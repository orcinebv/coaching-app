import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'COACH' | 'ADMIN';
  isActive: boolean;
  isOnboarded: boolean;
  createdAt: string;
  _count: { checkIns: number; conversations: number; goals: number };
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalCheckIns: number;
  totalGoals: number;
  aiUsage: { totalCalls: number; totalTokens: number; totalCostEur: number; avgResponseMs: number };
  roleBreakdown: { role: string; count: number }[];
}

interface AiCost {
  user: { id: string; name: string; email: string };
  tokensUsed: number;
  costEur: number;
  calls: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  activeTab = signal<'stats' | 'users' | 'costs' | 'audit'>('stats');
  stats = signal<PlatformStats | null>(null);
  users = signal<User[]>([]);
  aiCosts = signal<AiCost[]>([]);
  auditLogs = signal<AuditLogEntry[]>([]);

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
    this.loadAiCosts();
    this.loadAuditLogs();
  }

  loadStats() {
    this.http.get<PlatformStats>(`${this.apiUrl}/admin/stats`).subscribe((s) => this.stats.set(s));
  }

  loadUsers() {
    this.http.get<{ users: User[] }>(`${this.apiUrl}/admin/users`).subscribe((r) => this.users.set(r.users));
  }

  loadAiCosts() {
    this.http.get<AiCost[]>(`${this.apiUrl}/admin/ai-costs`).subscribe((c) => this.aiCosts.set(c));
  }

  loadAuditLogs() {
    this.http.get<{ logs: AuditLogEntry[] }>(`${this.apiUrl}/admin/audit-logs`).subscribe((r) => this.auditLogs.set(r.logs));
  }

  updateRole(user: User) {
    this.http.patch(`${this.apiUrl}/admin/users/${user.id}/role`, { role: user.role }).subscribe();
  }

  deactivateUser(user: User) {
    this.http.patch(`${this.apiUrl}/admin/users/${user.id}/deactivate`, {}).subscribe(() => {
      user.isActive = false;
    });
  }

  activateUser(user: User) {
    this.http.patch(`${this.apiUrl}/admin/users/${user.id}/activate`, {}).subscribe(() => {
      user.isActive = true;
    });
  }
}
