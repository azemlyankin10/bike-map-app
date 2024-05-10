import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeoApiService {
  apiUrl = environment.api_url;

  constructor(private http: HttpClient) { }

  // points 3 - 30 / seeds 0 - 90
  getDirection(coordinates: [number, number][], options: TDirectionApiOptions ) {
    return this.http.post(`${this.apiUrl}/geo/cycling-road`, { coordinates, options });
  }

}


export type TDirectionApiOptions = { round_trip: { length: number, points: number, seed: number } }
