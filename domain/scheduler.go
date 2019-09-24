package domain

import "time"

type Scheduler interface {
	SetRunner(f func(*JobDefinition))
	Add(j *JobDefinition) error
	Remove(id string)
	Start()
	Stop()
}
