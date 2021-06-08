import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';

import{Place} from './place.model'
import { BehaviorSubject, of } from 'rxjs';
import {take, map, tap, delay, switchMap} from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

interface PlaceData {
  availableFrom: string,
  availableTo: string,
  description: string,
  imageUrl: string,
  price: number,
  title: string,
  userId: string,
}

@Injectable({
  providedIn: 'root'
})

export class PlacesService {

  private _places = new BehaviorSubject<Place[]>([
//    new Place(
//      'p1',
//      'Luxembourg',
//      'Country in the heart of Europe',
//      'https://cdn.getyourguide.com/img/country/5dc7f9278a58a.jpeg/88.jpg',
//      299.99,
//      new Date('2019-01-01'),
//      new Date('2019-12-31'),
//      'abc'
//    ),
//    new Place(
//      'p2',
//      'Paris',
//      'City in France',
//      'https://photos.mandarinoriental.com/is/image/MandarinOriental/paris-2017-home?wid=2880&hei=1280&fmt=jpeg&crop=9,336,2699,1200&anchor=1358,936&qlt=75,0&fit=wrap&op_sharpen=0&resMode=sharp2&op_usm=0,0,0,0&iccEmbed=0&printRes=72',
//      199.99,
//      new Date('2019-01-01'),
//      new Date('2019-12-31'),
//      'abc'
//    ),
//    new Place(
//      'p3',
//      'London',
//      'City in England',
//      'https://images.musement.com/cover/0002/49/big-ben-westminster-bridge-on-river-thames-in-london-jpg_header-148518.jpeg?w=1200&h=630&q=95&fit=crop',
//      99.99,
//      new Date('2019-01-01'),
//      new Date('2019-12-31'),
//      'xyz'
//    ),

    ]);

  get places(){
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  getPlace(id: string){
    return this.http
      .get<PlaceData>(`https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/offered-places/${id}.json`
      )
      .pipe(
        map(placeData => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
            );
        })
      )
  }

  fetchPlaces(){
    return this.http.get<{[key: string]: PlaceData}>('https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/offered-places.json')
      .pipe(map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)){
            places.push(new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId
              ));
          }
        }
        return places;
        //return [];
      }),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date){
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://images.musement.com/cover/0002/49/big-ben-westminster-bridge-on-river-thames-in-london-jpg_header-148518.jpeg?w=1200&h=630&q=95&fit=crop',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.http
      .post<{name: string}>('https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/offered-places.json',{...newPlace, id: null})
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        delay(1000),
        tap(places => {
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string){
    let updatedPlaces: Place [];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if(!places || places.length <= 0 ){
          return this.fetchPlaces();
        } else {
          return of(places)
        }
      }),
      switchMap(places=> {
        const updatedPlaceIndex = places.findIndex(pl =>  pl.id === placeId );
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/offered-places/${placeId}.json`,
          {...updatedPlaces[updatedPlaceIndex], id: null}
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      }));
    };



}
