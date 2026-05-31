package db

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB, err = sql.Open("sqlite3", "./app.db")
	if err != nil {
		return err
	}

	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			user_name TEXT UNIQUE NOT NULL,
			full_name TEXT NOT NULL,
			about TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS topics (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			summary TEXT NOT NULL,
			topic_type TEXT NOT NULL,
			city TEXT NOT NULL,
			street TEXT NOT NULL,
			event_start DATETIME,
			is_voided BOOLEAN DEFAULT 0,
			created_by TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(created_by) REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS topic_users (
			topic_id TEXT NOT NULL,
			user_id TEXT NOT NULL,
			role TEXT NOT NULL,
			joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY(topic_id, user_id),
			FOREIGN KEY(topic_id) REFERENCES topics(id),
			FOREIGN KEY(user_id) REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY,
			text TEXT NOT NULL,
			topic_id TEXT NOT NULL,
			user_id TEXT NOT NULL,
			user_role_at_time TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(topic_id) REFERENCES topics(id),
			FOREIGN KEY(user_id) REFERENCES users(id)
		)`,
	}

	for _, query := range queries {
		_, err = DB.Exec(query)
		if err != nil {
			return err
		}
	}

	err = seedMockData()
	if err != nil {
		log.Printf("Предупреждение: не удалось заполнить тестовые данные: %v", err)
	}

	log.Println("База данных инициализирована успешно")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}

func GetCurrentTime() string {
	return time.Now().UTC().Format(time.RFC3339)
}

func seedMockData() error {

	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM topics").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("База данных уже содержит проекты, пропускаем заполнение")
		return nil
	}

	log.Println("Создаём тестовые проекты...")

	var userCount int
	err = DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount)
	if err != nil {
		return err
	}

	var demoUserID string
	if userCount == 0 {
		// Создаём демо-пользователя
		demoUserID = "user_demo_1"
		_, err = DB.Exec(`
			INSERT INTO users (id, email, password, user_name, full_name, about, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, demoUserID, "demo@example.com", "hashed_password", "demo_user", "Демо Пользователь", "Тестовый пользователь для демонстрации", GetCurrentTime())
		if err != nil {
			return err
		}
		log.Println("Создан демо-пользователь")
	} else {

		err = DB.QueryRow("SELECT id FROM users LIMIT 1").Scan(&demoUserID)
		if err != nil {
			return err
		}
	}

	// Тестовые проекты
	mockTopics := []struct {
		id         string
		title      string
		summary    string
		topicType  string
		city       string
		street     string
		eventStart string
		createdBy  string
	}{
		{
			id:         "topic_1",
			title:      "AI платформа для обучения",
			summary:    "Разработка адаптивной платформы обучения с использованием машинного обучения",
			topicType:  "Development",
			city:       "Москва",
			street:     "ул. Тверская, 10",
			eventStart: "2025-06-15T14:00:00Z",
			createdBy:  demoUserID,
		},
		{
			id:         "topic_2",
			title:      "Эко-доставка",
			summary:    "Мобильное приложение для связи магазинов с эко-доставкой на электромобилях",
			topicType:  "Development",
			city:       "Санкт-Петербург",
			street:     "Невский пр., 25",
			eventStart: "2025-06-20T09:00:00Z",
			createdBy:  demoUserID,
		},
		{
			id:         "topic_3",
			title:      "Блокчейн для цепочек поставок",
			summary:    "Внедрение блокчейна для отслеживания подлинности товаров",
			topicType:  "Research",
			city:       "Казань",
			street:     "ул. Баумана, 15",
			eventStart: "2025-07-01T15:00:00Z",
			createdBy:  demoUserID,
		},
		{
			id:         "topic_4",
			title:      "Воркшоп: Продвинутые паттерны React",
			summary:    "Практический воркшоп по сложным паттернам React: compound components, render props и хуки",
			topicType:  "Workshop",
			city:       "Новосибирск",
			street:     "Красный пр., 50",
			eventStart: "2025-06-25T10:00:00Z",
			createdBy:  demoUserID,
		},
		{
			id:         "topic_5",
			title:      "Воркшоп по Open Source",
			summary:    "Ежемесячный воркшоп, помогающий разработчикам сделать первый вклад в open source",
			topicType:  "Workshop",
			city:       "Онлайн",
			street:     "Discord",
			eventStart: "2025-06-30T16:00:00Z",
			createdBy:  demoUserID,
		},
	}

	for _, topic := range mockTopics {
		_, err = DB.Exec(`
			INSERT INTO topics (id, title, summary, topic_type, city, street, event_start, created_by, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, topic.id, topic.title, topic.summary, topic.topicType, topic.city, topic.street, topic.eventStart, topic.createdBy, GetCurrentTime())
		if err != nil {
			return err
		}

		_, err = DB.Exec(`
			INSERT INTO topic_users (topic_id, user_id, role, joined_at)
			VALUES (?, ?, ?, ?)
		`, topic.id, demoUserID, "Organizer", GetCurrentTime())
		if err != nil {
			return err
		}
	}

	return nil
}
