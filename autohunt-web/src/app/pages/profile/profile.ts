import { Component, inject, signal, OnInit, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="profile-page-wrapper">
      <!-- BLOCO 1 — Dados Pessoais -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-edit" 
               (click)="fileInput.click()"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)">
            
            <div class="avatar-spinner-overlay" *ngIf="isSaving()">
              <div class="spinner"></div>
            </div>

            <img [src]="editUser.profileImageUrl || 'https://ui-avatars.com/api/?name=' + user()?.fullName" alt="Avatar" *ngIf="!isSaving()">
            
            <div class="avatar-hover-overlay" *ngIf="!isSaving()">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="camera-icon"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <span>Alterar Foto</span>
            </div>
          </div>
          <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none;">
          <div class="profile-title-group">
            <h1>{{ editUser.fullName || user()?.fullName }}</h1>
            <p class="profile-subtitle">{{ user()?.email }}</p>
            
            <div class="avatar-actions">
              <button type="button" class="btn-action clickable" (click)="fileInput.click()">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Alterar Foto
              </button>
              <button type="button" class="btn-action danger clickable" *ngIf="editUser.profileImageUrl" (click)="removePhoto()">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Remover Foto
              </button>
              <button type="button" class="btn-action primary clickable" *ngIf="hasGooglePhoto()" (click)="restoreGooglePhoto()">
                <svg width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.01 3.07v2.55h3.24c1.9-1.75 3-4.32 3-7.32 0-.63-.06-1.23-.27-2.0zM12 21c2.43 0 4.47-.8 5.96-2.18l-3.24-2.55c-.9.6-2.05.96-3.72.96-2.86 0-5.28-1.93-6.14-4.52H1.61v2.63C3.09 18.25 7.23 21 12 21zM5.86 12.71c-.22-.67-.34-1.38-.34-2.11s.12-1.44.34-2.11V5.86H1.61C.58 7.92 0 10.21 0 12.71s.58 4.79 1.61 6.85l4.25-3.0zM12 5.72c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 3.03 14.43 2.25 12 2.25 7.23 2.25 3.09 5 1.61 7.89l4.25 3.0C6.72 8.35 9.14 5.72 12 5.72z"/></svg>
                Usar Foto do Google
              </button>
            </div>
          </div>
        </div>

        <form (ngSubmit)="save()" #profileForm="ngForm" class="profile-form">
          <div class="form-grid">
            <div class="input-group">
              <label>Nome Completo</label>
              <input type="text" [(ngModel)]="editUser.fullName" name="fullName" class="glass-input" required>
            </div>
            <div class="input-group">
              <label>E-mail</label>
              <input type="email" [value]="user()?.email" class="glass-input disabled" readonly disabled>
            </div>
            <div class="input-group">
              <label>Telefone</label>
              <input type="text" [value]="editUser.phone || ''" (input)="onPhoneInput($event)" placeholder="(00) 00000-0000" class="glass-input">
            </div>
            
            <div class="input-group">
              <label>Data de Nascimento</label>
              <div class="datepicker-container">
                <input 
                  type="text" 
                  [value]="displayBirthDate" 
                  readonly 
                  (click)="toggleDatePicker($event)" 
                  placeholder="DD/MM/AAAA" 
                  class="glass-input clickable datepicker-trigger"
                >
                <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>

                <!-- Custom Datepicker Popup -->
                @if (showDatePicker()) {
                  <div class="custom-datepicker-popup">
                    <!-- Header -->
                    <div class="datepicker-header">
                      <button type="button" class="nav-btn" (click)="prevMonth($event)">
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      
                      <button type="button" class="month-year-label" (click)="togglePickerMode($event)">
                        {{ currentMonthYearLabel }}
                        <svg class="chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      
                      <button type="button" class="nav-btn" (click)="nextMonth($event)" [disabled]="isCurrentMonthYear">
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>

                    <!-- Mode 1: Calendar View -->
                    @if (datePickerMode() === 'calendar') {
                      <!-- Weekdays -->
                      <div class="weekdays-grid">
                        @for (day of weekdays; track day) {
                          <div class="weekday">{{ day }}</div>
                        }
                      </div>

                      <!-- Days Grid -->
                      <div class="days-grid">
                        @for (cell of daysGrid; track $index) {
                          @if (cell.isCurrentMonth) {
                            <button 
                              type="button" 
                              class="day-btn" 
                              [class.today]="cell.isToday"
                              [class.selected]="cell.isSelected"
                              [disabled]="cell.isFuture"
                              (click)="selectDay(cell.day, $event)"
                            >
                              {{ cell.day }}
                            </button>
                          } @else {
                            <div class="day-btn adjacent-month">
                              {{ cell.day }}
                            </div>
                          }
                        }
                      </div>
                    }

                    <!-- Mode 2: Month/Year Selection View -->
                    @if (datePickerMode() === 'month-year') {
                      <div class="month-year-picker">
                        <!-- Months list -->
                        <div class="picker-column months-list">
                          @for (m of shortMonths; let idx = $index; track m) {
                            <button 
                              type="button" 
                              class="month-select-btn" 
                              [class.selected]="viewDate.getMonth() === idx" 
                              [disabled]="isFutureMonth(idx)"
                              (click)="selectMonth(idx, $event)"
                            >
                              {{ m }}
                            </button>
                          }
                        </div>
                        
                        <!-- Years list -->
                        <div class="picker-column years-list">
                          @for (y of yearsRange; track y) {
                            <button 
                              type="button" 
                              class="year-select-btn" 
                              [class.selected]="viewDate.getFullYear() === y" 
                              (click)="selectYear(y, $event)"
                            >
                              {{ y }}
                            </button>
                          }
                        </div>
                      </div>
                    }

                    <!-- Footer -->
                    <div class="datepicker-footer">
                      <button type="button" class="footer-action-btn clear-btn" (click)="clearDate($event)">Limpar</button>
                      <button type="button" class="footer-action-btn today-btn" (click)="selectToday($event)">Hoje</button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="input-group">
              <label>CPF</label>
              <input type="text" [value]="editUser.cpf || ''" (input)="onCpfInput($event)" placeholder="000.000.000-00" class="glass-input">
            </div>
          </div>

          <div class="actions">
            <button type="submit" class="save-btn" [disabled]="isSaving()">
              {{ isSaving() ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </form>
      </div>

      <!-- BLOCO 2 — Segurança -->
      <div class="profile-card">
        <div class="profile-header no-avatar">
          <h1>Segurança</h1>
          <p class="profile-subtitle">Gerencie suas credenciais de acesso e sessões ativas</p>
        </div>

        <form (ngSubmit)="changePassword()" class="profile-form">
          <div class="form-grid single-column">
            <div class="input-group">
              <label>Senha Atual</label>
              <input type="password" [(ngModel)]="currentPassword" name="currentPassword" class="glass-input" required>
            </div>
            <div class="input-group">
              <label>Nova Senha</label>
              <input type="password" [ngModel]="newPassword()" (ngModelChange)="onNewPasswordChange($event)" name="newPassword" class="glass-input" required>
              <div class="strength-bar-container">
                <div class="strength-bar" [class]="passwordStrength()"></div>
              </div>
            </div>
            <div class="input-group">
              <label>Confirmar Nova Senha</label>
              <input type="password" [ngModel]="confirmPassword()" (ngModelChange)="confirmPassword.set($event)" name="confirmPassword" class="glass-input" required>
              @if (newPassword() && confirmPassword() && newPassword() !== confirmPassword()) {
                <span class="error-text">As senhas não coincidem.</span>
              }
            </div>
          </div>

          <div class="actions">
            <button type="submit" class="save-btn" [disabled]="isSavingPassword() || (newPassword() !== confirmPassword()) || !newPassword()">
              {{ isSavingPassword() ? 'Alterando...' : 'Alterar Senha' }}
            </button>
          </div>
        </form>

        <div class="security-meta">
          <p class="last-access-text">{{ formatLastLogin(user()?.lastLoginAt) }}</p>
        </div>

        <!-- Sessões Ativas -->
        <div class="sessions-section">
          <h3>Sessões Ativas</h3>
          <div class="sessions-list">
            @for (session of sessions(); track session.id) {
              <div class="session-item">
                <div class="session-info">
                  <span class="session-device">{{ session.device }}</span>
                  <span class="session-date">Início: {{ formatSessionDate(session.createdAt) }}</span>
                </div>
                <div class="session-actions">
                  @if (session.isCurrent) {
                    <span class="current-session-badge">Sessão atual</span>
                  } @else {
                    <button type="button" class="terminate-btn clickable" (click)="terminateSession(session.id)">Encerrar</button>
                  }
                </div>
              </div>
            } @empty {
              <p class="no-sessions-text">Nenhuma sessão ativa encontrada.</p>
            }
          </div>
        </div>

        <!-- 2FA -->
        <div class="two-factor-card-section">
          <div class="settings-row">
            <div class="settings-text">
              <span class="settings-title">Autenticação em dois fatores (2FA)</span>
              <span class="settings-desc">Adicione uma camada extra de segurança à sua conta</span>
            </div>
            <label class="switch-item clickable">
              <input type="checkbox" [checked]="twoFactorEnabled()" (change)="twoFactorEnabled.set(!twoFactorEnabled())">
              <span class="switch"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Cropper Modal Overlay -->
      <div class="cropper-overlay" *ngIf="showCropModal()">
        <div class="cropper-container">
          <div class="cropper-card-header">
            <h3>Ajustar Foto de Perfil</h3>
            <button type="button" class="close-btn" (click)="closeCropModal()">&times;</button>
          </div>
          
          <div class="crop-area-wrapper">
            <div class="crop-viewport" 
                 (mousedown)="startDrag($event)" 
                 (mousemove)="onDrag($event)" 
                 (mouseup)="endDrag()" 
                 (mouseleave)="endDrag()"
                 (touchstart)="startDrag($event)"
                 (touchmove)="onDrag($event)"
                 (touchend)="endDrag()"
                 (wheel)="onWheel($event)">
              
              <img [src]="cropImageSrc()" 
                   [style.width.px]="imgWidth" 
                   [style.height.px]="imgHeight"
                   [style.transform]="getImageTransform()" 
                   class="crop-image"
                   alt="Crop Image"
                   draggable="false">
              
              <!-- Circle Mask Overlay -->
              <div class="crop-mask"></div>
            </div>
          </div>
          
          <div class="cropper-controls">
            <div class="zoom-control">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <input type="range" 
                     [min]="minZoom()" 
                     [max]="maxZoom()" 
                     step="0.01" 
                     [value]="zoomLevel()" 
                     (input)="onZoomSliderChange($event)"
                     class="zoom-slider">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </div>
            
            <p class="crop-instructions">Dica: Arraste a foto para reposicionar ou use a roda do mouse para dar zoom.</p>
          </div>
          
          <div class="cropper-actions">
            <button type="button" class="btn-cancel clickable" (click)="closeCropModal()">Cancelar</button>
            <button type="button" class="btn-confirm clickable" (click)="confirmCrop()">Confirmar e Recortar</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .profile-page-wrapper {
      max-width: 800px;
      margin: 40px auto;
      display: flex;
      flex-direction: column;
      gap: 30px;
      padding: 0 20px;
    }
    .profile-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 40px;
      box-shadow: var(--shadow-sm);
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 36px;
      
      &.no-avatar {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px;
      }
      
      .profile-title-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      h1 {
        font-size: 26px;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }
      
      .profile-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .avatar-edit {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      flex-shrink: 0;
      border: 4px solid var(--border);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
      
      &.drag-over {
        border-color: var(--accent);
        box-shadow: 0 0 12px var(--accent);
        transform: scale(1.05);
      }
      
      &:hover {
        border-color: var(--accent);
        
        img {
          filter: brightness(0.4);
        }
        
        .avatar-hover-overlay {
          opacity: 1;
        }
      }
      
      .avatar-hover-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: var(--text-inverse);
        font-size: 11px;
        font-weight: 700;
        opacity: 0;
        transition: opacity 0.3s ease;
        text-align: center;
        pointer-events: none;
        background: rgba(10, 22, 40, 0.6);
        
        .camera-icon {
          stroke: var(--text-inverse);
        }
      }

      .avatar-spinner-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 22, 40, 0.7);
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Avatar Actions Under Name/Email */
    .avatar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
    }
    
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      cursor: pointer;
      background-color: var(--surface-secondary);
      transition: all 0.2s ease;
      
      &:hover {
        background-color: var(--border);
        color: var(--text-primary);
        border-color: var(--text-secondary);
      }
      
      &.danger {
        border-color: rgba(239, 68, 68, 0.3);
        background-color: rgba(239, 68, 68, 0.05);
        color: #ef4444;
        
        &:hover {
          background-color: #ef4444;
          color: white;
          border-color: #ef4444;
        }
      }
      
      &.primary {
        border-color: rgba(0, 191, 234, 0.3);
        background-color: rgba(0, 191, 234, 0.05);
        color: var(--accent);
        
        &:hover {
          background-color: var(--accent);
          color: white;
          border-color: var(--accent);
        }
      }
      
      svg {
        flex-shrink: 0;
      }
    }

    /* Cropper Modal Styles */
    .cropper-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .cropper-container {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 440px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .cropper-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
      }
      
      .close-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        
        &:hover {
          color: var(--text-primary);
        }
      }
    }
    
    .crop-area-wrapper {
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #090e18;
    }
    
    .crop-viewport {
      position: relative;
      width: 300px;
      height: 300px;
      overflow: hidden;
      cursor: move;
      border: 2px dashed rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      box-shadow: 0 0 0 9999px rgba(9, 14, 24, 0.7);
    }
    
    .crop-image {
      position: absolute;
      top: 50%;
      left: 50%;
      max-width: none;
      max-height: none;
      pointer-events: none;
      transform-origin: center center;
    }
    
    .crop-mask {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid var(--accent);
      pointer-events: none;
      box-sizing: border-box;
      box-shadow: 0 0 20px rgba(0, 191, 234, 0.4);
    }
    
    .cropper-controls {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .zoom-control {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-secondary);
      
      .zoom-slider {
        flex-grow: 1;
        height: 6px;
        background: var(--border);
        border-radius: 3px;
        outline: none;
        -webkit-appearance: none;
        accent-color: var(--accent);
        
        &::-webkit-slider-runnable-track {
          cursor: pointer;
        }
      }
    }
    
    .crop-instructions {
      margin: 0;
      font-size: 11px;
      color: var(--text-secondary);
      text-align: center;
    }
    
    .cropper-actions {
      padding: 16px 20px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      background: var(--surface-secondary);
      
      button {
        padding: 10px 18px;
        font-size: 13px;
        font-weight: 600;
        border-radius: var(--radius-md);
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .btn-cancel {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text-primary);
        
        &:hover {
          background: var(--border);
        }
      }
      
      .btn-confirm {
        background: var(--accent);
        color: white;
        
        &:hover {
          background: var(--accent-hover);
          box-shadow: 0 0 10px rgba(0, 191, 234, 0.3);
        }
      }
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 30px;
      
      &.single-column {
        grid-template-columns: 1fr;
        max-width: 480px;
        gap: 20px;
      }
    }
    
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      label {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-secondary);
      }
      
      .glass-input {
        width: 100%;
        height: 48px;
        padding: 12px 16px;
        background: var(--surface-secondary);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
        box-sizing: border-box;

        &::placeholder {
          color: var(--text-muted);
        }
        
        &:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
          background: var(--surface);
        }
        
        &:disabled, &.disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: var(--surface-secondary);
        }
      }
      
      .error-text {
        font-size: 12px;
        color: var(--error);
        margin-top: 4px;
        font-weight: 600;
      }
    }
    
    /* Custom Datepicker styles */
    .datepicker-container {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      
      .calendar-icon {
        position: absolute;
        right: 16px;
        width: 18px;
        height: 18px;
        color: var(--text-secondary);
        pointer-events: none;
      }
      
      .glass-input {
        padding-right: 48px;
        cursor: pointer;
      }
    }

    .custom-datepicker-popup {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      width: 320px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 20px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-sizing: border-box;
    }
    
    .datepicker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .nav-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover:not(:disabled) {
          background: var(--surface-secondary);
          border-color: var(--text-secondary);
        }
        
        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .chevron {
          width: 16px;
          height: 16px;
        }
      }
      
      .month-year-label {
        font-family: 'Outfit', sans-serif;
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        
        &:hover {
          background: var(--surface-secondary);
        }
        
        .chevron-down {
          width: 14px;
          height: 14px;
          color: var(--text-secondary);
        }
      }
    }
    
    .weekdays-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      
      .weekday {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
        padding-bottom: 8px;
      }
    }
    
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      
      .day-btn {
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        font-size: 13px;
        font-weight: 600;
        background: transparent;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s ease;
        
        &:hover:not(:disabled):not(.adjacent-month) {
          background: var(--surface-secondary);
          color: var(--text-primary);
        }
        
        &.today {
          border: 1.5px solid var(--accent);
        }
        
        &.selected {
          background: var(--accent) !important;
          color: var(--bg-navbar) !important;
          font-weight: 700;
        }
        
        &.adjacent-month {
          color: var(--text-muted);
          opacity: 0.45;
          cursor: default;
          pointer-events: none;
        }
        
        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }
    
    .month-year-picker {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      height: 200px;
      
      .picker-column {
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 8px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        &::-webkit-scrollbar {
          width: 4px;
        }
        &::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
      }
      
      .month-select-btn, .year-select-btn {
        width: 100%;
        padding: 8px;
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        border-radius: var(--radius-sm);
        background: transparent;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s;
        
        &:hover:not(:disabled) {
          background: var(--surface-secondary);
        }
        
        &.selected {
          background: var(--accent) !important;
          color: var(--bg-navbar) !important;
          font-weight: 700;
        }
        
        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }
    
    .datepicker-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--border);
      
      .footer-action-btn {
        background: transparent;
        border: none;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: var(--radius-sm);
        transition: all 0.2s;
        
        &.clear-btn {
          color: var(--error);
          &:hover {
            background: rgba(239, 68, 68, 0.08);
          }
        }
        
        &.today-btn {
          color: var(--accent);
          &:hover {
            background: var(--accent-light);
          }
        }
      }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
    
    .save-btn {
      padding: 12px 28px;
      background: var(--accent);
      color: var(--bg-navbar);
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
      
      &:hover:not(:disabled) {
        background: var(--accent-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .strength-bar-container {
      width: 100%;
      height: 4px;
      background: var(--border);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-top: 6px;
    }
    
    .strength-bar {
      height: 100%;
      width: 0;
      transition: width 0.3s ease, background-color 0.3s ease;
      
      &.weak { width: 33%; background: var(--error); }
      &.medium { width: 66%; background: var(--warning); }
      &.strong { width: 100%; background: var(--success); }
    }
    
    .security-meta {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      
      .last-access-text {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .sessions-section {
      margin-top: 36px;
      
      h3 {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 16px;
      }
      
      .sessions-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .session-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: var(--surface-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
      }
      
      .session-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .session-device {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
      }
      
      .session-date {
        font-size: 12px;
        color: var(--text-secondary);
      }
      
      .current-session-badge {
        font-size: 12px;
        font-weight: 700;
        color: var(--success);
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.2);
        padding: 6px 12px;
        border-radius: var(--radius-sm);
      }
      
      .terminate-btn {
        background: transparent;
        border: 1.5px solid var(--error);
        color: var(--error);
        padding: 6px 14px;
        border-radius: var(--radius-sm);
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--error);
          color: var(--text-inverse);
        }
      }
      
      .no-sessions-text {
        font-size: 13px;
        color: var(--text-muted);
        font-style: italic;
      }
    }
    
    .two-factor-card-section {
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }
    
    .settings-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }
    
    .settings-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .settings-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .settings-desc {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .switch-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      position: relative;
      
      input {
        display: none;
      }
      
      .switch {
        width: 46px;
        height: 26px;
        background: var(--border);
        border-radius: var(--radius-full);
        position: relative;
        transition: background-color 0.2s ease;
        border: 1px solid var(--border);
        
        &::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: var(--surface);
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease;
        }
      }
      
      input:checked + .switch {
        background-color: var(--accent);
        border-color: var(--accent);
        
        &::after {
          transform: translateX(20px);
        }
      }
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
    authService = inject(AuthService);
    toast = inject(ToastService);
    http = inject(HttpClient);

    user = this.authService.currentUser;
    editUser: Partial<User> = {};
    isSaving = signal(false);

    // Avatar Cropper & Photo Management State
    showCropModal = signal(false);
    cropImageSrc = signal<string>('');
    zoomLevel = signal<number>(1);
    minZoom = signal<number>(1);
    maxZoom = signal<number>(3);
    offsetX = signal<number>(0);
    offsetY = signal<number>(0);
    originalGooglePhoto = signal<string | null>(null);

    // Viewport constant
    private readonly V = 300;
    baseScale = 1;
    imgWidth = 0;
    imgHeight = 0;

    // Drag state
    private isDragging = false;
    private startX = 0;
    private startY = 0;

    // Password State
    currentPassword = signal('');
    newPassword = signal('');
    confirmPassword = signal('');
    isSavingPassword = signal(false);

    // Sessions and 2FA State
    sessions = signal<any[]>([]);
    twoFactorEnabled = signal(false);

    // Custom Datepicker State
    showDatePicker = signal(false);
    datePickerMode = signal<'calendar' | 'month-year'>('calendar');
    viewDate = new Date();
    weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    ngOnInit() {
        if (this.user()) {
            this.editUser = { ...this.user() };
            // Capture Google Photo if it's not base64 and not localhost
            const currentPhoto = this.user()?.profileImageUrl;
            if (currentPhoto && (currentPhoto.startsWith('http://') || currentPhoto.startsWith('https://')) && !currentPhoto.includes('localhost')) {
                this.originalGooglePhoto.set(currentPhoto);
            }
        }
        this.loadSessions();
    }

    save() {
        this.isSaving.set(true);
        this.authService.updateMe(this.editUser).subscribe({
            next: () => {
                this.toast.success('Perfil atualizado com sucesso!');
                this.isSaving.set(false);
            },
            error: (err) => {
                const msg = err.error || 'Erro ao atualizar o perfil.';
                this.toast.error(msg);
                this.isSaving.set(false);
            }
        });
    }

    // Drag & Drop
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        const element = event.currentTarget as HTMLElement;
        element.classList.add('drag-over');
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        const element = event.currentTarget as HTMLElement;
        element.classList.remove('drag-over');
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        const element = event.currentTarget as HTMLElement;
        element.classList.remove('drag-over');
        
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            this.handleFile(file);
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files?.[0];
        this.handleFile(file);
    }

    handleFile(file: File) {
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.toast.error('Formato não suportado! Envie apenas JPG, PNG ou WEBP.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.toast.error('A imagem excede o tamanho máximo de 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            
            const img = new Image();
            img.onload = () => {
                const w = img.width;
                const h = img.height;
                
                this.baseScale = Math.max(this.V / w, this.V / h);
                this.imgWidth = w * this.baseScale;
                this.imgHeight = h * this.baseScale;
                
                this.offsetX.set(0);
                this.offsetY.set(0);
                this.zoomLevel.set(1);
                this.minZoom.set(1);
                this.maxZoom.set(3);
                
                this.cropImageSrc.set(dataUrl);
                this.showCropModal.set(true);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }

    closeCropModal() {
        this.showCropModal.set(false);
        this.cropImageSrc.set('');
    }

    confirmCrop() {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                const zoom = this.zoomLevel();
                const sActual = this.baseScale * zoom;
                
                const wActual = this.imgWidth * zoom;
                const hActual = this.imgHeight * zoom;
                
                const xCrop = (wActual / 2) - 150 - this.offsetX();
                const yCrop = (hActual / 2) - 150 - this.offsetY();
                
                const sx = xCrop / sActual;
                const sy = yCrop / sActual;
                const sSize = this.V / sActual;
                
                ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 400, 400);
                
                const base64 = canvas.toDataURL('image/jpeg', 0.9);
                this.editUser.profileImageUrl = base64;
                this.closeCropModal();
                this.toast.success('Foto recortada! Lembre-se de salvar as alterações.');
            }
        };
        img.src = this.cropImageSrc();
    }

    removePhoto() {
        this.editUser.profileImageUrl = '';
        this.toast.success('Foto removida! Lembre-se de salvar as alterações.');
    }

    hasGooglePhoto(): boolean {
        const googlePhoto = this.originalGooglePhoto();
        return !!googlePhoto && this.editUser.profileImageUrl !== googlePhoto;
    }

    restoreGooglePhoto() {
        const googlePhoto = this.originalGooglePhoto();
        if (googlePhoto) {
            this.editUser.profileImageUrl = googlePhoto;
            this.toast.success('Foto do Google selecionada! Lembre-se de salvar as alterações.');
        }
    }

    // Drag-drag interactions for Crop Canvas
    startDrag(event: any) {
        event.preventDefault();
        this.isDragging = true;
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        this.startX = clientX - this.offsetX();
        this.startY = clientY - this.offsetY();
    }

    onDrag(event: any) {
        if (!this.isDragging) return;
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        
        let newX = clientX - this.startX;
        let newY = clientY - this.startY;
        
        const zoom = this.zoomLevel();
        const wActual = this.imgWidth * zoom;
        const hActual = this.imgHeight * zoom;
        
        const limitX = Math.max(0, (wActual - this.V) / 2);
        const limitY = Math.max(0, (hActual - this.V) / 2);
        
        newX = Math.min(limitX, Math.max(-limitX, newX));
        newY = Math.min(limitY, Math.max(-limitY, newY));
        
        this.offsetX.set(newX);
        this.offsetY.set(newY);
    }

    endDrag() {
        this.isDragging = false;
    }

    onZoomSliderChange(event: any) {
        const val = parseFloat(event.target.value);
        this.setZoom(val);
    }

    onWheel(event: WheelEvent) {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.05 : -0.05;
        const newZoom = Math.min(this.maxZoom(), Math.max(this.minZoom(), this.zoomLevel() + delta));
        this.setZoom(newZoom);
    }

    private setZoom(newZoom: number) {
        this.zoomLevel.set(newZoom);
        
        const wActual = this.imgWidth * newZoom;
        const hActual = this.imgHeight * newZoom;
        
        const limitX = Math.max(0, (wActual - this.V) / 2);
        const limitY = Math.max(0, (hActual - this.V) / 2);
        
        const currentX = Math.min(limitX, Math.max(-limitX, this.offsetX()));
        const currentY = Math.min(limitY, Math.max(-limitY, this.offsetY()));
        
        this.offsetX.set(currentX);
        this.offsetY.set(currentY);
    }

    getImageTransform() {
        return `translate(calc(-50% + ${this.offsetX()}px), calc(-50% + ${this.offsetY()}px)) scale(${this.zoomLevel()})`;
    }

    // CPF Mask Formatting
    formatCPF(value: string): string {
        if (!value) return '';
        const clean = value.replace(/\D/g, '');
        const match = clean.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
        if (!match) return clean;
        let formatted = match[1];
        if (match[2]) formatted += '.' + match[2];
        if (match[3]) formatted += '.' + match[3];
        if (match[4]) formatted += '-' + match[4];
        return formatted.substring(0, 14);
    }

    onCpfInput(event: any) {
        const input = event.target;
        const formatted = this.formatCPF(input.value);
        input.value = formatted;
        this.editUser.cpf = formatted;
    }

    // Phone Mask Formatting
    formatPhone(value: string): string {
        if (!value) return '';
        const clean = value.replace(/\D/g, '');
        const match = clean.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
        if (!match) return clean;
        let formatted = match[1];
        if (match[1]) formatted = '(' + match[1];
        if (match[2]) formatted += ') ' + match[2];
        if (match[3]) formatted += '-' + match[3];
        return formatted.substring(0, 15);
    }

    onPhoneInput(event: any) {
        const input = event.target;
        const formatted = this.formatPhone(input.value);
        input.value = formatted;
        this.editUser.phone = formatted;
    }

    // Datepicker Methods
    get displayBirthDate(): string {
        if (!this.editUser.birthDate) return '';
        const parts = this.editUser.birthDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return this.editUser.birthDate;
    }

    toggleDatePicker(event: Event) {
        event.stopPropagation();
        this.showDatePicker.set(!this.showDatePicker());
        if (this.showDatePicker()) {
            if (this.editUser.birthDate) {
                const parts = this.editUser.birthDate.split('-');
                if (parts.length === 3) {
                    this.viewDate = new Date(
                        parseInt(parts[0], 10),
                        parseInt(parts[1], 10) - 1,
                        parseInt(parts[2], 10)
                    );
                }
            } else {
                this.viewDate = new Date();
            }
            this.datePickerMode.set('calendar');
        }
    }

    closeDatePicker() {
        this.showDatePicker.set(false);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.showDatePicker()) return;
        const path = event.composedPath();
        const clickedInsideInput = path.some(el => el instanceof HTMLElement && el.classList.contains('datepicker-trigger'));
        const clickedInsideCalendar = path.some(el => el instanceof HTMLElement && el.classList.contains('custom-datepicker-popup'));
        if (!clickedInsideInput && !clickedInsideCalendar) {
            this.closeDatePicker();
        }
    }

    get currentMonthYearLabel(): string {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${months[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
    }

    get isCurrentMonthYear(): boolean {
        const today = new Date();
        return this.viewDate.getFullYear() === today.getFullYear() && 
               this.viewDate.getMonth() === today.getMonth();
    }

    prevMonth(event: Event) {
        event.stopPropagation();
        const currentYear = this.viewDate.getFullYear();
        const currentMonth = this.viewDate.getMonth();
        this.viewDate = new Date(currentYear, currentMonth - 1, 1);
    }

    nextMonth(event: Event) {
        event.stopPropagation();
        if (this.isCurrentMonthYear) return;
        const currentYear = this.viewDate.getFullYear();
        const currentMonth = this.viewDate.getMonth();
        this.viewDate = new Date(currentYear, currentMonth + 1, 1);
    }

    togglePickerMode(event: Event) {
        event.stopPropagation();
        this.datePickerMode.set(this.datePickerMode() === 'calendar' ? 'month-year' : 'calendar');
    }

    isFutureMonth(monthIdx: number): boolean {
        const today = new Date();
        const viewYear = this.viewDate.getFullYear();
        if (viewYear > today.getFullYear()) return true;
        if (viewYear === today.getFullYear()) {
            return monthIdx > today.getMonth();
        }
        return false;
    }

    selectMonth(monthIdx: number, event: Event) {
        event.stopPropagation();
        const currentYear = this.viewDate.getFullYear();
        this.viewDate = new Date(currentYear, monthIdx, 1);
        this.datePickerMode.set('calendar');
    }

    selectYear(year: number, event: Event) {
        event.stopPropagation();
        const currentMonth = this.viewDate.getMonth();
        this.viewDate = new Date(year, currentMonth, 1);
    }

    get yearsRange(): number[] {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear; y >= currentYear - 100; y--) {
            years.push(y);
        }
        return years;
    }

    get daysGrid() {
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevMonthTotalDays = new Date(year, month, 0).getDate();
        
        const grid = [];
        const today = new Date();
        
        let selYear = -1;
        let selMonth = -1;
        let selDay = -1;
        if (this.editUser.birthDate) {
            const parts = this.editUser.birthDate.split('-');
            if (parts.length === 3) {
                selYear = parseInt(parts[0], 10);
                selMonth = parseInt(parts[1], 10) - 1;
                selDay = parseInt(parts[2], 10);
            }
        }

        for (let i = firstDayIndex - 1; i >= 0; i--) {
            grid.push({
                day: prevMonthTotalDays - i,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isFuture: false
            });
        }
        
        for (let i = 1; i <= totalDays; i++) {
            const cellDate = new Date(year, month, i);
            const isToday = cellDate.getDate() === today.getDate() &&
                            cellDate.getMonth() === today.getMonth() &&
                            cellDate.getFullYear() === today.getFullYear();
            const isSelected = i === selDay && month === selMonth && year === selYear;
            const isFuture = cellDate > new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            grid.push({
                day: i,
                isCurrentMonth: true,
                isToday,
                isSelected,
                isFuture
            });
        }
        
        const totalCells = grid.length;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
            grid.push({
                day: i,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isFuture: false
            });
        }
        
        return grid;
    }

    selectDay(day: number, event: Event) {
        event.stopPropagation();
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        const yyyy = year;
        const mm = (month + 1).toString().padStart(2, '0');
        const dd = day.toString().padStart(2, '0');
        this.editUser.birthDate = `${yyyy}-${mm}-${dd}`;
        this.closeDatePicker();
    }

    clearDate(event: Event) {
        event.stopPropagation();
        this.editUser.birthDate = undefined;
        this.closeDatePicker();
    }

    selectToday(event: Event) {
        event.stopPropagation();
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = (today.getMonth() + 1).toString().padStart(2, '0');
        const dd = today.getDate().toString().padStart(2, '0');
        this.editUser.birthDate = `${yyyy}-${mm}-${dd}`;
        this.viewDate = today;
        this.closeDatePicker();
    }

    // New Password strength checker
    onNewPasswordChange(val: string) {
        this.newPassword.set(val);
    }

    passwordStrength = computed(() => {
        const pass = this.newPassword();
        if (!pass) return 'none';
        if (pass.length < 6) return 'weak';
        
        const hasLetters = /[a-zA-Z]/.test(pass);
        const hasNumbers = /[0-9]/.test(pass);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
        
        if (pass.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
            return 'strong';
        }
        if (hasLetters && hasNumbers) {
            return 'medium';
        }
        return 'weak';
    });

    changePassword() {
        if (this.newPassword() !== this.confirmPassword()) {
            return;
        }
        this.isSavingPassword.set(true);
        this.http.post('/api/users/me/change-password', {
            currentPassword: this.currentPassword(),
            newPassword: this.newPassword()
        }).subscribe({
            next: () => {
                this.toast.success('Senha alterada com sucesso!');
                this.currentPassword.set('');
                this.newPassword.set('');
                this.confirmPassword.set('');
                this.isSavingPassword.set(false);
            },
            error: (err) => {
                const msg = err.error || 'Erro ao alterar a senha.';
                this.toast.error(msg);
                this.isSavingPassword.set(false);
            }
        });
    }

    // Sessions and Access formatting
    loadSessions() {
        this.http.get<any[]>('/api/users/me/sessions').subscribe({
            next: (res) => this.sessions.set(res),
            error: (err) => console.error('Erro ao buscar sessões', err)
        });
    }

    terminateSession(id: number) {
        this.http.delete(`/api/users/me/sessions/${id}`).subscribe({
            next: () => {
                this.toast.success('Sessão encerrada com sucesso!');
                this.loadSessions();
            },
            error: (err) => {
                this.toast.error('Erro ao encerrar sessão.');
            }
        });
    }

    formatLastLogin(dateStr?: string): string {
        if (!dateStr) return 'Sem registros de acesso recente';
        try {
            const date = new Date(dateStr);
            const months = [
                'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
            ];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `Último acesso: ${day} de ${month} de ${year} às ${hours}:${minutes}`;
        } catch (e) {
            return 'Último acesso: ' + dateStr;
        }
    }

    formatSessionDate(dateStr: string): string {
        try {
            const date = new Date(dateStr);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${day}/${month}/${year} às ${hours}:${minutes}`;
        } catch (e) {
            return dateStr;
        }
    }
}
