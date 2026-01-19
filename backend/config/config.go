package config

import (
	"os"
)

type Config struct {
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	JWTExpiration  int
	AllowedOrigins string
	Port           string
}

func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/gaming_panel?sslmode=disable"),
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379/0"),
		JWTSecret:      getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
		JWTExpiration:  24, // hours
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3001"),
		Port:           getEnv("PORT", "3000"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
