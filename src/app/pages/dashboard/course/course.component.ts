import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { User } from '../../../core/interfaces/user';
import { Course } from '../../../core/interfaces/course';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseStudentsService } from '../../../core/services/data/course-students.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css',
})
export default class CourseComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private _authService: AuthService,
    private _courseService: CourseService,
    private _courseEstudentsService: CourseStudentsService
  ) {}

  ngOnInit(): void {
    this._authService.getCurrentUser().subscribe((user) => {
      this.user = user;

      this._courseEstudentsService
        .getCoursesByTeacher(this.user?.id!)
        .subscribe({
          next: (data) => {
            this.isLoading = false;
            if (data) {
              this.courses = data;
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
    });
  }

  deleteCourse(courseId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._courseService.deleteCourse(courseId).subscribe({
          next: (data) => {
            Swal.fire('Eliminado', 'El curso ha sido eliminado', 'success');
            this.courses = this.courses.filter(
              (course) => course.id !== courseId
            );
          },
          error: (error) => {
            console.error(error);
            Swal.fire('Error', 'Ha ocurrido un error', 'error');
          },
        });
      }
    });
  }

  async createNewCourse() {
    this._courseService.generateFirebaseID().subscribe({
      next: (data) => {
        this.router.navigate(['dashboard', 'course', data]);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
