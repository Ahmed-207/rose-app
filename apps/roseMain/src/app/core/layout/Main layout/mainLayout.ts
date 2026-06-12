import { Component } from '@angular/core';
import { Navbar } from '../Navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule ,RouterOutlet ,Navbar ],
  templateUrl: './mainLayout.html',
  styleUrl: './mainLayout.css',
})
export class MainLayout {}
