package http

import (
	"net/http"

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
