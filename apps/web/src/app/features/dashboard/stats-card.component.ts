import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss'],
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() icon: 'chat' | 'checkin' | 'mood' | 'streak' = 'chat';
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
}
