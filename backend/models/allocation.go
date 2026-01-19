package models

import (
	"time"

	"gorm.io/gorm"
)

type Allocation struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	NodeID    uint           `json:"node_id" gorm:"not null;index"`
	Node      Node           `json:"node,omitempty" gorm:"foreignKey:NodeID"`
	IP        string         `json:"ip" gorm:"not null"`
	Port      int            `json:"port" gorm:"not null;uniqueIndex:idx_allocation"`
	Assigned  bool           `json:"assigned" gorm:"default:false"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
