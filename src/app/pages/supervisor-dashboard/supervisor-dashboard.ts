import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header';
import { SupervisorService } from '../../services/supervisor';
import * as XLSX from 'xlsx';
import Chart from 'chart.js/auto';

// Interface para organizar os dados de cada cartão
interface AgentReportCard {
  agentName: string;
  total: number;
  average: number;
  data: any[]; // Dados brutos para o gráfico deste agente
}

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './supervisor-dashboard.html',
  styleUrls: ['./supervisor-dashboard.css']
})
export class SupervisorDashboard implements OnInit {
  // Pega TODOS os canvas da tela (agora teremos vários)
  @ViewChildren('agentChart') chartCanvases!: QueryList<ElementRef>;
  charts: any[] = []; // Array para guardar as instâncias dos gráficos

  // Filtros
  agents: any[] = [];
  selectedAgent: string = '';
  startDate: string = '';
  endDate: string = '';

  // Dados Processados (Lista de Cartões)
  dashboardCards: AgentReportCard[] = [];
  
  // Dados Brutos (Para exportação global)
  rawReportData: any[] = [];

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
    this.supervisorService.getAgents().subscribe({
      next: (data) => {
        this.agents = data;
        this.cdr.detectChanges();
      }
    });
  }

  search() {
    this.isLoading = true;
    this.hasSearched = true;
    
    // 1. Limpa gráficos antigos
    this.charts.forEach(c => c.destroy());
    this.charts = [];
    this.dashboardCards = [];

    this.supervisorService.getGradesReport(this.startDate, this.endDate, this.selectedAgent)
      .subscribe({
        next: (data) => {
          this.rawReportData = data;
          
          // 2. Processa e Agrupa os dados
          this.processData(data);

          this.isLoading = false;
          this.cdr.detectChanges(); // Atualiza HTML para criar os elementos <canvas>

          // 3. Renderiza os gráficos (com pequeno delay para garantir que o HTML existe)
          setTimeout(() => {
            this.renderCharts();
          }, 100);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  processData(data: any[]) {
    // Se não tiver dados, encerra
    if (!data || data.length === 0) return;

    // Agrupa por nome do agente
    const grouped = data.reduce((acc: any, curr: any) => {
      const name = curr.agent_name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(curr);
      return acc;
    }, {});

    // Transforma o objeto agrupado em array de cartões
    this.dashboardCards = Object.keys(grouped).map(name => {
      const agentData = grouped[name];
      const sum = agentData.reduce((acc: number, curr: any) => acc + Number(curr.grade), 0);
      
      return {
        agentName: name,
        data: agentData, // Guarda os dados específicos deste agente
        total: agentData.length,
        average: sum / agentData.length
      };
    })
    .sort((a, b) => a.agentName.localeCompare(b.agentName));
  }

  renderCharts() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Para cada cartão de dados, pegamos o canvas correspondente
    this.chartCanvases.forEach((canvasRef, index) => {
      const card = this.dashboardCards[index]; // Dados correspondentes ao índice
      const ctx = canvasRef.nativeElement.getContext('2d');

      const labels = card.data.map(d => {
        const date = new Date(d.timestamp);
        return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      const grades = card.data.map(d => d.grade);

      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nota',
            data: grades,
            borderColor: '#2563eb', // Azul (var --primary)
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#2563eb',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 5.5,
              border: { display: false },
              ticks: {
                stepSize: 1,
                callback: function(val) {
                  return (Number.isInteger(val) && Number(val) > 0 && Number(val) <= 5) ? val : null;
                }
              }
            },
            x: { grid: { display: false } } // Limpa o visual removendo grades verticais
          }
        }
      });

      this.charts.push(newChart);
    });
  }

  exportToExcel() {
    // Se não tiver cartões processados, não faz nada
    if (this.dashboardCards.length === 0) {
      alert('Sem dados para exportar.');
      return;
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let fileName = '';

    // Função auxiliar para formatar os dados (Datas e Colunas)
    const formatDataForExcel = (data: any[]) => {
      return data.map(item => {
        const date = new Date(item.timestamp);
        return {
          'Data/Hora': `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          'Agente': item.agent_name,
          'Nota': item.grade,
          'Telefone Cliente': item.caller_id // Adicionei caso queira, se não quiser basta remover
        };
      });
    };

    // CENÁRIO 1: Todos os Agentes (Gera Múltiplas Abas)
    if (!this.selectedAgent) {
      
      // Itera sobre os cartões (que já estão ordenados de A-Z pelo processData)
      this.dashboardCards.forEach(card => {
        // 1. Formata os dados deste agente específico
        const formattedData = formatDataForExcel(card.data);
        
        // 2. Cria a aba
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
        
        // 3. Define o nome da aba (Excel limita a 31 caracteres, cortamos por segurança)
        // Removemos caracteres proibidos no Excel como : \ / ? * [ ]
        let sheetName = card.agentName.replace(/[\\/:?*\[\]]/g, '').substring(0, 31);
        
        // 4. Adiciona a aba ao arquivo
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      fileName = `Relatorio_Geral_Por_Agente_${new Date().toISOString().slice(0,10)}.xlsx`;

    } 
    // CENÁRIO 2: Agente Específico (Gera 1 Aba apenas)
    else {
      // Pega o primeiro (e único) cartão da lista
      const card = this.dashboardCards[0];
      const formattedData = formatDataForExcel(card.data);
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
      
      XLSX.utils.book_append_sheet(wb, ws, 'Avaliações');
      
      // Nome do arquivo personalizado
      const safeName = card.agentName.replace(/\s+/g, '_');
      fileName = `Relatorio_${safeName}_${new Date().toISOString().slice(0,10)}.xlsx`;
    }

    // Salva o arquivo final
    XLSX.writeFile(wb, fileName);
  }
}