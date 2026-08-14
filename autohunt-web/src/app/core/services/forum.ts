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
  participantsCount: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  participantAvatars: ForumAuthor[];
  lastActivityAuthor: string;
  userLiked: boolean;
}

export interface ForumComment {
  id: number;
  topicId: number;
  author: ForumAuthor;
  content: string;
  imageUrl?: string;
  createdAt: string;
  parentCommentId?: number;
}

export interface ForumPage {
  content: ForumTopic[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface CategoryStats {
  name: string;
  topicCount: number;
  color: string;
}

export interface FeaturedMember {
  id: number;
  name: string;
  avatarUrl: string;
  roleTag: string;
  postCount: number;
  commentCount: number;
}

export interface ForumStats {
  totalTopics: number;
  totalComments: number;
  totalMembers: number;
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

  getTopics(category?: string, sort?: string, search?: string, page = 0, size = 20): Observable<ForumPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (category && category !== 'all' && category !== 'Todas') {
      params = params.set('category', category);
    }
    if (sort) {
      params = params.set('sort', sort);
    }
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ForumPage>(`${this.apiUrl}/topics`, { params }).pipe(
      catchError(() => of({ content: [], totalPages: 0, totalElements: 0, currentPage: 0, pageSize: size }))
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

  getCategoryStats(): Observable<CategoryStats[]> {
    return this.http.get<CategoryStats[]>(`${this.apiUrl}/categories`).pipe(
      catchError(() => of([]))
    );
  }

  getFeaturedMember(): Observable<FeaturedMember | null> {
    return this.http.get<FeaturedMember>(`${this.apiUrl}/featured-member`).pipe(
      catchError(() => of(null))
    );
  }

  getForumStats(): Observable<ForumStats> {
    return this.http.get<ForumStats>(`${this.apiUrl}/stats`).pipe(
      catchError(() => of({ totalTopics: 0, totalComments: 0, totalMembers: 0 }))
    );
  }
}
