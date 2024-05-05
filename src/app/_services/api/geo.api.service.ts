import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeoApiService {
  apiUrl = environment.api_url;

  constructor(private http: HttpClient) { }

  getDirection() {
    return this.http.post(`${this.apiUrl}/geo/driving-car`, {
      coordinates: [[8.681495,49.41461]],
      options: { round_trip: { length: 1000 } }
    });
  }

}
