import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-photos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-container">
      <h2 class="step-title">Mídia e Fotos</h2>
      
      <div class="guidelines-box">
        <div class="icon">💡</div>
        <div class="content">
          <h4>Dicas para fotos que vendem mais rápido:</h4>
          <ul>
            <li>Garanta boa iluminação (prefira luz natural)</li>
            <li>Mostre o painel e interior detalhadamente</li>
            <li>Capture os 4 lados do veículo e as rodas</li>
          </ul>
        </div>
      </div>

      <div class="upload-area">
        <input type="file" multiple accept="image/*" class="file-input" (change)="onFileSelected($event)" #fileInput />
        <div class="upload-content" (click)="fileInput.click()">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          <p>Arraste fotos aqui ou <strong>clique para selecionar</strong></p>
          <span class="subtext">Suporta JPG, PNG. Máx 5MB por foto.</span>
        </div>
      </div>

      <div class="photo-preview-grid" *ngIf="carData.photos?.length">
        <div class="photo-item" *ngFor="let photo of carData.photos; let i = index">
          <img [src]="photo.url" alt="Preview" />
          <button class="remove-btn" (click)="removePhoto(i)">✕</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.3s ease-out; }
    .step-title { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
    .guidelines-box { display: flex; gap: 1rem; padding: 1rem; background: rgba(var(--accent-rgb), 0.1); border: 1px solid rgba(var(--accent-rgb), 0.2); border-radius: 8px; }
    .guidelines-box .icon { font-size: 1.5rem; }
    .guidelines-box h4 { margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1rem; }
    .guidelines-box ul { margin: 0; padding-left: 1.25rem; color: var(--text-secondary, #666); font-size: 0.875rem; }
    .upload-area { position: relative; border: 2px dashed var(--border); border-radius: 12px; padding: 3rem 1rem; text-align: center; background: var(--bg-main, #fafafa); cursor: pointer; transition: all 0.2s; }
    .upload-area:hover { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.02); }
    .file-input { display: none; }
    .upload-content { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: var(--text-secondary, #666); }
    .upload-content p { margin: 0; font-size: 1rem; }
    .upload-content .subtext { font-size: 0.75rem; opacity: 0.8; }
    .photo-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; }
    .photo-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 4/3; }
    .photo-item img { width: 100%; height: 100%; object-fit: cover; }
    .remove-btn { position: absolute; top: 0.5rem; right: 0.5rem; width: 24px; height: 24px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem; transition: background 0.2s; }
    .remove-btn:hover { background: rgba(220, 38, 38, 0.9); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StepPhotosComponent {
  @Input() carData: any = {};
  @Output() carDataChange = new EventEmitter<any>();

  ngOnInit() {
    if (!this.carData.photos) {
      this.carData.photos = [];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.carData.photos.push({
            file,
            url: e.target?.result as string
          });
          this.carDataChange.emit(this.carData);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removePhoto(index: number) {
    this.carData.photos.splice(index, 1);
    this.carDataChange.emit(this.carData);
  }
}
