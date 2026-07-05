import { Injectable, signal } from '@angular/core';

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<Toast[]>([]);

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
        this.toasts.update(prev => [...prev, { message, type }]);
        setTimeout(() => this.remove(message), 4000);
    }

    success(msg: string) { this.show(msg, 'success'); }
    error(msg: string) { this.show(msg, 'error'); }
    info(msg: string) { this.show(msg, 'info'); }
    warning(msg: string) { this.show(msg, 'warning'); }

    remove(message: string) {
        this.toasts.update(prev => prev.filter(t => t.message !== message));
    }
}
