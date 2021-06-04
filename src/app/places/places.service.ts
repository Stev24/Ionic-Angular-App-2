import { Injectable } from '@angular/core';

import{Place} from './place.model'

@Injectable({
  providedIn: 'root'
})

export class PlacesService {

  private _places: Place[] = [
    new Place(
      'p1',
      'Luxembourg',
      'Country in the heart of Europe',
      'https://cdn.getyourguide.com/img/country/5dc7f9278a58a.jpeg/88.jpg',
      299.99
    ),
    new Place(
      'p2',
      'Paris',
      'City in France',
      'https://photos.mandarinoriental.com/is/image/MandarinOriental/paris-2017-home?wid=2880&hei=1280&fmt=jpeg&crop=9,336,2699,1200&anchor=1358,936&qlt=75,0&fit=wrap&op_sharpen=0&resMode=sharp2&op_usm=0,0,0,0&iccEmbed=0&printRes=72',
      199.99
    ),
    new Place(
      'p3',
      'London',
      'City in England',
      'https://images.musement.com/cover/0002/49/big-ben-westminster-bridge-on-river-thames-in-london-jpg_header-148518.jpeg?w=1200&h=630&q=95&fit=crop',
      99.99
    ),

  ];

  get places(){
    return [...this._places];
  }

  constructor() { }

  getPlace(id: string){
    return {...this._places.find(p => p.id === id)};
  }
}
