import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { OrdersStatusChartComponent } from './orders-status-chart.component';
import { OrdersStatusSlice } from '../../models/dashboard.models';

@Component({
  selector: 'p-chart',
  standalone: true,
  template: '',
})
class MockPChartComponent {
  @Input() type = '';
  @Input() data: any;
  @Input() options: any;
  @Input() height = '';
}

describe('OrdersStatusChartComponent', () => {
  let fixture: ComponentFixture<OrdersStatusChartComponent>;
  let component: OrdersStatusChartComponent;

  const slices: OrdersStatusSlice[] = [
    { label: 'Delivered', value: 60, color: '#22c55e' },
    { label: 'Pending', value: 30, color: '#f59e0b' },
    { label: 'Cancelled', value: 10, color: '#ef4444' },
  ] as OrdersStatusSlice[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersStatusChartComponent],
    })
      .overrideComponent(OrdersStatusChartComponent, {
        set: { imports: [CommonModule, MockPChartComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OrdersStatusChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('data', slices);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('total', () => {
    it('should sum the value of every slice', () => {
      fixture.componentRef.setInput('data', slices);
      fixture.detectChanges();

      expect(component.total).toBe(100);
    });

    it('should be 0 for an empty data set', () => {
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();

      expect(component.total).toBe(0);
    });
  });

  describe('percentOf', () => {
    it('should compute the rounded percentage of the total', () => {
      fixture.componentRef.setInput('data', slices);
      fixture.detectChanges();

      expect(component.percentOf(60)).toBe(60);
      expect(component.percentOf(30)).toBe(30);
      expect(component.percentOf(10)).toBe(10);
    });

    it('should round to the nearest whole percent', () => {
      fixture.componentRef.setInput('data', [
        { label: 'A', value: 1, color: '#000' },
        { label: 'B', value: 2, color: '#111' },
      ] as OrdersStatusSlice[]);
      fixture.detectChanges();

      // 1/3 = 33.33...% -> rounds to 33
      expect(component.percentOf(1)).toBe(33);
      // 2/3 = 66.66...% -> rounds to 67
      expect(component.percentOf(2)).toBe(67);
    });

    it('should return 0 when the total is 0 (avoids divide-by-zero)', () => {
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();

      expect(component.percentOf(5)).toBe(0);
    });
  });

  describe('ngOnChanges', () => {
    it('should build chartData labels, values and colors from the input slices', () => {
      fixture.componentRef.setInput('data', slices);
      fixture.detectChanges();

      expect(component.chartData.labels).toEqual(['Delivered', 'Pending', 'Cancelled']);
      expect(component.chartData.datasets[0].data).toEqual([60, 30, 10]);
      expect(component.chartData.datasets[0].backgroundColor).toEqual([
        '#22c55e',
        '#f59e0b',
        '#ef4444',
      ]);
      expect(component.chartData.datasets[0].borderWidth).toBe(0);
      expect(component.chartData.datasets[0].hoverOffset).toBe(4);
    });

    it('should keep the doughnut cutout and hide the built-in legend/tooltip config', () => {
      fixture.componentRef.setInput('data', slices);
      fixture.detectChanges();

      expect(component.chartOptions.cutout).toBe('72%');
      expect(component.chartOptions.plugins.legend.display).toBe(false);
      expect(component.chartOptions.plugins.tooltip.enabled).toBe(true);
    });
  });

  describe('template', () => {
    it('should render the section title', () => {
      fixture.componentRef.setInput('data', slices);
      fixture.detectChanges();

      const heading = fixture.nativeElement.querySelector('.dash-card__header h3');
      expect(heading.textContent).toContain('Orders Status');
    });

    it('should pass the doughnut type, data and options to the chart', () => {
      fixture.componentRef.setInput('data', slices);
      fixture.detectChanges();

      const chart = fixture.debugElement.query(By.directive(MockPChartComponent))
        .componentInstance as MockPChartComponent;

      expect(chart.type).toBe('doughnut');
      expect(chart.height).toBe('180px');
      expect(chart.data).toBe(component.chartData);
      expect(chart.options).toBe(component.chartOptions);
    });

    it('should render one legend row per slice with label, dot color and value/percent', () => {
      fixture.componentRef.setInput('data', slices);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.legend-item');
      expect(rows.length).toBe(3);

      expect(rows[0].querySelector('.legend-item__label').textContent).toContain('Delivered');
      expect(rows[0].querySelector('.legend-item__value').textContent).toContain('60 (60%)');
      expect(rows[0].querySelector('.legend-item__dot').style.background).toBe('rgb(34, 197, 94)');
    });

    it('should render no legend rows when data is empty', () => {
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.legend-item').length).toBe(0);
    });
  });
});
