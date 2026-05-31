package models

type Location struct {
	City   string `json:"city"`
	Street string `json:"street"`
}

type User struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Password  string `json:"-"`
	UserName  string `json:"userName"`
	FullName  string `json:"fullName"`
	About     string `json:"about"`
	CreatedAt string `json:"createdAt"`
}

type TopicUser struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	FullName string `json:"fullName"`
	Role     string `json:"role"`
}

type Topic struct {
	ID         string      `json:"id"`
	Title      string      `json:"title"`
	EventStart *string     `json:"eventStart"`
	Summary    string      `json:"summary"`
	TopicType  string      `json:"topicType"`
	Location   Location    `json:"location"`
	IsVoided   bool        `json:"isVoided"`
	Users      []TopicUser `json:"users"`
	CreatedBy  string      `json:"-"`
}

type Comment struct {
	ID        string `json:"id"`
	Text      string `json:"text"`
	UserName  string `json:"userName"`
	FullName  string `json:"fullName"`
	Role      string `json:"role"`
	TopicID   string `json:"topicId"`
	CreatedAt string `json:"createdAt"`
}

// Request/Response DTOs
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	UserName string `json:"userName"`
	FullName string `json:"fullName"`
	About    string `json:"about"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	UserName string `json:"userName"`
	Email    string `json:"email"`
	JWTToken string `json:"jwtToken"`
}

type CreateTopicRequest struct {
	Title     string   `json:"title"`
	Summary   string   `json:"summary"`
	TopicType string   `json:"topicType"`
	Location  Location `json:"location"`
}

type UpdateTopicRequest struct {
	Title      string   `json:"title"`
	EventStart *string  `json:"eventStart"`
	Summary    string   `json:"summary"`
	TopicType  string   `json:"topicType"`
	Location   Location `json:"location"`
}

type CreateCommentRequest struct {
	Text string `json:"text"`
}

type GetTopicsResponse struct {
	Topics []Topic `json:"topics"`
}

type GetTopicResponse struct {
	Topic Topic `json:"topic"`
}

type CreateTopicResponse struct {
	ID         string      `json:"id"`
	Title      string      `json:"title"`
	EventStart *string     `json:"eventStart"`
	Summary    string      `json:"summary"`
	TopicType  string      `json:"topicType"`
	Location   Location    `json:"location"`
	IsVoided   bool        `json:"isVoided"`
	Users      []TopicUser `json:"users"`
}

type UpdateTopicResponse struct {
	TopicResponseDto Topic `json:"topicResponseDto"`
}

type JoinLeaveResponse struct {
	Details   string `json:"details"`
	IsSuccess bool   `json:"isSuccess"`
}

type DeleteResponse struct {
	IsSuccess bool `json:"isSuccess"`
}

type GetCommentsResponse struct {
	Comments []Comment `json:"comments"`
}

type CreateCommentResponse struct {
	Result Comment `json:"result"`
}
