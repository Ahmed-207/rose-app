import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RevenueChartComponent } from './revenue-chart.component';
import { RevenuePoint } from '../../models/dashboard.models';

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

@Component({
  selector: 'p-select',
  standalone: true,
  template: '',
})
class MockPSelectComponent {
  @Input() options: string[] = [];
  @Input() ngModel = '';
  @Output() ngModelChange = new EventEmitter<string>();
  @Input() style: any;
  @Input() size = '';
}

describe('RevenueChartComponent', () => {
  let fixture: ComponentFixture<RevenueChartComponent>;
  let component: RevenueChartComponent;

  const points: RevenuePoint[] = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 200 },
    { label: 'Mar', value: 150 },
  ] as RevenuePoint[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueChartComponent],
    })
      .overrideComponent(RevenueChartComponent, {
        set: { imports: [CommonModule, MockPChartComponent, MockPSelectComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RevenueChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('points', points);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should build chart labels and values from the points', () => {
      fixture.componentRef.setInput('points', points);
      fixture.detectChanges();

      expect(component.chartData.labels).toEqual(['Jan', 'Feb', 'Mar']);
      expect(component.chartData.datasets[0].data).toEqual([100, 200, 150]);
      expect(component.chartData.datasets[0].borderColor).toBe('#ef4577');
      expect(component.chartData.datasets[0].borderWidth).toBe(2.5);
      expect(component.chartData.datasets[0].fill).toBe(true);
    });

    it('should only enlarge the point matching highlightLabel', () => {
      fixture.componentRef.setInput('points', points);
      fixture.componentRef.setInput('highlightLabel', 'Feb');
      fixture.detectChanges();

      expect(component.chartData.datasets[0].pointRadius).toEqual([0, 5, 0]);
    });

    it('should leave every point un-highlighted when highlightLabel matches nothing', () => {
      fixture.componentRef.setInput('points', points);
      fixture.componentRef.setInput('highlightLabel', 'Unknown month');
      fixture.detectChanges();

      expect(component.chartData.datasets[0].pointRadius).toEqual([0, 0, 0]);
    });

    it('should rebuild chartData whenever points change', () => {
      fixture.componentRef.setInput('points', points);
      fixture.detectChanges();

      const newPoints = [{ label: 'Apr', value: 400 }] as RevenuePoint[];
      fixture.componentRef.setInput('points', newPoints);
      fixture.detectChanges();

      expect(component.chartData.labels).toEqual(['Apr']);
      expect(component.chartData.datasets[0].data).toEqual([400]);
    });

    describe('gradient background', () => {
      it('should build a linear gradient once the chart area is known', () => {
        fixture.componentRef.setInput('points', points);
        fixture.detectChanges();

        const addColorStop = vi.fn();
        const createLinearGradient = vi.fn().mockReturnValue({ addColorStop });
        const ctx = {
          chart: {
            ctx: { createLinearGradient },
            chartArea: { top: 0, bottom: 220 },
          },
        };

        const result = component.chartData.datasets[0].backgroundColor(ctx);

        expect(createLinearGradient).toHaveBeenCalledWith(0, 0, 0, 220);
        expect(addColorStop).toHaveBeenCalledWith(0, 'rgba(239, 69, 119, 0.35)');
        expect(addColorStop).toHaveBeenCalledWith(1, 'rgba(239, 69, 119, 0)');
        expect(result).toBe(createLinearGradient.mock.results[0].value);
      });

      it('should fall back to a flat color before the chart area is measured', () => {
        fixture.componentRef.setInput('points', points);
        fixture.detectChanges();

        const result = component.chartData.datasets[0].backgroundColor({
          chart: { ctx: {}, chartArea: null },
        });

        expect(result).toBe('rgba(239, 69, 119, 0.15)');
      });
    });
  });

  describe('chartOptions', () => {
    it('should format the tooltip label with a thousands separator and EGP suffix', () => {
      const label = component.chartOptions.plugins.tooltip.callbacks.label({
        parsed: { y: 12000 },
      });

      expect(label).toBe(' 12,000 EGP');
    });

    it('should hide the legend and the y axis, and disable point markers by default', () => {
      expect(component.chartOptions.plugins.legend.display).toBe(false);
      expect(component.chartOptions.scales.y.display).toBe(false);
      expect(component.chartOptions.elements.point.radius).toBe(0);
    });
  });

  describe('onPeriodChange', () => {
    it('should emit the new period on periodChange', () => {
      const emitted: string[] = [];
      component.periodChange.subscribe((period) => emitted.push(period));

      component.onPeriodChange('week');

      expect(emitted).toEqual(['week']);
    });
  });

  describe('template', () => {
    it('should render the section title', () => {
      fixture.componentRef.setInput('points', points);
      fixture.detectChanges();

      const heading = fixture.nativeElement.querySelector('.dash-card__header h3');
      expect(heading.textContent).toContain('Revenue');
    });

    it('should pass the line type, data, options and height to the chart', () => {
      fixture.componentRef.setInput('points', points);
      fixture.detectChanges();

      const chart = fixture.debugElement.query(By.directive(MockPChartComponent))
        .componentInstance as MockPChartComponent;

      expect(chart.type).toBe('line');
      expect(chart.height).toBe('220px');
      expect(chart.data).toBe(component.chartData);
      expect(chart.options).toBe(component.chartOptions);
    });

    it('should pass the period options and current selection to the period select', () => {
      fixture.componentRef.setInput('points', points);
      fixture.componentRef.setInput('selectedPeriod', 'week');
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.directive(MockPSelectComponent))
        .componentInstance as MockPSelectComponent;

      expect(select.options).toEqual(['monthly', 'week']);
      expect(select.ngModel).toBe('week');
    });

    it('should emit periodChange when the select emits a new value', () => {
      fixture.componentRef.setInput('points', points);
      fixture.detectChanges();

      const emitted: string[] = [];
      fixture.componentInstance.periodChange.subscribe((period) => emitted.push(period));

      const select = fixture.debugElement.query(By.directive(MockPSelectComponent))
        .componentInstance as MockPSelectComponent;
      select.ngModelChange.emit('week');

      expect(emitted).toEqual(['week']);
    });

    it('should render the highlight badge only when highlightValue is set', () => {
      fixture.componentRef.setInput('points', points);
      fixture.componentRef.setInput('highlightValue', '12,400 EGP');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.revenue-card__badge')?.textContent).toContain(
        '12,400 EGP',
      );
    });

    it('should not render the highlight badge when highlightValue is empty', () => {
      fixture.componentRef.setInput('points', points);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.revenue-card__badge')).toBeNull();
    });
  });
});
