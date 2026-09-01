import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { ListPanelComponent } from './components/list-panel/list-panel.component';
import { OrdersStatusChartComponent } from './components/orders-status-chart/orders-status-chart.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';
import { Statistics } from './service/statistics';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ListRowItem, OrdersStatusSlice, RevenuePoint, StatCardData } from './models/dashboard.models';
@Component({
  selector: 'app-dashboard',
 imports: [
    CommonModule,
    TranslatePipe,
    StatCardComponent,
    ListPanelComponent,
    OrdersStatusChartComponent,
    RevenueChartComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly statistics = inject(Statistics);
  private readonly cdr = inject(ChangeDetectorRef);
private readonly destroyRef$ = inject(DestroyRef);
  statCards: StatCardData[] = [];
  categories: ListRowItem[] = [];
  topSelling: ListRowItem[] = [];
  lowStock: ListRowItem[] = [];
  ordersStatus: OrdersStatusSlice[] = [];
  revenuePoints: RevenuePoint[] = [];
  revenuePeriod = 'monthly';
  revenueHighlightLabel = '';
  revenueHighlightValue = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.statistics.getStatistics(this.revenuePeriod).pipe(takeUntilDestroyed(this.destroyRef$)).subscribe({
      next: (data) => {
        this.statCards = [
          { icon: 'pi pi-box', iconBg: 'pink', value: data.summary.totalProducts.toLocaleString(), label: 'Total products' },
          { icon: 'pi pi-receipt', iconBg: 'blue', value: data.summary.totalOrders.toLocaleString(), label: 'Total orders' },
          { icon: 'pi pi-clipboard', iconBg: 'purple', value: data.summary.totalCategories.toLocaleString(), label: 'Total categories' },
          {
            icon: 'pi pi-dollar',
            iconBg: 'green',
            value: data.summary.totalRevenue.toLocaleString(),
            suffix: data.summary.currency,
            label: 'Total revenue',
          },
        ];
        console.log(this.statCards)
        this.categories = data.categories.map((category) => ({
          title: category.title,
          value: `${category.productCount.toLocaleString()} Products`,
        }));
        this.ordersStatus = [
          { label: 'Completed', value: data.orderStatus.completed.count, color: '#1fce7a' },
          { label: 'In progress', value: data.orderStatus.inProgress.count, color: '#3d7bfa' },
          { label: 'Canceled', value: data.orderStatus.canceled.count, color: '#e6e9f0' },
        ];
        this.revenuePoints = data.revenue.points.map((point) => ({ label: point.label, value: point.revenue }));
        const latestRevenuePoint = this.revenuePoints[this.revenuePoints.length - 1];
        this.revenueHighlightLabel = latestRevenuePoint?.label ?? '';
        this.revenueHighlightValue = `${(latestRevenuePoint?.value ?? 0).toLocaleString()} ${data.summary.currency}`;
        this.topSelling = data.topSellingProducts.map((product) => ({
          title: product.title,
          subtitle: `${product.unitPrice.toLocaleString()} ${data.summary.currency}`,
          value: `${product.totalSales.toLocaleString()} Sales`,
        }));
        this.lowStock = data.lowStockProducts.map((product) => ({
          title: product.title,
          value: `${product.stock.toLocaleString()} Products`,
          valueTone: product.stock === 0 ? 'danger' : product.stock <= 5 ? 'warning' : 'neutral',
        }));
        this.isLoading = false;
        this.cdr.markForCheck()

      },
      error: (error: { status?: number }) => {
        this.isLoading = false;
        this.errorMessage = error.status
          ? `Unable to load dashboard statistics (${error.status}).`
          : 'Unable to load dashboard statistics.';
      },
    });
  }

  onRevenuePeriodChange(period: string): void {
    this.revenuePeriod = period;
    this.loadStatistics();
  }
}
