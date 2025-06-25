import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProjectExpensesService } from '../../expenses/project-expenses.service';
import { PdfGeneratorService } from '../../../shared/services/pdf-generator.service';
import { 
  ProjectBudgetSummary, 
  ProjectExpense, 
  ExpenseCategory, 
  EXPENSE_CATEGORY_LABELS,
  Project 
} from '../../projects.models';

@Component({
  selector: 'app-project-budget',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './project-budget.component.html',
  styleUrls: ['./project-budget.component.css']
})
export class ProjectBudgetComponent implements OnInit {
  @Input() projectId!: string;
  @Input() project: Project | null = null;

  budgetSummary: ProjectBudgetSummary | null = null;
  expenses: ProjectExpense[] = [];
  isLoading = true;
  showAddExpenseForm = false;

  expenseForm: FormGroup;
  expenseCategories = Object.values(ExpenseCategory);
  expenseCategoryLabels = EXPENSE_CATEGORY_LABELS;

  // Columnas para la tabla de gastos
  displayedColumns: string[] = ['date', 'description', 'category', 'amount', 'actions'];

  constructor(
    private expensesService: ProjectExpensesService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private pdfGeneratorService: PdfGeneratorService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: [ExpenseCategory.OTHER, Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBudgetData();
  }

  loadBudgetData(): void {
    this.isLoading = true;
    
    this.expensesService.getBudgetSummary(this.projectId).subscribe({
      next: (summary) => {
        this.budgetSummary = summary;
        this.expenses = summary.expenses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar presupuesto:', error);
        this.snackBar.open('Error al cargar datos del presupuesto', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleAddExpenseForm(): void {
    this.showAddExpenseForm = !this.showAddExpenseForm;
    if (!this.showAddExpenseForm) {
      this.expenseForm.reset({
        category: ExpenseCategory.OTHER,
        date: new Date()
      });
    }
  }

  onSubmitExpense(): void {
    if (this.expenseForm.valid) {
      const formData = this.expenseForm.value;
      
      this.expensesService.createExpense(this.projectId, {
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        date: formData.date.toISOString()
      }).subscribe({
        next: (newExpense) => {
          this.snackBar.open('Gasto registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadBudgetData(); // Recargar datos
          this.toggleAddExpenseForm();
        },
        error: (error) => {
          console.error('Error al crear gasto:', error);
          this.snackBar.open('Error al registrar gasto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  deleteExpense(expense: ProjectExpense): void {
    if (confirm(`¿Estás seguro de eliminar el gasto "${expense.description}"?`)) {
      this.expensesService.deleteExpense(this.projectId, expense.id).subscribe({
        next: () => {
          this.snackBar.open('Gasto eliminado', 'Cerrar', { duration: 3000 });
          this.loadBudgetData();
        },
        error: (error) => {
          console.error('Error al eliminar gasto:', error);
          this.snackBar.open('Error al eliminar gasto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  getBudgetUsagePercentage(): number {
    if (!this.budgetSummary || this.budgetSummary.initialBudget === 0) return 0;
    return (this.budgetSummary.totalExpenses / this.budgetSummary.initialBudget) * 100;
  }

  getBudgetProgressColor(): string {
    const percentage = this.getBudgetUsagePercentage();
    if (percentage > 90) return 'warn';
    if (percentage > 70) return 'accent';
    return 'primary';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });
  }

  getCategoryIcon(category: ExpenseCategory): string {
    switch (category) {
      case ExpenseCategory.MATERIALS: return 'construction';
      case ExpenseCategory.LABOR: return 'groups';
      case ExpenseCategory.EQUIPMENT: return 'build';
      case ExpenseCategory.PERMITS: return 'gavel';
      default: return 'receipt';
    }
  }

  getCategoryColor(category: ExpenseCategory): string {
    switch (category) {
      case ExpenseCategory.MATERIALS: return 'primary';
      case ExpenseCategory.LABOR: return 'accent';
      case ExpenseCategory.EQUIPMENT: return 'warn';
      case ExpenseCategory.PERMITS: return 'basic';
      default: return 'basic';
    }
  }

  getCategoryLabel(category: ExpenseCategory): string {
    return EXPENSE_CATEGORY_LABELS[category];
  }

  generatePdfReport(): void {
    if (!this.project || !this.budgetSummary) {
      this.snackBar.open('No hay datos suficientes para generar el reporte', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      this.pdfGeneratorService.generateBudgetReport(this.project, this.budgetSummary);
      this.snackBar.open('Reporte PDF generado exitosamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.snackBar.open('Error al generar el reporte PDF', 'Cerrar', { duration: 3000 });
    }
  }
} 