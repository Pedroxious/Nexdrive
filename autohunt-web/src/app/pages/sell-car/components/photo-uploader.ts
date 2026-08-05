import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="photo-uploader">
      <div class="header">
        <span class="counter">{{ images.length }} / {{ maxPhotos }} fotos adicionadas</span>
      </div>

      <div 
        class="drop-area" 
        [class.drag-over]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input 
          type="file" 
          #fileInput 
          hidden 
          multiple 
          accept="image/*" 
          (change)="onFileSelect($event)"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="upload-icon">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p class="drop-text">Arraste ou clique para selecionar fotos</p>
        <p class="drop-subtext">JPEG ou PNG. Máximo 10 fotos.</p>
      </div>

      @if (images.length > 0) {
        <div class="preview-grid">
          @for (image of images; track image; let i = $index) {
            <div class="preview-card" [class.main-photo]="i === 0">
              <img [src]="image" alt="Preview" class="preview-img">
              
              <div class="overlay">
                @if (i === 0) {
                  <span class="badge">Foto Principal</span>
                } @else {
                  <button class="btn-action set-main" (click)="setMain(i, $event)" title="Tornar Principal">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </button>
                }
                
                <div class="actions">
                  <button class="btn-action" (click)="moveLeft(i, $event)" [disabled]="i === 0" title="Mover para esquerda">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button class="btn-action" (click)="moveRight(i, $event)" [disabled]="i === images.length - 1" title="Mover para direita">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                  <button class="btn-action btn-danger" (click)="removePhoto(i, $event)" title="Remover foto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .photo-uploader {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .counter {
      font-size: 0.875rem;
      color: var(--text-secondary, #9ca3af);
      font-weight: 500;
    }
    .drop-area {
      border: 2px dashed var(--border, #374151);
      border-radius: 1rem;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--surface, #111827);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .drop-area:hover, .drop-area.drag-over {
      border-color: var(--accent, #06b6d4);
      background: rgba(6, 182, 212, 0.05);
    }
    .upload-icon {
      width: 3rem;
      height: 3rem;
      color: var(--accent, #06b6d4);
      margin-bottom: 1rem;
    }
    .drop-text {
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--text-primary, #f9fafb);
      margin: 0 0 0.5rem 0;
    }
    .drop-subtext {
      font-size: 0.875rem;
      color: var(--text-secondary, #9ca3af);
      margin: 0;
    }
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .preview-card {
      position: relative;
      aspect-ratio: 4/3;
      border-radius: 0.5rem;
      overflow: hidden;
      border: 1px solid var(--border, #374151);
      background: #000;
      animation: fadeIn 0.3s ease;
    }
    .preview-card.main-photo {
      border-color: var(--accent, #06b6d4);
      box-shadow: 0 0 0 2px var(--accent, #06b6d4);
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .preview-card:hover .overlay {
      opacity: 1;
    }
    .badge {
      align-self: flex-start;
      background: var(--accent, #06b6d4);
      color: #fff;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .actions {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      margin-top: auto;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #fff;
      width: 2rem;
      height: 2rem;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-action:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.4);
    }
    .btn-action:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .btn-action.set-main {
      align-self: flex-start;
      background: rgba(6, 182, 212, 0.3);
      color: var(--accent, #06b6d4);
    }
    .btn-action.set-main:hover {
      background: var(--accent, #06b6d4);
      color: #fff;
    }
    .btn-action.btn-danger:hover {
      background: var(--error, #ef4444);
    }
    .btn-action svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class PhotoUploaderComponent {
  @Input() images: string[] = [];
  @Input() maxPhotos = 10;
  @Output() imagesChange = new EventEmitter<string[]>();

  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
    input.value = '';
  }

  async processFiles(files: FileList) {
    const remainingSlots = this.maxPhotos - this.images.length;
    if (remainingSlots <= 0) return;

    const filesArray = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remainingSlots);
    
    for (const file of filesArray) {
      const base64 = await this.compressImage(file);
      this.images = [...this.images, base64];
    }
    this.imagesChange.emit(this.images);
  }

  compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > 1200) {
            height = Math.round((height * 1200) / width);
            width = 1200;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number, event: Event) {
    event.stopPropagation();
    this.images = this.images.filter((_, i) => i !== index);
    this.imagesChange.emit(this.images);
  }

  setMain(index: number, event: Event) {
    event.stopPropagation();
    if (index === 0) return;
    const item = this.images.splice(index, 1)[0];
    this.images.unshift(item);
    this.imagesChange.emit(this.images);
  }

  moveLeft(index: number, event: Event) {
    event.stopPropagation();
    if (index === 0) return;
    const temp = this.images[index];
    this.images[index] = this.images[index - 1];
    this.images[index - 1] = temp;
    this.images = [...this.images];
    this.imagesChange.emit(this.images);
  }

  moveRight(index: number, event: Event) {
    event.stopPropagation();
    if (index === this.images.length - 1) return;
    const temp = this.images[index];
    this.images[index] = this.images[index + 1];
    this.images[index + 1] = temp;
    this.images = [...this.images];
    this.imagesChange.emit(this.images);
  }
}
