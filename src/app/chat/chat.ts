import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  @ViewChild('scrollBox') scrollBox!: ElementRef<HTMLDivElement>;

  messages = signal<Message[]>([
    { role: 'bot', text: 'Привет! Я ваш ИИ-агент. Чем могу помочь?' },
  ]);
  input = '';
  loading = signal(false);

  send() {
  const text = this.input.trim();
  if (!text || this.loading()) return;

  this.messages.update((m) => [...m, { role: 'user', text }]);
  this.input = '';
  this.loading.set(true);
  this.scrollDown();

  this.http.post<{ reply: string }>(this.webhookUrl, { message: text, sessionId: this.sessionId }).subscribe({
    next: (res) => {
      this.messages.update((m) => [...m, { role: 'bot', text: res.reply }]);
      this.loading.set(false);
      this.scrollDown();
    },
    error: () => {
      this.messages.update((m) => [
        ...m,
        { role: 'bot', text: 'Не удалось связаться с n8n. Попробуйте ещё раз.' },
      ]);
      this.loading.set(false);
      this.scrollDown();
    },
  });
}

  private scrollDown() {
    setTimeout(() => {
      const el = this.scrollBox.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  private http = inject(HttpClient);
private readonly webhookUrl = 'https://n8n.lessonstudy.asia/webhook/chat';

private sessionId = this.getSessionId();

private getSessionId(): string {
  let id = localStorage.getItem('chatSessionId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('chatSessionId', id);
  }
  return id;
}
}