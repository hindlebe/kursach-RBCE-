export interface Location {
  city: string;
  street: string;
}

export interface TopicUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface Topic {
  id: string;
  title: string;
  eventStart: string | null;
  summary: string;
  topicType: string;
  location: Location;
  isVoided: boolean;
  users: TopicUser[];
}

export interface Comment {
  id: string;
  text: string;
  userName: string;
  fullName: string;
  role: string;
  topicId: string;
  createdAt: string;
}

export interface AuthResponse {
  result: {
    userName: string;
    email: string;
    jwtToken: string;
  };
}

export interface CreateTopicRequest {
  title: string;
  summary: string;
  topicType: string;
  location: Location;
}

export interface UpdateTopicRequest {
  title: string;
  eventStart: string | null;
  summary: string;
  topicType: string;
  location: Location;
}

export interface CreateCommentRequest {
  text: string;
}