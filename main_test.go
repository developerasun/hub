package main

import (
	"bytes"
	"context"
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

func setup(t *testing.T) (*gin.Engine, *gorm.DB) {
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
	r.GET("/api/confirm", func(ctx *gin.Context) {
		isValid := IsValidKey(ctx, db)
		ctx.JSON(http.StatusOK, gin.H{"isValid": isValid})
	})

	return r, db
}

func Test_GenerateApiKey(t *testing.T) {
	r, db := setup(t)

	t.Run("create api key by client", func(t *testing.T) {
		t.Skip()
		generateApiKey(r, t)
	})

	t.Run("validate api key", func(t *testing.T) {
		generateApiKey(r, t)

		w := httptest.NewRecorder()
		req, err := http.NewRequest(http.MethodGet, "/api/confirm", nil)
		require.NoError(t, err)

		req.Header.Set(models.AuthHeader, "dummy")
		r.ServeHTTP(w, req)

		var resp struct {
			IsValid bool `json:"isValid"`
		}
		uErr := json.Unmarshal(w.Body.Bytes(), &resp)

		t.Log(resp.IsValid)
		t.Log(w.Body.String())
		require.NoError(t, uErr)
		require.True(t, resp.IsValid == false)

		req2, err := http.NewRequest(http.MethodGet, "/api/confirm", nil)
		context := context.Background()
		apiKey, tErr := gorm.G[models.ApiKey](db).Take(context)
		require.NoError(t, tErr)

		req2.Header.Set(models.AuthHeader, apiKey.Code)
		w2 := httptest.NewRecorder()
		r.ServeHTTP(w2, req2)
		uErr = json.Unmarshal(w2.Body.Bytes(), &resp)
		require.True(t, resp.IsValid == true)
	})
}

func generateApiKey(r *gin.Engine, t *testing.T) {
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

	require.True(t, w.Code == http.StatusOK)
}
