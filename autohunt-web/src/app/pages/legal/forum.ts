import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Heart, Eye, MessageSquare, Search, PlusCircle, X, Pin, CheckCircle, Star, ChevronLeft, ChevronRight, Image, Filter, TrendingUp, Clock, Users, MessageCircle, Award, Menu, Shield } from 'lucide-angular';
import { ForumService, ForumTopic, ForumComment, ForumPage, CategoryStats, FeaturedMember, ForumStats } from '../../core/services/forum';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <!-- Forum Header -->
    <div class="forum-header">
      <div class="forum-header-inner">
        <div class="forum-brand">
          <lucide-icon name="message-circle" [size]="28"></lucide-icon>
          <h1>Comunidade Nexdrive</h1>
        </div>
        <div class="forum-search-header">
          <lucide-icon name="search" [size]="16"></lucide-icon>
          <input type="text" placeholder="Buscar discussoes..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" />
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="forum-layout">
      <!-- Sidebar -->
      <aside class="forum-sidebar" [class.sidebar-open]="sidebarOpen()">
        <div class="sidebar-overlay" (click)="sidebarOpen.set(false)"></div>
        <div class="sidebar-content">
          <button class="btn-new-discussion" (click)="openNewTopic()">
            <lucide-icon name="plus-circle" [size]="18"></lucide-icon>
            Iniciar Discussao
          </button>

          <nav class="sidebar-nav">
            <a class="nav-item" [class.active]="!activeCategory()" (click)="filterCategory(null)">
              <lucide-icon name="message-square" [size]="16"></lucide-icon>
              Todas as Discussoes
            </a>
          </nav>

          <div class="sidebar-section">
            <h3 class="sidebar-title">Categorias</h3>
            @for (cat of categories(); track cat.name) {
              <a class="nav-item category-item" [class.active]="activeCategory() === cat.name" (click)="filterCategory(cat.name)">
                <span class="cat-dot" [style.background]="cat.color"></span>
                {{ cat.name }}
                <span class="cat-count">{{ cat.topicCount }}</span>
              </a>
            }
          </div>

          @if (featuredMember()) {
            <div class="sidebar-widget featured-widget">
              <h3 class="sidebar-title">
                <lucide-icon name="award" [size]="14"></lucide-icon>
                Membro Destacado
              </h3>
              <div class="featured-card">
                <img [src]="featuredMember()!.avatarUrl" [alt]="featuredMember()!.name" class="featured-avatar" />
                <div class="featured-info">
                  <span class="featured-name">{{ featuredMember()!.name }}</span>
                  <span class="featured-role">{{ featuredMember()!.roleTag }}</span>
                </div>
                <div class="featured-stats">
                  <span><strong>{{ featuredMember()!.postCount }}</strong> posts</span>
                  <span><strong>{{ featuredMember()!.commentCount }}</strong> respostas</span>
                </div>
              </div>
            </div>
          }

          @if (forumStats()) {
            <div class="sidebar-widget stats-widget">
              <h3 class="sidebar-title">Estatisticas</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-value">{{ forumStats()!.totalTopics }}</span>
                  <span class="stat-label">Discussoes</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ forumStats()!.totalComments }}</span>
                  <span class="stat-label">Respostas</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ forumStats()!.totalMembers }}</span>
                  <span class="stat-label">Membros</span>
                </div>
              </div>
            </div>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <main class="forum-main">
        <!-- Mobile toggle -->
        <button class="mobile-sidebar-toggle" (click)="sidebarOpen.set(!sidebarOpen())">
          <lucide-icon name="menu" [size]="20"></lucide-icon>
          Categorias
        </button>

        <!-- Top Controls -->
        <div class="controls-bar">
          <div class="sort-controls">
            <button class="sort-btn" [class.active]="currentSort() === 'recent'" (click)="setSort('recent')">
              <lucide-icon name="clock" [size]="14"></lucide-icon>
              Recentes
            </button>
            <button class="sort-btn" [class.active]="currentSort() === 'popular'" (click)="setSort('popular')">
              <lucide-icon name="trending-up" [size]="14"></lucide-icon>
              Melhores
            </button>
          </div>
          @if (activeCategory()) {
            <button class="clear-filter-btn" (click)="filterCategory(null)">
              <lucide-icon name="x" [size]="14"></lucide-icon>
              {{ activeCategory() }}
            </button>
          }
        </div>

        <!-- Discussion List -->
        <div class="discussion-list">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Carregando discussoes...</span>
            </div>
          } @else if (topics().length === 0) {
            <div class="empty-state">
              <lucide-icon name="message-square" [size]="48"></lucide-icon>
              <h3>Nenhuma discussao encontrada</h3>
              <p>Seja o primeiro a iniciar uma discussao!</p>
            </div>
          } @else {
            @for (topic of topics(); track topic.id) {
              <div class="discussion-row" [class.is-pinned]="topic.isPinned" (click)="openTopic(topic)">
                <div class="disc-avatar-col">
                  <img [src]="topic.author.avatarUrl" [alt]="topic.author.name" class="disc-avatar" />
                  <span class="online-dot"></span>
                </div>
                <div class="disc-content-col">
                  <div class="disc-title-row">
                    @if (topic.isPinned) {
                      <span class="badge badge-pinned"><lucide-icon name="pin" [size]="10"></lucide-icon></span>
                    }
                    @if (topic.isSolved) {
                      <span class="badge badge-solved"><lucide-icon name="check-circle" [size]="10"></lucide-icon> Resolvido</span>
                    }
                    <span class="disc-title">{{ topic.title }}</span>
                  </div>
                  <div class="disc-meta-row">
                    <span class="cat-tag" [style.background]="getCategoryColor(topic.category)">{{ topic.category }}</span>
                    <span class="disc-activity">
                      {{ topic.lastActivityAuthor || topic.author.name }}
                      <span class="dot-sep"></span>
                      {{ timeAgo(topic.updatedAt) }}
                    </span>
                  </div>
                </div>
                <div class="disc-stats-col">
                  <div class="disc-participants">
                    @for (p of topic.participantAvatars?.slice(0, 3); track p.id) {
                      <img [src]="p.avatarUrl" [alt]="p.name" class="mini-avatar" />
                    }
                  </div>
                  <div class="reply-badge" [class.has-replies]="topic.repliesCount > 0">
                    {{ topic.repliesCount }}
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">
              <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
            </button>
            @for (p of pageRange(); track p) {
              <button class="page-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">
                {{ p + 1 }}
              </button>
            }
            <button class="page-btn" [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">
              <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
            </button>
          </div>
        }
      </main>
    </div>

    <!-- Topic Detail Modal -->
    @if (selectedTopic()) {
      <div class="modal-overlay" (click)="closeTopicModal($event)">
        <div class="modal-content topic-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-section">
              <h2>{{ selectedTopic()!.title }}</h2>
              <div class="modal-meta">
                <span class="cat-tag" [style.background]="getCategoryColor(selectedTopic()!.category)">{{ selectedTopic()!.category }}</span>
                @if (selectedTopic()!.isSolved) {
                  <span class="badge badge-solved"><lucide-icon name="check-circle" [size]="12"></lucide-icon> Resolvido</span>
                }
              </div>
            </div>
            <button class="modal-close" (click)="selectedTopic.set(null)">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>

          <div class="modal-body">
            <!-- Original Post -->
            <div class="post-item op-post">
              <div class="post-author">
                <img [src]="selectedTopic()!.author.avatarUrl" [alt]="selectedTopic()!.author.name" class="post-avatar" />
                <div class="post-author-info">
                  <span class="post-author-name">{{ selectedTopic()!.author.name }}</span>
                  <span class="post-author-role">{{ selectedTopic()!.author.roleTag }}</span>
                </div>
                <span class="post-time">{{ timeAgo(selectedTopic()!.createdAt) }}</span>
              </div>
              <div class="post-body">{{ selectedTopic()!.content }}</div>
              @if (selectedTopic()!.imageUrl) {
                <img [src]="selectedTopic()!.imageUrl" alt="Imagem do topico" class="post-image" />
              }
              <div class="post-actions">
                <button class="action-btn" [class.liked]="selectedTopic()!.userLiked" (click)="toggleLike()">
                  <lucide-icon name="heart" [size]="16"></lucide-icon>
                  {{ selectedTopic()!.likesCount }}
                </button>
                <span class="action-info">
                  <lucide-icon name="eye" [size]="16"></lucide-icon>
                  {{ selectedTopic()!.viewsCount }}
                </span>
                <span class="action-info">
                  <lucide-icon name="message-square" [size]="16"></lucide-icon>
                  {{ selectedTopic()!.repliesCount }}
                </span>
              </div>
            </div>

            <!-- Comments -->
            <div class="comments-section">
              <h3 class="comments-title">{{ comments().length }} resposta{{ comments().length !== 1 ? 's' : '' }}</h3>
              @for (comment of comments(); track comment.id) {
                <div class="post-item comment-post">
                  <div class="post-author">
                    <img [src]="comment.author.avatarUrl" [alt]="comment.author.name" class="post-avatar small" />
                    <div class="post-author-info">
                      <span class="post-author-name">{{ comment.author.name }}</span>
                      <span class="post-author-role">{{ comment.author.roleTag }}</span>
                    </div>
                    <span class="post-time">{{ timeAgo(comment.createdAt) }}</span>
                  </div>
                  <div class="post-body">{{ comment.content }}</div>
                  @if (comment.imageUrl) {
                    <img [src]="comment.imageUrl" alt="Imagem do comentario" class="post-image" />
                  }
                </div>
              }
            </div>

            <!-- Reply Form -->
            <div class="reply-form">
              <h3>Responder</h3>
              @if (auth.isLoggedIn()) {
                <textarea [(ngModel)]="replyContent" placeholder="Escreva sua resposta..." rows="3"></textarea>
                <div class="reply-actions">
                  <button class="btn-primary" [disabled]="!replyContent.trim()" (click)="submitReply()">
                    Enviar Resposta
                  </button>
                </div>
              } @else {
                <div class="login-prompt">
                  <lucide-icon name="shield" [size]="20"></lucide-icon>
                  <span>Faca login para participar da discussao.</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- New Topic Modal -->
    @if (showNewTopicModal()) {
      <div class="modal-overlay" (click)="closeNewTopicModal($event)">
        <div class="modal-content new-topic-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Iniciar Discussao</h2>
            <button class="modal-close" (click)="showNewTopicModal.set(false)">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Titulo</label>
              <input type="text" [(ngModel)]="newTopicTitle" placeholder="Titulo da discussao" />
            </div>
            <div class="form-group">
              <label>Categoria</label>
              <select [(ngModel)]="newTopicCategory">
                @for (cat of categories(); track cat.name) {
                  <option [value]="cat.name">{{ cat.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Conteudo</label>
              <textarea [(ngModel)]="newTopicContent" placeholder="Descreva sua duvida ou contribuicao..." rows="5"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn-secondary" (click)="showNewTopicModal.set(false)">Cancelar</button>
              <button class="btn-primary" [disabled]="!newTopicTitle.trim() || !newTopicContent.trim()" (click)="submitNewTopic()">
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    /* ═══ Forum Header ═══ */
    .forum-header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 16px 24px;
      border-bottom: 3px solid #0284C7;
    }
    .forum-header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .forum-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
    }
    .forum-brand h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
    }
    .forum-search-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 6px 12px;
      max-width: 360px;
      flex: 1;
      color: rgba(255,255,255,0.7);
      transition: all 0.2s;
    }
    .forum-search-header:focus-within {
      background: rgba(255,255,255,0.15);
      border-color: #0284C7;
    }
    .forum-search-header input {
      background: none;
      border: none;
      color: #fff;
      font-size: 0.875rem;
      font-family: 'Inter', sans-serif;
      width: 100%;
      outline: none;
    }
    .forum-search-header input::placeholder { color: rgba(255,255,255,0.5); }

    /* ═══ Layout ═══ */
    .forum-layout {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 0;
      min-height: 80vh;
    }

    /* ═══ Sidebar ═══ */
    .forum-sidebar { padding: 20px 16px; border-right: 1px solid #E2E8F0; background: #F8FAFC; }
    .sidebar-overlay { display: none; }
    .sidebar-content { position: sticky; top: 80px; }

    .btn-new-discussion {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      background: #0284C7;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 20px;
    }
    .btn-new-discussion:hover { background: #0369A1; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(2,132,199,0.3); }

    .sidebar-nav { margin-bottom: 16px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      color: #475569;
      font-size: 0.875rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
    }
    .nav-item:hover { background: #E2E8F0; color: #0F172A; }
    .nav-item.active { background: #0284C7; color: #fff; font-weight: 600; }

    .sidebar-section { margin-bottom: 20px; }
    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94A3B8;
      margin: 0 0 8px 12px;
    }

    .category-item { justify-content: flex-start; }
    .cat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .cat-count {
      margin-left: auto;
      background: #E2E8F0;
      color: #64748B;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 1px 7px;
      border-radius: 10px;
    }
    .nav-item.active .cat-count { background: rgba(255,255,255,0.2); color: #fff; }

    /* Featured Member */
    .sidebar-widget { margin-bottom: 16px; }
    .featured-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .featured-avatar { width: 52px; height: 52px; border-radius: 50%; border: 3px solid #0284C7; object-fit: cover; }
    .featured-info { text-align: center; }
    .featured-name { display: block; font-weight: 600; font-size: 0.875rem; color: #0F172A; }
    .featured-role { display: block; font-size: 0.75rem; color: #64748B; }
    .featured-stats {
      display: flex;
      gap: 16px;
      font-size: 0.75rem;
      color: #64748B;
    }
    .featured-stats strong { color: #0284C7; }

    /* Stats Widget */
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; text-align: center; }
    .stat-item { padding: 8px 0; }
    .stat-value { display: block; font-size: 1.1rem; font-weight: 700; color: #0284C7; font-family: 'Outfit', sans-serif; }
    .stat-label { display: block; font-size: 0.65rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.03em; }

    /* ═══ Main Content ═══ */
    .forum-main { padding: 20px 24px; background: #fff; }

    .mobile-sidebar-toggle {
      display: none;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      color: #475569;
      font-size: 0.85rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      margin-bottom: 12px;
    }

    .controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }
    .sort-controls { display: flex; gap: 4px; }
    .sort-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      background: #fff;
      color: #64748B;
      font-size: 0.8rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.15s;
    }
    .sort-btn:hover { border-color: #CBD5E1; color: #0F172A; }
    .sort-btn.active { background: #0284C7; color: #fff; border-color: #0284C7; }

    .clear-filter-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: #FEF3C7;
      border: 1px solid #FCD34D;
      border-radius: 20px;
      color: #92400E;
      font-size: 0.75rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
    }

    /* ═══ Discussion List ═══ */
    .discussion-list { display: flex; flex-direction: column; }

    .discussion-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-bottom: 1px solid #F1F5F9;
      cursor: pointer;
      transition: background 0.15s;
    }
    .discussion-row:hover { background: #F8FAFC; }
    .discussion-row.is-pinned { background: #FFFBEB; border-left: 3px solid #F59E0B; }

    .disc-avatar-col { position: relative; flex-shrink: 0; }
    .disc-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #E2E8F0; }
    .online-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid #fff;
    }

    .disc-content-col { flex: 1; min-width: 0; }
    .disc-title-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
    .disc-title {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      color: #0F172A;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .discussion-row:hover .disc-title { color: #0284C7; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 7px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .badge-pinned { background: #FEF3C7; color: #92400E; }
    .badge-solved { background: #D1FAE5; color: #065F46; }

    .disc-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .cat-tag {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
    }
    .disc-activity {
      font-size: 0.75rem;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot-sep { width: 3px; height: 3px; border-radius: 50%; background: #CBD5E1; }

    .disc-stats-col {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .disc-participants { display: flex; }
    .mini-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #fff;
      margin-left: -6px;
      object-fit: cover;
    }
    .mini-avatar:first-child { margin-left: 0; }

    .reply-badge {
      min-width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      color: #94A3B8;
      background: #F1F5F9;
      transition: all 0.15s;
    }
    .reply-badge.has-replies { background: #0284C7; color: #fff; }

    /* Loading & Empty */
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #94A3B8;
      gap: 12px;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid #E2E8F0;
      border-top-color: #0284C7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state h3 { font-family: 'Outfit', sans-serif; color: #64748B; margin: 0; }
    .empty-state p { color: #94A3B8; font-size: 0.875rem; margin: 0; }

    /* ═══ Pagination ═══ */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 20px;
      padding: 16px 0;
    }
    .page-btn {
      min-width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      background: #fff;
      color: #64748B;
      font-size: 0.85rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.15s;
    }
    .page-btn:hover:not(:disabled) { border-color: #0284C7; color: #0284C7; }
    .page-btn.active { background: #0284C7; color: #fff; border-color: #0284C7; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ═══ Modal ═══ */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15,23,42,0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 16px;
      overflow-y: auto;
    }
    .modal-content {
      background: #fff;
      border-radius: 12px;
      width: 100%;
      max-width: 760px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.25s ease-out;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 1px solid #E2E8F0;
    }
    .modal-title-section h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: #0F172A;
      margin: 0 0 8px 0;
    }
    .modal-meta { display: flex; gap: 8px; align-items: center; }
    .modal-close {
      background: none;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      transition: color 0.15s;
      flex-shrink: 0;
    }
    .modal-close:hover { color: #0F172A; }
    .modal-body { padding: 20px 24px; }

    /* Posts */
    .post-item { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F1F5F9; }
    .post-author { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .post-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #E2E8F0; }
    .post-avatar.small { width: 32px; height: 32px; }
    .post-author-info { flex: 1; }
    .post-author-name { display: block; font-weight: 600; font-size: 0.875rem; color: #0F172A; }
    .post-author-role { display: block; font-size: 0.7rem; color: #94A3B8; }
    .post-time { font-size: 0.75rem; color: #94A3B8; }
    .post-body { font-size: 0.9rem; line-height: 1.6; color: #334155; white-space: pre-wrap; }
    .post-image { max-width: 100%; border-radius: 8px; margin-top: 12px; }

    .post-actions { display: flex; gap: 16px; margin-top: 12px; }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 4px 12px;
      color: #64748B;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .action-btn:hover { border-color: #CBD5E1; color: #0F172A; }
    .action-btn.liked { color: #EF4444; border-color: #FCA5A5; background: #FEF2F2; }
    .action-info { display: flex; align-items: center; gap: 5px; color: #94A3B8; font-size: 0.8rem; }

    .comments-section { margin-top: 20px; }
    .comments-title {
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: #0F172A;
      margin-bottom: 16px;
    }
    .comment-post { padding-left: 16px; border-left: 3px solid #E2E8F0; }

    /* Reply Form */
    .reply-form { margin-top: 20px; padding-top: 16px; border-top: 1px solid #E2E8F0; }
    .reply-form h3 { font-family: 'Outfit', sans-serif; font-size: 0.95rem; color: #0F172A; margin: 0 0 12px 0; }
    .reply-form textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .reply-form textarea:focus { border-color: #0284C7; }
    .reply-actions { display: flex; justify-content: flex-end; margin-top: 10px; }

    .login-prompt {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      color: #64748B;
      font-size: 0.85rem;
    }

    /* Buttons */
    .btn-primary {
      padding: 8px 20px;
      background: #0284C7;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-primary:hover:not(:disabled) { background: #0369A1; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary {
      padding: 8px 20px;
      background: #F1F5F9;
      color: #475569;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-secondary:hover { background: #E2E8F0; }

    /* New Topic Modal */
    .new-topic-modal .modal-body { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 10px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #0284C7; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; }

    /* ═══ Mobile Responsive ═══ */
    @media (max-width: 768px) {
      .forum-header-inner { flex-direction: column; align-items: stretch; }
      .forum-search-header { max-width: 100%; }
      .forum-layout { grid-template-columns: 1fr; }
      .forum-sidebar {
        position: fixed;
        inset: 0;
        z-index: 900;
        transform: translateX(-100%);
        transition: transform 0.3s;
        padding: 0;
        width: 280px;
      }
      .forum-sidebar.sidebar-open { transform: translateX(0); }
      .forum-sidebar.sidebar-open .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: -1;
      }
      .sidebar-content { padding: 20px 16px; height: 100%; overflow-y: auto; }
      .mobile-sidebar-toggle { display: flex; }
      .forum-main { padding: 16px; }
      .disc-participants { display: none; }
      .disc-title { white-space: normal; }
      .modal-overlay { padding: 0; align-items: stretch; }
      .modal-content { border-radius: 0; max-width: 100%; min-height: 100vh; }
    }
  `]
})
export class ForumComponent implements OnInit, OnDestroy {
  private forumService = inject(ForumService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  // State
  topics = signal<ForumTopic[]>([]);
  categories = signal<CategoryStats[]>([]);
  featuredMember = signal<FeaturedMember | null>(null);
  forumStats = signal<ForumStats | null>(null);
  loading = signal(true);
  sidebarOpen = signal(false);
  selectedTopic = signal<ForumTopic | null>(null);
  comments = signal<ForumComment[]>([]);
  showNewTopicModal = signal(false);

  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  // Filters
  activeCategory = signal<string | null>(null);
  currentSort = signal('recent');
  searchQuery = '';

  // New Topic
  newTopicTitle = '';
  newTopicContent = '';
  newTopicCategory = 'Suporte';

  // Reply
  replyContent = '';

  // Polling
  private pollingInterval: any;

  private categoryColors: Record<string, string> = {
    'Suporte': '#3B82F6',
    'Duvidas sobre Veiculos': '#8B5CF6',
    'Experiencias com Locadoras': '#10B981',
    'Dicas e Mecanica': '#F97316',
    'Off-Topic': '#6B7280',
    'Anuncios': '#EF4444'
  };

  pageRange = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  });

  ngOnInit() {
    this.loadTopics();
    this.loadSidebar();
    this.pollingInterval = setInterval(() => this.loadTopics(true), 12000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  loadTopics(silent = false) {
    if (!silent) this.loading.set(true);
    this.forumService.getTopics(
      this.activeCategory() || undefined,
      this.currentSort(),
      this.searchQuery || undefined,
      this.currentPage(),
      20
    ).subscribe(page => {
      this.topics.set(page.content);
      this.totalPages.set(page.totalPages);
      this.totalElements.set(page.totalElements);
      this.loading.set(false);
    });
  }

  loadSidebar() {
    this.forumService.getCategoryStats().subscribe(cats => this.categories.set(cats));
    this.forumService.getFeaturedMember().subscribe(m => this.featuredMember.set(m));
    this.forumService.getForumStats().subscribe(s => this.forumStats.set(s));
  }

  filterCategory(cat: string | null) {
    this.activeCategory.set(cat);
    this.currentPage.set(0);
    this.sidebarOpen.set(false);
    this.loadTopics();
  }

  setSort(sort: string) {
    this.currentSort.set(sort);
    this.currentPage.set(0);
    this.loadTopics();
  }

  onSearch() {
    this.currentPage.set(0);
    this.loadTopics();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadTopics();
  }

  openTopic(topic: ForumTopic) {
    this.forumService.getTopicById(topic.id).subscribe(t => {
      if (t) {
        this.selectedTopic.set(t);
        this.loadComments(t.id);
      }
    });
  }

  loadComments(topicId: number) {
    this.forumService.getComments(topicId).subscribe(c => this.comments.set(c));
  }

  toggleLike() {
    const topic = this.selectedTopic();
    if (!topic) return;
    if (!this.auth.isLoggedIn()) {
      this.toast.warning('Faca login para curtir');
      return;
    }
    this.forumService.toggleLike(topic.id).subscribe(updated => {
      if (updated) {
        this.selectedTopic.set(updated);
        this.loadTopics(true);
      }
    });
  }

  submitReply() {
    const topic = this.selectedTopic();
    if (!topic || !this.replyContent.trim()) return;
    this.forumService.addComment(topic.id, { content: this.replyContent.trim() }).subscribe(comment => {
      if (comment) {
        this.comments.set([...this.comments(), comment]);
        this.replyContent = '';
        this.toast.success('Resposta publicada');
        this.loadTopics(true);
      }
    });
  }

  openNewTopic() {
    if (!this.auth.isLoggedIn()) {
      this.toast.warning('Faca login para criar uma discussao');
      return;
    }
    this.showNewTopicModal.set(true);
    if (this.categories().length > 0) {
      this.newTopicCategory = this.categories()[0].name;
    }
  }

  submitNewTopic() {
    if (!this.newTopicTitle.trim() || !this.newTopicContent.trim()) return;
    this.forumService.createTopic({
      title: this.newTopicTitle.trim(),
      content: this.newTopicContent.trim(),
      category: this.newTopicCategory
    }).subscribe(topic => {
      if (topic) {
        this.showNewTopicModal.set(false);
        this.newTopicTitle = '';
        this.newTopicContent = '';
        this.toast.success('Discussao criada');
        this.loadTopics();
        this.loadSidebar();
      }
    });
  }

  closeTopicModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.selectedTopic.set(null);
    }
  }

  closeNewTopicModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showNewTopicModal.set(false);
    }
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || '#64748B';
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    return `${months}m`;
  }
}
