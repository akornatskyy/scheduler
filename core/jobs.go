package core

import (
	"github.com/akornatskyy/scheduler/domain"
	"github.com/google/uuid"
)

func (s *Service) ListJobs() ([]*domain.JobItem, error) {
	return s.Repository.ListJobs("")
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
	if err := domain.ValidateID(id); err != nil {
		return nil, err
	}
	return s.Repository.RetrieveJob(id)
}

func (s *Service) UpdateJob(job *domain.JobDefinition) error {
	if err := domain.ValidateJobDefinition(job); err != nil {
		return err
	}
	return s.Repository.UpdateJob(job)
}

func (s *Service) DeleteJob(id string) error {
	if err := domain.ValidateID(id); err != nil {
		return err
	}
	return s.Repository.DeleteJob(id)
}

func (s *Service) RetrieveJobStatus(id string) (*domain.JobStatus, error) {
	if err := domain.ValidateID(id); err != nil {
		return nil, err
	}
	j, err := s.Repository.RetrieveJobStatus(id)
	if err != nil {
		return nil, err
	}
	j.NextRun = s.Scheduler.NextRun(id)
	return j, nil
}

func (s *Service) RunJob(id string) error {
	if err := domain.ValidateID(id); err != nil {
		return err
	}
	_, err := s.Repository.RetrieveJob(id)
	if err != nil {
		return err
	}

	// TODO:
	// go s.OnRunJob(job)
	return nil
}
