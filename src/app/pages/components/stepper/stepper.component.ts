import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Step } from '../../../core/interfaces/step';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
export class StepperComponent {
  @Input() steps: Step[] = [];
}
