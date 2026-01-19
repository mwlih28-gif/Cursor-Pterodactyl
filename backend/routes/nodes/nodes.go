package nodes

import (
	"gaming-panel/backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func SetupNodeRoutes(router fiber.Router, db *gorm.DB, redisClient *redis.Client) {
	router.Get("/", listNodes(db))
	router.Get("/:id", getNode(db))
	router.Get("/:id/status", getNodeStatus(db))
}

func listNodes(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var nodes []models.Node
		if err := db.Preload("Servers").Find(&nodes).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch nodes",
			})
		}

		return c.JSON(nodes)
	}
}

func getNode(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		nodeID := c.Params("id")

		var node models.Node
		if err := db.Preload("Servers").Preload("Allocations").First(&node, nodeID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Node not found",
			})
		}

		return c.JSON(node)
	}
}

func getNodeStatus(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		nodeID := c.Params("id")

		var node models.Node
		if err := db.First(&node, nodeID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Node not found",
			})
		}

		return c.JSON(fiber.Map{
			"status":    node.Status,
			"used_ram":  node.UsedRAM,
			"total_ram": node.TotalRAM,
			"used_cpu":  node.UsedCPU,
			"total_cpu": node.TotalCPU,
		})
	}
}
