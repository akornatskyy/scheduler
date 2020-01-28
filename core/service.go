package core

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/akornatskyy/scheduler/domain"
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

	items, err := s.Repository.ResetJobsStatus()
	if err != nil {
		log.Fatalf("ERR: failed to reset job statuses: %s", err)
	}
	if len(items) > 0 {
		log.Printf("reset job status for: %s", strings.Join(items, ", "))
	}

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
