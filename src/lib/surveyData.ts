import type { Category, Question } from "@/types/survey";

export const categories: Category[] = [
  {
    id: "general",
    title: "1. Evaluación general",
    description: "Relevancia y resolución de retos",
    icon: "Puzzle"
  },
  {
    id: "e2e",
    title: "2. Flujo completo",
    description: "Visión end-to-end integrada",
    icon: "RefreshCw"
  },
  {
    id: "revenue",
    title: "3. Gestión de ingresos",
    description: "Acuerdos globales y contratos",
    icon: "TrendingUp"
  },
  {
    id: "expenses",
    title: "4. Control de egresos",
    description: "XML SAT, autorizaciones y pagos",
    icon: "Receipt"
  },
  {
    id: "reconciliation",
    title: "5. Conciliación bancaria",
    description: "Integración con bancos y tiempos",
    icon: "Building2"
  },
  {
    id: "cashflow",
    title: "6. Flujo de efectivo",
    description: "Proyección y liquidez",
    icon: "Waves"
  },
  {
    id: "tax",
    title: "7. Cumplimiento fiscal",
    description: "CFDI y contabilidad electrónica",
    icon: "FileText"
  },
  {
    id: "assets",
    title: "8. Activos fijos",
    description: "Control automatizado y depreciación",
    icon: "Package"
  },
  {
    id: "reporting",
    title: "9. Reporteo financiero",
    description: "Estados en tiempo real y drill-down",
    icon: "BarChart3"
  },
  {
    id: "priority",
    title: "10. Prioridad del proyecto",
    description: "Viabilidad y horizonte",
    icon: "Rocket"
  },
  {
    id: "closing",
    title: "11. Cierre estratégico",
    description: "Impacto final en la organización",
    icon: "MessageSquare"
  }
];

