import type { Category, Question } from "@/types/survey";

export const categories: Category[] = [
  {
    id: "revenue",
    title: "Gestión de Ingresos",
    description: "Contratos, intereses y comisiones",
    icon: "TrendingUp"
  },
  {
    id: "expenses",
    title: "Control de Egresos",
    description: "Validación XML SAT y pagos",
    icon: "Receipt"
  },
  {
    id: "reconciliation",
    title: "Conciliación Bancaria",
    description: "Automatización y control",
    icon: "Building2"
  },
  {
    id: "cashflow",
    title: "Flujo de Efectivo",
    description: "Proyecciones y análisis",
    icon: "Waves"
  },
  {
    id: "tax",
    title: "Cumplimiento Fiscal",
    description: "CFDI 4.0 y reportes SAT",
    icon: "FileText"
  },
  {
    id: "assets",
    title: "Activos Fijos",
    description: "Depreciación e inventario",
    icon: "Package"
  },
  {
    id: "reporting",
    title: "Reporteo Financiero",
    description: "Estados financieros y dashboards",
    icon: "BarChart3"
  }
];

export const questions: Question[] = [
  // ========== GESTIÓN DE INGRESOS ==========
  {
    id: "rev-001",
    type: "likert",
    category: "revenue",
    text: "¿El sistema gestiona contratos de crédito con cálculo automático de intereses?",
    description: "Evalúe la automatización en la gestión de contratos y generación de intereses",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rev-002",
    type: "likert",
    category: "revenue",
    text: "¿Se calculan y registran automáticamente las comisiones por operación?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rev-003",
    type: "boolean",
    category: "revenue",
    text: "¿Existe trazabilidad completa de cada ingreso desde su origen hasta el estado de cuenta?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rev-004",
    type: "likert",
    category: "revenue",
    text: "¿El sistema valida automáticamente que los ingresos correspondan a los contratos vigentes?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rev-005",
    type: "open",
    category: "revenue",
    text: "¿Qué funcionalidades relacionadas con la gestión de ingresos NO están cubiertas por su sistema actual?",
    description: "Describa procesos manuales, workarounds o áreas donde necesita mejorar",
    required: false,
    allowNotMyRole: true
  },

  // ========== CONTROL DE EGRESOS ==========
  {
    id: "exp-001",
    type: "likert",
    category: "expenses",
    text: "¿El sistema valida automáticamente los XML del SAT contra las facturas recibidas?",
    description: "Validación de CFDI recibidos",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-002",
    type: "likert",
    category: "expenses",
    text: "¿Existe un flujo de aprobación digital para pagos con múltiples niveles de autorización?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-003",
    type: "boolean",
    category: "expenses",
    text: "¿Se generan automáticamente las pólizas contables al registrar un egreso?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-004",
    type: "likert",
    category: "expenses",
    text: "¿El sistema permite programar pagos recurrentes y gestionar sus vencimientos?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-005",
    type: "boolean",
    category: "expenses",
    text: "¿Se integra el sistema con bancos para ejecutar pagos electrónicos?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-006",
    type: "open",
    category: "expenses",
    text: "¿Qué controles de egresos o validaciones NO realiza su sistema actual?",
    required: false,
    allowNotMyRole: true
  },

  // ========== CONCILIACIÓN BANCARIA ==========
  {
    id: "rec-001",
    type: "likert",
    category: "reconciliation",
    text: "¿El sistema concilia automáticamente los estados de cuenta bancarios vs registros contables?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rec-002",
    type: "multiple",
    category: "reconciliation",
    text: "¿Con qué frecuencia realizan la conciliación bancaria?",
    options: [
      { value: "daily", label: "Diaria" },
      { value: "weekly", label: "Semanal" },
      { value: "biweekly", label: "Quincenal" },
      { value: "monthly", label: "Mensual" },
      { value: "irregular", label: "Irregular/según necesidad" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rec-003",
    type: "likert",
    category: "reconciliation",
    text: "¿El sistema identifica y sugiere coincidencias entre movimientos bancarios y registros contables?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rec-004",
    type: "boolean",
    category: "reconciliation",
    text: "¿Se generan reportes automáticos de partidas en tránsito y pendientes de conciliar?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rec-005",
    type: "open",
    category: "reconciliation",
    text: "¿Qué desafíos enfrenta en el proceso de conciliación bancaria que su sistema no resuelve?",
    required: false,
    allowNotMyRole: true
  },

  // ========== FLUJO DE EFECTIVO ==========
  {
    id: "cash-001",
    type: "likert",
    category: "cashflow",
    text: "¿El sistema genera proyecciones de flujo de efectivo basadas en contratos y pagos programados?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "cash-002",
    type: "boolean",
    category: "cashflow",
    text: "¿Existe un dashboard en tiempo real del saldo de efectivo disponible?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "cash-003",
    type: "likert",
    category: "cashflow",
    text: "¿El sistema emite alertas cuando el flujo proyectado cae por debajo de umbrales definidos?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "cash-004",
    type: "boolean",
    category: "cashflow",
    text: "¿Se realiza análisis de variaciones entre flujo proyectado vs real?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "cash-005",
    type: "open",
    category: "cashflow",
    text: "¿Qué información o análisis de flujo de efectivo NO obtiene actualmente de forma automática?",
    required: false,
    allowNotMyRole: true
  },

  // ========== CUMPLIMIENTO FISCAL ==========
  {
    id: "tax-001",
    type: "likert",
    category: "tax",
    text: "¿El sistema genera y timbra CFDI 4.0 de forma automática?",
    description: "Facturación electrónica actualizada",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "tax-002",
    type: "boolean",
    category: "tax",
    text: "¿El sistema valida el cumplimiento de requisitos fiscales antes de timbrar?",
    description: "Validación de RFC, uso de CFDI, forma de pago, etc.",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "tax-003",
    type: "likert",
    category: "tax",
    text: "¿Se generan automáticamente los reportes y declaraciones fiscales requeridos por el SAT?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "tax-004",
    type: "boolean",
    category: "tax",
    text: "¿El sistema mantiene un histórico completo de CFDI emitidos y recibidos?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "tax-005",
    type: "open",
    category: "tax",
    text: "¿Qué procesos fiscales o de cumplimiento realiza manualmente que deberían automatizarse?",
    required: false,
    allowNotMyRole: true
  },

  // ========== ACTIVOS FIJOS ==========
  {
    id: "asset-001",
    type: "likert",
    category: "assets",
    text: "¿El sistema calcula automáticamente la depreciación de activos fijos?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "asset-002",
    type: "boolean",
    category: "assets",
    text: "¿Existe un inventario digital de activos fijos con su ubicación física?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "asset-003",
    type: "likert",
    category: "assets",
    text: "¿El sistema controla el ciclo completo del activo (adquisición, uso, baja)?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "asset-004",
    type: "boolean",
    category: "assets",
    text: "¿Se genera automáticamente la conciliación entre el registro contable y el inventario físico?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "asset-005",
    type: "open",
    category: "assets",
    text: "¿Qué aspectos de la gestión de activos fijos NO están digitalizados?",
    required: false,
    allowNotMyRole: true
  },

  // ========== REPORTEO FINANCIERO ==========
  {
    id: "rep-001",
    type: "likert",
    category: "reporting",
    text: "¿El sistema genera automáticamente estados financieros (Balance, Estado de Resultados, Flujo de Efectivo)?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-002",
    type: "multiple",
    category: "reporting",
    text: "¿Con qué periodicidad se generan los reportes financieros formales?",
    options: [
      { value: "realtime", label: "Tiempo real" },
      { value: "daily", label: "Diario" },
      { value: "weekly", label: "Semanal" },
      { value: "monthly", label: "Mensual" },
      { value: "quarterly", label: "Trimestral" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-003",
    type: "likert",
    category: "reporting",
    text: "¿Existe un dashboard ejecutivo con indicadores clave (KPIs) del negocio?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-004",
    type: "boolean",
    category: "reporting",
    text: "¿Los reportes se pueden personalizar y exportar en múltiples formatos (Excel, PDF)?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-005",
    type: "likert",
    category: "reporting",
    text: "¿El sistema permite análisis comparativos (período actual vs anterior, presupuesto vs real)?",
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-006",
    type: "open",
    category: "reporting",
    text: "¿Qué reportes o análisis financieros generan manualmente que deberían estar disponibles automáticamente?",
    required: false,
    allowNotMyRole: true
  }
];