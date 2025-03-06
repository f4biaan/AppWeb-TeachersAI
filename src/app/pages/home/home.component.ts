import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export default class HomeComponent implements OnInit {
  public title = 'Home Component';
  public response: any;

  constructor(
    // private _apiService: ApiService
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // console.log('HomeComponent initialized');
    // this._apiService.testConexionAPI().subscribe((response: any) => {
    //   console.log(response);
    //   this.response = response;
    // });
  }
}
