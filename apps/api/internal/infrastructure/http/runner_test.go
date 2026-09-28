package http

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/akornatskyy/scheduler/internal/domain"
)

func TestRun(t *testing.T) {
	type tc struct {
		Req      *domain.HTTPRequest
		Expected *http.Request
	}
	var testcases = []tc{
		{
			Req: &domain.HTTPRequest{
				URI: "http://127.0.0.1:8000/test",
				Headers: []*domain.NameValuePair{
					{
						Name:  "X-Requested-With",
						Value: "XMLHttpRequest",
					},
				},
			},
			Expected: &http.Request{
				Method:     "GET",
				Host:       "127.0.0.1:8000",
				RequestURI: "/test",
				Header: http.Header{
					"Accept-Encoding":  []string{"gzip"},
					"User-Agent":       []string{userAgent},
					"X-Requested-With": []string{"XMLHttpRequest"},
				},
			},
		},
	}
	for _, tt := range testcases {
		client, teardown := setupClient(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != tt.Expected.Method {
				t.Errorf(
					"method, got: %s, expected: %s",
					r.Method,
					tt.Expected.Method)
			}
			if r.Host != tt.Expected.Host {
				t.Errorf(
					"Host, got: %s, expected: %s",
					r.Host,
					tt.Expected.Host)
			}
			if r.RequestURI != tt.Expected.RequestURI {
				t.Errorf(
					"RequestURI, got: %s, expected: %s",
					r.RequestURI,
					tt.Expected.RequestURI)
			}
			if (len(r.Header) != 0 || len(tt.Expected.Header) != 0) &&
				!reflect.DeepEqual(r.Header, tt.Expected.Header) {
				t.Errorf(
					"headers, %d %d got: %v, expected: %v",
					len(r.Header), len(tt.Expected.Header),
					r.Header,
					tt.Expected.Header)
			}
		})
		defer teardown()
		runner := &httpRunner{
			client: client,
		}

		ctx := context.Background()
		err := runner.Run(ctx, &domain.Action{
			Request: tt.Req,
		})

		if err != nil {
			t.Fatal(err)
		}
	}
}

func TestRunTransposedRequest(t *testing.T) {
	client, teardown := setupClient(func(w http.ResponseWriter, r *http.Request) {
		if got, want := r.URL.RawQuery, "first=1&second=2"; got != want {
			t.Errorf("query, got: %q, expected: %q", got, want)
		}
		if got, want := r.Header.Get("Authorization"), "Bearer a+b&c=d"; got != want {
			t.Errorf("Authorization, got: %q, expected: %q", got, want)
		}
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Error(err)
		}
		if got, want := string(body), `{"message":"A&B < C"}`; got != want {
			t.Errorf("body, got: %q, expected: %q", got, want)
		}
	})
	defer teardown()
	req, err := (&domain.HTTPRequest{
		Method: "POST",
		URI:    "{{.endpoint}}",
		Headers: []*domain.NameValuePair{
			{Name: "Authorization", Value: "Bearer {{.token}}"},
		},
		Body: "{{.payload}}",
	}).Transpose(map[string]string{
		"endpoint": "http://127.0.0.1:8000/run?first=1&second=2",
		"token":    "a+b&c=d",
		"payload":  `{"message":"A&B < C"}`,
	})
	if err != nil {
		t.Fatal(err)
	}
	runner := &httpRunner{client: client}
	if err := runner.Run(context.Background(), &domain.Action{Request: req}); err != nil {
		t.Fatal(err)
	}
}

func setupClient(handler http.HandlerFunc) (*http.Client, func()) {
	s := httptest.NewServer(http.HandlerFunc(handler))
	c := &http.Client{
		Transport: &http.Transport{
			DialContext: func(_ context.Context, network, _ string) (net.Conn, error) {
				return net.Dial(network, s.Listener.Addr().String())
			},
		},
	}
	return c, s.Close
}
