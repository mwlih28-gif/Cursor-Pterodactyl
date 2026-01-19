package models

import (
	"time"

	"gorm.io/gorm"
)

type AuditLog struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      *uint          `json:"user_id"`
	User        *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Action      string         `json:"action" gorm:"not null"` // e.g., "server.start", "server.stop"
	ResourceType string        `json:"resource_type"`           // e.g., "server", "node"
	ResourceID  *uint          `json:"resource_id"`
	IP          string         `json:"ip"`
	UserAgent   string         `json:"user_agent"`
	Metadata    map[string]interface{} `json:"metadata" gorm:"type:jsonb"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}
