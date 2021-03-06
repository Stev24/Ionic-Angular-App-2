import { HttpClient } from '@angular/common/http';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { AuthService } from './../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Booking } from './booking.model';
import { Injectable } from "@angular/core";

interface BookingData {
  bookedFrom: string,
  bookedTo: string,
  firstname: string,
  guestNumber: number,
  lastname:string,
  placeId: string,
  placeImage: string,
  placeTitle: string,
  userId: string,
}


@Injectable({providedIn: 'root'})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(
    private authService: AuthService,
    private http: HttpClient
    ){

  }

  get bookings(){
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastname: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
    ){
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastname,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http.post<{name: string}>(
      'https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/bookings.json',
      {...newBooking, id: null}
      )
      .pipe(
        switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
        }),
        take(1)
        ,tap(bookings => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );

  };



  cancelBooking(bookingId: string){
    return this.http.delete(`https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/bookings/${bookingId}.json`
    ).pipe(switchMap( ()=> {
      return this.bookings;
      }),
      take(1),
      tap(bookings => {
      this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  };


  fetchBookings(){
    return this.http.get<{[key:string]: BookingData}>(`https://ionic-angular-app2-default-rtdb.europe-west1.firebasedatabase.app/bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`)
    .pipe(
      map( bookingData => {
      const bookings =[];
      for (const key in bookingData) {
        if (bookingData.hasOwnProperty(key)){
          bookings.push(
            new Booking(
              key,
              bookingData[key].placeId,
              bookingData[key].userId,
              bookingData[key].placeTitle,
              bookingData[key].placeImage,
              bookingData[key].firstname,
              bookingData[key].lastname,
              bookingData[key].guestNumber,
              new Date(bookingData[key].bookedFrom),
              new Date(bookingData[key].bookedTo)
              )
            );
        }
      }
      return bookings;
    }),
    tap(bookings =>{
      this._bookings.next(bookings);
    })

    )
  }

}
