package config

import (
	"os"
)

type Config struct {
	NodeID    string
	RedisURL  string
	DockerHost string
}

func Load() *Config {
	return &Config{
		NodeID:     getEnv("NODE_ID", "node-1"),
		RedisURL:   getEnv("REDIS_URL", "redis://localhost:6379/0"),
		DockerHost: getEnv("DOCKER_HOST", "unix:///var/run/docker.sock"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
