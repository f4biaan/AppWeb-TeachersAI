import { PDFSubset } from './../../../../../node_modules/@types/pdfmake/interfaces.d';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnChanges,
  OnInit,
  runInInjectionContext,
  signal,
  Signal,
  SimpleChanges,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { Activity } from '../../../core/interfaces/activity';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import JSZip from 'jszip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CourseStudentsService } from '../../../core/services/data/course-students.service';
import {
  Assessment,
  ComponentGrade,
} from '../../../core/interfaces/assessment';
import { AiAssesmentService } from '../../../core/services/ai-assesment.service';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Student } from '../../../core/interfaces/student';
import { studentAssessment } from '../../../core/interfaces/studentAssessment';
import { MatInputModule } from '@angular/material/input';
import { Course } from '../../../core/interfaces/course';
import { CourseService } from '../../../core/services/course.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import hljs from 'highlight.js';
import { HighlightPipe } from '../../../core/pipes/highlight.pipe';
import { MarkdownModule } from 'ngx-markdown';
import * as XLSX from 'xlsx';
import { JsonResponseAiComponent } from '../../components/json-response-ai/json-response-ai.component';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

import { DomSanitizer } from '@angular/platform-browser';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
// import htmlToPdfMake from 'html-to-pdfmake';

// (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
// (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

