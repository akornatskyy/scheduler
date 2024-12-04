package domain

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"time"
)

const (
	Version = "1.4.8"
)

var (
	ErrConflict = errors.New("conflict")
	ErrNotFound = errors.New("not found")
)

type (
	Duration         time.Duration
	CollectionState  int
	JobState         int
	JobStatusCode    int
	JobHistoryStatus int

	CollectionItem struct {
		ID    string          `json:"id"`
		Name  string          `json:"name"`
		State CollectionState `json:"state"`
	}

	Collection struct {
		CollectionItem
		Updated time.Time `json:"updated"`
	}

	VariableItem struct {
		ID           string    `json:"id"`
		Name         string    `json:"name"`
		CollectionID string    `json:"collectionId"`
		Updated      time.Time `json:"updated"`
	}

	Variable struct {
		VariableItem
		Value string `json:"value"`
	}

	JobItem struct {
		ID           string         `json:"id"`
		Name         string         `json:"name"`
		CollectionID string         `json:"collectionId"`
		State        JobState       `json:"state"`
		Schedule     string         `json:"schedule"`
		Status       *JobStatusCode `json:"status,omitempty"`
		ErrorRate    *float32       `json:"errorRate,omitempty"`
	}

	JobDefinition struct {
		JobItem
		Updated time.Time `json:"updated"`
		Action  *Action   `json:"action"`
	}

	Action struct {
		Type        string       `json:"type"`
		Request     *HttpRequest `json:"request"`
		RetryPolicy *RetryPolicy `json:"retryPolicy,omitempty"`
	}

	HttpRequest struct {
		Method  string           `json:"method,omitempty"`
		URI     string           `json:"uri"`
		Headers []*NameValuePair `json:"headers,omitempty"`
		Body    string           `json:"body,omitempty"`
	}

	NameValuePair struct {
		Name  string `json:"name"`
		Value string `json:"value"`
	}

	RetryPolicy struct {
		RetryCount    int      `json:"retryCount"`
		RetryInterval Duration `json:"retryInterval"`
		Deadline      Duration `json:"deadline"`
	}

	JobStatus struct {
		Updated    time.Time  `json:"updated"`
		Running    bool       `json:"running"`
		RunCount   int        `json:"runCount"`
		ErrorCount int        `json:"errorCount"`
		LastRun    *time.Time `json:"lastRun,omitempty"`
		NextRun    *time.Time `json:"nextRun,omitempty"`
	}

	JobHistory struct {
		JobID      string           `json:"-"`
		Action     string           `json:"action"`
		Started    time.Time        `json:"started"`
		Finished   time.Time        `json:"finished"`
		Status     JobHistoryStatus `json:"status"`
		RetryCount int              `json:"retryCount,omitempty"`
		Message    *string          `json:"message,omitempty"`
	}

	UpdateEvent struct {
		ObjectType string
		Operation  string
		ObjectID   string
	}
)

var (
	DefaultRetryPolicy = &RetryPolicy{
		RetryCount:    3,
		RetryInterval: 5 * Duration(time.Second),
		Deadline:      20 * Duration(time.Second),
	}

	Connected    = &UpdateEvent{ObjectType: "connection", Operation: "connected"}
	Disconnected = &UpdateEvent{ObjectType: "connection", Operation: "disconnected"}
	Reconnected  = &UpdateEvent{ObjectType: "connection", Operation: "reconnected"}
)

func NewID() string {
	id := make([]byte, 8)
	_, err := io.ReadAtLeast(rand.Reader, id, 8)
	if err != nil {
		return ""
	}
	if id[0] >= 248 { // Exclude '-' and '_'
		id[0] -= 248
	}
	return base64.RawURLEncoding.EncodeToString(id)
}
