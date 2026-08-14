import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ForumService, ForumTopic, ForumComment, CategoryStats, FeaturedMember, ForumStats } from '../../core/services/forum';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="forum-container">
      <!-- Forum Header -->
      <div class="forum-header">
        <div class="forum-header-inner">
          <div class="forum-brand">
            <lucide-icon name="message-circle" [size]="28"></lucide-icon>
            <h1>Comunidade Nexdrive</h1>
          </div>
          <div class="forum-search-header">
            <lucide-icon name="search" [size]="16"></lucide-icon>
            <input type="text" placeholder="Buscar discussões..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" />
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="forum-layout">
        <!-- Sidebar -->
        <aside class="forum-sidebar" [class.sidebar-open]="sidebarOpen()">
          <div class="sidebar-overlay" (click)="sidebarOpen.set(false)"></div>
          <div class="sidebar-content">
            <button class="btn-new-discussion clickable" (click)="openNewTopic()">
              <lucide-icon name="plus-circle" [size]="18"></lucide-icon>
              Iniciar Discussão
            </button>

            <nav class="sidebar-nav">
              <a class="nav-item clickable" [class.active]="!activeCategory()" (click)="filterCategory(null)">
                <lucide-icon name="message-square" [size]="16"></lucide-icon>
                Todas as Discussões
              </a>
            </nav>

            <div class="sidebar-section">
              <h3 class="sidebar-title">Categorias</h3>
              @for (cat of categories(); track cat.name) {
                <a class="nav-item category-item clickable" [class.active]="activeCategory() === cat.name" (click)="filterCategory(cat.name)">
                  <span class="cat-dot" [style.background]="cat.color || getCategoryColor(cat.name)"></span>
                  <span class="cat-name">{{ cat.name }}</span>
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
                <h3 class="sidebar-title">Estatísticas</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-value">{{ forumStats()!.totalTopics }}</span>
                    <span class="stat-label">Discussões</span>
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
          <button class="mobile-sidebar-toggle clickable" (click)="sidebarOpen.set(!sidebarOpen())">
            <lucide-icon name="menu" [size]="20"></lucide-icon>
            Categorias & Filtros
          </button>

          <!-- Top Controls -->
          <div class="controls-bar">
            <div class="sort-controls">
              <button class="sort-btn clickable" [class.active]="currentSort() === 'recent'" (click)="setSort('recent')">
                <lucide-icon name="clock" [size]="14"></lucide-icon>
                Recentes
              </button>
              <button class="sort-btn clickable" [class.active]="currentSort() === 'popular'" (click)="setSort('popular')">
                <lucide-icon name="trending-up" [size]="14"></lucide-icon>
                Melhores
              </button>
            </div>
            @if (activeCategory()) {
              <button class="clear-filter-btn clickable" (click)="filterCategory(null)">
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
                <span>Carregando discussões em tempo real...</span>
              </div>
            } @else if (topics().length === 0) {
              <div class="empty-state">
                <lucide-icon name="message-square" [size]="48"></lucide-icon>
                <h3>Nenhuma discussão encontrada nesta categoria</h3>
                <p>Seja o primeiro a iniciar um tópico sobre este assunto!</p>
                <button class="btn-primary clickable" (click)="openNewTopic()" style="margin-top: 12px;">
                  Criar Tópico Agora
                </button>
              </div>
            } @else {
              @for (topic of topics(); track topic.id) {
                <div class="discussion-row clickable" [class.is-pinned]="topic.isPinned" (click)="openTopic(topic)">
                  <div class="disc-avatar-col">
                    <img [src]="topic.author.avatarUrl" [alt]="topic.author.name" class="disc-avatar" />
                    <span class="online-dot"></span>
                  </div>
                  <div class="disc-content-col">
                    <div class="disc-title-row">
                      @if (topic.isPinned) {
                        <span class="badge badge-pinned"><lucide-icon name="pin" [size]="10"></lucide-icon> Fixo</span>
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
                        <span class="dot-sep">•</span>
                        {{ timeAgo(topic.updatedAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="disc-stats-col">
                    <div class="disc-metrics">
                      <span title="Visualizações"><lucide-icon name="eye" [size]="13"></lucide-icon> {{ topic.viewsCount }}</span>
                      <span title="Curtidas"><lucide-icon name="heart" [size]="13"></lucide-icon> {{ topic.likesCount }}</span>
                    </div>
                    <div class="reply-badge" [class.has-replies]="topic.repliesCount > 0" title="Respostas">
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
              <button class="page-btn clickable" [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">
                <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
              </button>
              @for (p of pageRange(); track p) {
                <button class="page-btn clickable" [class.active]="p === currentPage()" (click)="goToPage(p)">
                  {{ p + 1 }}
                </button>
              }
              <button class="page-btn clickable" [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">
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
              <button class="modal-close clickable" (click)="selectedTopic.set(null)">
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
                  <img [src]="selectedTopic()!.imageUrl" alt="Imagem do tópico" class="post-image" />
                }
                <div class="post-actions">
                  <button class="action-btn clickable" [class.liked]="selectedTopic()!.userLiked" (click)="toggleLike()">
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
                      <img [src]="comment.imageUrl" alt="Imagem do comentário" class="post-image" />
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
                    <button class="btn-primary clickable" [disabled]="!replyContent.trim()" (click)="submitReply()">
                      Enviar Resposta
                    </button>
                  </div>
                } @else {
                  <div class="login-prompt">
                    <lucide-icon name="shield" [size]="20"></lucide-icon>
                    <span>Faça login na plataforma para publicar respostas nesta discussão.</span>
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
              <h2>Iniciar Discussão</h2>
              <button class="modal-close clickable" (click)="showNewTopicModal.set(false)">
                <lucide-icon name="x" [size]="20"></lucide-icon>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Título</label>
                <input type="text" [(ngModel)]="newTopicTitle" placeholder="Título descritivo da discussão" />
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
                <label>Conteúdo</label>
                <textarea [(ngModel)]="newTopicContent" placeholder="Descreva sua dúvida, experiência ou contribuição..." rows="5"></textarea>
              </div>
              <div class="form-actions">
                <button class="btn-secondary clickable" (click)="showNewTopicModal.set(false)">Cancelar</button>
                <button class="btn-primary clickable" [disabled]="!newTopicTitle.trim() || !newTopicContent.trim()" (click)="submitNewTopic()">
                  Publicar Discussão
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .forum-container {
      width: 100%;
      min-height: 80vh;
      border-radius: 14px;
      overflow: hidden;
      background: var(--surface, #FFFFFF);
      border: 1px solid var(--border, #E2E8F0);
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.06));
    }

    /* ═══ Forum Header ═══ */
    .forum-header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 18px 24px;
      border-bottom: 3px solid var(--accent, #0284C7);
    }
    .forum-header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .forum-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #FFFFFF;
    }
    .forum-brand h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      margin: 0;
      white-space: nowrap;
      color: #FFFFFF;
    }
    .forum-search-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 8px 14px;
      max-width: 380px;
      flex: 1;
      color: rgba(255, 255, 255, 0.8);
      transition: all 0.2s ease;
    }
    .forum-search-header:focus-within {
      background: rgba(255, 255, 255, 0.2);
      border-color: var(--accent, #00BFEA);
    }
    .forum-search-header input {
      background: none;
      border: none;
      color: #FFFFFF;
      font-size: 0.875rem;
      font-family: 'Inter', sans-serif;
      width: 100%;
      outline: none;
    }
    .forum-search-header input::placeholder { color: rgba(255, 255, 255, 0.6); }

    /* ═══ Layout ═══ */
    .forum-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 0;
      min-height: 75vh;
    }

    /* ═══ Sidebar ═══ */
    .forum-sidebar {
      padding: 20px 16px;
      border-right: 1px solid var(--border, #E2E8F0);
      background: var(--surface-secondary, #F8FAFC);
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .sidebar-overlay { display: none; }
    .sidebar-content { position: sticky; top: 90px; }

    .btn-new-discussion {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px 16px;
      background: var(--accent, #0284C7);
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }
    .btn-new-discussion:hover {
      background: var(--accent-hover, #0369A1);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
    }

    .sidebar-nav { margin-bottom: 16px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      color: var(--text-secondary, #475569);
      font-size: 0.875rem;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .nav-item:hover {
      background: var(--surface-hover, #E2E8F0);
      color: var(--text-primary, #0F172A);
    }
    .nav-item.active {
      background: var(--accent, #0284C7);
      color: #FFFFFF;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
    }

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
      color: var(--text-muted, #94A3B8);
      margin: 0 0 10px 10px;
    }

    .category-item { justify-content: flex-start; }
    .cat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .cat-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cat-count {
      margin-left: auto;
      background: var(--border, #E2E8F0);
      color: var(--text-secondary, #64748B);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .nav-item.active .cat-count { background: rgba(255, 255, 255, 0.25); color: #FFFFFF; }

    /* Featured Member */
    .sidebar-widget { margin-bottom: 16px; }
    .featured-card {
      background: var(--surface, #FFFFFF);
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04));
    }
    .featured-avatar { width: 56px; height: 56px; border-radius: 50%; border: 3px solid var(--accent, #0284C7); object-fit: cover; }
    .featured-info { text-align: center; }
    .featured-name { display: block; font-weight: 700; font-size: 0.9rem; color: var(--text-primary, #0F172A); }
    .featured-role { display: block; font-size: 0.75rem; color: var(--text-secondary, #64748B); }
    .featured-stats {
      display: flex;
      gap: 16px;
      font-size: 0.75rem;
      color: var(--text-secondary, #64748B);
    }
    .featured-stats strong { color: var(--accent, #0284C7); }

    /* Stats Widget */
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; }
    .stat-item {
      padding: 8px 4px;
      background: var(--surface, #FFFFFF);
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 8px;
    }
    .stat-value { display: block; font-size: 1.15rem; font-weight: 800; color: var(--accent, #0284C7); font-family: 'Outfit', sans-serif; }
    .stat-label { display: block; font-size: 0.65rem; color: var(--text-muted, #94A3B8); text-transform: uppercase; letter-spacing: 0.03em; }

    /* ═══ Main Content ═══ */
    .forum-main {
      padding: 24px;
      background: var(--surface, #FFFFFF);
      transition: background 0.3s ease;
    }

    .mobile-sidebar-toggle {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--surface-secondary, #F1F5F9);
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 8px;
      color: var(--text-primary, #475569);
      font-size: 0.875rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      margin-bottom: 16px;
    }

    .controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }
    .sort-controls { display: flex; gap: 6px; }
    .sort-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1.5px solid var(--border, #E2E8F0);
      border-radius: 8px;
      background: var(--surface, #FFFFFF);
      color: var(--text-secondary, #64748B);
      font-size: 0.85rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .sort-btn:hover { border-color: var(--accent, #0284C7); color: var(--text-primary, #0F172A); }
    .sort-btn.active { background: var(--accent, #0284C7); color: #FFFFFF; border-color: var(--accent, #0284C7); }

    .clear-filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #FEF3C7;
      border: 1px solid #FCD34D;
      border-radius: 20px;
      color: #92400E;
      font-size: 0.78rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
    }

    /* ═══ Discussion List ═══ */
    .discussion-list { display: flex; flex-direction: column; gap: 4px; }

    .discussion-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 18px;
      border: 1px solid var(--border-light, #F1F5F9);
      border-radius: 10px;
      background: var(--surface, #FFFFFF);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .discussion-row:hover {
      background: var(--surface-hover, #F8FAFC);
      border-color: var(--accent, #0284C7);
      transform: translateX(2px);
    }
    .discussion-row.is-pinned {
      background: var(--accent-light, #FFFBEB);
      border-left: 4px solid #F59E0B;
    }

    .disc-avatar-col { position: relative; flex-shrink: 0; }
    .disc-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border, #E2E8F0); }
    .online-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid #FFFFFF;
    }

    .disc-content-col { flex: 1; min-width: 0; }
    .disc-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .disc-title {
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary, #0F172A);
      line-height: 1.35;
    }
    .discussion-row:hover .disc-title { color: var(--accent, #0284C7); }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .badge-pinned { background: #FEF3C7; color: #92400E; }
    .badge-solved { background: #D1FAE5; color: #065F46; }

    .disc-meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .cat-tag {
      display: inline-block;
      padding: 2px 9px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #FFFFFF;
      white-space: nowrap;
    }
    .disc-activity {
      font-size: 0.78rem;
      color: var(--text-muted, #94A3B8);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .disc-stats-col {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .disc-metrics {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.78rem;
      color: var(--text-muted, #94A3B8);

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .reply-badge {
      min-width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 800;
      font-family: 'Outfit', sans-serif;
      color: var(--text-muted, #94A3B8);
      background: var(--surface-secondary, #F1F5F9);
      transition: all 0.15s ease;
    }
    .reply-badge.has-replies { background: var(--accent, #0284C7); color: #FFFFFF; }

    /* Loading & Empty */
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: var(--text-muted, #94A3B8);
      gap: 14px;
      text-align: center;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--border, #E2E8F0);
      border-top-color: var(--accent, #0284C7);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state h3 { font-family: 'Outfit', sans-serif; color: var(--text-primary, #64748B); margin: 0; }
    .empty-state p { color: var(--text-muted, #94A3B8); font-size: 0.9rem; margin: 0; }

    /* ═══ Pagination ═══ */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 24px;
      padding: 16px 0;
    }
    .page-btn {
      min-width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 8px;
      background: var(--surface, #FFFFFF);
      color: var(--text-secondary, #64748B);
      font-size: 0.875rem;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .page-btn:hover:not(:disabled) { border-color: var(--accent, #0284C7); color: var(--accent, #0284C7); }
    .page-btn.active { background: var(--accent, #0284C7); color: #FFFFFF; border-color: var(--accent, #0284C7); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ═══ Modal ═══ */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 16px;
      overflow-y: auto;
    }
    .modal-content {
      background: var(--surface, #FFFFFF);
      color: var(--text-primary, #0F172A);
      border-radius: 16px;
      width: 100%;
      max-width: 820px;
      box-shadow: var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.25));
      border: 1px solid var(--border, #E2E8F0);
      animation: slideUp 0.25s ease-out;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 24px;
      border-bottom: 1px solid var(--border, #E2E8F0);
    }
    .modal-title-section h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary, #0F172A);
      margin: 0 0 10px 0;
    }
    .modal-meta { display: flex; gap: 8px; align-items: center; }
    .modal-close {
      background: var(--surface-secondary, #F1F5F9);
      border: 1px solid var(--border, #E2E8F0);
      color: var(--text-muted, #94A3B8);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .modal-close:hover { color: var(--text-primary, #0F172A); background: var(--surface-hover, #E2E8F0); }
    .modal-body { padding: 24px; }

    /* Posts */
    .post-item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border-light, #F1F5F9); }
    .post-author { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .post-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border, #E2E8F0); }
    .post-avatar.small { width: 36px; height: 36px; }
    .post-author-info { flex: 1; }
    .post-author-name { display: block; font-weight: 700; font-size: 0.9rem; color: var(--text-primary, #0F172A); }
    .post-author-role { display: block; font-size: 0.75rem; color: var(--text-muted, #94A3B8); }
    .post-time { font-size: 0.78rem; color: var(--text-muted, #94A3B8); }
    .post-body { font-size: 0.95rem; line-height: 1.65; color: var(--text-primary, #334155); white-space: pre-wrap; }
    .post-image { max-width: 100%; border-radius: 10px; margin-top: 14px; }

    .post-actions { display: flex; gap: 16px; margin-top: 14px; }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--surface, #FFFFFF);
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 8px;
      padding: 6px 14px;
      color: var(--text-secondary, #64748B);
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .action-btn:hover { border-color: var(--accent, #0284C7); color: var(--text-primary, #0F172A); }
    .action-btn.liked { color: #EF4444; border-color: #FCA5A5; background: #FEF2F2; }
    .action-info { display: flex; align-items: center; gap: 6px; color: var(--text-muted, #94A3B8); font-size: 0.825rem; }

    .comments-section { margin-top: 24px; }
    .comments-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary, #0F172A);
      margin-bottom: 18px;
    }
    .comment-post { padding-left: 18px; border-left: 3px solid var(--accent, #0284C7); }

    /* Reply Form */
    .reply-form { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border, #E2E8F0); }
    .reply-form h3 { font-family: 'Outfit', sans-serif; font-size: 1rem; color: var(--text-primary, #0F172A); margin: 0 0 14px 0; }
    .reply-form textarea {
      width: 100%;
      padding: 12px 16px;
      background: var(--surface, #FFFFFF);
      color: var(--text-primary, #0F172A);
      border: 1.5px solid var(--border, #E2E8F0);
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }
    .reply-form textarea:focus { border-color: var(--accent, #0284C7); }
    .reply-actions { display: flex; justify-content: flex-end; margin-top: 12px; }

    .login-prompt {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--surface-secondary, #F8FAFC);
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 10px;
      color: var(--text-secondary, #64748B);
      font-size: 0.875rem;
    }

    /* Buttons */
    .btn-primary {
      padding: 10px 22px;
      background: var(--accent, #0284C7);
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover, #0369A1); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary {
      padding: 10px 22px;
      background: var(--surface-secondary, #F1F5F9);
      color: var(--text-primary, #475569);
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-secondary:hover { background: var(--surface-hover, #E2E8F0); }

    /* New Topic Modal */
    .new-topic-modal .modal-body { display: flex; flex-direction: column; gap: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.825rem; font-weight: 700; color: var(--text-primary, #475569); }
    .form-group input, .form-group select, .form-group textarea {
      padding: 12px 16px;
      background: var(--surface, #FFFFFF);
      color: var(--text-primary, #0F172A);
      border: 1.5px solid var(--border, #E2E8F0);
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent, #0284C7); }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }

    /* ═══ Dark Theme Styles ═══ */
    :host-context([data-theme='dark']) {
      .forum-container {
        background: #0B1426;
        border-color: #1A2744;
      }
      .forum-sidebar {
        background: #070E1C;
        border-color: #1A2744;
      }
      .forum-main {
        background: #0B1426;
      }
      .nav-item {
        color: #8B9FC7;

        &:hover {
          background: #14213D;
          color: #EDF2F7;
        }

        &.active {
          background: #00D4FF;
          color: #060D1A;
        }
      }
      .discussion-row {
        background: #0F1829;
        border-color: #1A2744;

        &:hover {
          background: #16223A;
          border-color: #00D4FF;
        }

        &.is-pinned {
          background: #1B2312;
          border-left-color: #F59E0B;
        }
      }
      .disc-title { color: #EDF2F7; }
      .featured-card, .stat-item {
        background: #0F1829;
        border-color: #1A2744;
      }
      .reply-badge {
        background: #1A2744;
        color: #8B9FC7;

        &.has-replies {
          background: #00D4FF;
          color: #060D1A;
        }
      }
      .sort-btn, .page-btn, .action-btn {
        background: #0F1829;
        border-color: #1A2744;
        color: #8B9FC7;

        &:hover {
          border-color: #00D4FF;
          color: #EDF2F7;
        }

        &.active {
          background: #00D4FF;
          color: #060D1A;
          border-color: #00D4FF;
        }
      }
      .modal-content {
        background: #0B1426;
        border-color: #1A2744;
        color: #EDF2F7;
      }
      .modal-header, .post-item, .reply-form {
        border-color: #1A2744;
      }
      .reply-form textarea, .form-group input, .form-group select, .form-group textarea {
        background: #0F1829;
        border-color: #1A2744;
        color: #EDF2F7;
      }
      .login-prompt {
        background: #0F1829;
        border-color: #1A2744;
        color: #8B9FC7;
      }
      .btn-secondary {
        background: #1A2744;
        border-color: #24355A;
        color: #EDF2F7;

        &:hover {
          background: #24355A;
        }
      }
    }

    /* ═══ Mobile Responsive ═══ */
    @media (max-width: 860px) {
      .forum-header-inner { flex-direction: column; align-items: stretch; }
      .forum-search-header { max-width: 100%; }
      .forum-layout { grid-template-columns: 1fr; }
      .forum-sidebar {
        position: fixed;
        inset: 0;
        z-index: 900;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        padding: 0;
        width: 300px;
        box-shadow: 0 0 40px rgba(0,0,0,0.4);
      }
      .forum-sidebar.sidebar-open { transform: translateX(0); }
      .forum-sidebar.sidebar-open .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: -1;
      }
      .sidebar-content { padding: 20px 16px; height: 100%; overflow-y: auto; }
      .mobile-sidebar-toggle { display: flex; }
      .forum-main { padding: 16px; }
      .disc-metrics { display: none; }
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
    'Dúvidas sobre Veículos': '#8B5CF6',
    'Duvidas sobre Veiculos': '#8B5CF6',
    'Experiências com Locadoras': '#10B981',
    'Experiencias com Locadoras': '#10B981',
    'Dicas e Mecânica': '#F97316',
    'Dicas e Mecanica': '#F97316',
    'Off-Topic': '#6B7280',
    'Anúncios': '#EF4444',
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

    // Auto-polling every 10 seconds for real-time live social feed updates
    this.pollingInterval = setInterval(() => {
      this.loadTopics(true);
      this.loadSidebar();
    }, 10000);
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
      this.toast.warning('Faça login para curtir');
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
      this.toast.warning('Faça login para criar uma discussão');
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
        this.toast.success('Discussão criada');
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
    return this.categoryColors[category] || '#0284C7';
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
