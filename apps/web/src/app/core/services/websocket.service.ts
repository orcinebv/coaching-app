import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject, EMPTY } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;

  private connectedSubject = new BehaviorSubject<boolean>(false);
  private messagesSubject = new Subject<any>();
  private typingSubject = new Subject<any>();

  connected$ = this.connectedSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  typing$ = this.typingSubject.asObservable();

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connectedSubject.next(false);
    });

    this.socket.on('newMessage', (data: any) => {
      this.messagesSubject.next(data);
    });

    this.socket.on('userTyping', (data: any) => {
      this.typingSubject.next(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedSubject.next(false);
    }
  }

  on<T>(event: string): Observable<T> {
    if (!this.socket) {
      return EMPTY;
    }
    return new Observable<T>((observer) => {
      const handler = (data: T) => observer.next(data);
      this.socket!.on(event, handler);
      return () => {
        this.socket?.off(event, handler);
      };
    });
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}
