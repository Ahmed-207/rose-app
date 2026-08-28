import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { OrdersStatusSlice } from '../../models/dashboard.models';


@Component({
  selector: 'app-orders-status-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './orders-status-chart.component.html',
  styleUrl: './orders-status-chart.component.scss'
})
export class OrdersStatusChartComponent implements OnChanges {
  @Input({ required: true }) data: OrdersStatusSlice[] = [];

  chartData: any;
  chartOptions: any = {
    cutout: '72%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    maintainAspectRatio: false
  };

  get total(): number {
    return this.data.reduce((sum, d) => sum + d.value, 0);
  }

  percentOf(value: number): number {
    return this.total ? Math.round((value / this.total) * 100) : 0;
  }

  ngOnChanges(): void {
    this.chartData = {
      labels: this.data.map((d) => d.label),
      datasets: [
        {
          data: this.data.map((d) => d.value),
          backgroundColor: this.data.map((d) => d.color),
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }
}
