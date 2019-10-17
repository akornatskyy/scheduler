package core

import (
	"log"
	"time"

	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) OnUpdateEvent(m *domain.UpdateEvent) error {
	log.Printf("event: %v", m)
	switch m.ObjectType {
	case "collection":
		switch m.Operation {
		case "UPDATE":
			return s.onCollectionUpdate(m.ObjectID)
		}
	case "connection":
		switch m.Operation {
		case "connected", "reconnected":
			for i := 1; i <= 5; i++ {
				// might fail in case reconnected
				if err := s.Repository.Ping(); err != nil {
					log.Printf("ping attempt %d failed, %s", i, err)
					time.Sleep(time.Second)
				} else {
					break
				}
			}
			return s.scheduleJobs()
		}
	}
	return nil
}

func (s *Service) onCollectionUpdate(id string) error {
	c, err := s.Repository.RetrieveCollection(id)
	if err != nil {
		return err
	}
	jobs, err := s.Repository.ListJobs(c.ID)
	if err != nil {
		return err
	}
	for _, j := range jobs {
		if c.State != domain.CollectionStateEnabled {
			s.Scheduler.Remove(j.ID)
		} else {
			j, err := s.Repository.RetrieveJob(j.ID)
			if err != nil {
				return err
			}
			if j.State == domain.JobStateEnabled {
				s.Scheduler.Add(j)
			}
		}
	}
	return nil
}
