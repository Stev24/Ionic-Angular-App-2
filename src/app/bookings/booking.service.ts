import { Booking } from './booking.model';
import { Injectable } from "@angular/core";



@Injectable({providedIn: 'root'})
export class BookingService {
  private _bookings: Booking[] = [
    {
      id: 'xyz',
      placeId: 'p1',
      placeTitle: 'Luxembourg',
      guestNumber: 2,
      userId: 'abc'
    }
  ];

  getbookings(){
    return [...this._bookings];
  }
}
