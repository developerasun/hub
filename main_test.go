package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/developerasun/keydian/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setup(t *testing.T) *gin.Engine {
	db, oErr := gorm.Open(sqlite.Open("./keydian_test.db"), &gorm.Config{
		SkipDefaultTransaction: true,
	})
	require.NoError(t, oErr)

	err := db.Migrator().DropTable("api_keys", "clients", "requests")
	require.NoError(t, err)

	db.AutoMigrate(&models.ApiKey{}, &models.Client{}, &models.Request{})

	r := gin.Default()
	r.POST("/api/generate", func(ctx *gin.Context) {
		GenerateApiKey(ctx, db)
	})

	return r
}

func Test_GenerateApiKey(t *testing.T) {
	r := setup(t)

	t.Run("create api key by client", func(t *testing.T) {
		w := httptest.NewRecorder()
		body := struct {
			Name        string
			Description string
		}{
			Name:        "guest",
			Description: "guest",
		}
		out, err := json.Marshal(body)
		require.NoError(t, err)

		req, err := http.NewRequest(http.MethodPost, "/api/generate", bytes.NewBuffer(out))
		require.NoError(t, err)

		req.Header.Set("Origin", "https://test.com")
		r.ServeHTTP(w, req)
	})
}
