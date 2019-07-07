package http

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *Server) Routes() http.Handler {
	r := httprouter.New()

	return r
}
