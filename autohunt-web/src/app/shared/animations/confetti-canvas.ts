import { Injectable } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  rotationAxis: number; // 0=X, 1=Y, 2=Z
  opacity: number;
  gravity: number;
  drag: number;
  wobble: number;
  wobbleSpeed: number;
  wobblePhase: number;
}

const COLORS = [
  '#00BFEA', '#4DD0E1', '#00E5FF',   // brand cyan family
  '#10B981', '#34D399',               // green
  '#F59E0B', '#FBBF24',              // amber
  '#EF4444', '#F87171',              // red
  '#8B5CF6', '#A78BFA',              // purple
  '#EC4899', '#F472B6',              // pink
  '#ffffff',                          // white
];

@Injectable({ providedIn: 'root' })
export class ConfettiCanvasService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private running = false;
  private resolvePromise: (() => void) | null = null;
  private startTime = 0;

  /**
   * Launch a fullscreen confetti celebration.
   * Returns a Promise that resolves when the animation naturally ends.
   * Call destroy() for immediate cleanup.
   */
  launch(durationMs = 3500): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    // Respect prefers-reduced-motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return this.launchReduced();
    }

    this.destroy(); // Clean up any previous instance

    return new Promise<void>((resolve) => {
      this.resolvePromise = resolve;
      this.createCanvas();
      this.spawnParticles();
      this.startTime = performance.now();
      this.running = true;
      this.tick(durationMs);
    });
  }

  /**
   * Immediately destroy the animation and clean up all resources.
   */
  destroy() {
    this.running = false;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.canvas?.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.particles = [];

    if (this.resolvePromise) {
      this.resolvePromise();
      this.resolvePromise = null;
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private launchReduced(): Promise<void> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        pointer-events: none;
        background: radial-gradient(ellipse at center, rgba(0,191,234,0.08) 0%, transparent 70%);
        opacity: 0; transition: opacity 0.6s ease-in-out;
      `;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 600);
        }, 1200);
      });
    });
  }

  private createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      pointer-events: none; width: 100%; height: 100%;
    `;
    this.canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    this.canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    this.ctx = this.canvas.getContext('2d');

    if (this.ctx) {
      this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    document.body.appendChild(this.canvas);

    // Handle resize
    const onResize = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      this.canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
      if (this.ctx) {
        this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }
    };
    window.addEventListener('resize', onResize);

    // Cleanup listener when canvas removed
    const observer = new MutationObserver(() => {
      if (!document.body.contains(this.canvas!)) {
        window.removeEventListener('resize', onResize);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true });
  }

  private spawnParticles() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Adaptive particle count based on screen area
    const area = w * h;
    const baseCount = Math.min(180, Math.max(80, Math.floor(area / 8000)));

    this.particles = [];

    for (let i = 0; i < baseCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 8 + Math.random() * 14;

      this.particles.push({
        x: Math.random() * w,
        y: h + 10 + Math.random() * 40,  // Start below viewport
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed * (1.2 + Math.random() * 0.8),
        width: 4 + Math.random() * 8,
        height: 2 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        rotationAxis: Math.floor(Math.random() * 3),
        opacity: 0.9 + Math.random() * 0.1,
        gravity: 0.06 + Math.random() * 0.04,
        drag: 0.98 + Math.random() * 0.015,
        wobble: Math.random() * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.04,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  private tick(durationMs: number) {
    if (!this.running || !this.ctx || !this.canvas) return;

    const elapsed = performance.now() - this.startTime;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Clear canvas
    this.ctx.clearRect(0, 0, w, h);

    // Fade out during last 800ms
    const fadeStart = durationMs - 800;
    const globalAlpha = elapsed > fadeStart
      ? Math.max(0, 1 - (elapsed - fadeStart) / 800)
      : 1;

    let aliveCount = 0;

    for (const p of this.particles) {
      // Physics
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;

      // Wobble (sinusoidal lateral drift)
      p.wobblePhase += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobblePhase) * p.wobble;
      p.y += p.vy;

      // Rotation
      p.rotation += p.rotationSpeed;

      // Check if still visible
      if (p.y > h + 50 || p.opacity <= 0) continue;
      aliveCount++;

      // Draw
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      // Simulate 3D rotation by scaling one axis
      let scaleX = 1, scaleY = 1;
      if (p.rotationAxis === 0) {
        scaleY = Math.abs(Math.cos(p.rotation * 2));
      } else if (p.rotationAxis === 1) {
        scaleX = Math.abs(Math.cos(p.rotation * 2));
      }

      this.ctx.scale(scaleX, scaleY);
      this.ctx.globalAlpha = p.opacity * globalAlpha;
      this.ctx.fillStyle = p.color;

      // Draw confetti shape (rounded rectangle)
      const hw = p.width / 2;
      const hh = p.height / 2;
      const r = Math.min(hw, hh) * 0.3;
      this.ctx.beginPath();
      this.ctx.moveTo(-hw + r, -hh);
      this.ctx.lineTo(hw - r, -hh);
      this.ctx.quadraticCurveTo(hw, -hh, hw, -hh + r);
      this.ctx.lineTo(hw, hh - r);
      this.ctx.quadraticCurveTo(hw, hh, hw - r, hh);
      this.ctx.lineTo(-hw + r, hh);
      this.ctx.quadraticCurveTo(-hw, hh, -hw, hh - r);
      this.ctx.lineTo(-hw, -hh + r);
      this.ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    }

    // End conditions: duration exceeded or no particles visible
    if (elapsed >= durationMs || (elapsed > 1000 && aliveCount === 0)) {
      this.destroy();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.tick(durationMs));
  }
}
