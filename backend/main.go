package main

import (
	"log"
	"net/http"
	"student-projects-platform/db"
	"student-projects-platform/handlers"
	"student-projects-platform/middleware"

	"github.com/gorilla/mux"
)

func main() {

	if err := db.InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.CloseDB()

	r := mux.NewRouter()

	// Публичные маршруты
	r.HandleFunc("/api/Auth/Register", handlers.Register).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/Auth/login", handlers.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/Comment/GetComments", handlers.GetComments).Methods("GET", "OPTIONS")

	// Защищенные маршруты
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.HandleFunc("/Topics/GetTopics", handlers.GetTopics).Methods("GET", "OPTIONS")
	protected.HandleFunc("/Topics/GetTopic", handlers.GetTopic).Methods("GET", "OPTIONS")
	protected.HandleFunc("/Topics/CreateTopic", handlers.CreateTopic).Methods("POST", "OPTIONS")
	protected.HandleFunc("/Topics/UpdateTopic", handlers.UpdateTopic).Methods("PUT", "OPTIONS")
	protected.HandleFunc("/Topics/DeleteTopic/{id}", handlers.DeleteTopic).Methods("DELETE", "OPTIONS")
	protected.HandleFunc("/Topics/JoinLeaveTopic", handlers.JoinLeaveTopic).Methods("POST", "OPTIONS")
	protected.HandleFunc("/Comment/CreateComment", handlers.CreateComment).Methods("POST", "OPTIONS")

	// CORS middleware
	r.Use(middleware.CORS)

	log.Println("Server starting on :3333")
	log.Fatal(http.ListenAndServe(":3333", r))
}
