package admin

import (
	"gaming-panel/backend/config"
	"gaming-panel/backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func SetupAdminRoutes(router fiber.Router, db *gorm.DB, redisClient *redis.Client, cfg *config.Config) {
	// TODO: Add admin middleware for role check
	router.Get("/metrics", getMetrics(db, redisClient))
	router.Get("/roles", listRoles(db))
	router.Post("/nodes", createNode(db))
}

func getMetrics(db *gorm.DB, redisClient *redis.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var totalServers int64
		var onlineServers int64
		var totalNodes int64
		var onlineNodes int64

		db.Model(&models.Server{}).Count(&totalServers)
		db.Model(&models.Server{}).Where("status = ?", models.ServerStatusOnline).Count(&onlineServers)
		db.Model(&models.Node{}).Count(&totalNodes)
		db.Model(&models.Node{}).Where("status = ?", models.NodeStatusOnline).Count(&onlineNodes)

		return c.JSON(fiber.Map{
			"servers": fiber.Map{
				"total":  totalServers,
				"online": onlineServers,
			},
			"nodes": fiber.Map{
				"total":  totalNodes,
				"online": onlineNodes,
			},
		})
	}
}

func listRoles(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var roles []models.Role
		if err := db.Preload("Users").Find(&roles).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch roles",
			})
		}

		return c.JSON(roles)
	}
}

func createNode(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Name      string `json:"name"`
			Hostname  string `json:"hostname"`
			IP        string `json:"ip"`
			Port      int    `json:"port"`
			TotalRAM  int64  `json:"total_ram"`
			TotalCPU  int64  `json:"total_cpu"`
			TotalDisk int64  `json:"total_disk"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		node := models.Node{
			Name:      req.Name,
			Hostname:  req.Hostname,
			IP:        req.IP,
			Port:      req.Port,
			TotalRAM:  req.TotalRAM,
			TotalCPU:  req.TotalCPU,
			TotalDisk: req.TotalDisk,
			Status:    models.NodeStatusOffline,
		}

		if err := db.Create(&node).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create node",
			})
		}

		return c.Status(fiber.StatusCreated).JSON(node)
	}
}
