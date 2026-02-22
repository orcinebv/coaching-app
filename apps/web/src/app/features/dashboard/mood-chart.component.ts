import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-mood-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-container">
      @if (chartData.labels.length > 0) {
        <canvas baseChart
          [datasets]="lineChartData.datasets"
          [labels]="lineChartData.labels"
          [options]="lineChartOptions"
          type="line"
        ></canvas>
      } @else {
        <div class="chart-empty">
          <p>No data to display yet. Complete some check-ins to see your trends.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      min-height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    canvas {
      width: 100% !important;
      max-height: 300px;
    }

    .chart-empty {
      text-align: center;
      color: var(--text-light);
      font-size: 0.875rem;
      padding: 2rem;
    }
  `],
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
