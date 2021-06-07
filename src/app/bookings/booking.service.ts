import { take, tap, delay } from 'rxjs/operators';
import { AuthService } from './../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Booking } from './booking.model';
import { Injectable } from "@angular/core";



@Injectable({providedIn: 'root'})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService){

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
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
      this._bookings.next(bookings.concat(newBooking));
      })
    );

  };

  cancelBooking(bookingId: string){

    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
      this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );

  };

}
