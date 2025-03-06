import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Activity } from '../../../core/interfaces/activity';
import { Course } from '../../../core/interfaces/course';
import { User } from '../../../core/interfaces/user';
import { AuthService } from '../../../core/services/auth.service';
import { ActivityService } from '../../../core/services/activity.service';
import { CourseService } from '../../../core/services/course.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-activity',
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
    MatAutocompleteModule,
    CKEditorModule,
  ],
  templateUrl: './add-activity.component.html',
  styleUrl: './add-activity.component.css',
})
export default class AddActivityComponent implements OnInit {
  user: User | null = null;
  activityID: Signal<string> = toSignal(
    this.route.params.pipe(map((params) => params['idActivity']))
  );
  courseID: Signal<string> = toSignal(
    this.route.queryParams.pipe(map((params) => params['courseId']))
  );
  dataActivity!: Activity;
  coursesData: Course[] = [];
  dataCourse: Course | undefined;
  isNewActivity: boolean = true;

  public Editor = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      'blockQuote',
      '|',
      'insertTable',
      'tableColumn',
      'tableRow',
      'mergeTableCells',
      '|',
      'undo',
      'redo',
      '|',
      'MathType',
    ],
    math: {
      engine: 'mathjax',
      outputType: 'span',
      mathJaxLib: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
    },
  };

  generalForm!: FormGroup;
  specificForm!: FormGroup;
  @ViewChild(MatStepper) stepper!: MatStepper; // Referencia al MatStepper
  selectedIndex!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _authService: AuthService,
    private _activityService: ActivityService,
    private _courseService: CourseService
  ) {
    this.route.queryParams.subscribe((params) => {
      const stepIndex = params['stepIndex'];
      const courseId = params['courseId'];
      if (!stepIndex) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { stepIndex: 0, courseId: courseId || '' },
          queryParamsHandling: 'merge',
        });
      } else {
        this.selectedIndex = +stepIndex;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            stepIndex: this.selectedIndex,
            courseId: courseId || '',
          },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  ngOnInit(): void {
    // Datos General
    this.generalForm = this.fb.group({
      name: ['', Validators.required],
      typeActivity: [
        { value: 'Calificación de actividades', disabled: true },
        Validators.required,
      ],
      courseId: [this.courseID() || '', Validators.required],
      learningComponent: ['', Validators.required],
      academicLevel: [{ value: '', disabled: true }, Validators.required],
    });

    // Datos Específicos
    this.specificForm = this.fb.group({
      unitTheme: ['', Validators.required],
      expectedLearningOutcomes: ['', Validators.required],
      didacticStrategies: ['', Validators.required],
      assessmentRubric: ['', Validators.required],
      solution: ['', Validators.required],
    });

    this._authService.getCurrentUser().subscribe((user) => {
      this.user = user;

      this._courseService
        .getCoursesByTeacher(this.user?.id!)
        .subscribe((data) => {
          if (data) {
            this.generalForm
              .get('courseId')
              ?.valueChanges.subscribe((courseId) => {
                const selectedCourse = this.coursesData.find(
                  (course) => course.id === courseId
                );
                this.generalForm
                  .get('academicLevel')
                  ?.setValue(selectedCourse?.academicLevel ?? '');
              });

            this.coursesData = data;
            console.log(data);
            if (this.courseID()) {
              this.dataCourse = this.coursesData.find(
                (course) => course.id === this.courseID()
              );

              this.generalForm.patchValue({
                courseId: this.courseID(),
              });

              if (!this.dataCourse) {
                // console.log('Curso:', this.dataCourse);
                this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: { courseId: '' },
                  queryParamsHandling: 'merge',
                });
              }
            }

            this._activityService
              .getActivityById(this.activityID())
              .subscribe((data) => {
                if (data) {
                  this.dataActivity = data;
                  this.isNewActivity = false;
                  this.isNewActivity = false;
                  // Si hay datos, los usamos para actualizar el formulario
                  this.generalForm.patchValue({
                    name: data.name,
                    typeActivity: data.typeActivity,
                    courseId: data.courseId,
                    learningComponent: data.learningComponent,
                    academicLevel: data.academicLevel,
                  });

                  this.specificForm.patchValue({
                    unitTheme: data.unitTheme,
                    expectedLearningOutcomes: data.expectedLearningOutcomes,
                    didacticStrategies: data.didacticStrategies,
                    assessmentRubric: data.assessmentRubric,
                    solution: data.solution,
                  });
                } else {
                  // console.log('No data');
                }
              });
          }
        });
    });
  }

  onSubmit() {
    if (this.generalForm.valid && this.specificForm.valid) {
      const generalData = this.generalForm.value;
      const specificData = this.specificForm.value;
      // console.log('Datos generales:', generalData);
      // console.log('Datos específicos:', specificData);

      const dataLoad: Activity = {
        ...generalData,
        ...specificData,
        academicLevel: this.academicLevel,
        typeActivity: 'Calificación de actividades',
        createdAt: new Date(),
        id: this.activityID(),
        teacherId: this.user?.id,
        lastUpdate: new Date(),
      };

      console.log('DataLoad:', dataLoad);

      this._activityService.addActivity(dataLoad).subscribe({
        next: (data) => {
          Swal.fire({
            title: 'Actividad creada',
            text: 'La actividad ha sido creada con éxito',
            icon: 'success',
          });
          this.router.navigate(
            ['dashboard', 'activity', this.activityID(), 'view'],
            {
              queryParams: { courseId: this.courseID() },
            }
          );
        },
        error: (error) => {
          console.error(error);
          Swal.fire({
            title: 'Error',
            text: 'Ha ocurrido un error',
            icon: 'error',
          });
        },
      });
    }
  }

  onUpdate() {
    if (this.generalForm && this.specificForm) {
      const generalData = this.generalForm.value;
      const specificData = this.specificForm.value;

      const dataLoad: Activity = {
        ...this.dataActivity,
        ...generalData,
        ...specificData,
        academicLevel: this.academicLevel,
        lastUpdate: new Date(),
      };

      this._activityService.updateActivity(dataLoad).subscribe({
        next: (data) => {
          Swal.fire({
            title: 'Actividad actualizada',
            text: 'La actividad ha sido actualizada con éxito',
            icon: 'success',
          });
          this.router.navigate(
            ['dashboard', 'activity', this.activityID(), 'view'],
            {
              queryParams: { courseId: this.courseID() },
            }
          );
        },
        error: (error) => {
          console.error(error);
          Swal.fire({
            title: 'Error',
            text: 'Ha ocurrido un error',
            icon: 'error',
          });
        },
      });
    }
  }

  onStepChange(event: any): void {
    this.selectedIndex = event.selectedIndex;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { stepIndex: this.selectedIndex },
      queryParamsHandling: 'merge', // Mantiene otros parámetros de consulta
    });
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    // Guarda solo el id en el formulario
    this.generalForm.get('courseId')?.setValue(event.option.value.id);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { courseId: event.option.value.id },
      queryParamsHandling: 'merge',
    });
  }

  getCourseName(id: string | null): string {
    const course = this.coursesData.find((course) => course.id === id);
    return course ? `${course.subject} - ${course.subjectCode}` : '';
  }

  displayCourseName = (courseId: string | null): string => {
    const course = this.coursesData.find((c) => c.id === courseId);
    return course ? `${course.subject} - ${course.subjectCode}` : '';
  };

  get academicLevel(): string {
    const courseId = this.generalForm.get('courseId')?.value;
    return (
      this.coursesData.find((course) => course.id === courseId)
        ?.academicLevel ?? ''
    );
  }
}
