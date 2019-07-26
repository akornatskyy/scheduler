package http

import (
	"net/http"

	"github.com/akornatskyy/goext/binding"
	"github.com/akornatskyy/goext/httpjson"
	"github.com/akornatskyy/scheduler/domain"
	"github.com/julienschmidt/httprouter"
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

func (s *Server) createCollection() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var collection domain.Collection
		collection.State = domain.CollectionStateEnabled
		if err := httpjson.Decode(r, &collection, 140); err != nil {
			httpjson.Encode(w, err, http.StatusUnprocessableEntity)
			return
		}
		if err := s.Service.CreateCollection(&collection); err != nil {
			writeError(w, err)
			return
		}
		httpjson.Encode(w, collection.ID, http.StatusCreated)
	}
}

func (s *Server) retrieveCollection() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		c, err := s.Service.RetrieveCollection(p.ByName("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		etag := c.ETag()
		if etag == r.Header.Get("If-None-Match") {
			w.WriteHeader(http.StatusNotModified)
			return
		}
		w.Header().Add("ETag", etag)
		httpjson.Encode(w, c, http.StatusOK)
	}
}

func (s *Server) patchCollection() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		c, err := s.Service.RetrieveCollection(p.ByName("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		etag := r.Header.Get("If-Match")
		if etag != "" && etag != c.ETag() {
			w.WriteHeader(http.StatusPreconditionFailed)
			return
		}
		if err := httpjson.Decode(r, &c, 140); err != nil {
			httpjson.Encode(w, err, http.StatusUnprocessableEntity)
			return
		}
		if err := s.Service.UpdateCollection(c); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) deleteCollection() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		id := p.ByName("id")
		etag := r.Header.Get("If-Match")
		if etag != "" {
			c, err := s.Service.RetrieveCollection(id)
			if err != nil {
				writeError(w, err)
				return
			}
			if etag != c.ETag() {
				w.WriteHeader(http.StatusPreconditionFailed)
				return
			}
		}
		if err := s.Service.DeleteCollection(id); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
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
