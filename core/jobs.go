package core

import (
	"log"

	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) ListJobs() ([]*domain.JobItem, error) {
	return s.Repository.ListJobs("")
}

func (s *Service) CreateJob(job *domain.JobDefinition) error {
	if err := s.validateJobDefinition(job); err != nil {
		return err
	}
	if job.ID == "" {
		job.ID = domain.NewID()
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
	if err := s.validateJobDefinition(job); err != nil {
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
	job, err := s.Repository.RetrieveJob(id)
	if err != nil {
		return err
	}

	go s.OnRunJob(job)
	return nil
}

func (s *Service) validateJobDefinition(job *domain.JobDefinition) error {
	if err := domain.ValidateJobDefinition(job); err != nil {
		return err
	}
	variables, err := s.mapVariables(job.CollectionID)
	if err != nil {
		return err
	}
	req, err := job.Action.Request.Transpose(variables)
	if err != nil {
		return err
	}
	if err := domain.ValidateURI(req.URI); err != nil {
		return err
	}
	return nil
}

func (s *Service) resetLeftOverJobs() {
	jobs, err := s.Repository.ListLeftOverJobs()
	if err != nil {
		log.Printf("WARN: failed to list left over jobs: %s", err)
		return
	}
	for _, id := range jobs {
		log.Printf("reset job status for: %s", id)
		s.Repository.ResetJobStatus(id)
	}
}
