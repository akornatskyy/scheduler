package domain

import (
	"errors"
	"time"
)

var (
	ErrConflict = errors.New("conflict")
	ErrNotFound = errors.New("not found")
)

type (
	Duration        time.Duration
	CollectionState int
	JobState        int

	CollectionItem struct {
		ID    string          `json:"id"`
		Name  string          `json:"name"`
		State CollectionState `json:"state"`
	}

	Collection struct {
		CollectionItem
		Updated *time.Time `json:"updated"`
	}

	JobItem struct {
		ID       string   `json:"id"`
		Name     string   `json:"name"`
		State    JobState `json:"state"`
		Schedule string   `json:"schedule"`
	}

	JobDefinition struct {
		JobItem
		Updated      *time.Time `json:"updated"`
		CollectionID string     `json:"collectionId"`
		Action       *Action    `json:"action"`
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
		Updated    *time.Time `json:"updated"`
		Running    bool       `json:"running"`
		RunCount   int        `json:"runCount"`
		ErrorCount int        `json:"errorCount"`
		LastRun    *time.Time `json:"lastRun,omitempty"`
		NextRun    *time.Time `json:"nextRun,omitempty"`
	}
)
