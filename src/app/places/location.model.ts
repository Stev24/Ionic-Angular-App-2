export interface Coodinates{
  lat: number;
  lng: number;

}

export interface PlaceLocation extends Coodinates {

  address: string;
  staticMapImageUrl: string;
}
