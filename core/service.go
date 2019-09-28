package core

import (
	"github.com/akornatskyy/scheduler/domain"
)

type Service struct {
	Repository domain.Repository
	Scheduler  domain.Scheduler
	Runners    map[string]domain.Runner
}

func (s *Service) Start() {
	s.Scheduler.SetRunner(s.OnRunJob)
	s.Scheduler.Start()
	s.scheduleJobs()
}

func (s *Service) Stop() {
	s.Scheduler.Stop()
	s.Repository.Close()
}

func (s *Service) Health() error {
	return s.Repository.Ping()
}
