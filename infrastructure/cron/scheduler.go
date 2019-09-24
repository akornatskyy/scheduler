package cron

import (
	"log"
	"sync"
	"time"

	"github.com/akornatskyy/scheduler/domain"
	"github.com/robfig/cron/v3"
)

type cronSheduler struct {
	mu     sync.Mutex
	c      *cron.Cron
	jobs   map[string]*cronJob
	runner func(*domain.JobDefinition)
}

type cronJob struct {
	id cron.EntryID
	j  *domain.JobDefinition
}

func New() domain.Scheduler {
	c := cron.New(
		cron.WithLocation(time.UTC),
	)
	return &cronSheduler{c: c, jobs: make(map[string]*cronJob)}
}

func (s *cronSheduler) SetRunner(f func(*domain.JobDefinition)) {
	s.runner = f
}

func (s *cronSheduler) Add(j *domain.JobDefinition) error {
	defer s.mu.Unlock()
	s.mu.Lock()
	cj := s.jobs[j.ID]
	if cj != nil {
		if j.Updated == cj.j.Updated {
			return nil
		}
		s.c.Remove(cj.id)
		delete(s.jobs, j.ID)
	}

	id, err := s.c.AddFunc(j.Schedule, func() {
		s.Run(j)
	})
	if err != nil {
		return err
	}
	s.jobs[j.ID] = &cronJob{
		id: id,
		j:  j,
	}
	return nil
}

func (s *cronSheduler) Remove(id string) {
	defer s.mu.Unlock()
	s.mu.Lock()
	j := s.jobs[id]
	if j == nil {
		return
	}

	s.c.Remove(j.id)
	delete(s.jobs, id)
}

func (s *cronSheduler) Start() {
	s.c.Start()
	log.Print("scheduler started")
}

func (s *cronSheduler) Stop() {
	s.c.Stop()
	log.Print("scheduler stopped")
}

func (s *cronSheduler) Run(j *domain.JobDefinition) {
	s.runner(j)
}
