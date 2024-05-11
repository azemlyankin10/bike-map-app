import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { IRouteResponse } from 'src/app/_models/routeResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeoApiService {
  apiUrl = environment.api_url;

  constructor(private http: HttpClient) { }

  // points 3 - 30 / seeds 0 - 90
  getDirection(coordinates: [number, number][], options: TDirectionApiOptions ) {
    return this.http.post<IRouteResponse>(`${this.apiUrl}/geo/cycling-road`, { coordinates, options });
  }

  getLocationName(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    return this.http.get<any>(url)
  }

}


export type TDirectionApiOptions = { round_trip: { length: number, points: number, seed: number } }
