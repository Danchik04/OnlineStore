package auth

import (
	"errors"
	"fmt"
	"store/config"
	"store/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTService provides JWT operations
type JWTService struct {
	secretKey      string
	tokenExpireDur time.Duration
}

// NewJWTService creates a new JWT service
func NewJWTService(cfg *config.Config) (*JWTService, error) {
	expirationDuration, err := time.ParseDuration(cfg.TokenExpiration)
	if err != nil {
		return nil, fmt.Errorf("invalid token expiration duration: %w", err)
	}

	return &JWTService{
		secretKey:      cfg.JWTSecret,
		tokenExpireDur: expirationDuration,
	}, nil
}

// TokenClaims contains JWT claims data
type TokenClaims struct {
	UserID uint        `json:"user_id"`
	Role   models.Role `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for a user
func (s *JWTService) GenerateToken(user *models.User) (string, error) {
	claims := TokenClaims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.tokenExpireDur)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.secretKey))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken validates the given token
func (s *JWTService) ValidateToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
