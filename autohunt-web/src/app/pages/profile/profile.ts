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
    <div class="account-settings-container animate-in">
      <!-- SIDEBAR MENU -->
      <aside class="sidebar-nav">
        <button type="button" class="nav-item-btn" 
                [class.active]="activeSection() === 'inicio'"
                (click)="activeSection.set('inicio')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Página inicial
        </button>
        <button type="button" class="nav-item-btn" 
                [class.active]="activeSection() === 'dados'"
                (click)="activeSection.set('dados')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Dados pessoais
        </button>
        <button type="button" class="nav-item-btn" 
                [class.active]="activeSection() === 'seguranca'"
                (click)="activeSection.set('seguranca')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Segurança
        </button>
        <button type="button" class="nav-item-btn" 
                [class.active]="activeSection() === 'privacidade'"
                (click)="activeSection.set('privacidade')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Privacidade e dados
        </button>
      </aside>

      <!-- MAIN CONTENT COLUMN -->
      <main class="content-panel">
        
        <!-- ==================== TAB 1: PAGINA INICIAL ==================== -->
        @if (activeSection() === 'inicio') {
          <section class="tab-content-section animate-in">
            <div class="welcome-header">
              <h1>Olá, {{ editUser.fullName || user()?.fullName }}!</h1>
              <p class="subtitle-text">Gerencie as informações, segurança e privacidade da sua conta Nexdrive.</p>
            </div>

            <!-- Profile Completeness Card -->
            <div class="completeness-dashboard-card">
              <div class="completeness-header">
                <span class="completeness-title">Completude do Perfil</span>
                <span class="completeness-badge" [class.complete]="profileCompleteness() === 100">
                  {{ profileCompleteness() }}%
                </span>
              </div>
              <div class="completeness-track">
                <div class="completeness-bar" [style.width.%]="profileCompleteness()"></div>
              </div>
              <p class="completeness-tip" *ngIf="profileCompleteness() < 100">
                Preencha seu telefone, data de nascimento e CPF na aba de Dados Pessoais para completar seu cadastro.
              </p>
              <p class="completeness-tip success" *ngIf="profileCompleteness() === 100">
                Parabéns! Seu perfil está 100% preenchido.
              </p>
            </div>

            <!-- Account Dashboard Shortcuts -->
            <div class="dashboard-grid">
              <div class="dashboard-shortcut-card clickable" (click)="activeSection.set('dados')">
                <div class="shortcut-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="shortcut-details">
                  <h3>Dados pessoais</h3>
                  <p>Veja e edite suas informações básicas, como nome, telefone, data de nascimento e CPF, além da sua foto de perfil.</p>
                  <span class="shortcut-action">Gerenciar dados pessoais &rarr;</span>
                </div>
              </div>

              <div class="dashboard-shortcut-card clickable" (click)="activeSection.set('seguranca')">
                <div class="shortcut-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div class="shortcut-details">
                  <h3>Segurança</h3>
                  <p>Acesse chaves de segurança, altere sua senha, gerencie a autenticação em duas etapas e desconecte sessões ativas.</p>
                  <span class="shortcut-action">Configurar segurança &rarr;</span>
                </div>
              </div>

              <div class="dashboard-shortcut-card clickable" (click)="activeSection.set('privacidade')">
                <div class="shortcut-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div class="shortcut-details">
                  <h3>Privacidade e dados</h3>
                  <p>Controle as permissões de aplicativos de terceiros, gerencie preferências de comunicação e acesse a central de privacidade.</p>
                  <span class="shortcut-action">Acessar privacidade &rarr;</span>
                </div>
              </div>
            </div>
          </section>
        }

        <!-- ==================== TAB 2: DADOS PESSOAIS ==================== -->
        @if (activeSection() === 'dados') {
          <section class="tab-content-section animate-in">
            <div class="section-header-uber">
              <h1>Dados pessoais</h1>
              <p class="subtitle-text">Informações básicas sobre você usadas no Nexdrive</p>
            </div>

            <!-- Avatar Upload Area -->
            <div class="avatar-settings-card">
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
              
              <div class="avatar-meta-group">
                <h3>Foto de perfil</h3>
                <p>Arraste uma foto ou clique no avatar para selecionar um arquivo. Recomendamos uma foto quadrada 1:1.</p>
                <div class="avatar-actions">
                  <button type="button" class="btn-action clickable" (click)="fileInput.click()">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Alterar Foto
                  </button>
                  <button type="button" class="btn-action danger clickable" *ngIf="editUser.profileImageUrl" (click)="removePhoto()">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Remover Foto
                  </button>
                  <button type="button" class="btn-action primary clickable" *ngIf="hasGooglePhoto()" (click)="restoreGooglePhoto()">
                    <svg width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.01 3.07v2.55h3.24c1.9-1.75 3-4.32 3-7.32 0-.63-.06-1.23-.27-2.0zM12 21c2.43 0 4.47-.8 5.96-2.18l-3.24-2.55c-.9.6-2.05.96-3.72.96-2.86 0-5.28-1.93-6.14-4.52H1.61v2.63C3.09 18.25 7.23 21 12 21zM5.86 12.71c-.22-.67-.34-1.38-.34-2.11s.12-1.44.34-2.11V5.86H1.61C.58 7.92 0 10.21 0 12.71s.58 4.79 1.61 6.85l4.25-3.0zM12 5.72c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 3.03 14.43 2.25 12 2.25 7.23 2.25 3.09 5 1.61 7.89l4.25 3.0C6.72 8.35 9.14 5.72 12 5.72z"/></svg>
                    Usar Foto do Google
                  </button>
                </div>
              </div>
            </div>

            <!-- Profile Fields Form -->
            <form (ngSubmit)="save()" #profileForm="ngForm" class="profile-form-uber">
              <div class="form-grid-uber">
                <!-- Nome Completo (Google Locked conditional) -->
                <div class="input-group-uber">
                  <label>Nome Completo</label>
                  <div class="input-with-icon-wrapper">
                    <input type="text" 
                           [(ngModel)]="editUser.fullName" 
                           name="fullName" 
                           class="uber-input" 
                           [class.disabled]="isGoogleUser()" 
                           [readonly]="isGoogleUser()"
                           required>
                    <svg *ngIf="isGoogleUser()" class="input-lock-icon google" viewBox="0 0 24 24" width="18" height="18"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.67 5.67 0 0 1 8.3 12.915a5.67 5.67 0 0 1 5.69-5.685c1.47 0 2.82.55 3.84 1.485l3.235-3.236A10.15 10.15 0 0 0 13.99 2.25c-5.69 0-10.3 4.61-10.3 10.3s4.61 10.3 10.3 10.3c6.04 0 10.375-4.25 10.375-10.56 0-.66-.08-1.28-.225-1.805H12.24z"/></svg>
                  </div>
                  <span class="field-meta" *ngIf="isGoogleUser()">
                    Vinculado à sua conta Google (não editável)
                  </span>
                </div>

                <!-- E-mail (Always read-only/locked) -->
                <div class="input-group-uber">
                  <label>E-mail</label>
                  <div class="input-with-icon-wrapper">
                    <input type="email" [value]="user()?.email" class="uber-input disabled" readonly disabled>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="input-lock-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <span class="field-meta">
                    Identificação de acesso da conta (não editável)
                  </span>
                </div>

                <!-- Telefone -->
                <div class="input-group-uber">
                  <label>Telefone</label>
                  <input type="text" [value]="editUser.phone || ''" (input)="onPhoneInput($event)" placeholder="(00) 00000-0000" class="uber-input">
                </div>

                <!-- Data de Nascimento -->
                <div class="input-group-uber">
                  <label>Data de Nascimento</label>
                  <div class="datepicker-container">
                    <input 
                      type="text" 
                      [value]="displayBirthDate" 
                      readonly 
                      (click)="toggleDatePicker($event)" 
                      placeholder="DD/MM/AAAA" 
                      class="uber-input clickable datepicker-trigger"
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
                            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                          </button>
                          
                          <button type="button" class="month-year-label" (click)="togglePickerMode($event)">
                            {{ currentMonthYearLabel }}
                            <svg class="chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                          
                          <button type="button" class="nav-btn" (click)="nextMonth($event)" [disabled]="isCurrentMonthYear">
                            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </div>

                        <!-- Mode 1: Calendar View -->
                        @if (datePickerMode() === 'calendar') {
                          <div class="weekdays-grid">
                            @for (day of weekdays; track day) {
                              <div class="weekday">{{ day }}</div>
                            }
                          </div>

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

                <!-- CPF -->
                <div class="input-group-uber">
                  <label>CPF</label>
                  <input type="text" [value]="editUser.cpf || ''" (input)="onCpfInput($event)" placeholder="000.000.000-00" class="uber-input">
                </div>
              </div>

              <div class="form-actions-uber">
                <button type="submit" class="save-btn-uber clickable" [disabled]="isSaving()">
                  <div class="spinner-small" *ngIf="isSaving()"></div>
                  {{ isSaving() ? 'Salvando...' : 'Salvar Alterações' }}
                </button>
              </div>
            </form>
          </section>
        }

        <!-- ==================== TAB 3: SEGURANÇA ==================== -->
        @if (activeSection() === 'seguranca') {
          <section class="tab-content-section animate-in">
            <div class="section-header-uber">
              <h1>Segurança</h1>
              <p class="subtitle-text">Fazer login na Nexdrive</p>
            </div>

            <!-- Clean list group (Uber clean list style with beautiful left-hand icons) -->
            <div class="uber-clean-list">
              
              <!-- Chaves de acesso -->
              <div class="uber-list-item clickable" (click)="showInfoToast('Chaves de acesso')">
                <div class="item-left-group">
                  <div class="item-icon-box passkey">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                  </div>
                  <div class="item-content">
                    <span class="item-title">Chaves de acesso</span>
                    <span class="item-description">As chaves de acesso são mais práticas e seguras do que as senhas.</span>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

              <!-- Senha (Toggles Form) -->
              <div class="uber-list-item-collapsible">
                <div class="uber-list-item clickable" (click)="togglePasswordForm()">
                  <div class="item-left-group">
                    <div class="item-icon-box password">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <div class="item-content">
                      <span class="item-title">Senha</span>
                      <span class="item-description">•••••••• {{ user()?.lastLoginAt ? '(Última alteração: ' + formatSessionDate(user()!.lastLoginAt!) + ')' : '' }}</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon" [class.rotated]="showPasswordForm()"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>

                <!-- Password Form Panel -->
                @if (showPasswordForm()) {
                  <div class="password-form-panel animate-in">
                    <form (ngSubmit)="changePassword()" class="inner-password-form">
                      <div class="form-grid-uber single-column">
                        <div class="input-group-uber">
                          <label>Senha Atual</label>
                          <input type="password" [(ngModel)]="currentPassword" name="currentPassword" class="uber-input" required>
                        </div>
                        <div class="input-group-uber">
                          <label>Nova Senha</label>
                          <input type="password" [ngModel]="newPassword()" (ngModelChange)="onNewPasswordChange($event)" name="newPassword" class="uber-input" required>
                          <div class="strength-bar-container">
                            <div class="strength-bar" [class]="passwordStrength()"></div>
                          </div>
                        </div>
                        <div class="input-group-uber">
                          <label>Confirmar Nova Senha</label>
                          <input type="password" [ngModel]="confirmPassword()" (ngModelChange)="confirmPassword.set($event)" name="confirmPassword" class="uber-input" required>
                          @if (newPassword() && confirmPassword() && newPassword() !== confirmPassword()) {
                            <span class="error-text">As senhas não coincidem.</span>
                          }
                        </div>
                      </div>

                      <div class="form-actions-uber">
                        <button type="submit" class="save-btn-uber" [disabled]="isSavingPassword() || (newPassword() !== confirmPassword()) || !newPassword()">
                          {{ isSavingPassword() ? 'Alterando...' : 'Alterar Senha' }}
                        </button>
                      </div>
                    </form>
                  </div>
                }
              </div>

              <!-- App de autenticação -->
              <div class="uber-list-item clickable" (click)="showInfoToast('App de autenticação')">
                <div class="item-left-group">
                  <div class="item-icon-box mfa">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  </div>
                  <div class="item-content">
                    <span class="item-title">App de autenticação</span>
                    <span class="item-description">Configure seu app de autenticação para aumentar a segurança.</span>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

              <!-- Verificação em duas etapas -->
              <div class="uber-list-item">
                <div class="item-left-group">
                  <div class="item-icon-box double-factor">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <div class="item-content">
                    <span class="item-title">Verificação em duas etapas</span>
                    <span class="item-description">Adicione mais segurança à sua conta com a verificação em duas etapas.</span>
                  </div>
                </div>
                <label class="switch-item clickable">
                  <input type="checkbox" [checked]="twoFactorEnabled()" (change)="twoFactorEnabled.set(!twoFactorEnabled())">
                  <span class="switch"></span>
                </label>
              </div>

              <!-- Telefone para recuperação -->
              <div class="uber-list-item clickable" (click)="showInfoToast('Telefone para recuperação')">
                <div class="item-left-group">
                  <div class="item-icon-box phone">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div class="item-content">
                    <span class="item-title">Telefone para recuperação</span>
                    <span class="item-description">Adicione um número de telefone alternativo para acessar sua conta.</span>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

            </div>

            <!-- Social Connected Section -->
            <div class="uber-section-divider"></div>
            
            <div class="section-subheader-uber">
              <h2>Apps de redes sociais conectados</h2>
              <p class="subtitle-text">Gerencie seus apps de redes sociais para se conectar à conta da Nexdrive aqui.</p>
            </div>

            <div class="uber-clean-list no-top-border">
              
              <!-- Apple Connect -->
              <div class="social-connect-row">
                <div class="social-branding">
                  <div class="social-logo-box apple">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.2.12.3.12.87 0 1.96-.58 2.52-1.45"/></svg>
                  </div>
                  <span class="social-name">Apple</span>
                </div>
                <button type="button" class="btn-uber-action" (click)="toggleAppleConnection()">
                  {{ appleConnected() ? 'Desconectar' : 'Conectar-se' }}
                </button>
              </div>

              <!-- Google Connect -->
              <div class="social-connect-row">
                <div class="social-branding">
                  <div class="social-logo-box google">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.01 3.07v2.55h3.24c1.9-1.75 3-4.32 3-7.32 0-.63-.06-1.23-.27-2.0zM12 21c2.43 0 4.47-.8 5.96-2.18l-3.24-2.55c-.9.6-2.05.96-3.72.96-2.86 0-5.28-1.93-6.14-4.52H1.61v2.63C3.09 18.25 7.23 21 12 21zM5.86 12.71c-.22-.67-.34-1.38-.34-2.11s.12-1.44.34-2.11V5.86H1.61C.58 7.92 0 10.21 0 12.71s.58 4.79 1.61 6.85l4.25-3.0zM12 5.72c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 3.03 14.43 2.25 12 2.25 7.23 2.25 3.09 5 1.61 7.89l4.25 3.0C6.72 8.35 9.14 5.72 12 5.72z"/></svg>
                  </div>
                  <span class="social-name">Google</span>
                </div>
                <button type="button" class="btn-uber-action" (click)="toggleGoogleConnection()">
                  {{ isGoogleUser() ? 'Desconectar' : 'Conectar-se' }}
                </button>
              </div>

            </div>

            <!-- Login Activity Section -->
            <div class="uber-section-divider"></div>
            
            <div class="section-subheader-uber">
              <h2>Atividade de login</h2>
              <p class="subtitle-text">Você fez login nesses dispositivos nos últimos 30 dias. Podem aparecer vários logins do mesmo dispositivo.</p>
            </div>

            <!-- Current Active Session Card -->
            <div class="current-session-card-uber">
              <div class="device-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <div class="session-details">
                <div class="session-title-row">
                  <h3>Chrome on Windows</h3>
                  <span class="badge-current-dot"></span>
                  <span class="badge-current-text">Seu login atual</span>
                </div>
                <p class="geo-info">São Paulo, Brasil</p>
                <p class="platform-info">Página da plataforma do Nexdrive</p>
              </div>
            </div>

            <!-- Other Sessions List -->
            <div class="uber-clean-list no-top-border">
              @for (session of sessions(); track session.id) {
                @if (!session.isCurrent) {
                  <div class="uber-list-item session-row">
                    <div class="item-left-group">
                      <div class="device-icon-box other-device">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                      </div>
                      <div class="item-content">
                        <span class="item-title">{{ session.device }}</span>
                        <span class="item-description">Iniciado em: {{ formatSessionDate(session.createdAt) }} &bull; São Paulo, Brasil</span>
                      </div>
                    </div>
                    <button type="button" class="btn-terminate-session-uber" (click)="terminateSession(session.id)">Encerrar</button>
                  </div>
                }
              }
            </div>

            <!-- Terminate All Actions -->
            <div class="terminate-all-action-row clickable" (click)="terminateAllSessions()">
              <div class="terminate-icon-box">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </div>
              <div class="terminate-details">
                <span class="title">Terminar sessão em todos os dispositivos</span>
                <span class="description">Todos, exceto seu login atual</span>
              </div>
            </div>

          </section>
        }

        <!-- ==================== TAB 4: PRIVACIDADE E DADOS ==================== -->
        @if (activeSection() === 'privacidade') {
          <section class="tab-content-section animate-in">
            <div class="section-header-uber">
              <h1>Privacidade e dados</h1>
              <p class="subtitle-text">Privacidade</p>
            </div>

            <div class="uber-clean-list">
              
              <!-- Central de privacidade -->
              <div class="uber-list-item clickable" (click)="showInfoToast('Central de privacidade')">
                <div class="item-left-group">
                  <div class="item-icon-box privacy">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <div class="item-content">
                    <span class="item-title">Central de privacidade</span>
                    <span class="item-description">Controle a privacidade dos seus dados pessoais e descubra como os protegemos.</span>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

              <!-- Preferências de comunicação -->
              <div class="uber-list-item clickable" (click)="showInfoToast('Preferências de comunicação')">
                <div class="item-left-group">
                  <div class="item-icon-box communication">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div class="item-content">
                    <span class="item-title">Preferências de comunicação</span>
                    <span class="item-description">Gerencie como o Nexdrive entra em contato com você.</span>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

            </div>

            <!-- Apps de terceiros com acesso -->
            <div class="uber-section-divider"></div>
            
            <div class="section-subheader-uber">
              <h2>Apps de terceiros com acesso à conta</h2>
              <p class="subtitle-text">
                Os apps de terceiros com permissão de acesso à sua conta aparecem aqui. 
                <a href="javascript:void(0)" class="cyan-link" (click)="saibaMaisPrivacidade()">Saiba mais</a>
              </p>
            </div>
            
            <div class="empty-third-party-box">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" class="box-icon"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <p>Nenhum aplicativo de terceiros tem permissão de acesso à sua conta atualmente.</p>
            </div>

          </section>
        }

      </main>

      <!-- Cropper Modal Overlay -->
      <div class="cropper-overlay" *ngIf="showCropModal()">
        <div class="cropper-container animate-in">
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
              
              <div class="crop-mask"></div>
            </div>
          </div>
          
          <div class="cropper-controls">
            <div class="zoom-control">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <input type="range" 
                     [min]="minZoom()" 
                     [max]="maxZoom()" 
                     step="0.01" 
                     [value]="zoomLevel()" 
                     (input)="onZoomSliderChange($event)"
                     class="zoom-slider">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
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
    .account-settings-container {
      display: flex;
      max-width: 1150px;
      margin: 40px auto;
      gap: 48px;
      padding: 0 24px;
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: 24px;
        margin: 16px auto;
        padding: 0 16px;
      }
    }
    
    .sidebar-nav {
      width: 250px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
      
      @media (max-width: 768px) {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 8px;
        border-bottom: 1.5px solid var(--border);
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }
    }
    
    .nav-item-btn {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 14px 20px;
      background: transparent;
      border: none;
      border-left: 4px solid transparent;
      color: var(--text-secondary);
      font-size: 14.5px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      opacity: 0.85;
      
      .nav-icon {
        color: var(--text-muted);
        transition: all 0.25s ease;
      }
      
      &:hover {
        opacity: 1;
        color: var(--text-primary);
        background-color: var(--surface-secondary);
        border-left-color: var(--border);
        transform: translateX(4px);
        
        .nav-icon {
          color: var(--accent);
          transform: scale(1.1);
        }
      }
      
      &.active {
        opacity: 1;
        color: var(--accent);
        background-color: var(--surface-secondary);
        border-left-color: var(--accent);
        font-weight: 700;
        box-shadow: var(--shadow-xs);
        
        .nav-icon {
          color: var(--accent);
          transform: scale(1.1);
        }
      }
      
      @media (max-width: 768px) {
        width: auto;
        white-space: nowrap;
        border-left: none;
        border-bottom: 3.5px solid transparent;
        border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        padding: 12px 18px;
        
        &:hover {
          transform: none;
        }
        
        &.active {
          border-bottom-color: var(--accent);
          box-shadow: none;
        }
      }
    }
    
    .content-panel {
      flex-grow: 1;
      min-width: 0;
    }
    
    .tab-content-section {
      display: flex;
      flex-direction: column;
      gap: 32px;
      text-align: left;
    }
    
    .welcome-header, .section-header-uber {
      h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 32px;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0 0 8px 0;
        letter-spacing: -0.8px;
        line-height: 1.2;
      }
      
      .subtitle-text {
        font-size: 15px;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
      }
    }
    
    .section-subheader-uber {
      text-align: left;
      h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 22px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px 0;
        letter-spacing: -0.4px;
      }
      
      .subtitle-text {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
      }
    }
    
    /* Completeness card */
    .completeness-dashboard-card {
      padding: 26px;
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-secondary) 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 120px;
        height: 100%;
        background: radial-gradient(circle at 100% 0%, var(--accent-light) 0%, transparent 70%);
        pointer-events: none;
      }
    }
    
    .completeness-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    
    .completeness-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .completeness-badge {
      font-size: 13px;
      font-weight: 800;
      color: var(--accent);
      padding: 5px 10px;
      background: rgba(0, 191, 234, 0.12);
      border-radius: var(--radius-xs);
      border: 1px solid rgba(0, 191, 234, 0.18);
      
      &.complete {
        color: var(--success);
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.2);
      }
    }
    
    .completeness-track {
      width: 100%;
      height: 8px;
      background: var(--border);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: 14px;
    }
    
    .completeness-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent) 0%, #00e5a8 100%);
      border-radius: var(--radius-full);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .completeness-tip {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      
      &.success {
        color: var(--success);
        font-weight: 600;
      }
    }
    
    /* Shortcuts grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    
    .dashboard-shortcut-card {
      padding: 26px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-sm);
      
      .shortcut-icon-wrapper {
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        background: var(--surface-secondary);
        border-radius: var(--radius-md);
        border: 1.5px solid var(--border);
        transition: all 0.3s ease;
      }
      
      .shortcut-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-grow: 1;
        
        h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        p {
          margin: 0;
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
      }
      
      .shortcut-action {
        font-size: 13px;
        font-weight: 700;
        color: var(--accent);
        margin-top: auto;
        display: inline-block;
        transition: transform 0.25s ease;
      }
      
      &.clickable {
        cursor: pointer;
        
        &:hover {
          border-color: var(--accent);
          box-shadow: var(--shadow-md), 0 0 0 1px var(--accent-light);
          transform: translateY(-4px);
          
          .shortcut-icon-wrapper {
            background-color: var(--accent-light);
            border-color: var(--accent);
            color: var(--accent);
          }
          
          .shortcut-action {
            transform: translateX(6px);
          }
        }
      }
    }
    
    /* Avatar Edit Panel */
    .avatar-settings-card {
      display: flex;
      align-items: center;
      gap: 32px;
      padding: 28px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      
      @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
        padding: 24px;
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
      border: 4px solid var(--surface-secondary);
      outline: 2px dashed rgba(0, 191, 234, 0.25);
      outline-offset: 4px;
      box-shadow: var(--shadow-md);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
      
      &:hover {
        outline-color: var(--accent);
        transform: scale(1.02);
        
        img {
          filter: brightness(0.4) blur(1px);
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
        font-size: 12px;
        font-weight: 700;
        opacity: 0;
        transition: opacity 0.25s ease;
        text-align: center;
        background: rgba(10, 22, 40, 0.7);
        
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
        background: rgba(10, 22, 40, 0.75);
        
        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      }
    }
    
    .avatar-meta-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
      }
      
      p {
        margin: 0;
        font-size: 13.5px;
        color: var(--text-secondary);
        line-height: 1.5;
        max-width: 480px;
      }
      
      @media (max-width: 600px) {
        text-align: center;
        align-items: center;
      }
    }
    
    .avatar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
      
      @media (max-width: 600px) {
        justify-content: center;
      }
    }
    
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 16px;
      cursor: pointer;
      background-color: var(--surface-secondary);
      transition: all 0.25s ease;
      
      &:hover {
        background-color: var(--border);
        color: var(--text-primary);
      }
      
      &.danger {
        border-color: rgba(239, 68, 68, 0.2);
        background-color: rgba(239, 68, 68, 0.04);
        color: #ef4444;
        
        &:hover {
          background-color: #ef4444;
          color: white;
          border-color: #ef4444;
        }
      }
      
      &.primary {
        border-color: rgba(0, 191, 234, 0.25);
        background-color: rgba(0, 191, 234, 0.04);
        color: var(--accent);
        
        &:hover {
          background-color: var(--accent);
          color: var(--bg-navbar);
          border-color: var(--accent);
        }
      }
    }
    
    /* Uber Form Styles */
    .profile-form-uber {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .form-grid-uber {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      
      &.single-column {
        grid-template-columns: 1fr;
        max-width: 480px;
        gap: 20px;
      }
      
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    
    .input-group-uber {
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      label {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.2px;
      }
      
      .uber-input {
        width: 100%;
        height: 52px;
        padding: 14px 18px;
        background: var(--surface-secondary);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 14.5px;
        font-weight: 500;
        font-family: inherit;
        outline: none;
        transition: all 0.25s ease;
        box-sizing: border-box;
        
        &::placeholder {
          color: var(--text-muted);
        }
        
        &:focus:not(:disabled) {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-light);
          background: var(--surface);
        }
        
        &:disabled, &.disabled {
          background-color: var(--surface-secondary) !important;
          border-color: var(--border) !important;
          color: var(--text-secondary) !important;
          opacity: 0.75;
          cursor: not-allowed;
        }
      }
      
      .field-meta {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 4px;
        font-weight: 500;
      }
      
      .error-text {
        font-size: 12px;
        color: var(--error);
        margin-top: 4px;
        font-weight: 600;
      }
    }
    
    .input-with-icon-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      
      .uber-input {
        padding-right: 48px;
      }
      
      .input-lock-icon {
        position: absolute;
        right: 18px;
        color: var(--text-muted);
        pointer-events: none;
        
        &.google {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    
    .form-actions-uber {
      display: flex;
      justify-content: flex-end;
    }
    
    .save-btn-uber {
      padding: 14px 32px;
      background: var(--accent);
      color: var(--bg-navbar);
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 14.5px;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: var(--shadow-sm);
      
      &:hover:not(:disabled) {
        background: var(--accent-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md), var(--shadow-accent);
      }
      
      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }
    
    /* Uber Clean List Styles (Fine lines, modern icons on left) */
    .uber-clean-list {
      display: flex;
      flex-direction: column;
      border-top: 1px solid var(--border);
      
      &.no-top-border {
        border-top: none;
      }
    }
    
    .uber-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 8px;
      border-bottom: 1px solid var(--border);
      transition: all 0.25s ease;
      
      .item-left-group {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .item-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: var(--radius-sm);
        border: 1.5px solid var(--border);
        color: var(--text-secondary);
        background: var(--surface-secondary);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        flex-shrink: 0;
      }
      
      .item-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
      }
      
      .item-title {
        font-size: 16.5px;
        font-weight: 700;
        color: var(--text-primary);
      }
      
      .item-description {
        font-size: 13.5px;
        color: var(--text-secondary);
        line-height: 1.4;
      }
      
      .chevron-icon {
        color: var(--text-muted);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        
        &.rotated {
          transform: rotate(90deg);
        }
      }
      
      &.clickable {
        cursor: pointer;
        
        &:hover {
          background-color: var(--surface-hover);
          padding-left: 16px;
          padding-right: 16px;
          border-radius: var(--radius-md);
          border-color: transparent;
          
          .item-icon-box {
            background-color: var(--accent-light);
            border-color: var(--accent);
            color: var(--accent);
            transform: scale(1.05);
          }
          
          .chevron-icon {
            color: var(--text-primary);
            transform: translateX(4px);
          }
        }
      }
    }
    
    .uber-list-item-collapsible {
      display: flex;
      flex-direction: column;
    }
    
    .password-form-panel {
      padding: 28px;
      background-color: var(--surface-secondary);
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border);
      margin: 8px 8px 24px 8px;
    }
    
    .uber-section-divider {
      height: 1.5px;
      background-color: var(--border);
      margin: 40px 0;
    }
    
    /* Switch / Toggle styles */
    .switch-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      position: relative;
      
      input {
        display: none;
      }
      
      .switch {
        width: 48px;
        height: 28px;
        background: var(--border);
        border-radius: var(--radius-full);
        position: relative;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1.5px solid var(--border);
        
        &::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 19px;
          height: 19px;
          background: var(--surface);
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
    
    /* Social Connected branding styles */
    .social-connect-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 8px;
      border-bottom: 1px solid var(--border);
      
      .social-branding {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .social-logo-box {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface);
        border: 1.5px solid var(--border);
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s;
        
        &.apple {
          background-color: #0f1419;
          color: white;
          border-color: #0f1419;
        }
        &.google {
          background-color: white;
          color: #000;
        }
      }
      
      .social-name {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }
    
    .btn-uber-action {
      padding: 10px 22px;
      background-color: var(--surface-secondary);
      border: 1.5px solid var(--border);
      color: var(--text-primary);
      border-radius: 24px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
      
      &:hover {
        background-color: var(--border);
        border-color: var(--text-secondary);
        transform: translateY(-1px);
      }
    }
    
    /* Active sessions activity styles */
    .current-session-card-uber {
      display: flex;
      gap: 20px;
      padding: 26px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      background-color: var(--surface);
      box-shadow: var(--shadow-sm);
      margin-bottom: 12px;
      align-items: flex-start;
      
      .device-icon-box {
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background-color: var(--accent-light);
        border-radius: var(--radius-sm);
        border: 1.5px solid var(--accent);
        flex-shrink: 0;
        
        &.other-device {
          background-color: var(--surface-secondary);
          border-color: var(--border);
          color: var(--text-secondary);
        }
      }
      
      .session-details {
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: left;
        
        h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .session-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .badge-current-dot {
          width: 8px;
          height: 8px;
          background-color: var(--success);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px var(--success);
          animation: pulse-success 2s infinite;
        }
        
        .badge-current-text {
          font-size: 12px;
          font-weight: 800;
          color: var(--success);
        }
        
        .geo-info {
          font-size: 14px;
          color: var(--text-primary);
          margin: 0;
          font-weight: 600;
        }
        
        .platform-info {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }
      }
    }
    
    @keyframes pulse-success {
      0% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      70% { opacity: 1; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    
    .session-row {
      .btn-terminate-session-uber {
        background: transparent;
        border: 1.5px solid var(--error);
        color: var(--error);
        padding: 8px 18px;
        border-radius: var(--radius-sm);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.25s ease;
        
        &:hover {
          background-color: var(--error);
          color: white;
        }
      }
    }
    
    .terminate-all-action-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px 8px;
      cursor: pointer;
      color: var(--error);
      border-bottom: 1px solid var(--border);
      transition: all 0.25s ease;
      
      .terminate-icon-box {
        color: var(--error);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background-color: rgba(239, 68, 68, 0.05);
        border-radius: var(--radius-sm);
        border: 1.5px solid rgba(239, 68, 68, 0.2);
        transition: all 0.2s;
      }
      
      .terminate-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
        
        .title {
          font-size: 16px;
          font-weight: 700;
        }
        
        .description {
          font-size: 12.5px;
          color: var(--text-secondary);
        }
      }
      
      &:hover {
        background-color: rgba(239, 68, 68, 0.03);
        padding-left: 16px;
        border-radius: var(--radius-md);
        border-color: transparent;
        
        .terminate-icon-box {
          background-color: #ef4444;
          color: white;
          border-color: #ef4444;
        }
      }
    }
    
    .empty-third-party-box {
      padding: 56px;
      text-align: center;
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background-color: var(--surface-secondary);
      
      .box-icon {
        color: var(--text-muted);
      }
      
      p {
        margin: 0;
        font-size: 14.5px;
        max-width: 400px;
        line-height: 1.6;
      }
    }
    
    .cyan-link {
      color: var(--accent);
      font-weight: 700;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    /* Datepicker styling overlays */
    .datepicker-container {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      
      .calendar-icon {
        position: absolute;
        right: 18px;
        width: 18px;
        height: 18px;
        color: var(--text-secondary);
        pointer-events: none;
      }
      
      .uber-input {
        padding-right: 48px;
        cursor: pointer;
      }
    }

    .custom-datepicker-popup {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      width: 328px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 22px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 18px;
      box-sizing: border-box;
    }
    
    .datepicker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .nav-btn {
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.25s;
        
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
        font-size: 15.5px;
        font-weight: 700;
        color: var(--text-primary);
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
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
        color: var(--text-muted);
        padding-bottom: 10px;
      }
    }
    
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      
      .day-btn {
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 13.5px;
        font-weight: 600;
        background: transparent;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover:not(:disabled):not(.adjacent-month) {
          background: var(--accent-light);
          color: var(--accent);
        }
        
        &.today {
          border: 1.5px solid var(--accent);
          color: var(--accent);
        }
        
        &.selected {
          background: var(--accent) !important;
          color: var(--bg-navbar) !important;
          font-weight: 700;
          box-shadow: var(--shadow-sm), var(--shadow-accent);
        }
        
        &.adjacent-month {
          color: var(--text-muted);
          opacity: 0.35;
          cursor: default;
          pointer-events: none;
        }
        
        &:disabled {
          opacity: 0.25;
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
        font-size: 13.5px;
        font-weight: 600;
        border-radius: var(--radius-sm);
        background: transparent;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s;
        
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
      padding-top: 14px;
      border-top: 1px solid var(--border);
      
      .footer-action-btn {
        background: transparent;
        border: none;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        padding: 6px 14px;
        border-radius: var(--radius-sm);
        transition: all 0.25s;
        
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
    
    .strength-bar-container {
      width: 100%;
      height: 5px;
      background: var(--border);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-top: 8px;
    }
    
    .strength-bar {
      height: 100%;
      width: 0;
      transition: width 0.3s ease, background-color 0.3s ease;
      
      &.weak { width: 33%; background: var(--error); }
      &.medium { width: 66%; background: var(--warning); }
      &.strong { width: 100%; background: var(--success); }
    }
    
    .cropper-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(4, 9, 20, 0.85);
      backdrop-filter: blur(12px);
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
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .cropper-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      
      h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        color: var(--text-primary);
      }
      
      .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 26px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
        
        &:hover {
          color: var(--text-primary);
        }
      }
    }
    
    .crop-area-wrapper {
      padding: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #050a14;
    }
    
    .crop-viewport {
      position: relative;
      width: 300px;
      height: 300px;
      overflow: hidden;
      cursor: move;
      border: 2.5px dashed rgba(255, 255, 255, 0.35);
      border-radius: 50%;
      box-shadow: 0 0 0 9999px rgba(5, 10, 20, 0.75);
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
      box-shadow: 0 0 20px rgba(0, 191, 234, 0.45);
    }
    
    .cropper-controls {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    
    .zoom-control {
      display: flex;
      align-items: center;
      gap: 14px;
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
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
    }
    
    .cropper-actions {
      padding: 18px 24px;
      display: flex;
      gap: 14px;
      justify-content: flex-end;
      background: var(--surface-secondary);
      
      button {
        padding: 12px 22px;
        font-size: 13.5px;
        font-weight: 600;
        border-radius: var(--radius-md);
        border: none;
        cursor: pointer;
        transition: all 0.25s ease;
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
        color: var(--bg-navbar);
        font-weight: 700;
        
        &:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 14px rgba(0, 191, 234, 0.35);
        }
      }
    }
    
    .animate-in {
      animation: accountIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes accountIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  activeSection = signal<'inicio' | 'dados' | 'seguranca' | 'privacidade'>('inicio');
  showPasswordForm = signal(false);
  appleConnected = signal(false);

  togglePasswordForm() {
    this.showPasswordForm.set(!this.showPasswordForm());
  }

  toggleAppleConnection() {
    if (this.appleConnected()) {
      this.appleConnected.set(false);
      this.toast.success('Conta Apple desconectada com sucesso.');
    } else {
      this.appleConnected.set(true);
      this.toast.success('Conta Apple conectada com sucesso!');
    }
  }

  toggleGoogleConnection() {
    if (this.isGoogleUser()) {
      this.toast.warning('Sua conta de login principal do Google não pode ser desconectada.');
    } else {
      this.toast.info('Autenticação com o Google já está pronta para uso.');
    }
  }

  terminateAllSessions() {
    const nonCurrent = this.sessions().filter(s => !s.isCurrent);
    if (nonCurrent.length === 0) {
      this.toast.info('Não há outras sessões ativas para encerrar.');
      return;
    }
    
    this.isSaving.set(true);
    let count = 0;
    nonCurrent.forEach(s => {
      this.http.delete(`/api/users/me/sessions/${s.id}`).subscribe({
        next: () => {
          count++;
          if (count === nonCurrent.length) {
            this.toast.success('Todas as outras sessões foram encerradas com sucesso.');
            this.loadSessions();
            this.isSaving.set(false);
          }
        },
        error: () => {
          count++;
          if (count === nonCurrent.length) {
            this.loadSessions();
            this.isSaving.set(false);
          }
        }
      });
    });
  }

  saibaMaisPrivacidade() {
    this.toast.info('Para saber mais sobre a privacidade de seus dados, consulte nossos termos de uso.');
  }

  showInfoToast(title: string) {
    this.toast.info(title + ': Funcionalidade de demonstração.');
  }

    authService = inject(AuthService);
    toast = inject(ToastService);
    http = inject(HttpClient);

    user = this.authService.currentUser;
    editUser: Partial<User> = {};
    isSaving = signal(false);

    isGoogleUser = computed(() => {
        const photo = this.originalGooglePhoto() || this.user()?.profileImageUrl;
        return !!photo && (photo.includes('googleusercontent.com') || photo.includes('google'));
    });

    profileCompleteness = computed(() => {
        const fields = [
            !!this.editUser.fullName,
            !!this.user()?.email,
            !!this.editUser.phone,
            !!this.editUser.cpf,
            !!this.editUser.birthDate
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    });

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
        // Validate Phone (optional but must be valid if filled)
        if (this.editUser.phone) {
            const cleanPhone = this.editUser.phone.replace(/\D/g, '');
            if (cleanPhone.length > 0 && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
                this.toast.error('Telefone inválido. Formato esperado: (99) 99999-9999');
                return;
            }
        }
        
        // Validate CPF (optional but must be valid if filled)
        if (this.editUser.cpf) {
            const cleanCPF = this.editUser.cpf.replace(/\D/g, '');
            if (cleanCPF.length > 0 && cleanCPF.length !== 11) {
                this.toast.error('CPF inválido. Deve conter 11 dígitos.');
                return;
            }
        }

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
