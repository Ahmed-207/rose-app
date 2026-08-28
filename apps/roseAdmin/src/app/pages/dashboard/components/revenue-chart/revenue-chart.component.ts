import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { RevenuePoint } from '../../models/dashboard.models';


@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, SelectModule],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss'
})
export class RevenueChartComponent implements OnChanges {
  @Input({ required: true }) points: RevenuePoint[] = [];
  @Input() highlightLabel = '';
  @Input() highlightValue = '';
  @Input() selectedPeriod = 'monthly';
  @Output() periodChange = new EventEmitter<string>();

  periodOptions = ['monthly', 'week'];
  chartData: any;
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y.toLocaleString()} EGP`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { display: false }
    },
    elements: {
      line: { tension: 0.45 },
      point: { radius: 0, hoverRadius: 6 }
    }
  };

  ngOnChanges(): void {
    const highlightIndex = this.points.findIndex((p) => p.label === this.highlightLabel);

    this.chartData = {
      labels: this.points.map((p) => p.label),
      datasets: [
        {
          data: this.points.map((p) => p.value),
          fill: true,
          borderColor: '#ef4577',
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return 'rgba(239, 69, 119, 0.15)';
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(239, 69, 119, 0.35)');
            gradient.addColorStop(1, 'rgba(239, 69, 119, 0)');
            return gradient;
          },
          pointBackgroundColor: '#ef4577',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: this.points.map((_, i) => (i === highlightIndex ? 5 : 0)),
          borderWidth: 2.5
        }
      ]
    };
  }

  onPeriodChange(period: string): void {
    this.periodChange.emit(period);
  }
}
