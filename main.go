package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *Error) Error() string {
	return e.Message
}

type Status string

const (
	StatusProgress  Status = "progress"
	StatusCompleted Status = "completed"
	StatusError     Status = "error"
)

type Response struct {
	Status  Status `json:"status"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

func handleConvert(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	defer func() {
		fmt.Printf("Conversion took %.2f seconds\n", time.Since(start).Seconds())
	}()

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	url := r.URL.Query().Get("url")
	title := r.URL.Query().Get("title")
	artist := r.URL.Query().Get("artist")

	if url == "" || title == "" || artist == "" {
		sendErr(w, &Error{Code: "missing_params", Message: "missing required query params"})
		return
	}

	sendRes(w, Response{Status: StatusProgress, Message: "Validating YouTube link..."})
	if !isValidURL(url) {
		sendErr(w, &Error{Code: "invalid_url", Message: "invalid YouTube link"})
	}

	sendRes(w, Response{Status: StatusProgress, Message: "Validating video duration..."})
	duration, err := getVideoDuration(url)
	if err != nil {
		sendErr(w, &Error{Code: "duration_error", Message: "error getting video duration"})
		return
	}
	if duration > (5 * time.Minute) {
		sendErr(w, &Error{Code: "duration_error", Message: "video is longer than 5 minutes"})
		return
	}

	sendRes(w, Response{Status: StatusProgress, Message: "Getting thumbnail URL..."})
	thumbnailURL, err := getThumbnailURL(url)
	if err != nil {
		sendErr(w, &Error{Code: "thumbnail_error", Message: "error getting thumbnail URL"})
		return
	}

	sendRes(w, Response{Status: StatusProgress, Message: "Downloading thumbnail..."})
	thumbnail, err := downloadThumbnail(thumbnailURL)
	if err != nil {
		sendErr(w, &Error{Code: "thumbnail_error", Message: "error downloading thumbnail"})
		return
	}

	sendRes(w, Response{Status: StatusProgress, Message: "Cropping thumbnail..."})
	croppedCover, err := cropCover(thumbnail)
	if err != nil {
		sendErr(w, &Error{Code: "thumbnail_error", Message: "error cropping thumbnail"})
		return
	}

	sendRes(w, Response{Status: StatusProgress, Message: "Downloading and embedding audio..."})
	if err := downloadAudio(url, croppedCover, title, artist); err != nil {
		sendErr(w, &Error{Code: "audio_error", Message: "error downloading audio"})
		return
	}

	sendRes(w, Response{Status: StatusCompleted, Message: "Conversion completed"})
}

func sendRes(w http.ResponseWriter, res Response) {
	data, _ := json.Marshal(res)

	_, err := fmt.Fprintf(w, "data: %s\n\n", data)
	if err != nil {
		log.Println("Client disconnected")
	}

	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}
}

func sendErr(w http.ResponseWriter, err error) {
	var convErr *Error
	if !errors.As(err, &convErr) {
		convErr = &Error{Code: "internal_error", Message: err.Error()}
	}
	sendRes(w, Response{Status: "error", Error: convErr.Message})
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("static")))
	http.HandleFunc("/convert", handleConvert)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