export const questions: Question[] = [
  // ========== 1. Evaluación general de la solución ==========
  {
    id: "gen-001",
    type: "choice",
    category: "general",
    text: "¿Qué tan relevante considera la solución presentada para mejorar su operación financiera?",
    options: [
      { value: "Muy relevante", label: "Muy relevante (impacto directo inmediato)" },
      { value: "Relevante", label: "Relevante (mejoras importantes)" },
      { value: "Parcialmente relevante", label: "Parcialmente relevante" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "gen-002",
    type: "choice",
    category: "general",
    text: "¿Qué tanto considera que SAP Business One puede resolver sus retos actuales?",
    options: [
      { value: "Resuelve completamente", label: "Resuelve completamente" },
      { value: "Resuelve en gran medida", label: "Resuelve en gran medida" },
      { value: "Resuelve parcialmente", label: "Resuelve parcialmente" },
      { value: "No es claro", label: "No es claro" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "gen-003",
    type: "open",
    category: "general",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    description: "Mencione cualquier funcionalidad o caso de uso que no sienta cubierto.",
    required: true,
    allowNotMyRole: true
  },

  // ========== 2. Flujo completo del dinero (end-to-end) ==========
  {
    id: "e2e-001",
    type: "choice",
    category: "e2e",
    text: "¿Qué valor le ve a tener el flujo completo del dinero integrado en un solo sistema?",
    options: [
      { value: "Muy alto", label: "Muy alto (crítico para la operación)" },
      { value: "Alto", label: "Alto" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "e2e-002",
    type: "choice",
    category: "e2e",
    text: "¿Qué tanto impacto tendría automatizar este flujo en su operación?",
    options: [
      { value: "Alto impacto", label: "Alto impacto (transformación total)" },
      { value: "Medio impacto", label: "Medio impacto" },
      { value: "Bajo impacto", label: "Bajo impacto" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "e2e-003",
    type: "open",
    category: "e2e",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 3. Gestión de ingresos (Acuerdos Globales) ==========
  {
    id: "rev-001",
    type: "choice",
    category: "revenue",
    text: "¿Qué tan valioso considera el manejo de contratos (acuerdos globales) dentro del sistema?",
    options: [
      { value: "Muy valioso", label: "Muy valioso" },
      { value: "Valioso", label: "Valioso" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rev-002",
    type: "choice",
    category: "revenue",
    text: "¿Qué impacto tendría la automatización de ingresos (intereses y comisiones)?",
    options: [
      { value: "Alto", label: "Alto (reduce errores y carga operativa)" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rev-003",
    type: "choice",
    category: "revenue",
    text: "¿Qué tanto valor aporta la trazabilidad completa del ingreso hasta el contrato?",
    options: [
      { value: "Crítico", label: "Crítico (auditoría / control)" },
      { value: "Importante", label: "Importante" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rev-004",
    type: "open",
    category: "revenue",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 4. Control de egresos ==========
  {
    id: "exp-001",
    type: "choice",
    category: "expenses",
    text: "¿Qué tan importante es para su operación validar XML contra SAT automáticamente?",
    options: [
      { value: "Crítico", label: "Crítico" },
      { value: "Importante", label: "Importante" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-002",
    type: "choice",
    category: "expenses",
    text: "¿Qué valor le ve a prevenir pagos duplicados de forma automática?",
    options: [
      { value: "Muy alto", label: "Muy alto" },
      { value: "Alto", label: "Alto" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-003",
    type: "choice",
    category: "expenses",
    text: "¿Qué impacto tendría implementar flujos de autorización digital?",
    options: [
      { value: "Alto", label: "Alto (control total)" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "exp-004",
    type: "open",
    category: "expenses",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 5. Conciliación bancaria ==========
  {
    id: "rec-001",
    type: "choice",
    category: "reconciliation",
    text: "¿Qué tan valiosa considera la conciliación bancaria automatizada?",
    options: [
      { value: "Muy valiosa", label: "Muy valiosa" },
      { value: "Valiosa", label: "Valiosa" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rec-002",
    type: "choice",
    category: "reconciliation",
    text: "¿Qué impacto tendría reducir tiempos de conciliación?",
    options: [
      { value: "Alto", label: "Alto (mejora operativa significativa)" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rec-003",
    type: "choice",
    category: "reconciliation",
    text: "¿Qué valor le ve a la integración directa con bancos?",
    options: [
      { value: "Crítico", label: "Crítico" },
      { value: "Importante", label: "Importante" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rec-004",
    type: "open",
    category: "reconciliation",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 6. Flujo de efectivo y liquidez ==========
  {
    id: "cash-001",
    type: "choice",
    category: "cashflow",
    text: "¿Qué tan importante es tener flujo de efectivo proyectado en tiempo real?",
    options: [
      { value: "Crítico", label: "Crítico para la operación" },
      { value: "Importante", label: "Importante" },
      { value: "Deseable", label: "Deseable" },
      { value: "No prioritario", label: "No prioritario" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "cash-002",
    type: "choice",
    category: "cashflow",
    text: "¿Qué impacto tendría mejorar la precisión del flujo proyectado?",
    options: [
      { value: "Alto", label: "Alto (mejor toma de decisiones)" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "cash-003",
    type: "open",
    category: "cashflow",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 7. Cumplimiento fiscal y contabilidad electrónica ==========
  {
    id: "tax-001",
    type: "choice",
    category: "tax",
    text: "¿Qué valor le ve a tener la contabilidad 100% integrada con CFDI?",
    options: [
      { value: "Crítico", label: "Crítico" },
      { value: "Importante", label: "Importante" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "tax-002",
    type: "choice",
    category: "tax",
    text: "¿Qué tan importante es automatizar validaciones contra SAT?",
    options: [
      { value: "Muy importante", label: "Muy importante" },
      { value: "Importante", label: "Importante" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "tax-003",
    type: "choice",
    category: "tax",
    text: "¿Qué impacto tendría mejorar la preparación ante auditorías?",
    options: [
      { value: "Alto", label: "Alto" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "tax-004",
    type: "open",
    category: "tax",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 8. Activos fijos ==========
  {
    id: "asset-001",
    type: "choice",
    category: "assets",
    text: "¿Qué tan relevante es el control automatizado de activos fijos?",
    options: [
      { value: "Muy relevante", label: "Muy relevante" },
      { value: "Relevante", label: "Relevante" },
      { value: "Poco relevante", label: "Poco relevante" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "asset-002",
    type: "choice",
    category: "assets",
    text: "¿Qué valor le ve a calcular depreciación contable y fiscal automáticamente?",
    options: [
      { value: "Muy alto", label: "Muy alto" },
      { value: "Alto", label: "Alto" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "asset-003",
    type: "open",
    category: "assets",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 9. Reporteo financiero ==========
  {
    id: "rep-001",
    type: "choice",
    category: "reporting",
    text: "¿Qué tan importante es contar con estados financieros en tiempo real?",
    options: [
      { value: "Crítico", label: "Crítico" },
      { value: "Importante", label: "Importante" },
      { value: "Deseable", label: "Deseable" },
      { value: "No prioritario", label: "No prioritario" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-002",
    type: "choice",
    category: "reporting",
    text: "¿Qué valor le ve al análisis detallado (drill-down) hasta póliza?",
    options: [
      { value: "Muy alto", label: "Muy alto" },
      { value: "Alto", label: "Alto" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-003",
    type: "choice",
    category: "reporting",
    text: "¿Qué impacto tendría mejorar la calidad y velocidad del reporteo?",
    options: [
      { value: "Alto", label: "Alto" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "rep-004",
    type: "open",
    category: "reporting",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 10. Prioridad del proyecto ==========
  {
    id: "prio-001",
    type: "choice",
    category: "priority",
    text: "¿Qué tan viable considera implementar esta solución en su organización?",
    options: [
      { value: "Alta viabilidad", label: "Alta viabilidad (listos para avanzar)" },
      { value: "Media", label: "Media (requiere análisis adicional)" },
      { value: "Baja", label: "Baja" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "prio-002",
    type: "choice",
    category: "priority",
    text: "¿En qué horizonte considerarían una implementación?",
    options: [
      { value: "Inmediato", label: "Inmediato" },
      { value: "3-6 meses", label: "3–6 meses" },
      { value: "6-12 meses", label: "6–12 meses" },
      { value: "No definido", label: "No definido" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "prio-003",
    type: "open",
    category: "priority",
    text: "¿Qué áreas de mejora en este proceso considera que tendría el sistema para UNICCO?",
    required: true,
    allowNotMyRole: true
  },

  // ========== 11. Cierre estratégico ==========
  {
    id: "clos-001",
    type: "choice",
    category: "closing",
    text: "¿Qué impacto tendría esta solución en su organización?",
    options: [
      { value: "Transformacional", label: "Transformacional" },
      { value: "Alto", label: "Alto" },
      { value: "Medio", label: "Medio" },
      { value: "Bajo", label: "Bajo" }
    ],
    required: true,
    allowNotMyRole: true
  },
  {
    id: "clos-002",
    type: "open",
    category: "closing",
    text: "Comentarios adicionales:",
    description: "Cualquier otra observación sobre la sesión o requerimientos no cubiertos.",
    required: false,
    allowNotMyRole: true
  }
];