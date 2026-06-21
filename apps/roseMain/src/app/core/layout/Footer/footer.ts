
import { CommonModule } from '@angular/common';
import { Component ,inject} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import  { LangService } from '@org/ui-lang-switcher';
@Component({
  selector: 'app-footer',
  imports: [CommonModule, TranslatePipe ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  
  mytranclateService:LangService =inject(LangService);
}
