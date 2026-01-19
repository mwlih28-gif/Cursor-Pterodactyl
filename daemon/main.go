package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"gaming-panel/daemon/config"
	"gaming-panel/daemon/docker"
	"gaming-panel/daemon/listener"
)

func main() {
	cfg := config.Load()

	// Initialize Docker client
	dockerClient, err := docker.NewClient()
	if err != nil {
		log.Fatalf("Failed to initialize Docker client: %v", err)
	}

	// Initialize Redis subscriber
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	redisListener := listener.NewRedisListener(cfg.RedisURL, dockerClient)
	go redisListener.Start(ctx)

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	log.Println("🦖 Daemon started successfully")
	log.Printf("Node ID: %s", cfg.NodeID)
	log.Printf("Listening on Redis: %s", cfg.RedisURL)

	<-sigChan
	log.Println("Shutting down daemon...")
	cancel()
}
