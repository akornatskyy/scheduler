package http

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func serveFile(name string) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		http.ServeFile(w, r, name)
	}
}

func serveFiles(root http.FileSystem) httprouter.Handle {
	fileServer := http.FileServer(root)
	return func(w http.ResponseWriter, req *http.Request, p httprouter.Params) {
		req.URL.Path = p.ByName("filepath")
		fileServer.ServeHTTP(w, req)
	}
}
