import { Component, OnInit } from '@angular/core';

import { NavController } from 'ionic-angular';

import { File } from 'ionic-native';

@Component({
  selector: 'page-galerie',
  templateUrl: 'galerie.html'
})
export class GaleriePage implements OnInit {
  private images: Array<string>;

  constructor(public navCtrl: NavController) {
    this.images = [];
  }

  ngOnInit(): void {
    File.listDir((<any>File).dataDirectory, 'images')
    .then(entries => {
      entries.forEach(e => {
        File.readAsText((<any>File).dataDirectory + 'images', e.name)
        .then(data => {
          console.log(data);
          this.images.push(data.toString());
        });
      }, this);
    });
  }

  goRoot$(): void {
    this.navCtrl.popToRoot();
  }

}
