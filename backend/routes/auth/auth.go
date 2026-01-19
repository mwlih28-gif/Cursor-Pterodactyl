package auth

import (
	"gaming-panel/backend/config"
	"gaming-panel/backend/middleware"
	"gaming-panel/backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SetupAuthRoutes(router fiber.Router, db *gorm.DB, redisClient *redis.Client, cfg *config.Config) {
	router.Post("/login", login(db, redisClient, cfg))
	router.Post("/register", register(db, cfg))
	router.Post("/refresh", refreshToken(redisClient, cfg))
	router.Post("/logout", logout(redisClient))
}

func RequireAuth() fiber.Handler {
	return middleware.AuthMiddleware
}

func login(db *gorm.DB, redisClient *redis.Client, cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		var user models.User
		if err := db.Preload("Role").Where("email = ?", req.Email).First(&user).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid credentials",
			})
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid credentials",
			})
		}

		// Generate JWT token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": user.ID,
			"email":   user.Email,
			"role_id": user.RoleID,
		})

		tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to generate token",
			})
		}

		// Store refresh token in Redis
		refreshToken := generateRefreshToken()
		redisClient.Set(c.Context(), "refresh:"+refreshToken, user.ID, 0)

		return c.JSON(fiber.Map{
			"token":         tokenString,
			"refresh_token": refreshToken,
			"user":          user,
		})
	}
}

func register(db *gorm.DB, cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Email    string `json:"email"`
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to hash password",
			})
		}

		// Get default role (user)
		var defaultRole models.Role
		if err := db.Where("name = ?", "user").First(&defaultRole).Error; err != nil {
			// Create default role if not exists
			defaultRole = models.Role{
				Name: "user",
				Permissions: models.Permissions{
					"server.view":   true,
					"server.manage": true,
				},
			}
			db.Create(&defaultRole)
		}

		user := models.User{
			Email:        req.Email,
			Username:     req.Username,
			PasswordHash: string(hashedPassword),
			RoleID:       defaultRole.ID,
		}

		if err := db.Create(&user).Error; err != nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "User already exists",
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "User created successfully",
			"user":    user,
		})
	}
}

func refreshToken(redisClient *redis.Client, cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		userID, err := redisClient.Get(c.Context(), "refresh:"+req.RefreshToken).Result()
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid refresh token",
			})
		}

		// Generate new access token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": userID,
		})

		tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to generate token",
			})
		}

		return c.JSON(fiber.Map{
			"token": tokenString,
		})
	}
}

func generateRefreshToken() string {
	return "refresh_" + generateRandomString(32)
}

func logout(redisClient *redis.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// Remove refresh token from Redis
		redisClient.Del(c.Context(), "refresh:"+req.RefreshToken)

		return c.JSON(fiber.Map{
			"message": "Logged out successfully",
		})
	}
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[i%len(charset)]
	}
	return string(b)
}
