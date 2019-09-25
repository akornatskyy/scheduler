package core

import (
	"log"

	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) OnRunJob(j *domain.JobDefinition) {
	log.Printf("attempting to run job %s", j.ID)
}
