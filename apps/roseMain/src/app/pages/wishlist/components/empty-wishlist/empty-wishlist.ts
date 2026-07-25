import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-wishlist',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './empty-wishlist.html',
  styleUrl: './empty-wishlist.css',
})
export class EmptyWishlist { }