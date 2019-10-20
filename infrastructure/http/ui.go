package http

import (
	"net/http"

	"github.com/NYTimes/gziphandler"
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
	fileServer := gziphandler.GzipHandler(http.FileServer(http.Dir("static/js")))
	return func(w http.ResponseWriter, req *http.Request, p httprouter.Params) {
		req.URL.Path = p.ByName("filepath")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "max-age=31536000, immutable")
		w.Header().Set("Content-Type", "application/javascript; charset=UTF-8")
		fileServer.ServeHTTP(w, req)
	}
}
