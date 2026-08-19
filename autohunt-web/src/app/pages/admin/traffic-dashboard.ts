import { Component, OnInit, OnDestroy, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  TrafficAdminService,
  TrafficSummary,
  TrafficTimelinePoint,
  TopIp,
  TopRoute,
  RequestLogItem
} from '../../core/services/traffic-admin';
import { LanguageService } from '../../core/services/language';

interface HoverPoint {
  index: number;
  x: number;
  y: number;
  label: string;
  total: number;
  suspicious: number;
  blocked: number;
}

@Component({
  selector: 'app-traffic-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="traffic-console">
      <!-- Top Bar -->
      <div class="console-header">
        <div class="header-left">
          <div class="badge-tag">
            <span class="pulse-dot"></span>
            PAINEL DE SEGURANÇA & TRÁFEGO
          </div>
          <h1>Monitoramento em Tempo Real & Anti-Scraping</h1>
          <p class="subtitle">
            Proteção in-app com Rate Limiting (Bucket4j), heurísticas de detecção de bots, geolocalização e inspeção de dispositivos.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn-refresh" (click)="refreshAll()" [disabled]="isLoading()">
            <svg [class.spin]="isLoading()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>{{ isLoading() ? 'Atualizando...' : 'Atualizar Dados' }}</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Requisições (24h / 30d)</span>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ summary()?.totalRequests24h || 0 | number }}</span>
              <span class="kpi-sub">/ {{ summary()?.totalRequests30d || 0 | number }}</span>
            </div>
            <span class="kpi-trend positive">Tráfego HTTP Ativo</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Bloqueados por Rate Limit (429)</span>
            <div class="kpi-value-row">
              <span class="kpi-value red-text">{{ summary()?.blockedRequests24h || 0 | number }}</span>
              <span class="kpi-sub">/ {{ summary()?.blockedRequests30d || 0 | number }}</span>
            </div>
            <span class="kpi-trend danger">Excesso de Requisições</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Suspeitas de Bot / Scraper</span>
            <div class="kpi-value-row">
              <span class="kpi-value amber-text">{{ summary()?.suspiciousRequests24h || 0 | number }}</span>
              <span class="kpi-sub">/ {{ summary()?.suspiciousRequests30d || 0 | number }}</span>
            </div>
            <span class="kpi-trend warning">Padrão Anômalo Detectado</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10z"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">IPs Únicos Conectados</span>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ summary()?.uniqueIps24h || 0 | number }}</span>
              <span class="kpi-sub">/ {{ summary()?.uniqueIps30d || 0 | number }}</span>
            </div>
            <span class="kpi-trend positive">Origens Distintas</span>
          </div>
        </div>
      </div>

      <!-- Chart Section (Datadog / Vercel style) -->
      <div class="chart-section">
        <div class="section-top">
          <div>
            <h2>Volume de Tráfego & Picos</h2>
            <p class="section-desc">Evolução temporal das requisições, bloqueios (429) e atividades suspeitas com crosshair interativo.</p>
          </div>
          <div class="time-toggle">
            <button [class.active]="timeframe() === 'hourly'" (click)="setTimeframe('hourly')">24 Horas</button>
            <button [class.active]="timeframe() === 'daily'" (click)="setTimeframe('daily')">30 Dias</button>
          </div>
        </div>

        <!-- Custom Interactive SVG Chart -->
        <div class="chart-container" #chartContainer (mousemove)="onChartMouseMove($event)" (mouseleave)="onChartMouseLeave()">
          <div *ngIf="timelineData().length === 0" class="no-data">
            Carregando dados de tráfego...
          </div>

          <div *ngIf="timelineData().length > 0" class="svg-chart-wrapper">
            <svg class="traffic-svg" viewBox="0 0 900 240" preserveAspectRatio="none">
              <!-- Grid lines & Values -->
              <line x1="40" y1="30" x2="880" y2="30" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
              <line x1="40" y1="80" x2="880" y2="80" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
              <line x1="40" y1="130" x2="880" y2="130" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
              <line x1="40" y1="180" x2="880" y2="180" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>

              <!-- Baseline axis -->
              <line x1="40" y1="200" x2="880" y2="200" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>

              <!-- Gradients -->
              <defs>
                <linearGradient id="totalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45"/>
                  <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#1e293b" stop-opacity="0.0"/>
                </linearGradient>
                <linearGradient id="suspiciousGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Area under curve (Total) -->
              <polygon *ngIf="showTotal()" [attr.points]="chartTotalAreaPoints()" fill="url(#totalGradient)"/>

              <!-- Area under curve (Suspicious) -->
              <polygon *ngIf="showSuspicious()" [attr.points]="chartSuspiciousAreaPoints()" fill="url(#suspiciousGradient)"/>

              <!-- Total Requests Polyline (Blue/Cyan) -->
              <polyline *ngIf="showTotal()" [attr.points]="chartTotalLinePoints()" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Suspicious Polyline (Amber) -->
              <polyline *ngIf="showSuspicious()" [attr.points]="chartSuspiciousLinePoints()" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Blocked Polyline (Red Dashed) -->
              <polyline *ngIf="showBlocked()" [attr.points]="chartBlockedLinePoints()" fill="none" stroke="#f87171" stroke-width="2.5" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Data Points (Total) -->
              <ng-container *ngIf="showTotal()">
                <circle *ngFor="let pt of chartPoints()" [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" fill="#38bdf8" stroke="#0f172a" stroke-width="2.5"/>
              </ng-container>

              <!-- "Agora" (Now) marker on 24h view (last point) -->
              <g *ngIf="timeframe() === 'hourly' && chartPoints().length > 0">
                <line [attr.x1]="lastPointX()" y1="20" [attr.x2]="lastPointX()" y2="200" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4 2"/>
                <rect [attr.x]="lastPointX() - 24" y="6" width="48" height="18" rx="4" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7" stroke-width="1"/>
                <text [attr.x]="lastPointX()" y="18" fill="#e9d5ff" font-size="10" font-weight="700" text-anchor="middle">AGORA</text>
              </g>

              <!-- Crosshair Vertical Guideline (When Hovered) -->
              <g *ngIf="hoverPoint() as hp">
                <line [attr.x1]="hp.x" y1="25" [attr.x2]="hp.x" y2="200" stroke="#f8fafc" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
                <circle [attr.cx]="hp.x" [attr.cy]="hp.y" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
              </g>
            </svg>

            <!-- Floating Tooltip Card -->
            <div *ngIf="hoverPoint() as hp" class="floating-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
              <div class="tooltip-header">
                <span class="tooltip-time">{{ hp.label }}</span>
                <span class="tooltip-badge" *ngIf="timeframe() === 'hourly'">Última hora</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-dot blue"></span>
                <span class="tooltip-label">Total:</span>
                <span class="tooltip-val">{{ hp.total | number }} reqs</span>
              </div>
              <div class="tooltip-row" *ngIf="hp.suspicious > 0">
                <span class="tooltip-dot amber"></span>
                <span class="tooltip-label">Suspeitas:</span>
                <span class="tooltip-val amber-text">{{ hp.suspicious | number }}</span>
              </div>
              <div class="tooltip-row" *ngIf="hp.blocked > 0">
                <span class="tooltip-dot red"></span>
                <span class="tooltip-label">Bloqueados:</span>
                <span class="tooltip-val red-text">{{ hp.blocked | number }}</span>
              </div>
            </div>

            <!-- X-Axis Labels -->
            <div class="chart-labels">
              <span *ngFor="let pt of chartLabelsSample()">{{ pt }}</span>
            </div>

            <!-- Interactive Toggleable Legend -->
            <div class="chart-legend">
              <button class="legend-btn" [class.inactive]="!showTotal()" (click)="toggleSeries('total')">
                <span class="legend-dot blue"></span>
                <span>Total de Requisições</span>
                <span class="legend-eye">{{ showTotal() ? '👁️' : '🚫' }}</span>
              </button>

              <button class="legend-btn" [class.inactive]="!showSuspicious()" (click)="toggleSeries('suspicious')">
                <span class="legend-dot amber"></span>
                <span>Suspeitas de Bot</span>
                <span class="legend-eye">{{ showSuspicious() ? '👁️' : '🚫' }}</span>
              </button>

              <button class="legend-btn" [class.inactive]="!showBlocked()" (click)="toggleSeries('blocked')">
                <span class="legend-dot red"></span>
                <span>Bloqueados (Rate Limit 429)</span>
                <span class="legend-eye">{{ showBlocked() ? '👁️' : '🚫' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Tables Section -->
      <div class="analytics-grid">
        <!-- Top Active IPs -->
        <div class="analytics-card">
          <div class="card-header">
            <h3>Top IPs Mais Ativos</h3>
            <span class="count-badge">{{ topIps().length }} IPs</span>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Endereço IP & Local</th>
                  <th class="text-right">Requisições</th>
                  <th class="text-center">Status</th>
                  <th>Último Acesso</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ip of topIps()">
                  <td>
                    <div class="ip-cell">
                      <span class="mono bold">{{ ip.ipAddress }}</span>
                      <span class="sub-location" *ngIf="ip.city || ip.country">
                        📍 {{ ip.city || 'Desconhecido' }}, {{ ip.country || '--' }}
                      </span>
                    </div>
                  </td>
                  <td class="text-right">
                    <span class="bold">{{ ip.totalRequests | number }}</span>
                  </td>
                  <td class="text-center">
                    <span *ngIf="ip.isInternal" class="badge internal">Interno</span>
                    <span *ngIf="!ip.isInternal && ip.blockedCount > 0" class="badge danger">Bloqueado ({{ ip.blockedCount }})</span>
                    <span *ngIf="!ip.isInternal && ip.blockedCount === 0 && ip.suspiciousCount > 0" class="badge warning">Suspeito ({{ ip.suspiciousCount }})</span>
                    <span *ngIf="!ip.isInternal && ip.blockedCount === 0 && ip.suspiciousCount === 0" class="badge normal">Normal</span>
                  </td>
                  <td class="muted">{{ ip.lastSeen | date:'dd/MM HH:mm:ss' }}</td>
                </tr>
                <tr *ngIf="topIps().length === 0">
                  <td colspan="4" class="empty-cell">Nenhum registro de IP encontrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Routes -->
        <div class="analytics-card">
          <div class="card-header">
            <h3>Rotas Mais Acessadas</h3>
            <span class="count-badge">{{ topRoutes().length }} Rotas</span>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Endpoint / Rota</th>
                  <th class="text-right">Total Hits</th>
                  <th class="text-right">Tempo Médio</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let route of topRoutes()">
                  <td>
                    <span class="method-badge" [attr.data-method]="route.method">{{ route.method }}</span>
                  </td>
                  <td>
                    <span class="mono route-text">{{ route.endpoint }}</span>
                  </td>
                  <td class="text-right bold">{{ route.totalRequests | number }}</td>
                  <td class="text-right muted">{{ route.avgResponseTimeMs }} ms</td>
                </tr>
                <tr *ngIf="topRoutes().length === 0">
                  <td colspan="4" class="empty-cell">Nenhum registro de rota encontrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Live Stream Logs Section (Enriched with Device & GeoIP) -->
      <div class="logs-section">
        <div class="logs-header">
          <div>
            <h2>Feed de Auditoria de Requisições</h2>
            <p class="section-desc">Inspeção detalhada de eventos HTTP com geolocalização e identificação de dispositivo/navegador.</p>
          </div>

          <div class="filter-tabs">
            <button [class.active]="logFilter() === 'all'" (click)="setLogFilter('all')">Todas</button>
            <button [class.active]="logFilter() === 'suspicious'" (click)="setLogFilter('suspicious')">Suspeitas</button>
            <button [class.active]="logFilter() === 'blocked'" (click)="setLogFilter('blocked')">Bloqueadas (429)</button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table logs-table">
            <thead>
              <tr>
                <th>Horário</th>
                <th>IP & Origem</th>
                <th>Método & Rota</th>
                <th>Dispositivo / Navegador</th>
                <th>Status</th>
                <th class="text-right">Tempo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs()" [class.row-danger]="log.blockedByRateLimit" [class.row-warning]="log.isSuspicious && !log.blockedByRateLimit">
                <td class="muted">{{ log.timestamp | date:'dd/MM HH:mm:ss' }}</td>
                <td>
                  <div class="ip-geo-cell">
                    <span class="mono bold">{{ log.ipAddress }}</span>
                    <span class="geo-sub">
                      📍 {{ log.city || 'Desconhecido' }}, {{ log.countryCode || '--' }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="route-cell">
                    <span class="method-badge" [attr.data-method]="log.method">{{ log.method }}</span>
                    <span class="mono">{{ log.endpoint }}</span>
                  </div>
                </td>
                <td>
                  <div class="device-cell">
                    <div class="device-main">
                      <span class="device-icon" [title]="log.deviceType || 'Desktop'">
                        <span *ngIf="log.deviceType === 'Mobile'">📱</span>
                        <span *ngIf="log.deviceType === 'Tablet'">📟</span>
                        <span *ngIf="log.deviceType === 'Bot'">🤖</span>
                        <span *ngIf="!log.deviceType || log.deviceType === 'Desktop'">💻</span>
                      </span>
                      <span class="browser-name">{{ log.browser || 'Navegador' }}</span>
                      <span class="os-name">· {{ log.operatingSystem || 'SO' }}</span>
                    </div>

                    <!-- Warning Reason Badge -->
                    <div *ngIf="log.suspiciousReason" class="alert-reason-badge">
                      ⚠️ {{ log.suspiciousReason }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="status-cell">
                    <span class="status-code" [class.status-2xx]="log.statusCode < 300" [class.status-4xx]="log.statusCode >= 400 && log.statusCode < 500" [class.status-5xx]="log.statusCode >= 500">
                      {{ log.statusCode }}
                    </span>
                    <span *ngIf="log.isInternal" class="badge internal sm">Interno</span>
                  </div>
                </td>
                <td class="text-right muted">{{ log.responseTimeMs }} ms</td>
              </tr>
              <tr *ngIf="logs().length === 0">
                <td colspan="6" class="empty-cell">Nenhum log encontrado para o filtro selecionado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="totalPages() > 1">
          <span>Página {{ currentPage() + 1 }} de {{ totalPages() }} ({{ totalElements() }} logs)</span>
          <div class="page-buttons">
            <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 0">Anterior</button>
            <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages() - 1">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .traffic-console {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px 80px;
      color: #e2e8f0;
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      gap: 20px;
      flex-wrap: wrap;
    }

    .badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 10px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: #38bdf8;
      border-radius: 50%;
      box-shadow: 0 0 8px #38bdf8;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }

    .console-header h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 6px;
    }

    .subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #334155;
      border-color: #475569;
    }

    .btn-refresh:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .kpi-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .kpi-icon.red { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .kpi-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .kpi-icon.green { background: rgba(34, 197, 94, 0.15); color: #4ade80; }

    .kpi-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .kpi-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
    }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
    }

    .red-text { color: #f87171 !important; }
    .amber-text { color: #fbbf24 !important; }

    .kpi-sub {
      font-size: 13px;
      color: #64748b;
    }

    .kpi-trend {
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      padding: 2px 6px;
      width: fit-content;
      margin-top: 2px;
    }

    .kpi-trend.positive { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
    .kpi-trend.danger { background: rgba(239, 68, 68, 0.12); color: #f87171; }
    .kpi-trend.warning { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }

    /* Chart Section */
    .chart-section {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 28px;
    }

    .section-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .section-top h2, .logs-header h2 {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 4px;
    }

    .section-desc {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }

    .time-toggle, .filter-tabs {
      display: flex;
      background: #1e293b;
      padding: 3px;
      border-radius: 8px;
      gap: 2px;
    }

    .time-toggle button, .filter-tabs button {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .time-toggle button.active, .filter-tabs button.active {
      background: #3b82f6;
      color: #ffffff;
    }

    .chart-container {
      position: relative;
      width: 100%;
      cursor: crosshair;
    }

    .traffic-svg {
      width: 100%;
      height: 240px;
      overflow: visible;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
      margin-top: 8px;
      padding: 0 40px;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
      font-size: 12px;
      color: #94a3b8;
      flex-wrap: wrap;
    }

    .legend-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1e293b;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .legend-btn:hover {
      background: #334155;
    }

    .legend-btn.inactive {
      opacity: 0.4;
      text-decoration: line-through;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .legend-dot.blue { background: #38bdf8; }
    .legend-dot.amber { background: #fbbf24; }
    .legend-dot.red { background: #f87171; }

    /* Floating Tooltip */
    .floating-tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #3b82f6;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      transform: translate(-50%, -115%);
      z-index: 20;
      min-width: 140px;
      backdrop-filter: blur(8px);
      animation: fadeIn 0.1s ease-out;
    }

    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #334155;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }

    .tooltip-time {
      font-weight: 700;
      color: #f8fafc;
    }

    .tooltip-badge {
      font-size: 9px;
      background: #334155;
      padding: 1px 4px;
      border-radius: 3px;
      color: #94a3b8;
    }

    .tooltip-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 3px;
      font-size: 11px;
    }

    .tooltip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .tooltip-label { color: #94a3b8; }
    .tooltip-val { font-weight: 700; color: #f8fafc; margin-left: auto; }

    /* Analytics Grid */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 24px;
      margin-bottom: 28px;
    }

    .analytics-card, .logs-section {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 24px;
    }

    .card-header, .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .card-header h3 {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .count-badge {
      font-size: 11px;
      background: #1e293b;
      color: #94a3b8;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Data Tables */
    .table-wrap {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .data-table th {
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #1e293b;
    }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: #cbd5e1;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .bold { font-weight: 700; color: #f8fafc; }
    .muted { color: #64748b; font-size: 12px; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }

    .ip-cell, .ip-geo-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .sub-location, .geo-sub {
      font-size: 11px;
      color: #94a3b8;
    }

    .route-text {
      color: #38bdf8;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .method-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: #334155;
      color: #f1f5f9;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .method-badge[data-method="GET"] { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .method-badge[data-method="POST"] { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .method-badge[data-method="PUT"] { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .method-badge[data-method="DELETE"] { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    .badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .badge.normal { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
    .badge.warning { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
    .badge.danger { background: rgba(239, 68, 68, 0.12); color: #f87171; }
    .badge.internal { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }
    .badge.sm { font-size: 10px; padding: 1px 6px; }

    /* Device Cell */
    .device-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .device-main {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .device-icon { font-size: 14px; }
    .browser-name { font-weight: 600; color: #f8fafc; }
    .os-name { color: #94a3b8; }

    .alert-reason-badge {
      font-size: 10.5px;
      font-weight: 600;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      width: fit-content;
    }

    /* Logs Table */
    .row-danger td { background: rgba(239, 68, 68, 0.05) !important; }
    .row-warning td { background: rgba(245, 158, 11, 0.05) !important; }

    .route-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-code {
      font-weight: 700;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .status-2xx { color: #4ade80; background: rgba(34, 197, 94, 0.1); }
    .status-4xx { color: #f87171; background: rgba(239, 68, 68, 0.1); }
    .status-5xx { color: #c084fc; background: rgba(192, 132, 252, 0.1); }

    .empty-cell {
      text-align: center;
      padding: 30px !important;
      color: #64748b;
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      font-size: 12px;
      color: #94a3b8;
    }

    .page-buttons {
      display: flex;
      gap: 8px;
    }

    .page-buttons button {
      background: #1e293b;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }

    .page-buttons button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TrafficDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer') chartContainerRef?: ElementRef<HTMLDivElement>;

  private trafficService = inject(TrafficAdminService);
  langService = inject(LanguageService);

  summary = signal<TrafficSummary | null>(null);
  timelineData = signal<TrafficTimelinePoint[]>([]);
  topIps = signal<TopIp[]>([]);
  topRoutes = signal<TopRoute[]>([]);
  logs = signal<RequestLogItem[]>([]);

  isLoading = signal<boolean>(false);
  timeframe = signal<'hourly' | 'daily'>('hourly');
  logFilter = signal<string>('all');

  // Series visibility toggles
  showTotal = signal<boolean>(true);
  showSuspicious = signal<boolean>(true);
  showBlocked = signal<boolean>(true);

  // Crosshair & Hover Tooltip
  hoverPoint = signal<HoverPoint | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);

  private autoRefreshTimer: any = null;

  ngOnInit() {
    this.refreshAll();

    // Auto-refresh metrics every 15 seconds in browser
    if (typeof window !== 'undefined') {
      this.autoRefreshTimer = setInterval(() => {
        this.loadSummary();
        this.loadTimeline();
      }, 15000);
    }
  }

  ngOnDestroy() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }
  }

  refreshAll() {
    this.isLoading.set(true);
    this.loadSummary();
    this.loadTimeline();
    this.loadTopIps();
    this.loadTopRoutes();
    this.loadLogs();
  }

  setTimeframe(tf: 'hourly' | 'daily') {
    this.timeframe.set(tf);
    this.hoverPoint.set(null);
    this.loadTimeline();
  }

  setLogFilter(filter: string) {
    this.logFilter.set(filter);
    this.currentPage.set(0);
    this.loadLogs();
  }

  toggleSeries(series: 'total' | 'suspicious' | 'blocked') {
    if (series === 'total') this.showTotal.update(v => !v);
    if (series === 'suspicious') this.showSuspicious.update(v => !v);
    if (series === 'blocked') this.showBlocked.update(v => !v);
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadLogs();
  }

  private loadSummary() {
    this.trafficService.getSummary().subscribe({
      next: (res) => this.summary.set(res),
      error: (err) => console.error('Error loading summary', err)
    });
  }

  private loadTimeline() {
    const req$ = this.timeframe() === 'hourly'
      ? this.trafficService.getHourly()
      : this.trafficService.getDaily();

    req$.subscribe({
      next: (res) => {
        this.timelineData.set(res || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading timeline', err);
        this.isLoading.set(false);
      }
    });
  }

  private loadTopIps() {
    this.trafficService.getTopIps(15).subscribe({
      next: (res) => this.topIps.set(res || []),
      error: (err) => console.error('Error loading top IPs', err)
    });
  }

  private loadTopRoutes() {
    this.trafficService.getTopRoutes(15).subscribe({
      next: (res) => this.topRoutes.set(res || []),
      error: (err) => console.error('Error loading top routes', err)
    });
  }

  private loadLogs() {
    this.trafficService.getRecentLogs(this.logFilter(), this.currentPage(), 20).subscribe({
      next: (res) => {
        this.logs.set(res.content || []);
        this.totalPages.set(res.totalPages || 0);
        this.totalElements.set(res.totalElements || 0);
      },
      error: (err) => console.error('Error loading logs', err)
    });
  }

  // --- SVG Chart Calculations & Crosshair Interaction ---
  chartPoints = computed(() => {
    const data = this.timelineData();
    if (!data.length) return [];

    const maxVal = Math.max(...data.map(d => d.totalRequests), 10);
    const width = 840; // 40 to 880
    const height = 160; // 35 to 195
    const step = width / Math.max(data.length - 1, 1);

    return data.map((d, i) => {
      const x = 40 + i * step;
      // Minimum baseline offset so low/0 values are clearly visible above axis
      const y = 195 - (d.totalRequests / maxVal) * height;
      return { x, y, val: d.totalRequests, label: d.label, item: d };
    });
  });

  lastPointX = computed(() => {
    const pts = this.chartPoints();
    return pts.length > 0 ? pts[pts.length - 1].x : 880;
  });

  chartTotalLinePoints = computed(() => {
    return this.chartPoints().map(p => `${p.x},${p.y}`).join(' ');
  });

  chartTotalAreaPoints = computed(() => {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `40,200 ${pts.map(p => `${p.x},${p.y}`).join(' ')} ${last.x},200`;
  });

  chartBlockedLinePoints = computed(() => {
    const data = this.timelineData();
    if (!data.length) return '';

    const maxVal = Math.max(...data.map(d => d.totalRequests), 10);
    const width = 840;
    const height = 160;
    const step = width / Math.max(data.length - 1, 1);

    return data.map((d, i) => {
      const x = 40 + i * step;
      const y = 195 - (d.blockedRequests / maxVal) * height;
      return `${x},${y}`;
    }).join(' ');
  });

  chartSuspiciousLinePoints = computed(() => {
    const data = this.timelineData();
    if (!data.length) return '';

    const maxVal = Math.max(...data.map(d => d.totalRequests), 10);
    const width = 840;
    const height = 160;
    const step = width / Math.max(data.length - 1, 1);

    return data.map((d, i) => {
      const x = 40 + i * step;
      const y = 195 - (d.suspiciousRequests / maxVal) * height;
      return `${x},${y}`;
    }).join(' ');
  });

  chartSuspiciousAreaPoints = computed(() => {
    const data = this.timelineData();
    if (!data.length) return '';

    const maxVal = Math.max(...data.map(d => d.totalRequests), 10);
    const width = 840;
    const height = 160;
    const step = width / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => {
      const x = 40 + i * step;
      const y = 195 - (d.suspiciousRequests / maxVal) * height;
      return `${x},${y}`;
    });

    return `40,200 ${pts.join(' ')} ${40 + (data.length - 1) * step},200`;
  });

  chartLabelsSample = computed(() => {
    const data = this.timelineData();
    if (!data.length) return [];
    const count = Math.min(data.length, 8);
    const step = Math.floor(data.length / count) || 1;
    const labels: string[] = [];
    for (let i = 0; i < data.length; i += step) {
      labels.push(data[i].label);
    }
    return labels;
  });

  onChartMouseMove(event: MouseEvent) {
    const container = this.chartContainerRef?.nativeElement;
    if (!container || !this.timelineData().length) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * 900;

    const pts = this.chartPoints();
    if (!pts.length) return;

    // Find closest data point along X axis
    let closest = pts[0];
    let minDiff = Math.abs(pts[0].x - relativeX);
    let closestIndex = 0;

    pts.forEach((p, idx) => {
      const diff = Math.abs(p.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
        closestIndex = idx;
      }
    });

    const item = closest.item;
    this.hoverPoint.set({
      index: closestIndex,
      x: closest.x,
      y: closest.y,
      label: closest.label,
      total: item.totalRequests,
      suspicious: item.suspiciousRequests,
      blocked: item.blockedRequests
    });

    // Position tooltip relative to pixel container
    this.tooltipX.set((closest.x / 900) * rect.width);
    this.tooltipY.set((closest.y / 240) * rect.height);
  }

  onChartMouseLeave() {
    this.hoverPoint.set(null);
  }
}
