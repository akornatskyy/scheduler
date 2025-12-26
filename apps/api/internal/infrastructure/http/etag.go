package http

import (
	"bytes"
	"hash"
	"hash/crc64"
	"net/http"
	"strconv"
)

type middleware struct {
	hash   hash.Hash64
	w      http.ResponseWriter
	buf    *bytes.Buffer
	status int
}

func ETagHandler(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		m := middleware{
			hash: crc64.New(crc64.MakeTable(crc64.ECMA)),
			w:    w,
			buf:  bytes.NewBuffer(nil),
		}
		next.ServeHTTP(&m, r)
		if m.buf.Len() == 0 {
			w.WriteHeader(m.status)
			return
		}
		etag := "\"" + strconv.FormatUint(m.hash.Sum64(), 36) + "\""
		if etag == r.Header.Get("If-None-Match") {
			w.WriteHeader(http.StatusNotModified)
			return
		}
		w.Header().Add("ETag", etag)
		w.WriteHeader(m.status)
		if _, err := w.Write(m.buf.Bytes()); err != nil {
			panic(err)
		}
	}
}

func (m middleware) Header() http.Header {
	return m.w.Header()
}

func (m *middleware) WriteHeader(status int) {
	m.status = status
}

func (m *middleware) Write(b []byte) (int, error) {
	l, _ := m.buf.Write(b)
	_, err := m.hash.Write(b)
	return l, err
}
