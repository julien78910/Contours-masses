import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { DrawPage } from '../draw/draw';
import { GaleriePage } from '../galerie/galerie';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private drawPage;
  private galeriePage;

  constructor(public navCtrl: NavController) {
    this.drawPage = DrawPage;
    this.galeriePage = GaleriePage;
  }

}
