package domain

import "time"

type Scheduler interface {
	SetRunner(f func(*JobDefinition))
	ListIDs() []string
	Add(j *JobDefinition) error
	Remove(id string)
	NextRun(id string) *time.Time
	Start()
	Stop()
}
