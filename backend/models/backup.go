package models

import (
	"time"

	"gorm.io/gorm"
)

type Backup struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	ServerID  uint           `json:"server_id" gorm:"not null;index"`
	Server    Server         `json:"server,omitempty" gorm:"foreignKey:ServerID"`
	Size      int64          `json:"size"` // bytes
	Path      string         `json:"path" gorm:"not null"`
	IsSuccess bool           `json:"is_success" gorm:"default:false"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
