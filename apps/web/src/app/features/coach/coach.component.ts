import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Coachee {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  organization: { id: string; name: string } | null;
  lastCheckIn: { mood: number; energy: number; createdAt: string } | null;
  hasCrisisAlert: boolean;
}

interface CoacheeOverview {
  user: { id: string; name: string; email: string; avatar: string | null };
  stats: { avgMood: number | null; checkInCount: number; activeGoals: number; hasCrisisAlert: boolean };
  recentCheckIns: { mood: number; energy: number; notes: string | null; createdAt: string }[];
  goals: { id: string; title: string; progress: number; status: string }[];
  latestSentiment: { overall: number; crisis: boolean } | null;
}

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.scss'],
})
export class CoachComponent implements OnInit {
  coachees = signal<Coachee[]>([]);
  selectedCoachee = signal<Coachee | null>(null);
  selectedOverview = signal<CoacheeOverview | null>(null);
  crisisAlerts = signal<{ user: { name: string } }[]>([]);
  notes = signal<{ content: string; createdAt: string }[]>([]);
  newNote = '';

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCoachees();
    this.loadCrisisAlerts();
  }

  loadCoachees() {
    this.http.get<Coachee[]>(`${this.apiUrl}/coach/coachees`).subscribe((c) => this.coachees.set(c));
  }

  loadCrisisAlerts() {
    this.http.get<{ user: { name: string } }[]>(`${this.apiUrl}/coach/alerts`).subscribe((a) => this.crisisAlerts.set(a));
  }

  selectCoachee(coachee: Coachee) {
    this.selectedCoachee.set(coachee);
    this.http
      .get<CoacheeOverview>(`${this.apiUrl}/coach/coachees/${coachee.id}/overview`)
      .subscribe((o) => this.selectedOverview.set(o));
    this.http
      .get<{ content: string; createdAt: string }[]>(`${this.apiUrl}/coach/coachees/${coachee.id}/notes`)
      .subscribe((n) => this.notes.set(n));
  }

  addNote() {
    if (!this.newNote.trim() || !this.selectedCoachee()) return;
    this.http
      .post<{ content: string; createdAt: string }>(`${this.apiUrl}/coach/coachees/${this.selectedCoachee()!.id}/notes`, {
        content: this.newNote,
      })
      .subscribe((note) => {
        this.notes.update((n) => [note, ...n]);
        this.newNote = '';
      });
  }
}
