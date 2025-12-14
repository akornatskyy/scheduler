package http

import (
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func serveIndex() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "max-age=180")
		http.ServeFile(w, r, "static/index.html")
	}
}

func serveFavicon() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "max-age=180, immutable")
		http.ServeFile(w, r, "static/favicon.ico")
	}
}

func serveJavascript() httprouter.Handle {
	fileServer := http.FileServer(http.Dir("static/js"))
	return func(w http.ResponseWriter, req *http.Request, p httprouter.Params) {
		req.URL.Path = p.ByName("filepath")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "max-age=31536000, immutable")
		if strings.HasSuffix(req.URL.Path, ".map") {
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		} else {
			w.Header().Set("Content-Type", "application/javascript; charset=UTF-8")
		}
		fileServer.ServeHTTP(w, req)
	}
}
