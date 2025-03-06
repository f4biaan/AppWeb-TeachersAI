import { Injectable } from '@angular/core';
import { Student } from '../../interfaces/student';
import { Course } from '../../interfaces/course';
import { Activity } from '../../interfaces/activity';
import { StudentService } from '../student.service';
import { AiAssesmentService } from '../ai-assesment.service';
import { CourseService } from '../course.service';
import { ActivityService } from '../activity.service';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Assessment } from '../../interfaces/assessment';

@Injectable({
  providedIn: 'root',
})
export class CourseStudentsService {
  private studentsCache: { [courseId: string]: Student[] } = {};
  private assessmentsCache: { [activityId: string]: Assessment[] } = {};
  private coursesCache: { [teacherId: string]: Course[] } = {};
  private activitiesCache: { [courseId: string]: Activity[] } = {};

  constructor(
    private studentService: StudentService,
    private aiAssesmentService: AiAssesmentService,
    private courseService: CourseService,
    private activityService: ActivityService
  ) {}

  /**
   * Obtener estudiantes de un curso, utilizando caché si está disponible.
   */
  getStudentsByCourse(courseID: string): Observable<Student[]> {
    if (this.studentsCache[courseID]) {
      return of(this.studentsCache[courseID]);
    } else {
      return this.studentService
        .getStudentsByCourse(courseID)
        .pipe(tap((students) => (this.studentsCache[courseID] = students)));
    }
  }

  /**
   * Obtener cursos por maestro, utilizando caché si está disponible.
   */
  getCoursesByTeacher(teacherID: string): Observable<Course[]> {
    if (this.coursesCache[teacherID]) {
      return of(this.coursesCache[teacherID]);
    } else {
      return this.courseService
        .getCoursesByTeacher(teacherID)
        .pipe(tap((courses) => (this.coursesCache[teacherID] = courses)));
    }
  }

  /**
   * Obtener actividades por curso, utilizando caché si está disponible.
   */
  getActivitiesByCourse(courseID: string): Observable<Activity[]> {
    if (this.activitiesCache[courseID]) {
      return of(this.activitiesCache[courseID]);
    } else {
      return this.activityService
        .getAllActivitiesByCourse(courseID)
        .pipe(
          tap((activities) => (this.activitiesCache[courseID] = activities))
        );
    }
  }

  /**
   * Obtener la evaluación de un estudiante para una actividad específica.
   */
  getAssessmentForStudentActivity(
    studentId: string,
    activityId: string
  ): Observable<any> {
    return this.aiAssesmentService.getAssessmentByActivity(activityId).pipe(
      switchMap((assessment) => {
        const studentAssessment = assessment.find(
          (assess: any) => assess.studentId === studentId
        );
        return of(studentAssessment);
      })
    );
  }

  /**
   * Obtener la evaluación de una actividad, utilizando caché si está disponible.
   */
  /**
   * @function getAssessmentForActivity
   * @description This function is used to get the assessment for an activity
   * @param activityId The ID of the activity to get the assessment for it
   * @returns An observable with the response from the API
   */
  getAssessmentForActivity(activityId: string): Observable<Assessment[]> {
    if (this.assessmentsCache[activityId]) {
      return of(this.assessmentsCache[activityId]);
    } else {
      return this.aiAssesmentService
        .getAssessmentByActivity(activityId)
        .pipe(
          tap(
            (assessments) => (this.assessmentsCache[activityId] = assessments)
          )
        );
    }
  }

  updateAssessmentsData(activityId: string, updatedAssessments: Assessment[]): void {
    // Si no hay datos existentes, simplemente asignamos los nuevos
    this.assessmentsCache[activityId] = this.assessmentsCache[activityId] || [];

    // Combinar datos: actualizar existentes y agregar nuevos
    const currentAssessments = this.assessmentsCache[activityId];
    const mergedAssessments = currentAssessments.filter(
      oldItem => !updatedAssessments.some(newItem => newItem.id === oldItem.id)
    ).concat(updatedAssessments);

    this.assessmentsCache[activityId] = mergedAssessments;
  }


  /**
   * add submissions by course
   *
   */
  // FIXME
  /* addSubmissions(
    submissions: Assessment[],
    activityId: string
  ): Observable<any> {
    // first of all save on assesment service but then update the cache submissión then get assesments
    return this.aiAssesmentService.addSubmissions(submissions, activityId).pipe(
      tap(() => {
        this.assessmentsCache[activityId] = submissions;
      })
    );
  } */

  /**
   * Generate ai assesment with service and get assessment by activity
   */

  /**
   * Limpiar la caché de datos.
   */
  clearCache(): void {
    this.studentsCache = {};
    this.coursesCache = {};
    this.activitiesCache = {};
  }
}
