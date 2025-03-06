import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { CourseService } from '../../../core/services/course.service';
import Swal from 'sweetalert2';
import { User } from '../../../core/interfaces/user';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/interfaces/course';

@Component({
  selector: 'app-new-course',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './new-course.component.html',
  styleUrl: './new-course.component.css',
})
export default class NewCourseComponent implements OnInit {
  courseID: Signal<string> = toSignal(
    this.route.params.pipe(map((params) => params['idCourse']))
  );
  dataCourse!: Course;
  courseForm!: FormGroup;
  isNewCourse: boolean = true;
  numbers: number[] = [];
  user: User | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _courseService: CourseService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      faculty: ['', Validators.required],
      department: ['', Validators.required],
      degree: ['', Validators.required],
      modality: ['', Validators.required],
      subject: ['', Validators.required],
      subjectCode: ['', Validators.required],
      academicPeriod: ['', Validators.required],
      academicLevel: ['', Validators.required],
    });

    this._authService.getCurrentUser().subscribe((user) => {
      this.user = user;
    });

    this.numbers = Array.from({ length: 10 }, (_, i) => i + 1);

    this._courseService.getCourseById(this.courseID()).subscribe((data) => {
      if (data) {
        this.dataCourse = data;
        console.log(data);
        this.isNewCourse = false;
        // Si hay datos, los usamos para actualizar el formulario
        this.courseForm.patchValue({
          faculty: data.faculty,
          department: data.department,
          degree: data.degree,
          subject: data.subject,
          subjectCode: data.subjectCode,
          modality: data.modality,
          academicPeriod: data.academicPeriod,
          academicLevel: data.academicLevel
            ? data.academicLevel.toString()
            : '',
        });
      } else {
        // console.log('No data');
      }
    }, error => {
      console.error(error.message);
    }
  );
  }

  saveCourse() {
    if (this.courseForm.valid) {
      const course = {
        ...this.courseForm.value,
        id: this.courseID(),
        createdAt: new Date(),
        teacherId: this.user?.id,
      };

      this._courseService.addCourse(course).subscribe({
        next: (data) => {
          Swal.fire(
            'Curso creado',
            'El curso ha sido creado con éxito',
            'success'
          );
          this.router.navigate(['dashboard', 'courses']);
        },
        error: (error) => {
          console.error(error);
          Swal.fire('Error', 'Ha ocurrido un error', 'error');
        },
      });
    }
  }

  updateCourse() {
    if (this.courseForm.valid) {
      let course = this.dataCourse;
      course = {
        ...course,
        ...this.courseForm.value,
      };

      this._courseService.updateCourse(course).subscribe({
        next: (data) => {
          console.log(data);
          Swal.fire(
            'Curso actualizado',
            'El curso ha sido actualizado con éxito',
            'success'
          );
          this.router.navigate(['dashboard', 'courses']);
        },
        error: (error) => {
          console.error(error);
          Swal.fire('Error', 'Ha ocurrido un error', 'error');
        },
      });
    }
  }
}
