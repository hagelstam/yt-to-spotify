package server

import (
	"fmt"
	"net/http"
	"time"

	"go.uber.org/zap"
)

type Server struct {
	port   int
	logger *zap.Logger
}

func NewServer(logger *zap.Logger) *http.Server {
	newServer := &Server{
		port:   8080,
		logger: logger,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", newServer.port),
		Handler:      newServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
