import { Injectable } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { BehaviorSubject, finalize, catchError, of, Subject, startWith, map, switchMap } from 'rxjs';
import { IRouteQueryResponse } from 'src/app/_models/routeResponse';
import { haptic } from 'src/app/helpers/methods/native';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoutesApiService {
  apiUrl = environment.api_url;
  constructor(private http: HttpClient, private toastController: ToastController) { }

  isLoading$ = new BehaviorSubject<boolean>(false)
  private refreshRoutes$ = new Subject<void>();

  saveRoute(collectionId: string, routeName: string, routeQuery: IRouteQueryResponse, routeInfo: { distance: number, duration: number, location: string }) {
    this.isLoading$.next(true)
    return this.http.post(`${this.apiUrl}/routes`, { collectionId, name: routeName, routeQuery, routeInfo }).pipe(
      finalize(() => {
        this.isLoading$.next(false)
        haptic(ImpactStyle.Light)
      }),
      catchError(e => {
        console.error(e, 'Failed to save route to collection');
        this.toastController.create({
          message: 'Failed to save route to collection',
          duration: 10000,
          position: 'top',
          buttons: [{ text: 'Close', role: 'cancel' }],
          mode: 'ios'
        }).then(toast => toast.present())
        return of(null)
      })
    )
  }

  getSavedRoutes(payload?: IRouteRequest) {
    return this.refreshRoutes$.pipe(
      startWith(null),
      map(() => {
        let params = new HttpParams();
        if (payload) {
          const obj = payload as { [key: string]: any }
          Object.keys(payload).forEach(key => {
            params = params.set(key, String(obj[key]));
          });
        }
        return params
      }),
      switchMap(params => this.http.get<IRouteResponse[]>(`${this.apiUrl}/routes`, { params }))
    )
  }

  removeRoute(routeId: string) {
    this.isLoading$.next(true)
    return this.http.delete(`${this.apiUrl}/routes/${routeId}`).pipe(
      finalize(() => {
        this.isLoading$.next(false)
        haptic(ImpactStyle.Light)
      }),
      catchError(e => {
        console.error(e, 'Failed to remove route');
        this.toastController.create({
          message: 'Failed to remove route',
          duration: 10000,
          position: 'top',
          buttons: [{ text: 'Close', role: 'cancel' }],
          mode: 'ios'
        }).then(toast => toast.present())
        return of(null)
      })
    )
  }
}

export interface IRouteResponse {
  _id: string;
  collectionId: string;
  name: string;
  routeQuery: {
    coordinates: number[][];
    profile: string;
    format: string;
    options: {
      round_trip: {
        length: number;
        points: number;
        seed: number;
      };
    };
  };
  routeInfo: {
    distance: number;
    duration: number;
    location: string;
  };
}

interface IRouteRequest {
  pagination?: IPagination
}

interface IPagination { page: number, limit: number }
