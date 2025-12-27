package core

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/akornatskyy/scheduler/internal/domain"
)

type Service struct {
	Repository domain.Repository
	Scheduler  domain.Scheduler
	Runners    map[string]domain.Runner
	ctx        context.Context
	cancel     context.CancelFunc
	variables  map[string]string
}

func (s *Service) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	s.ctx = ctx
	s.cancel = cancel
	s.variables = mapEnviron()

	s.resetLeftOverJobs()
	s.Scheduler.SetRunner(s.OnRunJob)
	s.Scheduler.Start()
}

func (s *Service) Stop() {
	log.Println("canceling all running jobs...")
	s.cancel()
	s.Scheduler.Stop()
	if err := s.Repository.Close(); err != nil {
		log.Printf("WARN: failed to close repository: %v", err)
	}
}

func (s *Service) Health() error {
	return s.Repository.Ping()
}

func mapEnviron() map[string]string {
	variables := make(map[string]string)
	for _, e := range os.Environ() {
		pair := strings.SplitN(e, "=", 2)
		if !strings.HasPrefix(pair[0], "SCHEDULER_") {
			continue
		}
		variables[pair[0][10:]] = pair[1]
	}
	return variables
}
