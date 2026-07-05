import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="contact-container animate-in">
      <div class="header">
        <h1>Fale Conosco</h1>
        <p>Estamos prontos para ajudar com qualquer dúvida.</p>
      </div>

      <div class="contact-grid">
        <div class="info-side">
          <div class="info-card glass">
            <span class="icon">📍</span>
            <div class="meta">
              <strong>Endereço Sede</strong>
              <p>Av. Paulista, 1000 - Bela Vista<br>São Paulo, SP</p>
            </div>
          </div>

          <div class="info-card glass">
            <span class="icon">📞</span>
            <div class="meta">
              <strong>Telefone</strong>
              <p>0800 123 4567<br>(11) 4004-9000</p>
            </div>
          </div>

          <div class="info-card glass">
            <span class="icon">✉️</span>
            <div class="meta">
              <strong>E-mail</strong>
              <p>suporte&#64;nexdrive.com<br>comercial&#64;nexdrive.com</p>
            </div>
          </div>
        </div>

        <form class="form-side glass">
          <div class="group">
            <label>Seu Nome</label>
            <input type="text" class="glass-input" placeholder="João Silva">
          </div>
          <div class="group">
            <label>E-mail</label>
            <input type="email" class="glass-input" placeholder="seu&#64;email.com">
          </div>
          <div class="group">
            <label>Mensagem</label>
            <textarea class="glass-input" rows="5" placeholder="Como podemos ajudar?"></textarea>
          </div>
          <button type="submit" class="submit-btn clickable">Enviar Mensagem</button>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .contact-container { max-width: 1100px; margin: 60px auto; padding: 0 20px; }
    .header { text-align: center; margin-bottom: 50px; h1 { font-size: 32px; font-weight: 900; } p { color: var(--text-secondary); } }

    .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }
    
    .info-side { display: flex; flex-direction: column; gap: 20px; }
    .info-card {
      display: flex; gap: 20px; padding: 25px; border-radius: var(--radius-md);
      .icon { font-size: 24px; }
      .meta { strong { font-size: 16px; margin-bottom: 5px; display: block; } p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; } }
    }

    .form-side {
      padding: 40px; border-radius: var(--radius-lg);
      display: flex; flex-direction: column; gap: 24px;
      .group { display: flex; flex-direction: column; gap: 8px; label { font-size: 13px; font-weight: 700; color: var(--text-light); } }
      .glass-input { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 12px; border-radius: var(--radius-md); color: var(--text-primary); outline: none; }
      .submit-btn { width: 100%; padding: 15px; background: var(--accent-blue); color: white; border-radius: var(--radius-md); font-weight: 800; font-size: 16px; }
    }

    .animate-in { animation: fadeIn 0.7s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } }

    @media (max-width: 800px) { .contact-grid { grid-template-columns: 1fr; } }
  `]
})
export class ContactComponent { }
