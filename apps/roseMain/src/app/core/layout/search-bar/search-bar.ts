import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Product, ProductsStore } from '@org/products';
import { SearchDropdown } from "./components/search-dropdown/search-dropdown";

@Component({
  selector: 'app-search-bar',
  imports: [SearchDropdown],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  readonly store = inject(ProductsStore);
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);

  isOpen = signal(false);

  // Close dropdown when clicking outside of this component
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      this.close();
    }
  }

  // Close dropdown on Escape key
  // @HostListener('document:keydown.escape')
  // onEscape(): void {
  //   this.close();
  // }

  onFocus(): void {
    this.isOpen.set(true);
    // Load dropdown options if empty
    if (this.store.searchResults().length === 0) {
      this.store.loadSearchDropdownProducts();
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearchQuery(value);
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
  }

  clearSearch(input: HTMLInputElement): void {
    this.store.clearSearch();
    input.focus();
  }

  onSelectProduct(product: Product): void {
    this.close();
    this.router.navigate(['/home/products', product.id]);
  }

  private close(): void {
    this.isOpen.set(false);
    this.store.clearSearch();
  }
}
