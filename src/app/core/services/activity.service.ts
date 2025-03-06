import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Activity } from '../interfaces/activity';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  baseUrl = 'http://localhost:8080/activity';

  constructor(private readonly _httpClient: HttpClient) {}

  /**
   * @function generateFirebaseID
   * @description This function is used to generate a new ID for a new activity in firebase collection activity
   * @returns an Observable of type string with the generated ID from firebase collection activity
   */
  generateFirebaseID(): Observable<string> {
    return this._httpClient
      .get<any>(`${this.baseUrl}/generateId`, {
        responseType: 'json',
      })
      .pipe(map((response) => response.id));
  }

  /**
   * @function addActivity
   * @description This function is used to add a new activity to the firebase collection activity
   * @param activity an object of type Activity
   * @returns an Observable of type any with the response from the API after adding the activity
   */
  addActivity(activity: Activity): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}/add`, activity);
  }

  /**
   * @function getActivityById
   * @description This function is used to get an activity by its ID from the firebase collection activity
   * @param id a string representing the ID of the activity
   * @returns an Observable of type Activity with the activity object from the API
   */
  getActivityById(id: string): Observable<Activity> {
    return this._httpClient.get<Activity>(`${this.baseUrl}/${id}`);
  }

  getLastModifiedActivity(teacherId: string): Observable<Activity> {
    return this._httpClient.get<Activity>(
      `${this.baseUrl}/teacher/${teacherId}/last-updated`
    );
  }

  /**
   * @function getAllActivitiesByTeacher
   * @description This function is used to get all activities by a teacher from the firebase collection activity
   * @param techerID a string representing the ID of the teacher
   * @returns an Observable of type Activity[] with the list of activities from the API
   */
  getAllActivitiesByTeacher(techerID: string): Observable<Activity[]> {
    return this._httpClient.get<Activity[]>(
      `${this.baseUrl}/teacher/${techerID}`
    );
  }

  /**
   * @function getAllActivitiesByCourse
   * @description This function is used to get all activities by a course from the firebase collection activity
   * @param courseID a string representing the ID of the course
   * @returns an Observable of type Activity[] with the list of activities from the API
   */
  getAllActivitiesByCourse(courseID: string): Observable<Activity[]> {
    return this._httpClient.get<Activity[]>(
      `${this.baseUrl}/course/${courseID}`
    );
  }

  /**
   * @function updateActivity
   * @description This function is used to update an activity in the firebase collection activity
   * @param activity an object of type Activity
   * @returns an Observable of type any with the response from the API after updating the activity
   */
  updateActivity(activity: Activity): Observable<any> {
    return this._httpClient.put(
      `${this.baseUrl}/${activity.id}/update`,
      activity
    );
  }

  /**
   * @function deleteActivity
   * @description This function is used to delete an activity from the firebase collection activity
   * @param id a string representing the ID of the activity
   * @returns an Observable of type any with the response from the API after deleting the activity
   */
  deleteActivity(id: string): Observable<any> {
    return this._httpClient.delete(`${this.baseUrl}/${id}/delete`);
  }
}
