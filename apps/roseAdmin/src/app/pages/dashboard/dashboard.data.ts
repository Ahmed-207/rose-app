import { ListRowItem, OrdersStatusSlice, RevenuePoint, StatCardData } from "./models/dashboard.models";


export const STAT_CARDS: StatCardData[] = [
  { icon: 'pi pi-box', iconBg: 'pink', value: '12', label: 'Total products' },
  { icon: 'pi pi-receipt', iconBg: 'blue', value: '1,284', label: 'Total orders' },
  { icon: 'pi pi-clipboard', iconBg: 'purple', value: '125', label: 'Total categories' },
  {
    icon: 'pi pi-dollar',
    iconBg: 'green',
    value: '6,824,528',
    suffix: 'EGP',
    label: 'Total revenue'
  }
];

export const ALL_CATEGORIES: ListRowItem[] = [
  { title: 'Chocolate',  value: '4 Products' },
  { title: 'Flowers',  value: '8 Products' },
  { title: 'Chocolate', value: '4 Products' },
  { title: 'Chocolate', value: '4 Products' },
  { title: 'Chocolate', value: '4 Products' },
  { title: 'Chocolate', value: '4 Products' }
];

export const TOP_SELLING_PRODUCTS: ListRowItem[] = [
  {
    title: '25 Red Roses | Black Wrap',
    subtitle: '1,000 EGP',
   value: '5051 Sales'
  },
  {
    title: 'Wedding Flower',
    subtitle: '2,600 EGP',
   value: '1484 Sales'
  },
  {
    title: 'Moko Chocolate Set | Exper...',
    subtitle: '1,250 EGP',
  value: '1042 Sales'
  },
  {
    title: 'Red Wedding Flower',
    subtitle: '2,540 EGP',
 value: '613 Sales'
  },
  {
    title: 'Patchi Chocolate 500g | Lit...',
    subtitle: '1,320 EGP',
    value: '594 Sales'
  },
  {
    title: 'Patchi Chocolate 500g | Lit...',
    subtitle: '1,320 EGP',
    value: '594 Sales'
  }
];

export const LOW_STOCK_PRODUCTS: ListRowItem[] = [

  {
    title: '25 Red Roses | Black Wrap',
    value: '4 Products',
    valueTone: 'warning'
  },
  {
    title: '25 Red Roses | Black Wrap',

    value: '10 Products',
    valueTone: 'neutral'
  },
  {
    title: '25 Red Roses | Black Wrap',

    value: '13 Products',
    valueTone: 'neutral'
  },
  {
    title: '25 Red Roses | Black Wrap',

    value: '19 Products',
    valueTone: 'neutral'
  }
];

export const ORDERS_STATUS: OrdersStatusSlice[] = [
  { label: 'Completed', value: 216, color: '#1fce7a' },
  { label: 'In progress', value: 169, color: '#3d7bfa' },
  { label: 'Canceled', value: 19, color: '#e6e9f0' }
];

export const REVENUE_POINTS: RevenuePoint[] = [
  { label: 'Jan', value: 3200 },
  { label: 'Feb', value: 2600 },
  { label: 'Mar', value: 4100 },
  { label: 'Apr', value: 3300 },
  { label: 'May', value: 6500 },
  { label: 'Jun', value: 3000 },
  { label: 'Jul', value: 4400 },
  { label: 'Aug', value: 3600 },
  { label: 'Sep', value: 4700 },
  { label: 'Oct', value: 3100 },
  { label: 'Nov', value: 4200 },
  { label: 'Dec', value: 3500 }
];
