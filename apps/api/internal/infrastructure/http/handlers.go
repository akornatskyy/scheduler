package http

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/akornatskyy/goext/httpjson"
	"github.com/akornatskyy/scheduler/internal/domain"
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

func (s *Server) listVariables() http.HandlerFunc {
	type Response struct {
		Items []*domain.VariableItem `json:"items"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		collectionId := r.URL.Query().Get("collectionId")
		items, err := s.Service.ListVariables(collectionId)
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

func (s *Server) createVariable() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var v domain.Variable
		if err := httpjson.Decode(r, &v, 1256); err != nil {
			httpjson.Encode(w, err, http.StatusUnprocessableEntity)
			return
		}
		if err := s.Service.CreateVariable(&v); err != nil {
			writeError(w, err)
			return
		}
		httpjson.Encode(w, v.ID, http.StatusCreated)
	}
}

func (s *Server) retrieveVariable() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		v, err := s.Service.RetrieveVariable(p.ByName("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		etag := v.ETag()
		if etag == r.Header.Get("If-None-Match") {
			w.WriteHeader(http.StatusNotModified)
			return
		}
		w.Header().Add("ETag", etag)
		httpjson.Encode(w, v, http.StatusOK)
	}
}

func (s *Server) patchVariable() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		v, err := s.Service.RetrieveVariable(p.ByName("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		etag := r.Header.Get("If-Match")
		if etag != "" && etag != v.ETag() {
			w.WriteHeader(http.StatusPreconditionFailed)
			return
		}
		if err := httpjson.Decode(r, &v, 1256); err != nil {
			httpjson.Encode(w, err, http.StatusUnprocessableEntity)
			return
		}
		if err := s.Service.UpdateVariable(v); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) deleteVariable() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		id := p.ByName("id")
		etag := r.Header.Get("If-Match")
		if etag != "" {
			v, err := s.Service.RetrieveVariable(id)
			if err != nil {
				writeError(w, err)
				return
			}
			if etag != v.ETag() {
				w.WriteHeader(http.StatusPreconditionFailed)
				return
			}
		}
		if err := s.Service.DeleteVariable(id); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) listJobs() http.HandlerFunc {
	type Response struct {
		Items []*domain.JobItem `json:"items"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		collectionID := r.URL.Query().Get("collectionId")
		fields := strings.FieldsFunc(
			r.URL.Query().Get("fields"),
			func(c rune) bool {
				return c == ','
			})
		items, err := s.Service.ListJobs(collectionID, fields)
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

func (s *Server) createJob() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var job domain.JobDefinition
		if err := httpjson.Decode(r, &job, 4096); err != nil {
			httpjson.Encode(w, err, http.StatusUnprocessableEntity)
			return
		}
		if err := s.Service.CreateJob(&job); err != nil {
			writeError(w, err)
			return
		}
		httpjson.Encode(w, job.ID, http.StatusCreated)
	}
}

func (s *Server) retrieveJob() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		j, err := s.Service.RetrieveJob(p.ByName("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		etag := j.ETag()
		if etag == r.Header.Get("If-None-Match") {
			w.WriteHeader(http.StatusNotModified)
			return
		}
		w.Header().Add("ETag", etag)
		httpjson.Encode(w, j, http.StatusOK)
	}
}

func (s *Server) patchJob() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		j, err := s.Service.RetrieveJob(p.ByName("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		etag := r.Header.Get("If-Match")
		if etag != "" && etag != j.ETag() {
			w.WriteHeader(http.StatusPreconditionFailed)
			return
		}
		if err := httpjson.Decode(r, &j, 4096); err != nil {
			httpjson.Encode(w, err, http.StatusUnprocessableEntity)
			return
		}
		if err := s.Service.UpdateJob(j); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) deleteJob() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		id := p.ByName("id")
		etag := r.Header.Get("If-Match")
		if etag != "" {
			j, err := s.Service.RetrieveJob(id)
			if err != nil {
				writeError(w, err)
				return
			}
			if etag != j.ETag() {
				w.WriteHeader(http.StatusPreconditionFailed)
				return
			}
		}
		if err := s.Service.DeleteJob(id); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) retrieveJobStatus() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		j, err := s.Service.RetrieveJobStatus(p.ByName("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		etag := j.ETag()
		if etag == r.Header.Get("If-None-Match") {
			w.WriteHeader(http.StatusNotModified)
			return
		}
		w.Header().Add("ETag", etag)
		httpjson.Encode(w, j, http.StatusOK)
	}
}

func (s *Server) patchJobStatus() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		id := p.ByName("id")
		j, err := s.Service.RetrieveJobStatus(id)
		if err != nil {
			writeError(w, err)
			return
		}
		etag := r.Header.Get("If-Match")
		if etag != "" && etag != j.ETag() {
			w.WriteHeader(http.StatusPreconditionFailed)
			return
		}
		running := j.Running
		if err := httpjson.Decode(r, &j, 32); err != nil {
			httpjson.Encode(w, err, http.StatusUnprocessableEntity)
			return
		}
		if running {
			if !j.Running {
				httpjson.Encode(w, domain.ErrUnableCancelJob, http.StatusBadRequest)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if !j.Running {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if err := s.Service.RunJob(id); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) listJobHistory() httprouter.Handle {
	type Response struct {
		Items []*domain.JobHistory `json:"items"`
	}
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		id := p.ByName("id")
		etag := r.Header.Get("If-None-Match")
		if etag != "" {
			j, err := s.Service.RetrieveJobStatus(id)
			if err != nil {
				writeError(w, err)
				return
			}
			t := j.ETag()
			if etag == t {
				w.WriteHeader(http.StatusNotModified)
				return
			}
			etag = t
		}

		items, err := s.Service.ListJobHistory(id)
		if err != nil {
			writeError(w, err)
			return
		}
		resp := &Response{
			Items: items,
		}

		if etag == "" {
			j, err := s.Service.RetrieveJobStatus(id)
			if err != nil {
				writeError(w, err)
				return
			}
			etag = j.ETag()
		}
		w.Header().Add("ETag", etag)
		httpjson.Encode(w, resp, http.StatusOK)
	}
}

func (s *Server) deleteJobHistory() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		id := p.ByName("id")
		etag := r.Header.Get("If-Match")
		if etag != "" {
			j, err := s.Service.RetrieveJobStatus(id)
			if err != nil {
				writeError(w, err)
				return
			}
			if etag != j.ETag() {
				w.WriteHeader(http.StatusPreconditionFailed)
				return
			}
		}
		var before time.Time
		b := r.URL.Query().Get("before")
		if b != "" {
			var err error
			before, err = domain.ParseBefore(b)
			if err != nil {
				httpjson.Encode(w, err, http.StatusBadRequest)
				return
			}
		}
		if err := s.Service.DeleteJobHistory(id, before); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) health() http.HandlerFunc {
	const up = "{\"status\":\"up\"}"
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		if err := s.Service.Health(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, "{\"status\":\"down\",\"message\":%q}", err.Error())
			return
		}
		fmt.Fprint(w, up)
	}
}
