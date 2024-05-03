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
    return this.http.get(`${this.apiUrl}/geo`);
  }

}
