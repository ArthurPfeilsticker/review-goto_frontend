import { Component, OnInit, Inject, PLATFORM_ID, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header';
import { SupervisorService } from '../../services/supervisor';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './supervisor-dashboard.html',
  styleUrls: ['./supervisor-dashboard.css']
})
export class SupervisorDashboard implements OnInit {
  @ViewChild('gradesChart') gradesChartRef!: ElementRef;
  chart: any; // instance of the grafic

  // filters
  agents: any[] = [];
  selectedAgent: string = '';
  startDate: string = '';
  endDate: string = '';

  // states
  reportData: any[] = [];
  averageGrade: number = 0;
  isLoading = false;
  hasSearched = false;

  constructor(
    private supervisorService: SupervisorService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAgents();
    }
  }

  loadAgents() {
    this.supervisorService.getAgents().subscribe(data => {
      this.agents = data;
    });
  }

  search() {
    if (!this.selectedAgent) {
        alert('Por favor, selecione um agente.');
        return;
    }

    this.isLoading = true;
    this.hasSearched = true;

    if (this.chart) {
        this.chart.destroy(); 
        this.chart = null;
    }

    this.supervisorService.getGradesReport(this.startDate, this.endDate, this.selectedAgent)
      .subscribe({
        next: (data) => {
          this.reportData = data;
          console.log("Dados recebidos:", data); // Debug

          this.calculateStats();
          
          this.isLoading = false;
          this.cdr.detectChanges();

          if (this.reportData.length > 0) {
            setTimeout(() => {
                this.renderChart();
            }, 0);
          }
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  calculateStats() {
    if (this.reportData.length === 0) {
      this.averageGrade = 0;
      return;
    }
    // Soma as notas
    const sum = this.reportData.reduce((acc, curr) => acc + Number(curr.grade), 0);
    this.averageGrade = sum / this.reportData.length;
  }

  renderChart() {
    if (!isPlatformBrowser(this.platformId) || !this.gradesChartRef) return;

    const ctx = this.gradesChartRef.nativeElement.getContext('2d');

    // prepare data
    const labels = this.reportData.map(d => {
        // converts string into Date type
        const date = new Date(d.timestamp);
        // formats Day/Month Hour:Min
        return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });

    const grades = this.reportData.map(d => d.grade);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nota da Avaliação',
          data: grades,
          borderColor: '#28a745', // Verde Zoho
          backgroundColor: 'rgba(40, 167, 69, 0.2)',
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#28a745',
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5.3,
            border: {
              display: false
            },
            ticks: {
              stepSize: 1,
              callback: function(value: string | number) {
                const val = Number(value)
                if (Number.isInteger(val) && val > 0 && val <= 5) {
                    return value;
                }
                return null;
              }
            }
          }
        },
        plugins: {
            legend: {
                display: false
            }
        }
      }
    });
  }
}