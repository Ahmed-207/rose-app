// import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckPlatForm {
  
  constructor(@Inject(PLATFORM_ID) private ID:object){}
  

  CheckPlatFormBrowser(){
    if (isPlatformBrowser(this.ID)) {
      return true
      
    }
    return false;
  }
  
}
