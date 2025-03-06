import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Assessment } from '../interfaces/assessment';

@Injectable({
  providedIn: 'root',
})
export class AiAssesmentService {
  baseeUrl = 'http://localhost:8080/ai-assessment';

  constructor(private readonly _httpClient: HttpClient) {}

  /**
   * @function generateAssessmentForActivity
   * @description This function is used to generate an assessment for an activity
   * @param activityId The ID of the activity to generate the assessment for it
   * @returns An observable with the response from the API
   */
  generateAssessmentForActivity(activityId: string): Observable<any> {
    return this._httpClient.get(
      `${this.baseeUrl}/activity/${activityId}/assess`
      // TODO: además manejar los http status code
      //TODO: return data not boolean
    );
  }

  /**
   * @function getAssessmentByActivity
   * @description This function is used to get the assessment by activity
   * @param activityId The ID of the activity to get the assessment for it
   * @returns An observable with the response from the API
   */
  getAssessmentByActivity(activityId: string): Observable<any> {
    return this._httpClient.get(`${this.baseeUrl}/activity/${activityId}/list`);
  }

  addSubmissions(
    submissions: Assessment[],
    activityId: string
  ): Observable<any> {
    return this._httpClient.post(
      `${this.baseeUrl}/activity/${activityId}/add-submissions`,
      submissions
    );
  }

  // /activity/{activityId}/student/{studentId}/re-assessment
  reAssessment(
    activityId: string,
    studentId: string,
    reAssessmentComment: string
  ): Observable<any> {
    /* return this._httpClient.get(
      `${this.baseeUrl}/activity/${activityId}/student
      /${studentId}/re-assessment`
    ); */
    return this._httpClient.post(
      `${this.baseeUrl}/activity/${activityId}/student/${studentId}/re-assessment`,
      reAssessmentComment
    );
  }

  // "/activity/{activityId}/student/{studentId}"
  updateAssessment(
    activityId: string,
    studentId: string,
    assessment: Assessment
  ): Observable<any> {
    return this._httpClient.put(
      `${this.baseeUrl}/activity/${activityId}/student/${studentId}`,
      assessment
    );
  }
}
