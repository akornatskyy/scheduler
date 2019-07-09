package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/akornatskyy/scheduler/core"
	"github.com/akornatskyy/scheduler/infrastructure/http"
	"github.com/akornatskyy/scheduler/infrastructure/postgres"
)

func main() {
	log.Printf("starting...")

	dsn := os.Getenv("DSN")
	service := &core.Service{
		Repository: postgres.NewRepository(dsn),
	}

	server := &http.Server{
		Service: service,
	}

	server.Start()

	c := make(chan os.Signal)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
	<-c

	log.Println("shutting down...")

	server.Stop()

	log.Println("done")
}
