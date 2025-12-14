package http

import (
	"context"
	"log"
	"net/http"

	"github.com/CAFxX/httpcompression"
	"github.com/akornatskyy/goext/errorstate"
	"github.com/akornatskyy/goext/httpjson"
	"github.com/akornatskyy/scheduler/core"
	"github.com/akornatskyy/scheduler/domain"
)

const (
	addr = ":8080"
)

type Server struct {
	Service *core.Service
	srv     *http.Server
}

func (s *Server) Start() {
	compress, _ := httpcompression.DefaultAdapter()
	s.srv = &http.Server{
		Addr:    addr,
		Handler: compress(s.Routes()),
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
	case domain.ErrNotFound:
		w.WriteHeader(http.StatusNotFound)
	case domain.ErrConflict:
		w.WriteHeader(http.StatusConflict)
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
