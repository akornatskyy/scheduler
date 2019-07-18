package http

import (
	"net/http"

	"github.com/akornatskyy/goext/binding"
	"github.com/akornatskyy/goext/httpjson"
	"github.com/akornatskyy/scheduler/domain"
)

func (s *Server) listCollections() http.HandlerFunc {
	type Response struct {
		Items []*domain.CollectionItem `json:"items"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		items, err := s.Service.ListCollections()
		if err != nil {
			writeError(w, err)
			return
		}
		out := &Response{
			Items: items,
		}
		httpjson.Encode(w, out, http.StatusOK)
	}
}

func (s *Server) listJobs() http.HandlerFunc {
	type Request struct {
		CollectionID string `binding:"collectionId"`
	}
	type Response struct {
		Items []*domain.JobItem `json:"items"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		var req Request
		if err := binding.Bind(&req, r.URL.Query()); err != nil {
			httpjson.Encode(w, err, http.StatusBadRequest)
			return
		}
		items, err := s.Service.ListJobs(req.CollectionID)
		if err != nil {
			writeError(w, err)
			return
		}
		resp := &Response{
			Items: items,
		}
		httpjson.Encode(w, resp, http.StatusOK)
	}
}
