import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ProjectBudgetSummary, 
  ProjectExpense, 
  ExpenseCategory, 
  EXPENSE_CATEGORY_LABELS,
  Project 
} from '../../projects/projects.models';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  generateBudgetReport(
    project: Project, 
    budgetSummary: ProjectBudgetSummary
  ): void {
    const doc = new jsPDF();

    // Configurar colores y fuentes
    const primaryColor = [33, 150, 243]; // Azul Material
    const secondaryColor = [76, 175, 80]; // Verde
    const warningColor = [255, 152, 0]; // Naranja
    const textColor = [51, 51, 51]; // Gris oscuro

    // Configurar fuente por defecto
    doc.setFont('helvetica');

    // ENCABEZADO
    this.addHeader(doc, project, primaryColor);

    // RESUMEN EJECUTIVO
    let yPosition = this.addExecutiveSummary(doc, budgetSummary, primaryColor, secondaryColor, warningColor);

    // GASTOS POR CATEGORÍA
    yPosition = this.addExpensesByCategory(doc, budgetSummary, yPosition, primaryColor);

    // NUEVA PÁGINA PARA DETALLE DE GASTOS
    if (budgetSummary.expenses.length > 0) {
      doc.addPage();
      this.addExpensesDetail(doc, budgetSummary.expenses);
    }

    // PIE DE PÁGINA EN TODAS LAS PÁGINAS
    this.addFooter(doc);

    // Descargar el PDF
    const fileName = `Informe_Presupuesto_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private addHeader(doc: jsPDF, project: Project, primaryColor: number[]): void {
    // Fondo del encabezado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE PRESUPUESTO', 15, 20);

    // Información del proyecto
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Proyecto: ${project.name}`, 15, 30);

    // Fecha del reporte
    const today = new Date().toLocaleDateString('es-AR');
    doc.setTextColor(255, 255, 255);
    doc.text(`Fecha del reporte: ${today}`, 140, 30);

    // Resetear color de texto
    doc.setTextColor(51, 51, 51);
  }

  private addExecutiveSummary(
    doc: jsPDF, 
    budgetSummary: ProjectBudgetSummary, 
    primaryColor: number[], 
    secondaryColor: number[], 
    warningColor: number[]
  ): number {
    let yPos = 50;

    // Título de sección
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('RESUMEN EJECUTIVO', 15, yPos);

    yPos += 15;

    // Información financiera principal
    const budgetData = [
      ['Presupuesto Inicial', this.formatCurrency(budgetSummary.initialBudget)],
      ['Total Gastado', this.formatCurrency(budgetSummary.totalExpenses)],
      ['Presupuesto Restante', this.formatCurrency(budgetSummary.remainingBudget)],
      ['Porcentaje Utilizado', `${((budgetSummary.totalExpenses / budgetSummary.initialBudget) * 100).toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Valor']],
      body: budgetData,
      theme: 'grid',
      headStyles: { 
        fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 11 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

  
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    // Resetear color
    doc.setTextColor(51, 51, 51);
    
    return yPos + 20;
  }

  private addExpensesByCategory(
    doc: jsPDF, 
    budgetSummary: ProjectBudgetSummary, 
    yPos: number,
    primaryColor: number[]
  ): number {
    // Título de sección
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('GASTOS POR CATEGORÍA', 15, yPos);

    yPos += 15;

    // Preparar datos de categorías
    const categoryData = Object.entries(budgetSummary.expensesByCategory)
      .filter(([category, amount]) => amount > 0)
      .map(([category, amount]) => [
        EXPENSE_CATEGORY_LABELS[category as ExpenseCategory],
        this.formatCurrency(amount),
        `${((amount / budgetSummary.totalExpenses) * 100).toFixed(1)}%`
      ]);

    if (categoryData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Categoría', 'Monto', 'Porcentaje']],
        body: categoryData,
        theme: 'grid',
        headStyles: { 
          fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { fontSize: 11 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60, halign: 'right' },
          2: { cellWidth: 40, halign: 'center' }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('No hay gastos registrados por categorías.', 15, yPos);
      yPos += 20;
    }

    return yPos;
  }

  private addExpensesDetail(doc: jsPDF, expenses: ProjectExpense[]): void {
    // Título de página
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 150, 243);
    doc.text('DETALLE DE GASTOS', 15, 30);



    // Preparar datos de gastos
    const expenseData = expenses.map(expense => [
      this.formatDate((expense as any).expenseDate),
      expense.description,
      EXPENSE_CATEGORY_LABELS[expense.category],
      this.formatCurrency(expense.amount)
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
      body: expenseData,
      theme: 'grid',
      headStyles: { 
        fillColor: [33, 150, 243],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      }
    });

    // Resumen al final de la tabla
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(240, 240, 240);
    doc.rect(15, finalY, 180, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL DE GASTOS:', 20, finalY + 10);
    doc.text(this.formatCurrency(totalExpenses), 175, finalY + 10, { align: 'right' });
  }

  private addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 280, 195, 280);
      
      // Texto del pie
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('Generado por ArquiTrack - Sistema de Gestión de Proyectos Arquitectónicos', 15, 287);
      doc.text(`Página ${i} de ${pageCount}`, 195, 287, { align: 'right' });
      
      // Fecha y hora de generación
      const now = new Date();
      const timestamp = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR')}`;
      doc.text(`Generado el: ${timestamp}`, 105, 292, { align: 'center' });
    }
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });
  }

  private formatDate(dateString: string | undefined | null): string {
    try {
      // Si dateString es null, undefined o string vacío
      if (!dateString || dateString === null || dateString === undefined || dateString === '') {
        return 'Sin fecha';
      }
      
      // Convertir a string
      const dateStr = String(dateString).trim();
      
      // Crear objeto Date
      const date = new Date(dateStr);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateString);
        return 'Fecha inválida';
      }
      
      // Formatear a dd/MM/yyyy
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'Fecha original:', dateString);
      return 'Error en fecha';
    }
  }
} 