@Component({
  selector: 'app-activity-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatTooltipModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightPipe,
    MarkdownModule,
    JsonResponseAiComponent,
  ],
  templateUrl: './activity-view.component.html',
  styleUrl: './activity-view.component.css',
})
export default class ActivityViewComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['name', 'submission', 'statusAssessment'];
  dataSource!: MatTableDataSource<studentAssessment>;
  activityId: Signal<string> = toSignal(
    this.route.params.pipe(map((params) => params['idActivity']))
  );
  activity: Signal<Activity | undefined> = toSignal(
    this._activityService.getActivityById(this.activityId())
  );
  courseId: Signal<string | undefined> = computed(
    () => this.activity()?.courseId
  );
  course: WritableSignal<Course | undefined> = signal(undefined);

  studentsData: WritableSignal<Student[] | undefined> = signal(undefined);

  submissionsData: Signal<Assessment[] | undefined> = toSignal(
    this._courseStudentsService.getAssessmentForActivity(this.activityId())
  );
  studentAssessment: Signal<studentAssessment[]> = computed(() => {
    const students = this.studentsData();
    const submissions = this.submissionsData();
    // console.log('Students:', students);
    // console.log('Submissions:', submissions);

    if (!students || !submissions) {
      return [];
    }

    return students.map((student) => {
      const submission = submissions.find(
        (submission) => submission.id === student.id
      );

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        username: student.username,
        submission: submission?.submission ?? '',
        fileType: submission?.fileType ?? 'plaintext',
        statusAssessment: submission?.status ?? 'missing',
        // aiAssessment: submission?.aiAssessment ?? '',
        aiAssessment: submission?.aiAssessment ?? undefined,
        reAssessment: submission?.reAssessment ?? undefined,
      };
    });
  });

  isActivityStudentsHidden = false;
  isStudentViewHidden = true;

  selectedStudentName: string = '';
  filteredStudents: Student[] = [];
  currentStudent: studentAssessment | null = null;

  constructor(
    private _activityService: ActivityService,
    private _courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
    private _assessmentService: AiAssesmentService,
    private _courseStudentsService: CourseStudentsService,
    private paginatorIntl: MatPaginatorIntl
  ) {
    const injector = inject(Injector);

    runInInjectionContext(injector, () => {
      this.initializeEffects();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      // console.log('Params:', params);
      if (params['view']) {
        if (params['view'] === 'activity') {
          this.isActivityStudentsHidden = false;
          this.isStudentViewHidden = true;
        } else if (params['view'] === 'student') {
          this.isActivityStudentsHidden = true;
          this.isStudentViewHidden = false;
        } else {
          this.setDefaulView();
          this.initializeEffects();
        }
      } else {
        this.setDefaulView();
        this.initializeEffects();
      }
    });

    this.filteredStudents = this.studentsData()?.slice() || [];
  }
  private setDefaulView() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: 'activity' },
      queryParamsHandling: 'merge',
    });
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentStudent'] && this.currentStudent) {
      this.selectedStudentName = this.currentStudent.name || '';
    }
  }

  private initializeEffects(): void {
    // console.log('Initializing effects');
    // Efecto que observa cambios en courseId y actualiza studentsData
    effect(
      () => {
        const courseId = this.courseId();
        const dataStudentsAssessment = this.studentAssessment();

        if (!courseId) {
          this.studentsData.set(undefined);
          return;
        }

        this._courseStudentsService.getStudentsByCourse(courseId).subscribe({
          next: (students) => {
            // console.log('Fetched students:', students);
            this.studentsData.set(students);
          },
          error: (err) => {
            console.error('Error fetching students:', err);
            this.studentsData.set(undefined);
          },
        });

        this._courseService.getCourseById(courseId).subscribe({
          next: (course) => {
            this.course.set(course);
          },
          error: (err) => {
            console.error('Error fetching course:', err);
            this.course.set(undefined);
          },
        });
      },
      { allowSignalWrites: true } // Habilitar escritura en señales
    );

    // Efecto para construir la tabla cuando los datos estén listos
    //  para construir la tabla
    effect(() => {
      const students = this.studentsData();
      const submissions = this.submissionsData();

      if (!students || !submissions) {
        console.warn('Data not ready yet.');
        return;
      }

      const studentAssessments = this.studentAssessment();
      if (studentAssessments.length === 0) {
        console.warn('studentAssessment is empty, waiting for data.');
        return;
      }

      console.log('Building table with data:', studentAssessments);

      // Construcción de MatTableDataSource
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource(studentAssessments);
        this.sort.active = 'name';
        this.sort.direction = 'asc';
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.setPaginatorLabels();
      } else {
        this.dataSource.data = studentAssessments; // Actualizar datos sin reinstanciar
      }
    });
  }

  loadStudentSubmittion() {
    let submitions: Assessment[] = [];
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.click();

    fileInput.addEventListener('change', async () => {
      Swal.fire({
        title: 'Agregando submissions',
        text: 'Esto puede tardar unos momentos, espere por favor',
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const files = fileInput.files;
      if (files) {
        const zip = files.length > 0 ? await JSZip.loadAsync(files[0]) : null;
        if (zip) {
          const files = Object.keys(zip.files);

          // Usando un ciclo for...of para manejar las promesas
          for (const filename of files) {
            const file = zip.files[filename];
            const parsedFilename = this.parseFilename(filename);

            if (parsedFilename) {
              const fileType = this.detectFileType(filename);
              submitions.push({
                id: parsedFilename.id,
                submission: await file.async('text'),
                fileType,
                status: 'pending',
              });
            }
          }

          this._assessmentService
            .addSubmissions(submitions, this.activityId())
            .subscribe({
              next: (data) => {
                Swal.close();
                Swal.fire(
                  'Entregas agregadas',
                  'Las entregas han sido agregadas',
                  'success'
                ).then(() => {
                  location.reload();
                });
              },
              error: (err) => {
                Swal.close();
                Swal.fire('Error', 'Ha ocurrido un error', 'error');
              },
            });
        }
      }
    });
  }

  private parseFilename(filename: string) {
    // Expresión regular para extraer el nombre y el ID del archivo
    const regex = /^([a-z]+)_([0-9]+)_.+/i;
    const match = filename.match(regex);

    if (match) {
      return {
        name: match[1],
        id: match[2],
      };
    }
    return null;
  }
  // Detecta el tipo de archivo según la extensión
  private detectFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'js':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  showAllStudents(): void {
    this.filteredStudents = this.studentAssessment().filter(
      (student) => !!student.aiAssessment || !!student.reAssessment
    );
  }
  setPaginatorLabels(): void {
    this.paginatorIntl.itemsPerPageLabel = 'Ítems por página';
    this.paginatorIntl.nextPageLabel = 'Página siguiente';
    this.paginatorIntl.previousPageLabel = 'Página anterior';
    this.paginatorIntl.getRangeLabel = (
      page: number,
      pageSize: number,
      length: number
    ): string => {
      if (length === 0 || pageSize === 0) {
        return `0 de ${length}`;
      }
      const startIndex = page * pageSize;
      const endIndex = Math.min(startIndex + pageSize, length);
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };
  }

  sendAllToAiAssessment() {
    const activityId = this.activityId();

    Swal.fire({
      title: 'Enviando a evaluación AI',
      text: 'Esto puede tardar unos momentos, espere por favor',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    this._assessmentService
      .generateAssessmentForActivity(activityId)
      .subscribe({
        next: (data) => {
          console.log('Data:', data);
          Swal.close();
          Swal.fire(
            'Evaluación AI completada',
            'La evaluación de las actividades con AI ha sido completada',
            'success'
          ).then(() => {
            // FIXME: en lugar de recargar la pagina controlar el return que se hara par obtener la data de los estudiantes con la evaluacion GENERADAS, YA NO SE OBTENDRA UN BOLEANO
            // TODO: además manejar los http status code
            location.reload();
          });
        },
        error: (err) => {
          Swal.close();
          Swal.fire('Error', 'Ha ocurrido un error', 'error');
        },
      });
  }

  // Filtrar estudiantes para el autocomplete
  filterStudents(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredStudents =
      this.studentAssessment()?.filter(
        (student) =>
          student.name.toLowerCase().includes(filterValue) &&
          (!!student.aiAssessment || !!student.reAssessment)
      ) || [];
  }

  clearInputTable(input: HTMLInputElement): void {
    input.value = '';
    const event = new Event('input', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });
    this.applyFilter(event);
  }
  clearInputSearcher(): void {
    this.selectedStudentName = '';
    this.filteredStudents = []; // O reinicia la lista de estudiantes
    this.currentStudent = null; // O reinicia el estudiante actual
  }

  // Manejar selección del estudiante en el autocomplete
  onStudentSelected(event: any) {
    const selectedName = event.option.value;
    const student = this.studentAssessment().find(
      (s) => s.name === selectedName
    );
    if (student) {
      this.currentStudent = student;
    }
  }

  // Función para alternar a la vista del estudiante
  viewSubmission(student: studentAssessment) {
    this.currentStudent = student; // Asignar el estudiante actual
    this.selectedStudentName = student.name; // Asignar el nombre del estudiante al input
    this.isActivityStudentsHidden = true; // Ocultar la tabla
    this.isStudentViewHidden = false; // Mostrar la vista de estudiante
    this.changeView('student'); // Cambiar la vista en la URL
  }

  changeView(view: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  renderHighlightedCode(
    code: string | undefined,
    language: string | undefined
  ): string {
    const safeCode = code || ''; // Si es undefined, asigna un string vacío
    const safeLanguage = language || 'plaintext'; // Asigna un tipo por defecto si es undefined

    if (hljs.getLanguage(safeLanguage)) {
      return hljs.highlight(safeCode, { language: safeLanguage }).value;
    }
    return hljs.highlightAuto(safeCode).value;
  }

  getAssessmentJson(aiAssessment: string): { grade: string; response: string } {
    const gradeMatch = aiAssessment.match(/Calificación:\s*(\d+)/);
    const responseMatch = aiAssessment.match(/Respuesta:\s*(.+)/s);

    return {
      grade: gradeMatch ? gradeMatch[1] : 'Sin calificación',
      response: responseMatch ? responseMatch[1].trim() : 'Sin respuesta',
    };
  }

  // TODO: Implementar función para obteer tecto formateadp
  getJSONToTextGeneration(generation: Record<string, ComponentGrade>) {
    let text = '';
    for (const [key, value] of Object.entries(generation)) {
      text += `${key}: ${value.grade}\n`;
    }
    // FIXME: export like html or MD
    return text;
  }

  copyToClipboard(text: string): void {
    // Elimina el Markdown para copiar como texto plano
    const plainText = text.replace(/(\*\*|__)/g, '').replace(/[`]/g, '');
    navigator.clipboard.writeText(plainText).then(
      () => alert('Respuesta copiada al portapapeles'),
      (err) => console.error('Error al copiar al portapapeles', err)
    );
  }

  reAssessmentStudent(studentid: string) {
    Swal.fire({
      title: 'Reevaluar estudiante',
      input: 'textarea',
      inputLabel: 'Comentario',
      inputPlaceholder: 'Ingrese un comentario',
      inputAttributes: {
        'aria-label': 'Comentario',
      },
      showCancelButton: true,
      confirmButtonText: 'Reevaluar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (comment) => {
        return comment;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const reAssessmentComment: string = result.value;
        console.log('Reassessment comment:', reAssessmentComment);
        // loading
        Swal.fire({
          title: 'Reevaluando estudiante',
          text: 'Esto puede tardar unos momentos, espere por favor',
          showConfirmButton: false,
          allowOutsideClick: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        this._assessmentService
          .reAssessment(this.activityId(), studentid, reAssessmentComment)
          .subscribe({
            next: (data) => {
              Swal.close();
              Swal.fire(
                'Estudiante reevaluado',
                'El estudiante ha sido reevaluado',
                'success'
              ).then(() => {
                location.reload();
              });
              // FIXME: if not return data
              this._courseStudentsService.getAssessmentForStudentActivity(
                studentid,
                this.activityId()
              );
            },
            error: (err) => {
              Swal.close();
              Swal.fire('Error', 'Ha ocurrido un error', 'error');
            },
          });
      } else {
        // Swal.fire('Error', 'Debe ingresar un comentario', 'error');
      }
    });
  }

  exportGradesExcel() {
    console.log('Exporting grades to Excel');
    const data = this.studentAssessment();

    if (data.length === 0) {
      Swal.fire('Error', 'No hay datos para exportar', 'error');
      return;
    } else {
      // Crear un objeto con los datos a exportar
      const exportData = data.map((student) => {
        const assessment = student.reAssessment || student.aiAssessment;

        // Crear un objeto base con los datos principales
        const studentData: Record<string, any> = {
          ID: student.id,
          Nombre: student.name,
          Correo: student.email,
          Calificación: assessment?.globalGrade ?? null,
        };

        // Agregar dinámicamente las columnas de los componentes
        if (assessment) {
          Object.entries(assessment.componentsGrades).forEach(
            ([key, grade]) => {
              studentData[`${key} (Max: ${grade.maxGrade})`] = grade.grade;
            }
          );
        }

        return studentData;
      });

      // Crear un libro y una hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Calificaciones');

      // Generar el archivo Excel y descargarlo
      const fileName = 'calificaciones.xlsx';
      XLSX.writeFile(workbook, fileName);
    }
  }

  exportInforme() {
    console.log('Exporting grades to PDF');
    const data = this.studentAssessment();

    if (data.length === 0) {
      Swal.fire('Error', 'No hay datos para exportar', 'error');
      return;
    }

    // Información adicional
    const modelInfo = {
      model: 'OpenAI GPT-4',
      temperature: '0.1F',
      topP: 0.4,
      formatResponse: 'json',
      maxTokens: 1000,
    };

    // Definir contenido del documento
    const documentDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Informe de Calificaciones', style: 'header' },
        {
          text: 'Este documento es una generación automática de calificaciones, los detalles del LLM se encuentran a continuación.',
        },
        {
          text: 'Actividad: ',
          bold: true,
          margin: [0, 10, 0, 5],
        },
        {
          text: `${this.activity()?.name}`,
          margin: [0, 0, 0, 10],
        },
        {
          text: `Modelo utilizado: ${modelInfo.model}\nParámetros:`,
          margin: [0, 10, 0, 5],
        },
        {
          ul: [
            `Temperatura: ${modelInfo.temperature}`,
            `Creatividad: ${modelInfo.topP}`,
            `Formato de respuesta: ${modelInfo.formatResponse}`,
            `Máximo de tokens: ${modelInfo.maxTokens}`,
          ],
        },
        { text: '\n' }, // Espaciado entre contenido

        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', /* '*', */ 'auto'], // Ajustar las columnas automáticamente
            body: [
              // Cabeceras
              ['ID', 'Nombre', /*  'Correo', */ 'Calificación'],
              // Filas de datos
              ...data.map((student) => {
                const assessment = student.reAssessment || student.aiAssessment;
                return [
                  student.id,
                  student.name,
                  /* student.email, */
                  assessment?.globalGrade ?? 'N/A',
                ];
              }),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
    };

    // Crear el PDF y descargarlo
    pdfMake.createPdf(documentDefinition).download('calificaciones.pdf');
  }

  updateFeedBackResponse(event: {
    feedback: 'good' | 'bad';
    generation: string;
  }) {
    const { feedback, generation } = event;

    console.log('Feedback:', feedback);
    console.log('Generation:', generation);
    let studentAsssessment = this.submissionsData()!.find(
      (submission) => submission.id === this.currentStudent?.id
    );

    if (generation === 'first') {
      if (studentAsssessment?.aiAssessment) {
        studentAsssessment.aiAssessment.generationRating = feedback;
      }
    } else if (generation === 'reassessment') {
      if (studentAsssessment?.reAssessment) {
        studentAsssessment.reAssessment.generationRating = feedback;
      }
    } else {
      Swal.fire(
        'Error',
        'No se ha especificado el tipo de evaluación',
        'error'
      );
      return;
    }

    this._assessmentService
      .updateAssessment(
        this.activityId(),
        this.currentStudent!.id,
        studentAsssessment!
      )
      .subscribe({
        next: (data) => {
          if (data) {
            console.info('Assessment updated:', data);
          } else {
            console.error('Error updating assessment');
          }
        },
        error: (err) => {
          Swal.fire('Error', 'Ha ocurrido un error', 'error');
        },
      });
  }
}
