import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AIAssessment,
  ReAssessment,
} from '../../../core/interfaces/assessment';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-json-response-ai',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './json-response-ai.component.html',
  styleUrl: './json-response-ai.component.css',
})
export class JsonResponseAiComponent {
  @Input({ required: true }) assessmentComponents!: AIAssessment | ReAssessment;
  @Input({ required: true }) studentId!: string;
  @Input({ required: true }) activityId!: string;

  @Output() updateFeedback = new EventEmitter<{
    feedback: string;
    generation: string;
  }>();

  getComponentGrades() {
    const grades = this.assessmentComponents.componentsGrades;
    return Object.keys(grades).map((key) => ({
      title: key,
      content: grades[key].content,
      grade: grades[key].grade,
      maxGrade: grades[key].maxGrade,
    }));
  }

  async copyToClipboard() {
    /* const text = `Calificación: ${
      this.assessmentComponents.globalGrade
    }\nRúbrica de calificación:\n${this.getComponentGrades()
      .map(
        (component) =>
          `\t${component.title}:\n\t\tContent: ${component.content}\n\t\tGrade: ${component.grade}\n\t\tMax Grade: ${component.maxGrade}`
      )
      .join('\n\n')}`;

    navigator.clipboard.writeText(text); */

    // return like a HTML formate code
    /* const text = `<h1>Calificación: ${
      this.assessmentComponents.globalGrade
    }</h1><h2>Rúbrica de calificación:</h2>${this.getComponentGrades()
      .map(
        (component) =>
          `<h3>${component.title}:</h3><p>Content: ${component.content}</p><p>Grade: ${component.grade}</p><p>Max Grade: ${component.maxGrade}</p>`
      )
      .join('')}`; */

      const text = `
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.5;
        color: #2c3e50;
      }
      h1, h2 {
        color: #2c3e50;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f4f4f4;
        color: #333;
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      tr:hover {
        background-color: #f1f1f1;
      }
    </style>
    <h1>Calificación: ${this.assessmentComponents.globalGrade}</h1>
    <h2>Rúbrica de calificación:</h2>
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Contenido</th>
          <th>Calificación</th>
        </tr>
      </thead>
      <tbody>
        ${this.getComponentGrades()
          .map(
            (component) => `
            <tr>
              <td>${component.title}</td>
              <td>${component.content}</td>
              <td>${component.grade} / ${component.maxGrade}</td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>
  `;

    navigator.clipboard.writeText(text);

  }

  sendFeedback(feedback: 'good' | 'bad') {
    console.log(this.assessmentComponents);
    this.assessmentComponents.generationRating = feedback;
    const generation =
      'teacherComment' in this.assessmentComponents ? 'reassessment' : 'first';
    this.updateFeedback.emit({ feedback, generation });
  }
}
