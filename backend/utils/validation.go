package utils

import (
	"regexp"
	"strings"
	"unicode"
)

type ValidationResult struct {
	IsValid bool
	Errors  map[string]string
}

func ValidateEmail(email string) bool {
	// Простое regex для проверки email
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func ValidatePassword(password string) []string {
	var errors []string

	if len(password) < 4 {
		errors = append(errors, "Пароль должен содержать минимум 4 символов")
	}
	if len(password) > 72 {
		errors = append(errors, "Пароль не должен превышать 72 символа")
	}

	hasUpper := false
	hasLower := false
	hasDigit := false

	for _, char := range password {
		if unicode.IsUpper(char) {
			hasUpper = true
		}
		if unicode.IsLower(char) {
			hasLower = true
		}
		if unicode.IsDigit(char) {
			hasDigit = true
		}
	}

	if !hasUpper {
		errors = append(errors, "Пароль должен содержать хотя бы одну заглавную букву")
	}
	if !hasLower {
		errors = append(errors, "Пароль должен содержать хотя бы одну строчную букву")
	}
	if !hasDigit {
		errors = append(errors, "Пароль должен содержать хотя бы одну цифру")
	}

	return errors
}

// SanitizeString очищает строку от опасных символов
func SanitizeString(input string) string {
	// Удаляем потенциально опасные символы
	re := regexp.MustCompile(`[<>'"]`)
	return re.ReplaceAllString(input, "")
}

// ValidateProjectTitle проверяет название проекта
func ValidateProjectTitle(title string) []string {
	var errors []string

	if len(strings.TrimSpace(title)) < 3 {
		errors = append(errors, "Название проекта должно содержать минимум 3 символа")
	}
	if len(title) > 100 {
		errors = append(errors, "Название проекта не должно превышать 100 символов")
	}

	return errors
}

// ValidateProjectSummary проверяет описание проекта
func ValidateProjectSummary(summary string) []string {
	var errors []string

	if len(strings.TrimSpace(summary)) < 10 {
		errors = append(errors, "Описание проекта должно содержать минимум 10 символов")
	}
	if len(summary) > 500 {
		errors = append(errors, "Описание проекта не должно превышать 500 символов")
	}

	return errors
}
