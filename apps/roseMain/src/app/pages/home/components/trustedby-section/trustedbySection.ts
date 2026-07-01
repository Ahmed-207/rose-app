import { Component } from '@angular/core';
import {SectionHeader} from '../../../../../../../shared/components/section-header/sectionHeader'

@Component({
  selector: 'trusted-by-section',
  imports: [SectionHeader],
  templateUrl: './trustedbySection.html',
  styleUrl: './trustedbySection.css',
})
export class TrustedbySection {

  companies=[
    {src:'/assets/images/coconut.png',alt:'Coconut'},
    {src:'/assets/images/ginyard.png',alt:'Ginyard'},
    {src:'/assets/images/lingoude.png',alt:'Lingoude'},
    {src:'/assets/images/velvet.png',alt:'Velvet'},
    {src:'/assets/images/ingoud.png',alt:'Ingenicle'},
    {src:'/assets/images/houbu.png',alt:'Habun'},
  ]
}
