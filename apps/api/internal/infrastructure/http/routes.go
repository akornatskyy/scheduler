package http

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *Server) Routes() http.Handler {
	r := httprouter.New()

	r.HandlerFunc("GET", "/collections", ETagHandler(s.listCollections()))
	r.HandlerFunc("POST", "/collections", s.createCollection())
	r.Handle("GET", "/collections/:id", s.retrieveCollection())
	r.Handle("PATCH", "/collections/:id", s.patchCollection())
	r.Handle("DELETE", "/collections/:id", s.deleteCollection())

	r.HandlerFunc("GET", "/variables", ETagHandler(s.listVariables()))
	r.HandlerFunc("POST", "/variables", s.createVariable())
	r.Handle("GET", "/variables/:id", s.retrieveVariable())
	r.Handle("PATCH", "/variables/:id", s.patchVariable())
	r.Handle("DELETE", "/variables/:id", s.deleteVariable())

	r.HandlerFunc("GET", "/jobs", ETagHandler(s.listJobs()))
	r.HandlerFunc("POST", "/jobs", s.createJob())
	r.Handle("GET", "/jobs/:id", s.retrieveJob())
	r.Handle("PATCH", "/jobs/:id", s.patchJob())
	r.Handle("DELETE", "/jobs/:id", s.deleteJob())

	r.Handle("GET", "/jobs/:id/status", s.retrieveJobStatus())
	r.Handle("PATCH", "/jobs/:id/status", s.patchJobStatus())

	r.Handle("GET", "/jobs/:id/history", s.listJobHistory())
	r.Handle("DELETE", "/jobs/:id/history", s.deleteJobHistory())

	r.HandlerFunc("GET", "/health", s.health())

	r.Handle("GET", "/", serveIndex())
	r.Handle("GET", "/favicon.ico", serveFavicon())
	r.Handle("GET", "/js/*filepath", serveJavascript())

	return r
}
