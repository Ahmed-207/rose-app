import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '@org/products';

@Component({
  selector: 'app-product-details',
  imports: [],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {

  private readonly productsService = inject(ProductsService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly plat_id = inject(PLATFORM_ID);
  productId: WritableSignal<string> = signal<string>('');

  ngOnInit(): void {

    if (isPlatformBrowser(this.plat_id)) {

      this.getProductDetails();

    }

  }

  getProductDetails(): void {

    this.getProductId();

    this.productsService.getProductById(this.productId()).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    });

  }

  getProductId(): void {

    const id = this.activeRoute.snapshot.paramMap.get('id');

    if (id) {
      this.productId.set(id);
    }

  }

}
