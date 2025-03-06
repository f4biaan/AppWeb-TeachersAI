import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Course } from '../interfaces/course';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  baseUrl = 'http://localhost:8080/course';

  constructor(private readonly _httpClient: HttpClient) {}

  /**
   * @function generateFirebaseID
   * @description This function is used to generate a new ID for a new course in firebase collection course
   * @returns an Observable of type string with the generated ID from firebase collection course
   */
  generateFirebaseID(): Observable<string> {
    return this._httpClient
      .get<any>(`${this.baseUrl}/generateId`, {
        responseType: 'json',
      })
      .pipe(map((response) => response.id));
  }

  /**
   * @function addCourse
   * @description This function is used to add a new course to the firebase collection course
   * @param course an object of type Course
   * @returns an Observable of type any with the response from the API after adding the course
   */
  addCourse(course: Course): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}/add`, course);
  }

  /**
   * @function getCourseById
   * @description This function is used to get a course by its ID from the firebase collection course
   * @param id a string representing the ID of the course
   * @returns an Observable of type Course with the course object from the API
   */
  getCourseById(id: string): Observable<Course> {
    return this._httpClient.get<Course>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.status === 404) {
          errorMessage =
            error.error?.message ||
            'No se encontró el curso con el ID proporcionado';
        } else if (error.status === 500) {
          errorMessage =
            error.error?.message ||
            'Ocurrió un error inesperado en el servidor';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'La solicitud no es válida';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * @function getCoursesByTeacher
   * @description This function is used to get all courses by a teacher from the firebase collection course
   * @param teacherID a string representing the ID of the teacher
   * @returns an Observable of type Course[] with the list of courses from the API
   */
  getCoursesByTeacher(teacherID: string): Observable<Course[]> {
    return this._httpClient.get<Course[]>(
      `${this.baseUrl}/teacher/${teacherID}`
    );
  }

  /**
   * @function updateCourse
   * @description This function is used to update a course in the firebase collection course
   * @param course an object of type Course
   * @returns an Observable of type any with the response from the API after updating the course
   */
  updateCourse(course: Course): Observable<any> {
    return this._httpClient.put(`${this.baseUrl}/${course.id}/update`, course);
  }

  /**
   * @function deleteCourse
   * @description This function is used to delete a course from the firebase collection course
   * @param id a string representing the ID of the course
   * @returns an Observable of type any with the response from the API after deleting the course
   */
  deleteCourse(id: string): Observable<any> {
    return this._httpClient.delete(`${this.baseUrl}/${id}/delete`);
  }
}
