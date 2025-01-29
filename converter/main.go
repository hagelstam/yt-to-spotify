package main

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"
)

func isValidURL(url string) bool {
	regex := `^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$`
	matched, err := regexp.MatchString(regex, url)
	return matched && err == nil
}

func getVideoDuration(url string) (time.Duration, error) {
	cmd := exec.Command("yt-dlp", "--get-duration", url)
	output, err := cmd.Output()
	if err != nil {
		return 0, err
	}
	durationStr := strings.TrimSpace(string(output))
	return parseDuration(durationStr)
}

func parseDuration(duration string) (time.Duration, error) {
	parts := strings.Split(duration, ":")

	if len(parts) > 2 {
		return 0, errors.New("unexpected duration format")
	}

	seconds := 0
	for _, part := range parts {
		value, err := strconv.Atoi(part)
		if err != nil {
			return 0, errors.New("invalid number in duration")
		}
		seconds = seconds*60 + value
	}

	return time.Duration(seconds) * time.Second, nil
}

func downloadAudio(url string) error {
	cmd := exec.Command(
		"yt-dlp",
		"-x",
		"--audio-format", "mp3",
		"--output", "song.mp3",
		"--postprocessor-args", "-metadata title='Hoodbyair' -metadata artist='Playboi Carti'",
		url,
		"--ffmpeg-location", "/usr/bin/ffmpeg",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return err
	}

	return nil
}

func main() {
	url := "https://www.youtube.com/watch?v=NuKyecVfATc"

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		defer func() {
			elapsed := time.Since(start)
			fmt.Printf("Request took: %.2f seconds\n", elapsed.Seconds())
		}()

		if !isValidURL(url) {
			http.Error(w,
				fmt.Sprintf("invalid YouTube link: %s\n", url),
				http.StatusBadRequest,
			)
			return
		}

		duration, err := getVideoDuration(url)
		if err != nil {
			http.Error(w,
				fmt.Sprintf("error getting duration: %s\n", err),
				http.StatusInternalServerError,
			)
			return
		}

		if duration > (5 * time.Minute) {
			http.Error(w,
				fmt.Sprintf("video is longer than 5 minutes: %d seconds\n", duration),
				http.StatusBadRequest,
			)
			return
		}

		if err := downloadAudio(url); err != nil {
			http.Error(w,
				fmt.Sprintf("error downloading video: %s\n", err),
				http.StatusInternalServerError,
			)
			return
		}

		w.Write([]byte("Video downloaded successfully!"))
	})

	http.ListenAndServe(":8080", nil)
}
