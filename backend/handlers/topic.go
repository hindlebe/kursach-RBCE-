package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"student-projects-platform/db"
	"student-projects-platform/middleware"
	"student-projects-platform/models"
	"student-projects-platform/utils"

	"github.com/google/uuid"
)

func GetTopics(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	rows, err := db.DB.Query(`
		SELECT t.id, t.title, t.event_start, t.summary, t.topic_type, t.city, t.street, t.is_voided
		FROM topics t
		WHERE t.is_voided = 0
		ORDER BY t.created_at DESC
	`)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Ошибка базы данных"})
		return
	}
	defer rows.Close()

	var topics []models.Topic
	for rows.Next() {
		var topic models.Topic
		var eventStart sql.NullString
		err := rows.Scan(&topic.ID, &topic.Title, &eventStart, &topic.Summary, &topic.TopicType, &topic.Location.City, &topic.Location.Street, &topic.IsVoided)
		if err != nil {
			continue
		}
		if eventStart.Valid {
			topic.EventStart = &eventStart.String
		} else {
			topic.EventStart = nil
		}

		// Get users for this topic
		userRows, err := db.DB.Query(`
			SELECT u.id, u.user_name, u.full_name, tu.role
			FROM topic_users tu
			JOIN users u ON tu.user_id = u.id
			WHERE tu.topic_id = ?
		`, topic.ID)
		if err == nil {
			var users []models.TopicUser
			for userRows.Next() {
				var user models.TopicUser
				userRows.Scan(&user.ID, &user.Username, &user.FullName, &user.Role)
				users = append(users, user)
			}
			userRows.Close()
			topic.Users = users
		} else {
			topic.Users = []models.TopicUser{}
		}

		topics = append(topics, topic)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.GetTopicsResponse{Topics: topics})
}

func GetTopic(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Параметр id обязателен"})
		return
	}

	var topic models.Topic
	var eventStart sql.NullString
	err := db.DB.QueryRow(`
		SELECT id, title, event_start, summary, topic_type, city, street, is_voided, created_by
		FROM topics
		WHERE id = ? AND is_voided = 0
	`, id).Scan(&topic.ID, &topic.Title, &eventStart, &topic.Summary, &topic.TopicType, &topic.Location.City, &topic.Location.Street, &topic.IsVoided, &topic.CreatedBy)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Проект не найден"})
		return
	}

	if eventStart.Valid {
		topic.EventStart = &eventStart.String
	} else {
		topic.EventStart = nil
	}

	rows, err := db.DB.Query(`
		SELECT u.id, u.user_name, u.full_name, tu.role
		FROM topic_users tu
		JOIN users u ON tu.user_id = u.id
		WHERE tu.topic_id = ?
	`, id)
	if err == nil {
		defer rows.Close()
		var users []models.TopicUser
		for rows.Next() {
			var user models.TopicUser
			rows.Scan(&user.ID, &user.Username, &user.FullName, &user.Role)
			users = append(users, user)
		}
		topic.Users = users
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.GetTopicResponse{Topic: topic})
}

