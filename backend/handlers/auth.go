package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"student-projects-platform/db"
	"student-projects-platform/models"
	"student-projects-platform/utils"

	"github.com/google/uuid"
)

func hashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	var count int
	err := db.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = ? OR user_name = ?", req.Email, req.UserName).Scan(&count)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
		return
	}
	if count > 0 {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "User already exists"})
		return
	}

	userID := uuid.New().String()
	hashedPassword := hashPassword(req.Password)

	_, err = db.DB.Exec(
		"INSERT INTO users (id, email, password, user_name, full_name, about) VALUES (?, ?, ?, ?, ?, ?)",
		userID, req.Email, hashedPassword, req.UserName, req.FullName, req.About,
	)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create user"})
		return
	}

	token, err := utils.GenerateJWT(userID, req.UserName, req.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
		return
	}

	response := models.AuthResponse{
		UserName: req.UserName,
		Email:    req.Email,
		JWTToken: token,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"result": response})
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	hashedPassword := hashPassword(req.Password)

	var userID, userName, email string
	err := db.DB.QueryRow(
		"SELECT id, user_name, email FROM users WHERE email = ? AND password = ?",
		req.Email, hashedPassword,
	).Scan(&userID, &userName, &email)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateJWT(userID, userName, email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
		return
	}

	response := models.AuthResponse{
		UserName: userName,
		Email:    email,
		JWTToken: token,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"result": response})
}
