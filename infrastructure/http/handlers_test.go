package http_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"flag"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/akornatskyy/goext/iojson"
	"github.com/akornatskyy/scheduler/core"
	"github.com/akornatskyy/scheduler/domain"
	web "github.com/akornatskyy/scheduler/infrastructure/http"
)

var (
	update = flag.Bool("update", false, "update golden files")
)

type (
	input struct {
		Req struct {
			Method string      `json:"method,omitempty"`
			Path   string      `json:"path"`
			Header http.Header `json:"headers"`
			Body   interface{} `json:"body,omitempty"`
		} `json:"req"`

		Mock *mockRepository `json:"mock"`
	}

	mockRepository struct {
		Collections []*domain.CollectionItem `json:"collections"`
		Collection  *domain.Collection       `json:"collection"`
		Jobs        []*domain.JobItem        `json:"jobs"`
		Job         *domain.JobDefinition    `json:"job"`
		JobStatus   *domain.JobStatus        `json:"jobStatus"`
		JobHistory  []*domain.JobHistory     `json:"jobHistory"`
		Err         string                   `json:"err"`
	}

	mockScheduler struct {
	}

	result struct {
		Code   int         `json:"code"`
		Header http.Header `json:"headers,omitempty"`
		Body   interface{} `json:"body,omitempty"`
	}
)

func TestServeHTTP(t *testing.T) {
	const suffix = "-input.json"
	cases, err := filepath.Glob("testdata/*/*/*" + suffix)
	if err != nil {
		t.Fatal(err)
	}
	for _, in := range cases {
		name := strings.Replace(in[len("testdata/"):len(in)-len(suffix)], "\\", "/", -1)
		out := in[:len(in)-len(suffix)] + "-golden.json"
		t.Run(name, func(t *testing.T) {
			runTest(t, in, out)
		})
	}
}

func runTest(t *testing.T, in, golden string) {
	var i input
	if err := iojson.ReadFile(in, &i); err != nil {
		t.Fatal(err)
	}
	var reader io.Reader
	if i.Req.Body != nil {
		body, err := json.Marshal(i.Req.Body)
		if err != nil {
			t.Fatal(err)
		}
		reader = bytes.NewReader(body)
	}
	r, err := http.NewRequest(i.Req.Method, i.Req.Path, reader)
	if err != nil {
		t.Fatal(err)
	}
	r.Header = i.Req.Header
	w := httptest.NewRecorder()

	srv := &web.Server{
		Service: &core.Service{
			Repository: i.Mock,
			Scheduler:  &mockScheduler{},
			Runners:    map[string]domain.Runner{},
		},
	}
	srv.Routes().ServeHTTP(w, r)

	actual := result{
		Code:   w.Code,
		Header: w.Header(),
	}
	if w.Body.Len() > 0 {
		if err := json.Unmarshal(w.Body.Bytes(), &actual.Body); err != nil {
			t.Fatal(err)
		}
	}

	if *update {
		actual, err := json.MarshalIndent(actual, "", "  ")
		if err != nil {
			t.Fatal(err)
		}
		if err := ioutil.WriteFile(golden, actual, 0644); err != nil {
			t.Fatal(err)
		}
	}
	var expected result
	if err := iojson.ReadFile(golden, &expected); err != nil {
		t.Fatal(err)
	}

	if actual.Code != expected.Code {
		t.Errorf(
			"code, got: %d, expected: %d",
			actual.Code,
			expected.Code)
	}
	if (len(actual.Header) != 0 || len(expected.Header) != 0) &&
		!reflect.DeepEqual(actual.Header, expected.Header) {
		t.Errorf(
			"headers, %d %d got: %v, expected: %v",
			len(actual.Header), len(expected.Header),
			actual.Header,
			expected.Header)
	}
	if !reflect.DeepEqual(actual.Body, expected.Body) {
		t.Errorf(
			"body, got: %q, expected: %q",
			actual.Body,
			expected.Body)
	}
}

func (r *mockRepository) err(s string) error {
	switch r.Err {
	case "conflict":
		return domain.ErrConflict
	case "not found":
		return domain.ErrNotFound
	case "unexpected":
		return errors.New(r.Err)
	case s:
		return errors.New(s)
	}
	return nil
}

func (r *mockRepository) Ping() error {
	return r.err("ping")
}

func (r *mockRepository) Close() error {
	return r.err("ping")
}

func (r *mockRepository) ListCollections() ([]*domain.CollectionItem, error) {
	return r.Collections, r.err("list-collections")
}

func (r *mockRepository) CreateCollection(c *domain.Collection) error {
	return r.err("create-collection")
}

func (r *mockRepository) RetrieveCollection(id string) (*domain.Collection, error) {
	return r.Collection, r.err("retrieve-collection")
}

func (r *mockRepository) UpdateCollection(c *domain.Collection) error {
	return r.err("update-collection")
}

func (r *mockRepository) DeleteCollection(id string) error {
	return r.err("delete-collection")
}

func (r *mockRepository) ListVariables(collectionID string) ([]*domain.VariableItem, error) {
	return nil, r.err("list-variables")
}

func (r *mockRepository) MapVariables(collectionID string) (map[string]string, error) {
	return nil, r.err("map-variables")
}

func (r *mockRepository) CreateVariable(v *domain.Variable) error {
	return r.err("create-variables")
}

func (r *mockRepository) RetrieveVariable(id string) (*domain.Variable, error) {
	return nil, r.err("retrieve-variable")
}

func (r *mockRepository) UpdateVariable(v *domain.Variable) error {
	return r.err("update-variable")
}

func (r *mockRepository) DeleteVariable(id string) error {
	return r.err("delete-variable")
}

func (r *mockRepository) ListJobs(collectionID string) ([]*domain.JobItem, error) {
	return r.Jobs, r.err("list-jobs")
}

func (r *mockRepository) CreateJob(j *domain.JobDefinition) error {
	return r.err("create-job")
}

func (r *mockRepository) RetrieveJob(id string) (*domain.JobDefinition, error) {
	return r.Job, r.err("retrieve-job")
}

func (r *mockRepository) UpdateJob(j *domain.JobDefinition) error {
	return r.err("update-job")
}

func (r *mockRepository) DeleteJob(id string) error {
	return r.err("delete-job")
}

func (r *mockRepository) RetrieveJobStatus(id string) (*domain.JobStatus, error) {
	return r.JobStatus, r.err("retrieve-job-status")
}

func (r *mockRepository) ListLeftOverJobs() ([]string, error) {
	return []string{}, r.err("list-left-over-jobs")
}

func (r *mockRepository) ResetJobStatus(id string) error {
	return r.err("reset-job-status")
}

func (r *mockRepository) AcquireJob(id string, deadline time.Duration) error {
	return r.err("acquire-job")
}

func (r *mockRepository) ListJobHistory(id string) ([]*domain.JobHistory, error) {
	return r.JobHistory, r.err("retrieve-job-history")
}

func (r *mockRepository) AddJobHistory(jh *domain.JobHistory) error {
	return r.err("add-job-history")
}

func (r *mockRepository) DeleteJobHistory(id string, before time.Time) error {
	return r.err("delete-job-history")
}

func (r *mockScheduler) SetRunner(f func(*domain.JobDefinition)) {
}

func (r *mockScheduler) ListIDs() []string {
	return []string{}
}

func (r *mockScheduler) Add(j *domain.JobDefinition) error {
	return nil
}

func (r *mockScheduler) Remove(id string) {
}

func (r *mockScheduler) NextRun(id string) *time.Time {
	return nil
}

func (r *mockScheduler) Start() {
}

func (r *mockScheduler) Stop() {
}
