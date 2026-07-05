import { Injectable, signal } from '@angular/core';

export interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
    notifications = signal<Notification[]>([
        { id: 1, title: 'Reserva Confirmada', message: 'Sua reserva para o Onix 1.0 foi confirmada!', time: '2 min atrás', isRead: false },
        { id: 2, title: 'Nova Oferta', message: 'Confira as promoções de SUV para este final de semana.', time: '1h atrás', isRead: false },
        { id: 3, title: 'Perfil Atualizado', message: 'Sua foto de perfil foi alterada com sucesso.', time: '2h atrás', isRead: true }
    ]);

    unreadCount = signal<number>(2);

    markAllRead() {
        this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
    }
}
