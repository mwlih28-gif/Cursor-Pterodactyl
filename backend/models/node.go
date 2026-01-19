package models

import (
	"time"

	"gorm.io/gorm"
)

type NodeStatus string

const (
	NodeStatusOnline  NodeStatus = "online"
	NodeStatusOffline NodeStatus = "offline"
)

type Node struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	Name        string       `json:"name" gorm:"not null"`
	Hostname    string       `json:"hostname" gorm:"not null"`
	IP          string       `json:"ip" gorm:"not null"`
	Port        int          `json:"port" gorm:"default:8080"`
	TotalRAM    int64        `json:"total_ram"`    // bytes
	TotalCPU    int64        `json:"total_cpu"`    // nano CPUs
	TotalDisk   int64        `json:"total_disk"`   // bytes
	UsedRAM     int64        `json:"used_ram"`     // bytes
	UsedCPU     int64        `json:"used_cpu"`     // nano CPUs
	UsedDisk    int64        `json:"used_disk"`    // bytes
	Status      NodeStatus   `json:"status" gorm:"default:'offline'"`
	Servers     []Server     `json:"servers,omitempty"`
	Allocations []Allocation `json:"allocations,omitempty"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}
