import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Signal,
  ViewChild,
} from '@angular/core';
import { Activity } from '../../../core/interfaces/activity';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ActivityService } from '../../../core/services/activity.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/interfaces/course';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { CourseStudentsService } from '../../../core/services/data/course-students.service';
import { MatButtonModule } from '@angular/material/button';
import { Student } from '../../../core/interfaces/student';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { StudentService } from '../../../core/services/student.service';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-course-activities',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
  ],
  templateUrl: './course-activities.component.html',
  styleUrl: './course-activities.component.css',
})
export default class CourseActivitiesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['name'];
  // TODO:  ad accions como delete edit student columns -> 'name', 'actions'
  dataSource!: MatTableDataSource<Student>;
  courseID: Signal<string> = toSignal(
    this.route.params.pipe(map((params) => params['idCourse']))
  );
  course!: Course;
  activities: Activity[] = [];
  isLoading: boolean = true;

  isActivitiesHidden = false;
  isStudentsHidden = true;

  public students: Student[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _activityService: ActivityService,
    private _courseService: CourseService,
    private _studentService: StudentService,
    private _courseEstudentsService: CourseStudentsService,
    private paginatorIntl: MatPaginatorIntl
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      console.log(params);
      if (params['section']) {
        if (params['section'] === 'activities') {
          this.isActivitiesHidden = false;
          this.isStudentsHidden = true;
        } else if (params['section'] === 'students') {
          this.isActivitiesHidden = true;
          this.isStudentsHidden = false;
        } else {
          this.setDefaultSection();
        }
      } else {
        this.setDefaultSection();
      }
    });

    this._courseService.getCourseById(this.courseID()).subscribe((data) => {
      this.course = data;
    });

    this._courseEstudentsService
      .getActivitiesByCourse(this.courseID())
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data) {
            this.activities = data;
          }
        },
        error: (error) => {
          console.error(error);
        },
      });

    this._studentService.getStudentsByCourse(this.courseID()).subscribe({
      next: (data) => {
        this.students = data;
        this.dataSource = new MatTableDataSource(this.students);
        this.sort.active = 'name'; // Columna a ordenar
        this.sort.direction = 'asc'; // Dirección inicial (ascendente)
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.setPaginatorLabels();
        // console.log(this.dataSource);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  deleleActivity(activityId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, bórralo',
      cancelButtonText: 'No, cancela',
    }).then((result) => {
      if (result.isConfirmed) {
        this._activityService.deleteActivity(activityId).subscribe({
          next: (data) => {
            Swal.fire(
              '¡Eliminado!',
              'Tu actividad ha sido eliminada.',
              'success'
            );
            this.activities = this.activities.filter(
              (activity) => activity.id !== activityId
            );
          },
          error: (error) => {
            Swal.fire(
              '¡Error!',
              'Hubo un error al eliminar la actividad.',
              'error'
            );
          },
        });
      }
    });
  }

  async createNewActivity() {
    this._activityService.generateFirebaseID().subscribe({
      next: (data) => {
        console.log(data);
        this.router.navigate(['dashboard', 'activity', data], {
          queryParams: { courseId: this.courseID() },
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  changeViewSection(section: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section },
      queryParamsHandling: 'merge',
    });
  }

  private setDefaultSection(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: 'activities' },
      queryParamsHandling: 'merge',
    });
  }

  /* async createNewStudent() {s
    // TODO: Implementar la creación de un nuevo estudiante
  } */

  async loadStudentsExcel() {
    // Modal para cargar archivo Excel
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.click();

    Swal.fire({
      title: 'Cargando estudiantes',
      text: 'Por favor, espere un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = e.target?.result;
          if (data) {
            // Verificar la codificación de los datos, en caso de que sea necesario decodificar
            let binaryData: string;
            if (typeof data === 'string') {
              binaryData = data;
            } else {
              // Convertir el ArrayBuffer a cadena si es necesario
              const decoder = new TextDecoder('utf-8'); // Usar UTF-8 o la codificación correcta
              binaryData = decoder.decode(data);
            }

            // Leer el archivo CSV
            const workbook = XLSX.read(data, {
              type: 'binary',
              codepage: 65001,
            });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convertir la hoja a un JSON y extraer solo las columnas necesarias
            const rawData = XLSX.utils.sheet_to_json(sheet);

            // Filtrar solo las columnas deseadas: Student, ID, SIS Login ID
            const students: Student[] = rawData.map((row: any) => {
              const sisLoginId = row['SIS Login ID'] || '';
              return {
                name: row['Student']?.trim() || 'Sin nombre',
                id: row['ID'] ?? 'Sin ID',
                username: sisLoginId.includes('_inactivo')
                  ? sisLoginId.replace('_inactivo', '')
                  : sisLoginId || 'Sin usuario',
                email: sisLoginId
                  ? `${
                      sisLoginId.includes('_inactivo')
                        ? sisLoginId.replace('_inactivo', '')
                        : sisLoginId
                    }@utpl.edu.ec`
                  : 'Sin correo',
              };
            });

            console.log(students);

            this._studentService
              .addStudents(students, this.courseID())
              .subscribe({
                next: (data) => {
                  Swal.close();
                  Swal.fire(
                    '¡Éxito!',
                    'Estudiantes cargados correctamente',
                    'success'
                  ).then(() => {
                    location.reload();
                  });
                  this.students = [...this.students, ...students];

                  this.dataSource.data = this.students;
                  this.dataSource = new MatTableDataSource(this.students);
                  this.sort.active = 'name'; // Columna a ordenar
                  this.sort.direction = 'asc'; // Dirección inicial (ascendente)
                  this.dataSource.sort = this.sort;
                  this.dataSource.paginator = this.paginator;
                  this.setPaginatorLabels();
                },
                error: (error) => {
                  Swal.close();
                  Swal.fire(
                    '¡Error!',
                    'Hubo un error al cargar los estudiantes',
                    'error'
                  );
                },
              });
          }
        };
        reader.readAsBinaryString(file);
      }
    };

    fileInput.oncancel = () => {
      Swal.close();
    };
  }

  enterActivity(activityId: string) {
    this.router.navigate(['dashboard', 'activity', activityId, 'view']);
  }
}
