import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface ForumAuthor {
  id: number;
  name: string;
  avatarUrl: string;
  roleTag?: string;
  isBot: boolean;
}

export interface ForumTopic {
  id: number;
  title: string;
  content: string;
  category: string;
  author: ForumAuthor;
  isPinned: boolean;
  isSolved: boolean;
  viewsCount: number;
  likesCount: number;
  repliesCount: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  participantAvatars: ForumAuthor[];
  userLiked: boolean;
}

export interface ForumComment {
  id: number;
  topicId: number;
  author: ForumAuthor;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CreateTopicPayload {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
}

export interface CreateCommentPayload {
  content: string;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private apiUrl = '/api/forum';

  getTopics(category?: string, sort?: string): Observable<ForumTopic[]> {
    let params = new HttpParams();
    if (category && category !== 'all' && category !== 'Todas as categorias') {
      params = params.set('category', category);
    }
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<ForumTopic[]>(`${this.apiUrl}/topics`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getTopicById(id: number): Observable<ForumTopic | null> {
    return this.http.get<ForumTopic>(`${this.apiUrl}/topics/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  getComments(topicId: number): Observable<ForumComment[]> {
    return this.http.get<ForumComment[]>(`${this.apiUrl}/topics/${topicId}/comments`).pipe(
      catchError(() => of([]))
    );
  }

  createTopic(payload: CreateTopicPayload): Observable<ForumTopic | null> {
    return this.http.post<ForumTopic>(`${this.apiUrl}/topics`, payload).pipe(
      catchError(() => of(null))
    );
  }

  toggleLike(topicId: number): Observable<ForumTopic | null> {
    return this.http.post<ForumTopic>(`${this.apiUrl}/topics/${topicId}/like`, {}).pipe(
      catchError(() => of(null))
    );
  }

  addComment(topicId: number, payload: CreateCommentPayload): Observable<ForumComment | null> {
    return this.http.post<ForumComment>(`${this.apiUrl}/topics/${topicId}/comments`, payload).pipe(
      catchError(() => of(null))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError(() => of(['Aluguel', 'Veículos', 'Dicas', 'Suporte', 'Servidor', 'WordPress', 'Domínios', 'Cloudflare']))
    );
  }
}