func CreateTopic(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	claims := middleware.GetUserFromContext(r)
	if claims == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не авторизован"})
		return
	}

	var req models.CreateTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Неверный формат запроса"})
		return
	}

	// Валидация названия проекта
	if titleErrors := utils.ValidateProjectTitle(req.Title); len(titleErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":   "Название проекта не соответствует требованиям",
			"details": titleErrors,
		})
		return
	}

	// Валидация описания проекта
	if summaryErrors := utils.ValidateProjectSummary(req.Summary); len(summaryErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":   "Описание проекта не соответствует требованиям",
			"details": summaryErrors,
		})
		return
	}

	// Валидация типа проекта
	validTypes := map[string]bool{
		"Development": true,
		"Workshop":    true,
		"Research":    true,
		"Hackathon":   true,
		"Other":       true,
	}
	if !validTypes[req.TopicType] {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Неверный тип проекта"})
		return
	}

	// Валидация локации
	if len(strings.TrimSpace(req.Location.City)) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Укажите корректный город (минимум 2 символа)"})
		return
	}
	if len(req.Location.City) > 100 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Название города не должно превышать 100 символов"})
		return
	}
	if len(strings.TrimSpace(req.Location.Street)) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Укажите корректную улицу (минимум 2 символа)"})
		return
	}
	if len(req.Location.Street) > 200 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Название улицы не должно превышать 200 символов"})
		return
	}

	// Санитизация входных данных
	req.Title = utils.SanitizeString(strings.TrimSpace(req.Title))
	req.Summary = utils.SanitizeString(strings.TrimSpace(req.Summary))
	req.Location.City = utils.SanitizeString(strings.TrimSpace(req.Location.City))
	req.Location.Street = utils.SanitizeString(strings.TrimSpace(req.Location.Street))

	topicID := uuid.New().String()
	_, err := db.DB.Exec(`
		INSERT INTO topics (id, title, summary, topic_type, city, street, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, topicID, req.Title, req.Summary, req.TopicType, req.Location.City, req.Location.Street, claims.UserID)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не удалось создать проект"})
		return
	}

	_, err = db.DB.Exec(`
		INSERT INTO topic_users (topic_id, user_id, role)
		VALUES (?, ?, ?)
	`, topicID, claims.UserID, "Organizer")

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не удалось добавить организатора"})
		return
	}

	topic := models.Topic{
		ID:         topicID,
		Title:      req.Title,
		EventStart: nil,
		Summary:    req.Summary,
		TopicType:  req.TopicType,
		Location:   req.Location,
		IsVoided:   false,
		Users: []models.TopicUser{
			{
				ID:       claims.UserID,
				Username: claims.UserName,
				FullName: "",
				Role:     "Organizer",
			},
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(topic)
}

func UpdateTopic(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Параметр id обязателен"})
		return
	}

	claims := middleware.GetUserFromContext(r)
	if claims == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не авторизован"})
		return
	}

	var createdBy string
	err := db.DB.QueryRow("SELECT created_by FROM topics WHERE id = ? AND is_voided = 0", id).Scan(&createdBy)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Проект не найден"})
		return
	}

	if createdBy != claims.UserID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Только организатор может редактировать проект"})
		return
	}

	var req models.UpdateTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Неверный формат запроса"})
		return
	}

	// Валидация названия проекта при обновлении
	if titleErrors := utils.ValidateProjectTitle(req.Title); len(titleErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":   "Название проекта не соответствует требованиям",
			"details": titleErrors,
		})
		return
	}

	// Валидация описания проекта при обновлении
	if summaryErrors := utils.ValidateProjectSummary(req.Summary); len(summaryErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":   "Описание проекта не соответствует требованиям",
			"details": summaryErrors,
		})
		return
	}

	// Валидация локации
	if len(strings.TrimSpace(req.Location.City)) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Укажите корректный город (минимум 2 символа)"})
		return
	}
	if len(strings.TrimSpace(req.Location.Street)) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Укажите корректную улицу (минимум 2 символа)"})
		return
	}

	// Санитизация
	req.Title = utils.SanitizeString(strings.TrimSpace(req.Title))
	req.Summary = utils.SanitizeString(strings.TrimSpace(req.Summary))
	req.Location.City = utils.SanitizeString(strings.TrimSpace(req.Location.City))
	req.Location.Street = utils.SanitizeString(strings.TrimSpace(req.Location.Street))

	_, err = db.DB.Exec(`
		UPDATE topics
		SET title = ?, event_start = ?, summary = ?, topic_type = ?, city = ?, street = ?
		WHERE id = ?
	`, req.Title, req.EventStart, req.Summary, req.TopicType, req.Location.City, req.Location.Street, id)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не удалось обновить проект"})
		return
	}

	var topic models.Topic
	var eventStart sql.NullString
	err = db.DB.QueryRow(`
		SELECT id, title, event_start, summary, topic_type, city, street, is_voided
		FROM topics WHERE id = ?
	`, id).Scan(&topic.ID, &topic.Title, &eventStart, &topic.Summary, &topic.TopicType, &topic.Location.City, &topic.Location.Street, &topic.IsVoided)

	if err == nil {
		if eventStart.Valid {
			topic.EventStart = &eventStart.String
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.UpdateTopicResponse{TopicResponseDto: topic})
}

func DeleteTopic(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/Topics/DeleteTopic/")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Параметр id обязателен"})
		return
	}

	claims := middleware.GetUserFromContext(r)
	if claims == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не авторизован"})
		return
	}

	var createdBy string
	err := db.DB.QueryRow("SELECT created_by FROM topics WHERE id = ? AND is_voided = 0", id).Scan(&createdBy)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Проект не найден"})
		return
	}

	if createdBy != claims.UserID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Только организатор может удалить проект"})
		return
	}

	_, err = db.DB.Exec("UPDATE topics SET is_voided = 1 WHERE id = ?", id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не удалось удалить проект"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.DeleteResponse{IsSuccess: true})
}

func JoinLeaveTopic(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Параметр id обязателен"})
		return
	}

	claims := middleware.GetUserFromContext(r)
	if claims == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Не авторизован"})
		return
	}

	// Проверяем, существует ли проект
	var projectExists bool
	err := db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM topics WHERE id = ? AND is_voided = 0)", id).Scan(&projectExists)
	if err != nil || !projectExists {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Проект не найден"})
		return
	}

	var count int
	err = db.DB.QueryRow(`
		SELECT COUNT(*) FROM topic_users WHERE topic_id = ? AND user_id = ?
	`, id, claims.UserID).Scan(&count)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Ошибка базы данных"})
		return
	}

	if count > 0 {
		// Выход из проекта
		_, err = db.DB.Exec(`
			DELETE FROM topic_users WHERE topic_id = ? AND user_id = ?
		`, id, claims.UserID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Не удалось выйти из проекта"})
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(models.JoinLeaveResponse{Details: "Вы успешно вышли из проекта", IsSuccess: true})
	} else {
		// Присоединение к проекту
		_, err = db.DB.Exec(`
			INSERT INTO topic_users (topic_id, user_id, role) VALUES (?, ?, ?)
		`, id, claims.UserID, "Participant")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Не удалось присоединиться к проекту"})
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(models.JoinLeaveResponse{Details: "Вы успешно присоединились к проекту", IsSuccess: true})
	}
}
