
import { CommonModule } from '@angular/common';
import { Component ,inject} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Translate } from '../../services/Translate/translate';




@Component({
  selector: 'app-navbar',
  imports: [ CommonModule, TranslatePipe ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  mytranclateService:Translate =inject(Translate);

}
