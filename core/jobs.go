package core

import (
	"github.com/akornatskyy/scheduler/domain"
	"github.com/google/uuid"
)

func (s *Service) ListJobs(collectionID string) ([]*domain.JobItem, error) {
	// TODO: search by state
	return s.Repository.ListJobs(collectionID)
}

func (s *Service) CreateJob(job *domain.JobDefinition) error {
	if err := domain.ValidateJobDefinition(job); err != nil {
		return err
	}
	if job.ID == "" {
		job.ID = uuid.New().String()
	}
	return s.Repository.CreateJob(job)
}
