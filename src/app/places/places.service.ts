import { PlaceLocation } from './location.model';
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
  location: PlaceLocation,
}

@Injectable({
  providedIn: 'root'
})

export class PlacesService {

  private _places = new BehaviorSubject<Place[]>([]);

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
            placeData.userId,
            placeData.location,
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
              resData[key].userId,
              resData[key].location
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

  uploadImage(image: File){
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.http.post<{imageUrl: string, imagePath: string}>(
      'https://us-central1-ionic-angular-app2.cloudfunctions.net/storeImage',
      uploadData
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation, imageUrl: string){
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      imageUrl,
      price,
      dateFrom,
      dateTo,
      this.authService.userId,
      location,
    );
    return this.http
      .post<{name: string}>('https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/offered-places.json',{...newPlace, id: null})
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
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
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
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
