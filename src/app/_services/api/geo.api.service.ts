import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeoApiService {
  apiUrl = environment.api_url;

  constructor(private http: HttpClient) { }

  getDirection(coordinates: [number, number][]) {
    return this.http.post(`${this.apiUrl}/geo/cycling-road`, {
      coordinates,
      options: { round_trip: { length: 5000 } }  //points: 20, seed: 2
    });
  }

}
// [4.3917,51.2192]
