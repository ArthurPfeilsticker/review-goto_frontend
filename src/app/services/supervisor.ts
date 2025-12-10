import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupervisorService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  // search agents to select
  getAgents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/supervisor/agents`);
  }

  // search filtered grades
  getGradesReport(startDate: string, endDate: string, agentId: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (agentId) params = params.set('agent_id', agentId);

    return this.http.get<any[]>(`${this.apiUrl}/supervisor/grades`, { params });
  }
}