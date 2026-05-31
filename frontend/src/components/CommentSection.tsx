import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import { commentsService } from '../services/comments';
import { authService } from '../services/auth';

interface CommentSectionProps {
  topicId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ topicId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = authService.getUser();

  useEffect(() => {
    if (topicId) {
      loadComments();
    }
  }, [topicId]);

   const loadComments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await commentsService.getComments(topicId);

      setComments(data?.comments || []);
    } catch (err: any) {
      console.error('Error loading comments:', err);
      setError('Не удалось загрузить комментарии');
      setComments([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await commentsService.createComment(topicId, { text: newComment });
      if (response?.result) {
        
        setComments(prevComments => [response.result, ...prevComments]);
        setNewComment('');
      }
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError(err.response?.data?.error || 'Не удалось отправить комментарий');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="comment-section">
        <h3>Комментарии</h3>
        <div className="loading">Загрузка комментариев...</div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h3>Комментарии ({comments.length})</h3>
      
      {error && (
        <div className="error" style={{ marginBottom: '15px' }}>
          {error}
          <button 
            onClick={loadComments} 
            className="btn btn-secondary" 
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            Повторить
          </button>
        </div>
      )}
      
      <div className="comments-list" style={{ marginBottom: '20px' }}>
        {comments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#8892b0' }}>
            Пока нет комментариев. Будьте первым!
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id || index} className="card" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong>{comment.fullName || comment.userName || 'Аноним'}</strong>
                  <span style={{ marginLeft: '10px', color: '#64ffda', fontSize: '14px' }}>
                    Роль: {comment.role === 'Organizer' ? 'Организатор' : comment.role === 'Participant' ? 'Участник' : 'Не определена'}
                  </span>
                </div>
                <small style={{ color: '#8892b0' }}>
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString('ru-RU') : 'Только что'}
                </small>
              </div>
              <p style={{ marginBottom: '0' }}>{comment.text || 'Нет содержимого'}</p>
            </div>
          ))
        )}
      </div>

      {user && (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написать комментарий..."
            rows={3}
            required
            disabled={submitting}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Отправка...' : 'Отправить комментарий'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentSection;