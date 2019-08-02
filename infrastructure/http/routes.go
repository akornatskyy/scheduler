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
	r.Handle("PATCH", "/collections/:id", s.patchCollection())
	r.Handle("DELETE", "/collections/:id", s.deleteCollection())

	r.HandlerFunc("GET", "/jobs", s.listJobs())
	r.HandlerFunc("POST", "/jobs", s.createJob())
	r.Handle("GET", "/jobs/:id", s.retrieveJob())
	r.Handle("PATCH", "/jobs/:id", s.patchJob())
	r.Handle("DELETE", "/jobs/:id", s.deleteJob())

	r.Handle("GET", "/jobs/:id/status", s.retrieveJobStatus())
	r.Handle("PATCH", "/jobs/:id/status", s.patchJobStatus())

	r.Handle("GET", "/jobs/:id/history", s.listJobHistory())

	return r
}
