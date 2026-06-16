import { Component } from '@angular/core';
import { Navbar } from '../Navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Footer } from "../Footer/footer";

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, Navbar, Footer],
  templateUrl: './mainLayout.html',
  styleUrl: './mainLayout.css',
})
export class MainLayout {}
