package database

import (
	"fmt"

	"gaming-panel/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Server{},
		&models.Node{},
		&models.Allocation{},
		&models.Backup{},
		&models.AuditLog{},
	)
}
