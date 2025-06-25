import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectExpense, ProjectBudgetSummary, ExpenseCategory } from '../projects.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectExpensesService {
  private apiUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) {}

  // Obtener resumen de presupuesto del proyecto
  getBudgetSummary(projectId: string): Observable<ProjectBudgetSummary> {
    return this.http.get<ProjectBudgetSummary>(`${this.apiUrl}/${projectId}/budget`);
  }

  // Obtener gastos del proyecto
  getProjectExpenses(projectId: string): Observable<ProjectExpense[]> {
    return this.http.get<ProjectExpense[]>(`${this.apiUrl}/${projectId}/expenses`);
  }

  // Crear nuevo gasto
  createExpense(projectId: string, expense: Partial<ProjectExpense>): Observable<ProjectExpense> {
    const expensePayload = {
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.date,
      receiptUrl: expense.receiptUrl
    };
    
    return this.http.post<ProjectExpense>(`${this.apiUrl}/${projectId}/expenses`, expensePayload);
  }

  // Actualizar gasto
  updateExpense(projectId: string, expenseId: string, expense: Partial<ProjectExpense>): Observable<ProjectExpense> {
    const expensePayload = {
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.date,
      receiptUrl: expense.receiptUrl
    };
    
    return this.http.put<ProjectExpense>(`${this.apiUrl}/${projectId}/expenses/${expenseId}`, expensePayload);
  }

  // Eliminar gasto
  deleteExpense(projectId: string, expenseId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/expenses/${expenseId}`);
  }

  // Actualizar presupuesto inicial del proyecto
  updateInitialBudget(projectId: string, budget: number): Observable<ProjectBudgetSummary> {
    return this.http.patch<ProjectBudgetSummary>(`${this.apiUrl}/${projectId}/budget`, { initialBudget: budget });
  }
} 