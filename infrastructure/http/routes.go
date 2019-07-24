package http

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *Server) Routes() http.Handler {
	r := httprouter.New()

	r.HandlerFunc("GET", "/collections", s.listCollections())
	r.HandlerFunc("POST", "/collections", s.createCollection())
	r.Handle("GET", "/collections/:id", s.retrieveCollection())

	r.HandlerFunc("GET", "/jobs", s.listJobs())

	return r
}
