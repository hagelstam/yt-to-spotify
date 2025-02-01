package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

type Server struct {
	port   int
	logger *slog.Logger
}

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

func NewServer(logger *slog.Logger) *http.Server {
	newServer := &Server{
		port:   8080,
		logger: logger,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", newServer.port),
		Handler:      newServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}

func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/convert", s.ConvertHandler)
	return s.corsMiddleware(mux)
}

func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Replace "*" with specific origins if needed
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "false") // Set to "true" if credentials are required

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) SendRes(w http.ResponseWriter, res Response) {
	data, _ := json.Marshal(res)

	_, err := fmt.Fprintf(w, "data: %s\n\n", data)
	if err != nil {
		s.logger.Error("client disconnected")
	}

	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}
}

func (s *Server) SendErr(w http.ResponseWriter, err error) {
	var convErr *Error
	if !errors.As(err, &convErr) {
		convErr = &Error{Code: "internal_error", Message: err.Error()}
	}
	s.SendRes(w, Response{Status: "error", Error: convErr.Message})
}
