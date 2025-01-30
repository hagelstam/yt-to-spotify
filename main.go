package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func handleConvert(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	defer func() {
		fmt.Printf("Conversion took %.2f seconds\n", time.Since(start).Seconds())
	}()

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	url := "https://www.youtube.com/watch?v=sf0PJsknZiM"
	title := "ur the moon"
	artist := "Carti"

	sendSSE(w, flusher, "Validating YouTube link...")
	if !isValidURL(url) {
		http.Error(w, "invalid YouTube link", http.StatusBadRequest)
		return
	}

	sendSSE(w, flusher, "Validating video duration...")
	duration, err := getVideoDuration(url)
	if err != nil {
		http.Error(w, "error getting video duration", http.StatusInternalServerError)
		return
	}
	if duration > (5 * time.Minute) {
		http.Error(w, "video is longer than 5 minutes", http.StatusBadRequest)
		return
	}

	sendSSE(w, flusher, "Getting thumbnail URL...")
	thumbnailURL, err := getThumbnailURL(url)
	if err != nil {
		http.Error(w, "error getting thumbnail URL", http.StatusInternalServerError)
		return
	}

	sendSSE(w, flusher, "Downloading thumbnail...")
	thumbnail, err := downloadThumbnail(thumbnailURL)
	if err != nil {
		http.Error(w, "error downloading thumbnail", http.StatusInternalServerError)
		return
	}

	sendSSE(w, flusher, "Cropping thumbnail...")
	croppedCover, err := cropCover(thumbnail)
	if err != nil {
		http.Error(w, "error cropping thumbnail", http.StatusInternalServerError)
		return
	}

	sendSSE(w, flusher, "Downloading and embedding audio...")
	if err := downloadAudio(url, croppedCover, title, artist); err != nil {
		http.Error(w, "error downloading video", http.StatusInternalServerError)
		return
	}

	sendSSE(w, flusher, "Done!!!")
}

func sendSSE(w http.ResponseWriter, flusher http.Flusher, msg string) {
	_, err := fmt.Fprintf(w, "data: %s\n\n", msg)
	if err != nil {
		log.Println("Client disconnected")
	}
	flusher.Flush()
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("static")))
	http.HandleFunc("/convert", handleConvert)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
