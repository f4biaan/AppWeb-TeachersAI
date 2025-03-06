import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
  },
  /* {
    path: 'inicio',
    loadComponent: () => import('./pages/home/home.component'),
  }, */
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/layout/layout.component'),
    children: [
      {
        path: '',
        redirectTo: 'activities',
        pathMatch: 'full',
      },
      {
        path: 'activities',
        loadComponent: () =>
          import('./pages/dashboard/activities/activities.component'),
      },
      {
        path: 'activity/:idActivity/view',
        loadComponent: () =>
          import('./pages/dashboard/activity-view/activity-view.component')
      },
      {
        path: 'activity/:idActivity',
        loadComponent: () =>
          import('./pages/dashboard/add-activity/add-activity.component'),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./pages/dashboard/course/course.component'),
      },
      {
        path: 'course/:idCourse',
        loadComponent: () =>
          import('./pages/dashboard/new-course/new-course.component'),
      },
      {
        path: 'course/:idCourse/activities',
        loadComponent: () =>
          import(
            './pages/dashboard/course-activities/course-activities.component'
          ),
      },
    ],
    canActivate: [authGuard],
  },
  /**
   * this route is only for tarjet all row for dataset
   */
  /* {
    path: 'evaluate-res',
    loadComponent: () =>
      import('./pages/res-evaluation/res-evaluation.component'),
  }, */
  {
    path: '**',
    redirectTo: '/',
  },
];
