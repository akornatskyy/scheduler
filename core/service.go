package core

import (
	"context"
	"log"

	"github.com/akornatskyy/scheduler/domain"
)

type Service struct {
	Repository domain.Repository
	Scheduler  domain.Scheduler
	Runners    map[string]domain.Runner
	ctx        context.Context
	cancel     context.CancelFunc
}

func (s *Service) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	s.ctx = ctx
	s.cancel = cancel
	s.Scheduler.SetRunner(s.OnRunJob)
	s.Scheduler.Start()
}

func (s *Service) Stop() {
	log.Println("cancelling all running jobs...")
	s.cancel()
	s.Scheduler.Stop()
	s.Repository.Close()
}

func (s *Service) Health() error {
	return s.Repository.Ping()
}
