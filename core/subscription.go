package core

import (
	"log"
	"time"

	"github.com/akornatskyy/scheduler/domain"
)

func (s *Service) OnUpdateEvent(m *domain.UpdateEvent) error {
	log.Printf("event: %v", m)
	switch m.ObjectType {
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
