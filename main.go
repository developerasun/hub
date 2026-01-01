package main

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/developerasun/keydian/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func main() {
	e := gin.Default()
	e.SetTrustedProxies(nil)

	db, oErr := gorm.Open(sqlite.Open("keydian.db"), &gorm.Config{
		SkipDefaultTransaction: true,
	})

	db.AutoMigrate(&models.ApiKey{}, &models.Client{}, &models.Request{})

	if oErr != nil {
		log.Fatal(errors.New(oErr.Error()))
	}

	api := e.Group("/api")
	api.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "ok"})
	})

	api.POST("/generate", func(ctx *gin.Context) {
		GenerateApiKey(ctx, db)
	})

	e.Run(":3010")
}

func GenerateApiKey(ctx *gin.Context, db *gorm.DB) {
	var GenerateApiKeyRequest struct {
		Name        string
		Description string
	}
	if err := ctx.ShouldBindJSON(&GenerateApiKeyRequest); err != nil {
		ctx.Error(err)
	}

	origin := ctx.Request.Header.Get("Origin")

	err := db.Transaction(func(tx *gorm.DB) error {
		apiKey := &models.ApiKey{
			Code:      uuid.New().String(),
			ExpiredAt: time.Now().AddDate(0, 1, 0),
		}
		if err := tx.Clauses(
			clause.OnConflict{UpdateAll: true},
		).Create(apiKey).Error; err != nil {
			return err
		}

		client := &models.Client{
			ApiKeyID:    apiKey.ID,
			Name:        GenerateApiKeyRequest.Name,
			Description: GenerateApiKeyRequest.Description,
		}
		if err := tx.Create(&client).Error; err != nil {
			return err
		}

		request := &models.Request{
			ClientID: client.ID,
			Origin:   origin,
		}
		if err := tx.Create(request).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		if err := db.Create(&models.Request{
			Status:       http.StatusInternalServerError,
			Origin:       origin,
			ErrorMessage: err.Error(),
		}).Error; err != nil {
			ctx.Error(err)
		}

		ctx.Error(err)
	}
}
