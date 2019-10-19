package domain

type Scheduler interface {
	SetRunner(f func(*JobDefinition))
	ListIDs() []string
	Add(j *JobDefinition) error
	Remove(id string)
	Start()
	Stop()
}
