package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ServerStatus string

const (
	ServerStatusOffline  ServerStatus = "offline"
	ServerStatusStarting ServerStatus = "starting"
	ServerStatusOnline   ServerStatus = "online"
	ServerStatusStopping ServerStatus = "stopping"
)

type Server struct {
	ID           uint         `json:"id" gorm:"primaryKey"`
	UUID         string       `json:"uuid" gorm:"uniqueIndex;not null"`
	Name         string       `json:"name" gorm:"not null"`
	OwnerID      uint         `json:"owner_id" gorm:"not null;index"`
	Owner        User         `json:"owner,omitempty" gorm:"foreignKey:OwnerID"`
	NodeID       uint         `json:"node_id" gorm:"not null;index"`
	Node         Node         `json:"node,omitempty" gorm:"foreignKey:NodeID"`
	AllocationID uint         `json:"allocation_id" gorm:"not null;index"`
	Allocation   Allocation   `json:"allocation,omitempty" gorm:"foreignKey:AllocationID"`
	DockerImage  string       `json:"docker_image" gorm:"not null"`
	Status       ServerStatus `json:"status" gorm:"default:'offline'"`
	MemoryLimit  int64        `json:"memory_limit"` // bytes
	CPULimit     int64        `json:"cpu_limit"`    // nano CPUs
	DiskLimit    int64        `json:"disk_limit"`   // bytes
	Backups      []Backup     `json:"backups,omitempty"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (s *Server) BeforeCreate(tx *gorm.DB) error {
	if s.UUID == "" {
		s.UUID = uuid.New().String()
	}
	return nil
}

