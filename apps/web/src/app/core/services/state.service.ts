import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Conversation, Message, CheckIn, CheckInStats } from '@coaching-app/shared/types';

export { Conversation, Message, CheckIn };
export type Stats = CheckInStats;

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private currentConversationSubject = new BehaviorSubject<Conversation | null>(null);
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private checkInsSubject = new BehaviorSubject<CheckIn[]>([]);
  private statsSubject = new BehaviorSubject<Stats | null>(null);

  conversations$: Observable<Conversation[]> = this.conversationsSubject.asObservable();
  currentConversation$: Observable<Conversation | null> = this.currentConversationSubject.asObservable();
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  checkIns$: Observable<CheckIn[]> = this.checkInsSubject.asObservable();
  stats$: Observable<Stats | null> = this.statsSubject.asObservable();

  setConversations(conversations: Conversation[]): void {
    this.conversationsSubject.next(conversations);
  }

  setCurrentConversation(conversation: Conversation | null): void {
    this.currentConversationSubject.next(conversation);
  }

  setMessages(messages: Message[]): void {
    this.messagesSubject.next(messages);
  }

  addMessage(message: Message): void {
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, message]);
  }

  setCheckIns(checkIns: CheckIn[]): void {
    this.checkInsSubject.next(checkIns);
  }

  addCheckIn(checkIn: CheckIn): void {
    const current = this.checkInsSubject.getValue();
    this.checkInsSubject.next([checkIn, ...current]);
  }

  setStats(stats: Stats): void {
    this.statsSubject.next(stats);
  }

  clearAll(): void {
    this.conversationsSubject.next([]);
    this.currentConversationSubject.next(null);
    this.messagesSubject.next([]);
    this.checkInsSubject.next([]);
    this.statsSubject.next(null);
  }
}
