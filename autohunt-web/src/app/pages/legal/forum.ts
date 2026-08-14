import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ForumService, ForumTopic, ForumComment } from '../../core/services/forum';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="forum-container">
      <!-- Top Action & Filter Toolbar (Matching Screenshot 2) -->
      <div class="forum-toolbar">
        <div class="toolbar-left">
          <!-- Category Filter Dropdown -->
          <div class="select-wrap">
            <select
              class="category-select clickable"
              [ngModel]="selectedCategory()"
              (ngModelChange)="onCategoryChange($event)"
            >
              <option value="all">Todas as categorias</option>
              @for (cat of categories(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button
              class="tab-btn clickable"
              [class.active]="selectedTab() === 'recent'"
              (click)="selectTab('recent')"
            >
              Recentes
            </button>
            <button
              class="tab-btn clickable"
              [class.active]="selectedTab() === 'popular'"
              (click)="selectTab('popular')"
            >
              Melhores
            </button>
            <button
              class="tab-btn clickable"
              [class.active]="selectedTab() === 'categories'"
              (click)="selectTab('categories')"
            >
              Categorias
            </button>
          </div>
        </div>

        <div class="toolbar-right">
          <button class="new-topic-btn clickable" (click)="openNewTopicModal()">
            <lucide-icon name="plus-circle" [size]="16"></lucide-icon>
            <span>Novo Tópico</span>
          </button>
        </div>
      </div>

      <!-- Categories Overview Grid (Shown when 'Categorias' tab is active) -->
      @if (selectedTab() === 'categories') {
        <div class="categories-overview-grid">
          @for (cat of categories(); track cat) {
            <div
              class="category-card clickable"
              (click)="onCategoryChange(cat)"
            >
              <div class="cat-card-header">
                <span class="cat-dot" [style.background-color]="getCategoryColor(cat)"></span>
                <span class="cat-card-name">{{ cat }}</span>
              </div>
              <span class="cat-card-sub">Ver tópicos e discussões da comunidade</span>
            </div>
          }
        </div>
      }

      <!-- Main Forum Topics Table (Matching Screenshot 2) -->
      @if (selectedTab() !== 'categories') {
        <div class="forum-table-wrapper">
          <table class="forum-table">
            <thead>
              <tr>
                <th class="th-topic">Tópico</th>
                <th class="th-participants text-center">Participantes</th>
                <th class="th-stat text-center">Respostas</th>
                <th class="th-stat text-center">Visualizações</th>
                <th class="th-stat text-right">Atividade</th>
              </tr>
            </thead>
            <tbody>
              @if (topics().length === 0) {
                <tr class="empty-row">
                  <td colspan="5" class="text-center py-8">
                    <p class="empty-msg">Nenhum tópico encontrado nesta categoria.</p>
                  </td>
                </tr>
              } @else {
                @for (topic of topics(); track topic.id) {
                  <tr
                    class="topic-row clickable"
                    (click)="openTopicDetail(topic)"
                  >
                    <!-- Topic Info Column -->
                    <td class="td-topic">
                      <div class="topic-title-line">
                        <span class="pin-icon" *ngIf="topic.isPinned" title="Tópico fixado">📌</span>
                        <h3 class="topic-title">
                          {{ topic.title }}
                          <span class="solved-badge" *ngIf="topic.isSolved">(Resolvido)</span>
                        </h3>
                      </div>

                      <div class="topic-meta-line">
                        <span class="cat-badge">
                          <span class="cat-sq" [style.background-color]="getCategoryColor(topic.category)"></span>
                          <span class="cat-name">{{ topic.category }}</span>
                        </span>
                      </div>

                      <p class="topic-snippet">
                        {{ topic.content | slice:0:130 }}... <span class="read-more">leia mais</span>
                      </p>
                    </td>

                    <!-- Participants Avatars Column -->
                    <td class="td-participants text-center">
                      <div class="avatar-stack">
                        @for (p of topic.participantAvatars | slice:0:4; track p.name) {
                          <img
                            [src]="p.avatarUrl || 'https://ui-avatars.com/api/?name=' + p.name + '&background=0284C7&color=fff'"
                            [alt]="p.name"
                            [title]="p.name + (p.roleTag ? ' (' + p.roleTag + ')' : '')"
                            class="avatar-circle"
                          />
                        }
                      </div>
                    </td>

                    <!-- Stats Columns -->
                    <td class="td-stat text-center count-val">{{ topic.repliesCount }}</td>
                    <td class="td-stat text-center count-val">{{ topic.viewsCount }}</td>
                    <td class="td-stat text-right time-val">{{ formatTimeAgo(topic.updatedAt || topic.createdAt) }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Topic Detail & Replies Modal -->
      @if (activeTopic()) {
        <div class="modal-backdrop" (click)="closeTopicDetail()">
          <div class="modal-card topic-detail-modal" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <div class="modal-header-meta">
                <span class="cat-badge">
                  <span class="cat-sq" [style.background-color]="getCategoryColor(activeTopic()!.category)"></span>
                  <span>{{ activeTopic()!.category }}</span>
                </span>
                <span class="solved-badge" *ngIf="activeTopic()!.isSolved">(Resolvido)</span>
              </div>
              <button class="close-modal-btn clickable" (click)="closeTopicDetail()">
                <lucide-icon name="x" [size]="20"></lucide-icon>
              </button>
            </header>

            <div class="modal-body scrollable">
              <!-- Author Header -->
              <h2 class="modal-topic-title">{{ activeTopic()!.title }}</h2>

              <div class="author-bar">
                <img
                  [src]="activeTopic()!.author.avatarUrl || 'https://ui-avatars.com/api/?name=' + activeTopic()!.author.name"
                  class="author-avatar"
                />
                <div class="author-info">
                  <strong class="author-name">{{ activeTopic()!.author.name }}</strong>
                  <span class="author-tag" *ngIf="activeTopic()!.author.roleTag">{{ activeTopic()!.author.roleTag }}</span>
                  <span class="post-date">{{ formatTimeAgo(activeTopic()!.createdAt) }}</span>
                </div>
              </div>

              <!-- Post Content -->
              <div class="post-content">
                <p>{{ activeTopic()!.content }}</p>
                <img
                  *ngIf="activeTopic()!.imageUrl"
                  [src]="activeTopic()!.imageUrl"
                  class="post-attached-img"
                  alt="Imagem do tópico"
                />
              </div>

              <!-- Topic Actions (Like, Views) -->
              <div class="topic-actions-bar">
                <button
                  class="like-btn clickable"
                  [class.liked]="activeTopic()!.userLiked"
                  (click)="toggleLike(activeTopic()!)"
                >
                  <lucide-icon name="heart" [size]="18" [class.fill]="activeTopic()!.userLiked"></lucide-icon>
                  <span>{{ activeTopic()!.likesCount }} Curtidas</span>
                </button>

                <div class="view-count-badge">
                  <lucide-icon name="eye" [size]="16"></lucide-icon>
                  <span>{{ activeTopic()!.viewsCount }} Visualizações</span>
                </div>
              </div>

              <hr class="modal-divider" />

              <!-- Comments & Replies Thread -->
              <div class="comments-section">
                <h4 class="comments-heading">Respostas ({{ activeTopicComments().length }})</h4>

                <div class="comments-list">
                  @for (comment of activeTopicComments(); track comment.id) {
                    <div class="comment-item">
                      <img
                        [src]="comment.author.avatarUrl || 'https://ui-avatars.com/api/?name=' + comment.author.name"
                        class="comment-avatar"
                      />
                      <div class="comment-content-box">
                        <div class="comment-header">
                          <strong class="comment-author-name">{{ comment.author.name }}</strong>
                          <span class="comment-tag" *ngIf="comment.author.roleTag">{{ comment.author.roleTag }}</span>
                          <span class="comment-time">{{ formatTimeAgo(comment.createdAt) }}</span>
                        </div>
                        <p class="comment-text">{{ comment.content }}</p>
                        <img
                          *ngIf="comment.imageUrl"
                          [src]="comment.imageUrl"
                          class="comment-attached-img"
                          alt="Anexo da resposta"
                        />
                      </div>
                    </div>
                  }
                </div>

                <!-- Reply Form -->
                <div class="reply-form-card">
                  <h5 class="reply-form-title">Responder ao Tópico</h5>
                  <textarea
                    class="reply-textarea"
                    rows="3"
                    placeholder="Escreva sua resposta para a comunidade..."
                    [(ngModel)]="newCommentText"
                  ></textarea>

                  <div class="reply-actions-row">
                    <!-- Image Upload Button & Preview -->
                    <div class="file-upload-wrap">
                      <label class="file-btn clickable">
                        <lucide-icon name="image" [size]="16"></lucide-icon>
                        <span>{{ selectedCommentImageName || 'Anexar Imagem' }}</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          (change)="onFileSelected($event, 'comment')"
                          class="hidden-file-input"
                        />
                      </label>
                      <span *ngIf="selectedCommentImageName" class="clear-file clickable" (click)="clearImage('comment')">✕</span>
                    </div>

                    <button class="send-reply-btn clickable" (click)="submitComment()">
                      <span>Enviar Resposta</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- New Topic Modal -->
      @if (showNewTopicModal()) {
        <div class="modal-backdrop" (click)="closeNewTopicModal()">
          <div class="modal-card new-topic-modal" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h3>Criar Novo Tópico na Comunidade</h3>
              <button class="close-modal-btn clickable" (click)="closeNewTopicModal()">
                <lucide-icon name="x" [size]="20"></lucide-icon>
              </button>
            </header>

            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Título do Tópico</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Ex: Dicas de segurança na devolução de veículos..."
                  [(ngModel)]="newTopicTitle"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Categoria</label>
                <select class="form-select" [(ngModel)]="newTopicCategory">
                  @for (cat of categories(); track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Conteúdo do Tópico</label>
                <textarea
                  class="form-textarea"
                  rows="5"
                  placeholder="Descreva em detalhes a sua dúvida, relato ou sugestão para a comunidade..."
                  [(ngModel)]="newTopicContent"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Anexar Imagem (Opcional)</label>
                <div class="file-upload-box">
                  <label class="file-box-label clickable">
                    <lucide-icon name="image" [size]="20"></lucide-icon>
                    <span>{{ selectedTopicImageName || 'Escolha uma imagem (.png, .jpg, .jpeg, .webp - máx 5MB)' }}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      (change)="onFileSelected($event, 'topic')"
                      class="hidden-file-input"
                    />
                  </label>
                </div>
              </div>

              <div class="modal-actions-row">
                <button class="cancel-btn clickable" (click)="closeNewTopicModal()">Cancelar</button>
                <button class="submit-topic-btn clickable" (click)="submitNewTopic()">Publicar Tópico</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .forum-container {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #334155;
    }

    /* ── Toolbar & Filters (Matching Screenshot 2) ── */
    .forum-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .category-select {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #0F172A;
      font-size: 14px;
      font-weight: 600;
      outline: none;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      &:focus {
        border-color: #0284C7;
      }
    }

    .filter-tabs {
      display: flex;
      align-items: center;
      background: #F1F5F9;
      padding: 3px;
      border-radius: 6px;
    }

    .tab-btn {
      padding: 7px 16px;
      border-radius: 4px;
      border: none;
      background: transparent;
      color: #475569;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.15s ease;

      &.active {
        background: #0F172A;
        color: #FFFFFF;
      }

      &:hover:not(.active) {
        color: #0F172A;
      }
    }

    .new-topic-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 20px;
      border-radius: 6px;
      border: none;
      background: #0284C7;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 700;
      transition: all 0.2s ease;

      &:hover {
        background: #0369A1;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
      }
    }

    /* ── Topics Table (Matching Screenshot 2) ── */
    .forum-table-wrapper {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      background: #FFFFFF;
    }

    .forum-table {
      width: 100%;
      border-collapse: collapse;

      th {
        padding: 14px 18px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748B;
        border-bottom: 1px solid #E2E8F0;
        background: #F8FAFC;
      }

      td {
        padding: 18px;
        border-bottom: 1px solid #F1F5F9;
        vertical-align: top;
      }
    }

    .topic-row {
      transition: background 0.15s ease;

      &:hover {
        background: #F8FAFC;
      }
    }

    .td-topic {
      max-width: 500px;
    }

    .topic-title-line {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .pin-icon {
      font-size: 14px;
    }

    .topic-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
      line-height: 1.3;
    }

    .solved-badge {
      font-size: 12px;
      font-weight: 700;
      color: #16A34A;
      margin-left: 6px;
    }

    .topic-meta-line {
      margin-bottom: 6px;
    }

    .cat-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .cat-sq {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .topic-snippet {
      font-size: 13.5px;
      color: #64748B;
      margin: 0;
      line-height: 1.4;
    }

    .read-more {
      color: #0284C7;
      font-weight: 600;
    }

    /* ── Avatars Stack ── */
    .avatar-stack {
      display: inline-flex;
      align-items: center;

      .avatar-circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        margin-left: -8px;
        object-fit: cover;

        &:first-child {
          margin-left: 0;
        }
      }
    }

    .count-val {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }

    .time-val {
      font-size: 13px;
      color: #94A3B8;
      font-weight: 500;
    }

    /* ── Categories Grid ── */
    .categories-overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    .category-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 20px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #0284C7;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }

    .cat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .cat-dot {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .cat-card-name {
      font-weight: 700;
      font-size: 15px;
      color: #0F172A;
    }

    .cat-card-sub {
      font-size: 12.5px;
      color: #64748B;
    }

    /* ── Modals & Detail View ── */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2000;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-card {
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 750px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }

    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F8FAFC;
    }

    .close-modal-btn {
      background: none;
      border: none;
      color: #64748B;
      &:hover { color: #0F172A; }
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }

    .modal-topic-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 16px 0;
    }

    .author-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .author-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-size: 14.5px;
      font-weight: 700;
      color: #0F172A;
    }

    .author-tag {
      font-size: 11px;
      font-weight: 700;
      color: #0284C7;
      background: #E0F2FE;
      padding: 2px 6px;
      border-radius: 4px;
      width: fit-content;
      margin-top: 2px;
    }

    .post-date {
      font-size: 12px;
      color: #94A3B8;
      margin-top: 2px;
    }

    .post-content {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 24px;
    }

    .post-attached-img, .comment-attached-img {
      max-width: 100%;
      border-radius: 8px;
      margin-top: 12px;
      border: 1px solid #E2E8F0;
    }

    .topic-actions-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .like-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #475569;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.2s ease;

      &.liked {
        background: #FEF2F2;
        border-color: #FCA5A5;
        color: #EF4444;
      }
    }

    .view-count-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748B;
    }

    .modal-divider {
      border: none;
      border-top: 1px solid #E2E8F0;
      margin: 20px 0;
    }

    .comments-heading {
      font-size: 16px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 16px;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .comment-item {
      display: flex;
      gap: 12px;
    }

    .comment-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .comment-content-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 16px;
      flex: 1;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .comment-author-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #0F172A;
    }

    .comment-tag {
      font-size: 10px;
      font-weight: 700;
      color: #0284C7;
      background: #E0F2FE;
      padding: 1px 5px;
      border-radius: 4px;
    }

    .comment-time {
      font-size: 11px;
      color: #94A3B8;
      margin-left: auto;
    }

    .comment-text {
      font-size: 14px;
      color: #334155;
      margin: 0;
    }

    /* ── Reply Form ── */
    .reply-form-card {
      background: #F1F5F9;
      border-radius: 8px;
      padding: 16px;
    }

    .reply-form-title {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 10px 0;
    }

    .reply-textarea, .form-textarea, .form-input, .form-select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
      font-size: 14px;
      outline: none;

      &:focus {
        border-color: #0284C7;
      }
    }

    .reply-actions-row, .modal-actions-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;
    }

    .file-upload-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #0284C7;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 6px 12px;
      border-radius: 6px;
    }

    .hidden-file-input {
      display: none;
    }

    .clear-file {
      font-size: 14px;
      color: #EF4444;
      font-weight: 700;
    }

    .send-reply-btn, .submit-topic-btn {
      background: #0284C7;
      color: #FFFFFF;
      border: none;
      font-weight: 700;
      font-size: 14px;
      padding: 8px 20px;
      border-radius: 6px;

      &:hover { background: #0369A1; }
    }

    .cancel-btn {
      background: transparent;
      border: 1px solid #CBD5E1;
      color: #64748B;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 6px;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 768px) {
      .th-participants, .td-participants, .th-stat, .td-stat {
        display: none;
      }
      .forum-toolbar {
        flex-direction: column;
        align-items: stretch;
      }
      .toolbar-left {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-tabs {
        justify-content: space-around;
      }
    }
  `]
})
export class ForumComponent implements OnInit, OnDestroy {
  private forumService = inject(ForumService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  topics = signal<ForumTopic[]>([]);
  categories = signal<string[]>(['Aluguel', 'Veículos', 'Dicas', 'Suporte', 'Servidor', 'WordPress', 'Domínios', 'Cloudflare']);

  selectedCategory = signal<string>('all');
  selectedTab = signal<string>('recent');

  activeTopic = signal<ForumTopic | null>(null);
  activeTopicComments = signal<ForumComment[]>([]);

  showNewTopicModal = signal<boolean>(false);

  // Form states
  newTopicTitle = '';
  newTopicCategory = 'Aluguel';
  newTopicContent = '';
  selectedTopicBase64Image: string | undefined = undefined;
  selectedTopicImageName = '';

  newCommentText = '';
  selectedCommentBase64Image: string | undefined = undefined;
  selectedCommentImageName = '';

  private pollInterval: any = null;

  ngOnInit() {
    this.loadTopics();
    this.forumService.getCategories().subscribe(cats => this.categories.set(cats));

    // Dynamic living community polling ticker (every 15s)
    this.pollInterval = setInterval(() => {
      this.loadTopics(true);
      if (this.activeTopic()) {
        this.loadComments(this.activeTopic()!.id);
      }
    }, 15000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadTopics(silent = false) {
    const category = this.selectedCategory();
    const sort = this.selectedTab();
    this.forumService.getTopics(category, sort).subscribe(list => {
      this.topics.set(list);
    });
  }

  onCategoryChange(cat: string) {
    this.selectedCategory.set(cat);
    this.loadTopics();
  }

  selectTab(tab: string) {
    this.selectedTab.set(tab);
    if (tab !== 'categories') {
      this.loadTopics();
    }
  }

  openTopicDetail(topic: ForumTopic) {
    this.activeTopic.set(topic);
    this.loadComments(topic.id);
  }

  closeTopicDetail() {
    this.activeTopic.set(null);
    this.activeTopicComments.set([]);
    this.newCommentText = '';
    this.clearImage('comment');
  }

  loadComments(topicId: number) {
    this.forumService.getComments(topicId).subscribe(comments => {
      this.activeTopicComments.set(comments);
    });
  }

  toggleLike(topic: ForumTopic) {
    if (!this.auth.isLoggedIn()) {
      this.toast.warning('Faça login no sistema para curtir tópicos.');
      return;
    }

    this.forumService.toggleLike(topic.id).subscribe(updated => {
      if (updated) {
        this.activeTopic.set(updated);
        this.topics.update(list => list.map(t => t.id === updated.id ? updated : t));
      }
    });
  }

  submitComment() {
    if (!this.auth.isLoggedIn()) {
      this.toast.warning('Faça login no sistema para responder.');
      return;
    }

    if (!this.newCommentText || !this.newCommentText.trim()) {
      this.toast.warning('Escreva uma mensagem antes de enviar.');
      return;
    }

    const topicId = this.activeTopic()!.id;
    this.forumService.addComment(topicId, {
      content: this.newCommentText.trim(),
      imageUrl: this.selectedCommentBase64Image
    }).subscribe(comment => {
      if (comment) {
        this.toast.success('Resposta enviada com sucesso!');
        this.newCommentText = '';
        this.clearImage('comment');
        this.loadComments(topicId);
        this.loadTopics(true);
      }
    });
  }

  openNewTopicModal() {
    if (!this.auth.isLoggedIn()) {
      this.toast.warning('Faça login no sistema para criar um novo tópico.');
      return;
    }
    this.showNewTopicModal.set(true);
  }

  closeNewTopicModal() {
    this.showNewTopicModal.set(false);
    this.newTopicTitle = '';
    this.newTopicContent = '';
    this.clearImage('topic');
  }

  submitNewTopic() {
    if (!this.newTopicTitle || !this.newTopicTitle.trim()) {
      this.toast.warning('Informe um título para o tópico.');
      return;
    }
    if (!this.newTopicContent || !this.newTopicContent.trim()) {
      this.toast.warning('Informe o conteúdo do tópico.');
      return;
    }

    this.forumService.createTopic({
      title: this.newTopicTitle.trim(),
      category: this.newTopicCategory,
      content: this.newTopicContent.trim(),
      imageUrl: this.selectedTopicBase64Image
    }).subscribe(topic => {
      if (topic) {
        this.toast.success('Tópico criado com sucesso!');
        this.closeNewTopicModal();
        this.loadTopics();
      }
    });
  }

  onFileSelected(event: any, type: 'topic' | 'comment') {
    const file: File = event.target.files[0];
    if (!file) return;

    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      this.toast.error('Formato de imagem inválido. Formatos permitidos: .png, .jpg, .jpeg, .webp');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('A imagem excede o tamanho máximo de 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'topic') {
        this.selectedTopicBase64Image = reader.result as string;
        this.selectedTopicImageName = file.name;
      } else {
        this.selectedCommentBase64Image = reader.result as string;
        this.selectedCommentImageName = file.name;
      }
    };
    reader.readAsDataURL(file);
  }

  clearImage(type: 'topic' | 'comment') {
    if (type === 'topic') {
      this.selectedTopicBase64Image = undefined;
      this.selectedTopicImageName = '';
    } else {
      this.selectedCommentBase64Image = undefined;
      this.selectedCommentImageName = '';
    }
  }

  getCategoryColor(cat: string): string {
    switch (cat) {
      case 'Servidor': return '#3B82F6';
      case 'WordPress': return '#0284C7';
      case 'Domínios': return '#84CC16';
      case 'Cloudflare': return '#F97316';
      case 'Aluguel': return '#10B981';
      case 'Veículos': return '#8B5CF6';
      case 'Dicas': return '#EC4899';
      default: return '#64748B';
    }
  }

  formatTimeAgo(dateStr: string): string {
    if (!dateStr) return 'agora';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} d`;
  }
}
