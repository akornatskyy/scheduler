package http

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/akornatskyy/scheduler/internal/domain"
)

var (
	userAgent = fmt.Sprintf("Scheduler/%s", domain.Version)
)

type httpRunner struct {
	client *http.Client
}

func NewRunner() domain.Runner {
	return &httpRunner{
		client: &http.Client{},
	}
}

func (runner *httpRunner) Run(ctx context.Context, a *domain.Action) error {
	r := a.Request
	var reader io.Reader
	if r.Body != "" {
		reader = strings.NewReader(r.Body)
	}
	req, err := http.NewRequest(r.Method, r.URI, reader)
	if err != nil {
		return err
	}
	for _, p := range r.Headers {
		req.Header.Add(p.Name, p.Value)
	}
	req.Header.Set("User-Agent", userAgent)
	resp, err := runner.client.Do(req.WithContext(ctx))
	if err != nil {
		log.Printf("%s %s - %s", r.Method, r.URI, err)
		return err
	}
	body, err := io.ReadAll(resp.Body)
	log.Printf("%s %s - %d %d", r.Method, r.URI, resp.StatusCode, len(body))
	if err != nil {
		return err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return &domain.RunError{
			Code: resp.StatusCode,
			Err:  errors.New(http.StatusText(resp.StatusCode)),
		}
	}
	return nil
}
