package postgres

import (
	"log"
	"strings"
	"time"

	"github.com/akornatskyy/scheduler/internal/domain"
	"github.com/lib/pq"
)

const (
	chTableUpdate = "table_update"
)

type sqlSubscriber struct {
	callback domain.UpdateEventCallback
	listener *pq.Listener
	done     chan struct{}
}

func NewSubscriber(dsn string) domain.Subscriber {
	minReconn := 5 * time.Second
	maxReconn := time.Minute

	s := &sqlSubscriber{
		done: make(chan struct{}, 1),
	}
	s.listener = pq.NewListener(dsn, minReconn, maxReconn, s.onListenerEvent)
	return s
}

func (s *sqlSubscriber) SetCallback(callback domain.UpdateEventCallback) {
	s.callback = callback
}

func (s *sqlSubscriber) Start() {
	go s.waitForEvents()
	if err := s.listener.Listen(chTableUpdate); err != nil {
		panic(err)
	}
}

func (s *sqlSubscriber) Stop() {
	s.done <- struct{}{}
}

func (s *sqlSubscriber) onListenerEvent(ev pq.ListenerEventType, err error) {
	switch ev {
	case pq.ListenerEventConnected:
		if err := s.callback(domain.Connected); err != nil {
			log.Printf("subscriber connected: %s", err)
		}
	case pq.ListenerEventDisconnected:
		if err := s.callback(domain.Disconnected); err != nil {
			log.Printf("subscriber disconnected: %s", err)
		}
	case pq.ListenerEventReconnected:
		if err := s.callback(domain.Reconnected); err != nil {
			log.Printf("subscriber reconnected: %s", err)
		}
	case pq.ListenerEventConnectionAttemptFailed:
		log.Printf("subscriber connection attempt failed, %s", err)
	}
}

func (s *sqlSubscriber) waitForEvents() {
	log.Printf("subscriber started")
	var e domain.UpdateEvent
loop:
	for {
		select {
		case n := <-s.listener.Notify:
			if n == nil {
				continue
			}

			switch n.Channel {
			case chTableUpdate:
				fields := strings.Fields(n.Extra)
				e.Operation = fields[0]
				e.ObjectType = fields[1]
				e.ObjectID = fields[2]
				if err := s.callback(&e); err != nil {
					log.Printf("subscriber waiting for events: %s", err)
				}
			}
		case <-time.After(1 * time.Minute):
			s.listener.Ping()
		case <-s.done:
			break loop
		}
	}
	s.close()
	log.Printf("subscriber stopped")
}

func (s *sqlSubscriber) close() error {
	s.listener.UnlistenAll()
	return s.listener.Close()
}
