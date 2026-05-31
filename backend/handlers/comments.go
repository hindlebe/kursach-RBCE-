package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"student-projects-platform/db"
	"student-projects-platform/middleware"
	"student-projects-platform/models"

	"github.com/google/uuid"
)

func GetComments(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "id parameter required"})
		return
	}

	rows, err := db.DB.Query(`
		SELECT c.id, c.text, u.user_name, u.full_name, c.user_role_at_time, c.created_at, c.topic_id
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.topic_id = ?
		ORDER BY c.created_at ASC
	`, id)

	if err != nil {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(models.GetCommentsResponse{Comments: []models.Comment{}})
		return
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		err := rows.Scan(&comment.ID, &comment.Text, &comment.UserName, &comment.FullName, &comment.Role, &comment.CreatedAt, &comment.TopicID)
		if err != nil {
			continue
		}
		comments = append(comments, comment)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.GetCommentsResponse{Comments: comments})
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	topicID := r.URL.Query().Get("Id")
	if topicID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Id parameter required"})
		return
	}

	claims := middleware.GetUserFromContext(r)
	if claims == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	var req models.CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	var role string
	err := db.DB.QueryRow(`
		SELECT role FROM topic_users WHERE topic_id = ? AND user_id = ?
	`, topicID, claims.UserID).Scan(&role)

	if err != nil {
		if err == sql.ErrNoRows {
			role = "Undefined"
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
			return
		}
	}

	commentID := uuid.New().String()
	_, err = db.DB.Exec(`
		INSERT INTO comments (id, text, topic_id, user_id, user_role_at_time)
		VALUES (?, ?, ?, ?, ?)
	`, commentID, req.Text, topicID, claims.UserID, role)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create comment"})
		return
	}

	var fullName string
	db.DB.QueryRow("SELECT full_name FROM users WHERE id = ?", claims.UserID).Scan(&fullName)

	comment := models.Comment{
		ID:        commentID,
		Text:      req.Text,
		UserName:  claims.UserName,
		FullName:  fullName,
		Role:      role,
		TopicID:   topicID,
		CreatedAt: db.GetCurrentTime(),
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.CreateCommentResponse{Result: comment})
}
