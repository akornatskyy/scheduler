package http

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *Server) Routes() http.Handler {
	r := httprouter.New()

	r.HandlerFunc("GET", "/collections", s.listCollections())

	r.HandlerFunc("GET", "/jobs", s.listJobs())

	return r
}
