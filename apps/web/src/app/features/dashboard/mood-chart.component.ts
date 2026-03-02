import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-mood-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './mood-chart.component.html',
  styleUrls: ['./mood-chart.component.scss'],
})
export class MoodChartComponent implements OnChanges {
  @Input() chartData: { labels: string[]; mood: number[]; energy: number[] } = {
    labels: [],
    mood: [],
    energy: [],
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 12, family: 'Inter, sans-serif' },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 12, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          font: { size: 11, family: 'Inter, sans-serif' },
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
        },
      },
      x: {
        ticks: {
          font: { size: 11, family: 'Inter, sans-serif' },
          color: '#9CA3AF',
        },
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.lineChartData = {
      labels: this.chartData.labels,
      datasets: [
        {
          data: this.chartData.mood,
          label: 'Mood',
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          data: this.chartData.energy,
          label: 'Energy',
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }
}
