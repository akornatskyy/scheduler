package http

import (
	"context"
	"log"
	"net/http"

	"github.com/akornatskyy/goext/errorstate"
	"github.com/akornatskyy/goext/httpjson"
	"github.com/akornatskyy/scheduler/core"
)

const (
	addr = ":8080"
)

type Server struct {
	Service *core.Service
	srv     *http.Server
}

func (s *Server) Start() {
	s.srv = &http.Server{
		Addr:    addr,
		Handler: s.Routes(),
	}

	go func() {
		log.Println("http started")
		if err := s.srv.ListenAndServe(); err != nil {
			switch err {
			case http.ErrServerClosed:
				log.Println("http stopped")
			default:
				log.Printf("http serve: %s", err)
			}
		}
	}()
	log.Printf("http listening on %s", s.srv.Addr)
}

func (s *Server) Stop() {
	if err := s.srv.Shutdown(context.Background()); err != nil {
		log.Printf("shutdown: %s", err)
	}
	if err := s.srv.Close(); err != nil {
		log.Printf("close: %s", err)
	}
}

func writeError(w http.ResponseWriter, err error) {
	switch err {
	default:
		switch err.(type) {
		case *errorstate.ErrorState:
			httpjson.Encode(w, err, http.StatusBadRequest)
		default:
			log.Printf("ERR: %s", err)
			w.WriteHeader(http.StatusServiceUnavailable)
		}
	}
}
