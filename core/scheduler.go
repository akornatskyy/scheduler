package core

import (
	"log"

	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) scheduleJobs() error {
	collections, err := s.Repository.ListCollections()
	if err != nil {
		return err
	}
	scheduled := s.Scheduler.ListIDs()
	added := make(map[string]bool)
	n := 0
	for _, c := range collections {
		jobs, err := s.Repository.ListJobs(c.ID, []string{})
		if err != nil {
			return err
		}
		for _, j := range jobs {
			if c.State != domain.CollectionStateEnabled ||
				j.State != domain.JobStateEnabled {
				s.Scheduler.Remove(j.ID)
				continue
			}
			j, err := s.Repository.RetrieveJob(j.ID)
			if err != nil {
				return err
			}
			if err = s.Scheduler.Add(j); err != nil {
				return err
			}
			added[j.ID] = true
			n++
		}
	}
	// remove orphaned jobs if any
	for _, id := range scheduled {
		if !added[id] {
			s.Scheduler.Remove(id)
		}
	}
	log.Printf("scheduled %d jobs", n)
	return nil
}
