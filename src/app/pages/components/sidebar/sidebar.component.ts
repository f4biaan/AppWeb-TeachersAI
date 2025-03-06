import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ActivityService } from '../../../core/services/activity.service';
import { User } from '../../../core/interfaces/user';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  user: User | null = null;
  activityID: Signal<number> = toSignal(
    this.route.params.pipe(map((params) => params['idActivity']))
  );

  constructor(
    private _authService: AuthService,
    private _activityServices: ActivityService,
    private _courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._authService.getCurrentUser().subscribe((user) => {
      this.user = user;
    });
  }

  async createNewActivity() {
    this._activityServices.generateFirebaseID().subscribe({
      next: (data) => {
        this.router.navigate(['dashboard', 'activity', data]);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async createNewCourse() {
    this._courseService.generateFirebaseID().subscribe({
      next: (data) => {
        console.log(data);
        this.router.navigate(['dashboard', 'course', data]);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  logout() {
    this._authService.logout();
  }
}
