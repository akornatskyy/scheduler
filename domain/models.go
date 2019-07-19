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
)
