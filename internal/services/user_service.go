package services

import (
	"errors"
	"store/internal/models"
	"store/internal/repository"
	"store/pkg/auth"
)

// UserService provides user-related operations
type UserService struct {
	userRepo   *repository.UserRepository
	jwtService *auth.JWTService
}

// NewUserService creates a new UserService
func NewUserService(userRepo *repository.UserRepository, jwtService *auth.JWTService) *UserService {
	return &UserService{
		userRepo:   userRepo,
		jwtService: jwtService,
	}
}

// RegisterUser registers a new user
func (s *UserService) RegisterUser(user *models.User) error {
	// Check if user with that email already exists
	existingUser, err := s.userRepo.GetUserByEmail(user.Email)
	if err == nil && existingUser != nil {
		return errors.New("user with this email already exists")
	}

	// Set default role
	if user.Role == "" {
		user.Role = models.RoleUser
	}

	// Create the user
	return s.userRepo.CreateUser(user)
}

// LoginUser authenticates a user and returns a JWT token
func (s *UserService) LoginUser(email, password string) (string, error) {
	// Get the user
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	// Verify password
	if err := user.ComparePassword(password); err != nil {
		return "", errors.New("invalid email or password")
	}

	// Generate token
	token, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return "", err
	}

	return token, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	return s.userRepo.GetUserByID(id)
}

// UpdateUser updates a user's details
func (s *UserService) UpdateUser(user *models.User) error {
	return s.userRepo.UpdateUser(user)
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(id uint) error {
	return s.userRepo.DeleteUser(id)
}
