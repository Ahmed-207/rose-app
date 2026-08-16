// import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckPlatForm {

  private readonly ID = inject(PLATFORM_ID);

  CheckPlatFormBrowser(){
    if (isPlatformBrowser(this.ID)) {
      return true
      
    }
    return false;
  }
  
}
