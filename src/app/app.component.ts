import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Component } from '@angular/core';
import { Capacitor} from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen'
import { Camera } from '@capacitor/camera';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private authService: AuthService, private router: Router, private platform: Platform) {
    this.initialzeApp();
  }

  initialzeApp(){
    this.platform.ready().then( ()=> {
      if (Capacitor.isPluginAvailable('SplashScreen')){
        SplashScreen.hide();
      }
    })
  }

  onLogout(){
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }
}
