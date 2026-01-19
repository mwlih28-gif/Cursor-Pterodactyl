package servers

import (
	"gaming-panel/backend/models"
	"gaming-panel/backend/websocket/hub"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func SetupServerRoutes(router fiber.Router, db *gorm.DB, redisClient *redis.Client, wsHub *hub.Hub) {
	router.Get("/", listServers(db))
	router.Get("/:id", getServer(db))
	router.Post("/", createServer(db))
	router.Post("/:id/start", startServer(db, redisClient, wsHub))
	router.Post("/:id/stop", stopServer(db, redisClient, wsHub))
	router.Post("/:id/restart", restartServer(db, redisClient, wsHub))
	router.Get("/:id/status", getServerStatus(db))
	router.Post("/:id/backup", createBackup(db, redisClient))
	router.Delete("/:id", deleteServer(db))
}

func listServers(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		
		var servers []models.Server
		if err := db.Where("owner_id = ?", uint(userID)).
			Preload("Node").
			Preload("Allocation").
			Find(&servers).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch servers",
			})
		}

		return c.JSON(servers)
	}
}

func getServer(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		serverID := c.Params("id")

		var server models.Server
		if err := db.Where("id = ? AND owner_id = ?", serverID, uint(userID)).
			Preload("Node").
			Preload("Allocation").
			Preload("Backups").
			First(&server).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Server not found",
			})
		}

		return c.JSON(server)
	}
}

func createServer(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)

		var req struct {
			Name        string `json:"name"`
			NodeID      uint   `json:"node_id"`
			DockerImage string `json:"docker_image"`
			MemoryLimit int64  `json:"memory_limit"`
			CPULimit    int64  `json:"cpu_limit"`
			DiskLimit   int64  `json:"disk_limit"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// Find available allocation
		var allocation models.Allocation
		if err := db.Where("node_id = ? AND assigned = ?", req.NodeID, false).First(&allocation).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "No available allocation on this node",
			})
		}

		server := models.Server{
			Name:         req.Name,
			OwnerID:      uint(userID),
			NodeID:       req.NodeID,
			AllocationID: allocation.ID,
			DockerImage:  req.DockerImage,
			MemoryLimit:  req.MemoryLimit,
			CPULimit:     req.CPULimit,
			DiskLimit:    req.DiskLimit,
			Status:       models.ServerStatusOffline,
		}

		if err := db.Create(&server).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create server",
			})
		}

		// Mark allocation as assigned
		allocation.Assigned = true
		db.Save(&allocation)

		return c.Status(fiber.StatusCreated).JSON(server)
	}
}

func startServer(db *gorm.DB, redisClient *redis.Client, wsHub *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		serverID := c.Params("id")

		var server models.Server
		if err := db.Where("id = ? AND owner_id = ?", serverID, uint(userID)).First(&server).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Server not found",
			})
		}

		// Update status
		server.Status = models.ServerStatusStarting
		db.Save(&server)

		// Publish to Redis queue for daemon to process
		redisClient.Publish(c.Context(), "server:start", server.ID)

		// Broadcast WebSocket event
		wsHub.BroadcastToServer(server.UUID, map[string]interface{}{
			"type":   "server.status",
			"status": "starting",
		})

		return c.JSON(fiber.Map{
			"message": "Server start command sent",
			"status":  server.Status,
		})
	}
}

func stopServer(db *gorm.DB, redisClient *redis.Client, wsHub *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		serverID := c.Params("id")

		var server models.Server
		if err := db.Where("id = ? AND owner_id = ?", serverID, uint(userID)).First(&server).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Server not found",
			})
		}

		server.Status = models.ServerStatusStopping
		db.Save(&server)

		redisClient.Publish(c.Context(), "server:stop", server.ID)

		wsHub.BroadcastToServer(server.UUID, map[string]interface{}{
			"type":   "server.status",
			"status": "stopping",
		})

		return c.JSON(fiber.Map{
			"message": "Server stop command sent",
			"status":  server.Status,
		})
	}
}

func restartServer(db *gorm.DB, redisClient *redis.Client, wsHub *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		serverID := c.Params("id")

		var server models.Server
		if err := db.Where("id = ? AND owner_id = ?", serverID, uint(userID)).First(&server).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Server not found",
			})
		}

		server.Status = models.ServerStatusStopping
		db.Save(&server)

		redisClient.Publish(c.Context(), "server:restart", server.ID)

		return c.JSON(fiber.Map{
			"message": "Server restart command sent",
		})
	}
}

func getServerStatus(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		serverID := c.Params("id")

		var server models.Server
		if err := db.Where("id = ? AND owner_id = ?", serverID, uint(userID)).First(&server).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Server not found",
			})
		}

		return c.JSON(fiber.Map{
			"status": server.Status,
			"uuid":   server.UUID,
		})
	}
}

func createBackup(db *gorm.DB, redisClient *redis.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		serverID := c.Params("id")

		var server models.Server
		if err := db.Where("id = ? AND owner_id = ?", serverID, uint(userID)).First(&server).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Server not found",
			})
		}

		// Queue backup job
		redisClient.Publish(c.Context(), "server:backup", server.ID)

		return c.JSON(fiber.Map{
			"message": "Backup job queued",
		})
	}
}

func deleteServer(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(float64)
		serverID := c.Params("id")

		var server models.Server
		if err := db.Where("id = ? AND owner_id = ?", serverID, uint(userID)).First(&server).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Server not found",
			})
		}

		// Free allocation
		if server.AllocationID > 0 {
			var allocation models.Allocation
			db.First(&allocation, server.AllocationID)
			allocation.Assigned = false
			db.Save(&allocation)
		}

		db.Delete(&server)

		return c.JSON(fiber.Map{
			"message": "Server deleted",
		})
	}
}
