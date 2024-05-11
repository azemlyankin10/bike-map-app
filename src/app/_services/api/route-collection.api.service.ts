import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';
import { IRouteQueryResponse } from 'src/app/_models/routeResponse';
import { haptic } from 'src/app/helpers/methods/native';
import { ImpactStyle } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root'
})
export class RouteCollectionApiService {
  apiUrl = environment.api_url;
  constructor(private http: HttpClient, private toastController: ToastController) {
    this.initRouteCollections()
  }
  /**
   * Route collections
   */
  private _routeCollections$ = new BehaviorSubject<IRouteCollectionList[] | null>(null);
  private refreshRouteCollections$ = new Subject<void>();
  isCollectionsRefreshing$ = new BehaviorSubject<boolean>(false)
  private initRouteCollections() {
    this.refreshRouteCollections$.pipe(
      tap(() => this.isCollectionsRefreshing$.next(true)),
      switchMap(() => this.http.get<IRouteCollectionList[]>(`${this.apiUrl}/route-collections`)
        .pipe(catchError(e => {
          console.error(e, 'Failed to fetch route collections');
          this.toastController.create({
            message: 'Failed to fetch route collections',
            duration: 10000,
            position: 'top',
            buttons: [{ text: 'Close', role: 'cancel' }],
            mode: 'ios'
          }).then(toast => toast.present())
          return of(null)
        }))
      )
    ).subscribe(res => {
      console.log('collections', res);

      this.isCollectionsRefreshing$.next(false)
      if (!res) return;
      this._routeCollections$.next(res)
    })
  }

  getRouteCollections$() {
    if (!this._routeCollections$.value) {
      this.refreshRouteCollections$.next()
    }
    return this._routeCollections$
  }

  createRouteCollection(name: string) {
    return this.http.post(`${this.apiUrl}/route-collections`, { name }).pipe(
      finalize(() => haptic(ImpactStyle.Light)),
      catchError(e => {
        console.error(e, 'Failed to create route collection');
        this.toastController.create({
          message: 'Failed to create route collection',
          duration: 10000,
          position: 'top',
          buttons: [{ text: 'Close', role: 'cancel' }],
          mode: 'ios'
        }).then(toast => toast.present())
        return of(null)
      }),
      tap(() => this.refreshRouteCollections$.next()),
    )
  }

  // isSavingRoute$ = new BehaviorSubject<boolean>(false)
  // saveRouteToCollection(collectionId: number, routeName: string, routeQuery: IRouteQueryResponse, routeInfo: { distance: number, duration: number, location: string }) {
  //   this.isSavingRoute$.next(true)
  //   return this.http.put(`${this.apiUrl}/assets/route-collections-list/${collectionId}`, { name: routeName, routeQuery, routeInfo }).pipe(
  //     finalize(() => {
  //       this.isSavingRoute$.next(false)
  //       haptic(ImpactStyle.Light)
  //     }),
  //     catchError(e => {
  //       console.error(e, 'Failed to save route to collection');
  //       this.toastController.create({
  //         message: 'Failed to save route to collection',
  //         duration: 10000,
  //         position: 'top',
  //         buttons: [{ text: 'Close', role: 'cancel' }],
  //         mode: 'ios'
  //       }).then(toast => toast.present())
  //       return of(null)
  //     }),
  //     tap(() => this.refreshRouteCollections$.next()),
  //   )
  // }
}

export interface IRouteCollectionList { _id: string, name: string }

// export type TRouteCollection = {
//   name: string
//   id: number
//   routes: { collectionName: string, collectionId: number, name: string, id: number, routeQuery: IRouteQueryResponse, routeInfo: { distance: number, duration: number, location: string } }[]
// }
