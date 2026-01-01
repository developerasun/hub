package models

import (
	"time"

	"gorm.io/gorm"
)

const AuthHeader = "x-keydian-code"

type ApiKey struct {
	gorm.Model
	Code      string    `gorm:"column:code;uniqueIndex"`
	Credit    uint      `gorm:"column:credit;default:100"`
	Renewable bool      `gorm:"column:renewable;default:1"`
	ExpiredAt time.Time `gorm:"column:expired_at"`
}

type Client struct {
	gorm.Model
	ApiKeyID    uint   `gorm:"column:apikey_id"`
	ApiKey      ApiKey `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Name        string `gorm:"column:name;index:idx_client_name"`
	Description string `gorm:"column:description"`
	Self        bool   `gorm:"column:self;default:0"`
}

type Request struct {
	gorm.Model
	ClientID     uint   `gorm:"column:client_id"`
	Status       uint   `gorm:"column:status;default:200"`
	Origin       string `gorm:"column:origin"`
	ErrorMessage string `gorm:"column:error_message"`
}
