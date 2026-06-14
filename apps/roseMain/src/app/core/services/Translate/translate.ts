
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CheckPlatForm } from '../../../shared/checkPlatForm/check-plat-form';

@Injectable({
  providedIn: 'root',
})
export class Translate {
  

  
  translateService:TranslateService =inject(TranslateService);
   checkPlatFormService:CheckPlatForm = inject(CheckPlatForm)


  constructor(){
    if (this.checkPlatFormService.CheckPlatFormBrowser()) {
      
       let defaultLang:string = 'en';

    if (localStorage.getItem('lang')!=null) {

      defaultLang = localStorage.getItem('lang')!;
      
    }

    this.translateService.setFallbackLang(defaultLang);

    this.translateService.use(defaultLang);

    this.changeDirection(defaultLang)
    }
   
  }
  

  changeLanguage(lang:string){

    localStorage.setItem('lang' , lang);

    this.translateService.setFallbackLang(lang);

    this.translateService.use(lang);

    this.changeDirection(lang);
  }


  changeDirection(lang:string){

    document.dir = lang === 'ar' ? 'rtl':'ltr'
  }
}
