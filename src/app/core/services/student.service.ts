import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../interfaces/student';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  baseUrl = 'http://localhost:8080/student';

  constructor(private readonly _httpClient: HttpClient) {}

  /**
   * @function getStudentsByCourse
   * @description This function is used to get all students by course
   * @param courseID a string representing the ID of the course
   * @returns
   */
  getStudentsByCourse(courseID: string): Observable<Student[]> {
    return this._httpClient.get<Student[]>(
      `${this.baseUrl}/course/${courseID}/list`
    );
  }

  /**
   * @function addStudents
   * @description This function is used to add students to a course
   * @param students The list of students to add to the course
   * @param courseId The ID of the course to add the students to it
   * @returns An observable with the response from the API
   */
  addStudents(students: Student[], courseId: string): Observable<any> {
    return this._httpClient.post(
      `${this.baseUrl}/course/${courseId}/add-students`,
      students
    );
  }

  /**
   * @function addStudent
   * @description This function is used to add a student to a course
   * @param student The student to add to the course
   * @param courseId The ID of the course to add the student to it
   * @returns An observable with the response from the API
   */
  addStudent(student: Student, courseId: string): Observable<any> {
    return this._httpClient.post(
      `${this.baseUrl}/course/${courseId}/add`,
      student
    );
  }

  /**
   * @function editStudent
   * @description This function is used to edit a student
   * @param student The student data to edit
   * @param courseId The ID of the course to edit the student in it
   * @returns An observable with the response from the API
   */
  editStudent(student: Student, courseId: string): Observable<any> {
    return this._httpClient.put(
      `${this.baseUrl}/course/${courseId}/update`,
      student
    );
  }

  /**
   * @function deleteStudent
   * @description This function is used to delete a student from a course
   * @param studentId This is the ID of the student to delete from the course
   * @param courseId This is the ID of the course to delete the student from it
   * @returns An observable with the response from the API
   */
  deleteStudent(studentId: string, courseId: string): Observable<any> {
    return this._httpClient.delete(
      `${this.baseUrl}/${studentId}/course/${courseId}/delete`
    );
  }
}
