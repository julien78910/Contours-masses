import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { DrawPage } from '../pages/draw/draw';
import { GaleriePage } from '../pages/galerie/galerie';
import { HomePage } from '../pages/home/home';


@NgModule({
  declarations: [
    MyApp,
    DrawPage,
    GaleriePage,
    HomePage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      swipeBackEnabled: false
    }, {})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    DrawPage,
    GaleriePage,
    HomePage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
