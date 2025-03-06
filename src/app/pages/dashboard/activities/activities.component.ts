import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  Signal,
} from '@angular/core';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { StepperComponent } from '../../components/stepper/stepper.component';
import { Step } from '../../../core/interfaces/step';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/interfaces/user';
import { Activity } from '../../../core/interfaces/activity';
import { CourseStudentsService } from '../../../core/services/data/course-students.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/interfaces/course';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    StepperComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ActivitiesComponent implements OnInit {
  user: User | null = null;
  idNewActivity!: string;
  idNewCourse!: string;
  lastActivitySteps: Step[] = [];
  lastActivity!: Activity;
  courseOfLastActivity!: Course;

  constructor(
    private _authService: AuthService,
    private _activityServices: ActivityService,
    private _courseService: CourseService,
    private router: Router,
    private _courseStudentsService: CourseStudentsService
  ) {}

  ngOnInit(): void {
    this._authService.getCurrentUser().subscribe((user) => {
      this.user = user;

      this._activityServices.getLastModifiedActivity(user?.id!).subscribe({
        next: (data) => {
          this.lastActivity = data;
          this._courseStudentsService
            .getAssessmentForActivity(data.id)
            .subscribe({
              next: (submissions) => {
                const createdActivity = this.lastActivity ? 'done' : 'actual';
                submissions === null ? (submissions = []) : submissions;
                const loadedSubmissions =
                  submissions.length > 0 ? 'done' : 'actual';
                const reviewedSubmissions =
                  submissions.length == 0
                    ? 'todo'
                    : submissions.some(
                        (submission) => submission.status === 'pending'
                      )
                    ? 'actual'
                    : 'done';
                const aiAssesmented = submissions.some(
                  (submission) => submission.status === 'reviewed'
                )
                  ? 'done'
                  : 'actual';
                const feedback = aiAssesmented === 'done' ? 'done' : 'todo'; // TOD: implements feedback logic to consume this value

                this.lastActivitySteps = [
                  {
                    id: 'create',
                    title: 'Crear actividad',
                    status: createdActivity,
                  },
                  {
                    id: 'load',
                    title: 'Carga de entregables',
                    status: loadedSubmissions,
                  },
                  {
                    id: 'assessment',
                    title: 'Evaluación AI',
                    status: reviewedSubmissions,
                  },
                  {
                    id: 'comments',
                    title: 'Comentarios',
                    status: feedback,
                  },
                ];
                // console.log(this.lastActivitySteps);
              },
              error: (error) => {
                console.error(error);
              },
            });

          this._courseService
            .getCourseById(this.lastActivity.courseId)
            .subscribe({
              next: (course) => {
                this.courseOfLastActivity = course;
              },
              error: (error) => {
                console.error(error);
              },
            });
        },
        error: (error) => {
          console.error(error);
        },
      });
    });

    this._activityServices.generateFirebaseID().subscribe({
      next: (data) => {
        this.idNewActivity = data;
      },
      error: (error) => {
        console.error(error);
      },
    });

    this._courseService.generateFirebaseID().subscribe({
      next: (data) => {
        this.idNewCourse = data;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  createNewActivity() {
    this.router.navigate(['dashboard', 'activity', this.idNewActivity]);
  }

  createNewCourse() {
    this.router.navigate(['dashboard', 'course', this.idNewCourse]);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return '¡Buen día!';
    } else if (hour < 18) {
      return '¡Buenas tardes!';
    } else {
      return '¡Buenas noches!';
    }
  }

  caseOfLearningComponent(learningComponent: string): string {
    switch (learningComponent) {
      case 'ACD':
        return 'Aprendizaje en contacto con el docente';
      case 'APE':
        return 'Aprendizaje práctico experimental';
      case 'AA':
        return 'Aprendizaje autónomo';
      default:
        return '';
    }
  }

  enterActivity(activity: string) {
    this.router.navigate(['/dashboard', 'activity', activity, 'view'], {
      queryParams: { view: 'activity' },
    });
  }
}
