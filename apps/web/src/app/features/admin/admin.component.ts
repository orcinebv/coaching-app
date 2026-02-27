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
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <h1>Admin Panel</h1>
        <p class="subtitle">Beheer gebruikers, bekijk statistieken en audit logs</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="activeTab() === 'stats'" (click)="activeTab.set('stats')">Statistieken</button>
        <button [class.active]="activeTab() === 'users'" (click)="activeTab.set('users')">Gebruikers</button>
        <button [class.active]="activeTab() === 'costs'" (click)="activeTab.set('costs')">AI Kosten</button>
        <button [class.active]="activeTab() === 'audit'" (click)="activeTab.set('audit')">Audit Log</button>
      </div>

      <!-- Stats Tab -->
      <div *ngIf="activeTab() === 'stats'" class="tab-content">
        <div *ngIf="stats()" class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.totalUsers }}</div>
            <div class="stat-label">Totaal gebruikers</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.activeUsers }}</div>
            <div class="stat-label">Actieve gebruikers</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.totalConversations }}</div>
            <div class="stat-label">Gesprekken</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.totalCheckIns }}</div>
            <div class="stat-label">Check-ins</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-value">€{{ stats()!.aiUsage.totalCostEur.toFixed(2) }}</div>
            <div class="stat-label">Totaal AI kosten</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.aiUsage.totalCalls }}</div>
            <div class="stat-label">AI aanroepen</div>
          </div>
        </div>

        <div *ngIf="stats()" class="roles-breakdown">
          <h3>Rolverdeling</h3>
          <div class="role-list">
            <div *ngFor="let r of stats()!.roleBreakdown" class="role-item">
              <span class="role-badge" [attr.data-role]="r.role">{{ r.role }}</span>
              <span class="role-count">{{ r.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div *ngIf="activeTab() === 'users'" class="tab-content">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Status</th>
                <th>Check-ins</th>
                <th>Gesprekken</th>
                <th>Lid sinds</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users()">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <select [(ngModel)]="user.role" (change)="updateRole(user)" class="role-select">
                    <option value="USER">USER</option>
                    <option value="COACH">COACH</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>
                  <span class="status-badge" [class.active]="user.isActive" [class.inactive]="!user.isActive">
                    {{ user.isActive ? 'Actief' : 'Inactief' }}
                  </span>
                </td>
                <td>{{ user._count.checkIns }}</td>
                <td>{{ user._count.conversations }}</td>
                <td>{{ user.createdAt | date:'dd-MM-yyyy' }}</td>
                <td>
                  <button *ngIf="user.isActive" (click)="deactivateUser(user)" class="btn-danger-sm">Deactiveer</button>
                  <button *ngIf="!user.isActive" (click)="activateUser(user)" class="btn-success-sm">Activeer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI Costs Tab -->
      <div *ngIf="activeTab() === 'costs'" class="tab-content">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Gebruiker</th>
                <th>Email</th>
                <th>Tokens gebruikt</th>
                <th>Kosten (EUR)</th>
                <th>Aantal calls</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cost of aiCosts()">
                <td>{{ cost.user.name }}</td>
                <td>{{ cost.user.email }}</td>
                <td>{{ cost.tokensUsed | number }}</td>
                <td>€{{ cost.costEur.toFixed(4) }}</td>
                <td>{{ cost.calls }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Audit Log Tab -->
      <div *ngIf="activeTab() === 'audit'" class="tab-content">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Gebruiker</th>
                <th>Actie</th>
                <th>Resource</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of auditLogs()">
                <td>{{ log.createdAt | date:'dd-MM-yyyy HH:mm' }}</td>
                <td>{{ log.user ? log.user.name : 'Onbekend' }}</td>
                <td><span class="method-badge" [attr.data-method]="log.action">{{ log.action }}</span></td>
                <td>{{ log.resource }}{{ log.resourceId ? '/' + log.resourceId.substring(0, 8) + '...' : '' }}</td>
                <td>{{ log.ipAddress || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .admin-header { margin-bottom: 24px; }
    .admin-header h1 { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
    .tabs button { padding: 10px 20px; border: none; background: none; cursor: pointer; color: #666; font-size: 14px; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    .tabs button.active { color: #6c63ff; border-bottom-color: #6c63ff; font-weight: 600; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
    .stat-card.highlight { background: linear-gradient(135deg, #6c63ff, #9b59b6); color: white; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    .stat-card.highlight .stat-label { color: rgba(255,255,255,0.8); }
    .roles-breakdown h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .role-list { display: flex; gap: 12px; }
    .role-item { display: flex; align-items: center; gap: 8px; }
    .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .role-badge[data-role="ADMIN"] { background: #fee2e2; color: #dc2626; }
    .role-badge[data-role="COACH"] { background: #dbeafe; color: #2563eb; }
    .role-badge[data-role="USER"] { background: #f3f4f6; color: #374151; }
    .role-count { font-size: 14px; font-weight: 600; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; background: #f9fafb; }
    .data-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
    .role-select { padding: 4px 8px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13px; }
    .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .status-badge.active { background: #d1fae5; color: #065f46; }
    .status-badge.inactive { background: #fee2e2; color: #991b1b; }
    .btn-danger-sm { padding: 4px 12px; border-radius: 6px; border: none; background: #fee2e2; color: #dc2626; cursor: pointer; font-size: 12px; }
    .btn-success-sm { padding: 4px 12px; border-radius: 6px; border: none; background: #d1fae5; color: #065f46; cursor: pointer; font-size: 12px; }
    .method-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .method-badge[data-method="POST"] { background: #d1fae5; color: #065f46; }
    .method-badge[data-method="PATCH"], .method-badge[data-method="PUT"] { background: #fef3c7; color: #92400e; }
    .method-badge[data-method="DELETE"] { background: #fee2e2; color: #991b1b; }
  `],
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
