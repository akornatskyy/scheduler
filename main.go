package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/akornatskyy/scheduler/core"
	"github.com/akornatskyy/scheduler/domain"
	"github.com/akornatskyy/scheduler/infrastructure/cron"
	"github.com/akornatskyy/scheduler/infrastructure/http"
	"github.com/akornatskyy/scheduler/infrastructure/postgres"
)

func main() {
	log.Printf("starting scheduler version %s...", domain.Version)

	dsn := os.Getenv("DSN")
	service := &core.Service{
		Repository: postgres.NewRepository(dsn),
		Scheduler:  cron.New(),
		Runners: map[string]domain.Runner{
			"HTTP": http.NewRunner(),
		},
	}

	subscriber := postgres.NewSubscriber(dsn)
	subscriber.SetCallback(service.OnUpdateEvent)

	server := &http.Server{
		Service: service,
	}

	service.Start()
	subscriber.Start()
	server.Start()

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
	<-c

	log.Println("shutting down...")

	server.Stop()
	subscriber.Stop()
	service.Stop()

	log.Println("done")
}
