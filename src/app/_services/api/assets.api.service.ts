import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject, catchError, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AssetsApiService {
  apiUrl = environment.api_url;
  constructor(private http: HttpClient, private toastController: ToastController) {
    this.initRouteCollections()
  }
  /**
   * Route collections
   */
  private _routeCollections$ = new BehaviorSubject<TRouteCollection[] | null>(null);
  private refreshRouteCollections$ = new Subject<void>();
  isCollectionsRefreshing$ = new BehaviorSubject<boolean>(false)
  private initRouteCollections() {
    this.refreshRouteCollections$.pipe(
      tap(() => this.isCollectionsRefreshing$.next(true)),
      switchMap(() => this.http.get<TRouteCollection[]>(`${this.apiUrl}/assets/route-collections-list`)
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
    return this.http.post(`${this.apiUrl}/assets/route-collections-list`, { name }).pipe(
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

}

export type TRouteCollection = {
  name: string
  id: number
  routers: { name: string, id: number, routeQuery: any }[]
}
