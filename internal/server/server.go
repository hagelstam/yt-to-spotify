package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"
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
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	newServer := &Server{
		port:   port,
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
	mux.Handle("/", http.FileServer(http.Dir("static")))

	return mux
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
