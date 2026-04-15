---
title: Crear estructura de encuesta y sistema de navegación
status: in_progress
priority: urgent
type: feature
tags: [survey, navigation]
created_by: agent
created_at: 2026-04-15T16:32:52Z
position: 1
---

## Notes
Implementar la estructura base de la encuesta con navegación por secciones, barra de progreso y gestión de estado. Incluye las 7 categorías principales con preguntas cerradas y abiertas específicas para cada área.

## Checklist
- [x] Configurar design system (globals.css + tailwind.config.ts) con colores corporativos y fuentes Work Sans + Inter
- [ ] Crear tipos TypeScript para estructura de encuesta (preguntas, respuestas, secciones)
- [ ] Crear componente SurveyProgress con indicador visual de secciones completadas
- [ ] Crear componente QuestionCard con soporte para tipos: escala Likert, sí/no, texto abierto, opción "no es mi rol"
- [ ] Implementar página principal con navegación entre 7 secciones
- [ ] Crear contexto de estado para almacenar respuestas y progreso