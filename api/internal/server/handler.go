package server

import (
	"net/http"
	"time"

	"github.com/hagelstam/dwnldr/api/internal/utils"
)

func (s *Server) ConvertHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	defer func() {
		s.logger.Info("conversion completed", "duration", time.Since(start).String())
	}()

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	url := r.URL.Query().Get("url")
	title := r.URL.Query().Get("title")
	artist := r.URL.Query().Get("artist")

	if url == "" || title == "" || artist == "" {
		s.SendErr(w, &Error{Code: "missing_params", Message: "missing required query params"})
		return
	}

	s.SendRes(w, Response{Status: StatusProgress, Message: "Validating YouTube link..."})
	if !utils.IsValidURL(url) {
		s.SendErr(w, &Error{Code: "invalid_url", Message: "invalid YouTube link"})
	}

	s.SendRes(w, Response{Status: StatusProgress, Message: "Validating video duration..."})
	duration, err := utils.GetVideoDuration(url)
	if err != nil {
		s.SendErr(w, &Error{Code: "duration_error", Message: "error getting video duration"})
		return
	}
	if duration > (5 * time.Minute) {
		s.SendErr(w, &Error{Code: "duration_error", Message: "video is longer than 5 minutes"})
		return
	}

	s.SendRes(w, Response{Status: StatusProgress, Message: "Getting thumbnail URL..."})
	thumbnailURL, err := utils.GetThumbnailURL(url)
	if err != nil {
		s.SendErr(w, &Error{Code: "thumbnail_error", Message: "error getting thumbnail URL"})
		return
	}

	s.SendRes(w, Response{Status: StatusProgress, Message: "Downloading thumbnail..."})
	thumbnail, err := utils.DownloadThumbnail(thumbnailURL)
	if err != nil {
		s.SendErr(w, &Error{Code: "thumbnail_error", Message: "error downloading thumbnail"})
		return
	}

	s.SendRes(w, Response{Status: StatusProgress, Message: "Cropping thumbnail..."})
	croppedCover, err := utils.CropCover(thumbnail)
	if err != nil {
		s.SendErr(w, &Error{Code: "thumbnail_error", Message: "error cropping thumbnail"})
		return
	}

	s.SendRes(w, Response{Status: StatusProgress, Message: "Downloading and embedding audio..."})
	if err := utils.DownloadAudio(url, croppedCover, title, artist); err != nil {
		s.SendErr(w, &Error{Code: "audio_error", Message: "error downloading audio"})
		return
	}

	s.SendRes(w, Response{Status: StatusCompleted, Message: "Conversion completed"})
}
