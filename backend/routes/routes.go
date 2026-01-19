package routes

import (
	"gaming-panel/backend/config"
	"gaming-panel/backend/routes/auth"
	"gaming-panel/backend/routes/servers"
	"gaming-panel/backend/routes/nodes"
	"gaming-panel/backend/routes/admin"
	"gaming-panel/backend/websocket/hub"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func SetupRoutes(router fiber.Router, db *gorm.DB, redisClient *redis.Client, wsHub *hub.Hub, cfg *config.Config) {
	// Auth routes (public)
	auth.SetupAuthRoutes(router.Group("/auth"), db, redisClient, cfg)

	// Protected routes
	api := router.Group("/", auth.RequireAuth())

	// Server routes
	servers.SetupServerRoutes(api.Group("/servers"), db, redisClient, wsHub)

	// Node routes
	nodes.SetupNodeRoutes(api.Group("/nodes"), db, redisClient)

	// Admin routes
	admin.SetupAdminRoutes(api.Group("/admin"), db, redisClient, cfg)
}
