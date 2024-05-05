import { Routes } from '@angular/router';
import { NavTabsComponent } from './components/nav-tabs/nav-tabs.component';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  // {
  //   path: 'home',
  //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  // },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: NavTabsComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      // {
      //   path: 'search',
      //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      // },
      {
        path: 'history',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
    ],
  },
];
