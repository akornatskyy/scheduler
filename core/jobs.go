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

func (s *Service) RetrieveJob(id string) (*domain.JobDefinition, error) {
	if err := domain.ValidateId(id); err != nil {
		return nil, err
	}
	return s.Repository.RetrieveJob(id)
}

func (s *Service) DeleteJob(id string) error {
	if err := domain.ValidateId(id); err != nil {
		return err
	}
	return s.Repository.DeleteJob(id)
}
