import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Papa } from 'ngx-papaparse';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MARKED_OPTIONS,
  MarkdownModule,
  MarkdownService,
  MarkedOptions,
  MarkedRenderer,
  MermaidAPI,
} from 'ngx-markdown';

interface CsvRow {
  ID: number;
  Grade: number;
  Prompt: string;
  Scenario: string;
  Resultados_de_aprendizaje_que_se_espera_lograr: string;
  Rubrica_evaluacion: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  model: string;
  messageReq: string;
  Relevancia?: number;
  Precision?: number;
  Claridad?: number;
  Completitud?: number;
  Observaciones?: string;
  ResponseRelationGrade?: number;
}

@Component({
  selector: 'app-res-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MarkdownModule],
  templateUrl: './res-evaluation.component.html',
  styleUrl: './res-evaluation.component.css',
})
export default class ResEvaluationComponent {
  rows: CsvRow[] = [];
  currentIndex = 0;
  currentRow!: CsvRow;

  parameters = [
    { label: 'Relevancia', value: 0 },
    { label: 'Precision', value: 0 },
    { label: 'Claridad', value: 0 },
    { label: 'Completitud', value: 0 },
    // { label: 'Observacines', value: '' },
    // { label: 'ResponseRelationGrade', value: 0 },
  ];
  responseRelationPercentage: number = 0;
  observaciones: string = '';

  constructor(private http: HttpClient, private papa: Papa) {}

  ngOnInit(): void {
    this.loadCsvData();
  }

  loadCsvData(): void {
    this.http
      .get('http://localhost:3000/get-csv', { responseType: 'text' }) // Solicita el CSV desde el servidor
      .subscribe((data) => {
        this.papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            this.rows = result.data;
            this.loadCurrentRow();
          },
        });
      });
  }

  loadCurrentRow(): void {
    this.currentRow = this.rows[this.currentIndex];
    console.log(this.currentRow);
    if (this.currentRow) {
      this.parameters[0].value = Number(this.currentRow.Relevancia) || 0;
      this.parameters[1].value = Number(this.currentRow.Precision) || 0;
      this.parameters[2].value = Number(this.currentRow.Claridad) || 0;
      this.parameters[3].value = Number(this.currentRow.Completitud) || 0;
      // this.parameters[4].value = this.currentRow.Observaciones || '';
      // this.parameters[5].value = this.currentRow.ResponseRelationGrade || 0;
      this.observaciones = this.currentRow.Observaciones || '';
      this.responseRelationPercentage =
        Number(this.currentRow.ResponseRelationGrade) || 0;
    }
  }

  onValueChange(): void {
    if (this.currentRow) {
      this.currentRow.Relevancia = Number(this.parameters[0].value);
      this.currentRow.Precision = Number(this.parameters[1].value);
      this.currentRow.Claridad = Number(this.parameters[2].value);
      this.currentRow.Completitud = Number(this.parameters[3].value);
      // this.currentRow.Observaciones = String(this.parameters[4].value);
      // this.currentRow.ResponseRelationGrade = Number(this.parameters[5].value);
      this.currentRow.Observaciones = this.observaciones;
      this.currentRow.ResponseRelationGrade = this.responseRelationPercentage;
    }
  }

  saveCsv(): void {
    this.onValueChange(); // Ensure current changes are saved

    // Convert rows to CSV, including headers
    const csvData = this.papa.unparse(
      this.rows as unknown as (string | number)[][],
      {
        header: true, // Ensure headers are included
      }
    );

    fetch('http://localhost:3000/save-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData }),
    })
      .then((response) => response.text())
      .then((message) => {
        console.log(message); // Success or error message
        this.loadCsvData(); // Reload CSV after saving
      })
      .catch((error) => {
        console.error('Error saving CSV file:', error);
      });
  }

  goToIndex(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.rows.length) {
      this.saveCsv(); // Guardar el CSV antes de cambiar de registro
      this.loadCurrentRow();
    }
  }

  goToPrevious(): void {
    if (this.currentIndex > 0) {
      this.saveCsv(); // Guardar el CSV antes de cambiar de registro
      this.currentIndex--;
      this.loadCurrentRow();
    }
  }

  goToNext(): void {
    if (this.currentIndex < this.rows.length - 1) {
      this.saveCsv(); // Guardar el CSV antes de cambiar de registro
      this.currentIndex++;
      this.loadCurrentRow();
    }
  }
}
