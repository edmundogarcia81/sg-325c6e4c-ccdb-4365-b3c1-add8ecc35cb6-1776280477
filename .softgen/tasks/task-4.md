---
title: Actualizar estructura de encuesta para SAP Business One
status: done
priority: urgent
type: feature
tags: [content, survey]
created_by: agent
created_at: 2026-04-15T16:45:00Z
position: 4
---

## Notes
El usuario proporcionó una estructura específica de 11 secciones para evaluar SAP Business One para UNICCO. Cada sección tiene preguntas de opción múltiple personalizadas y una pregunta abierta estandarizada al final.

## Checklist
- [x] Actualizar `src/types/survey.ts` con las 11 nuevas categorías (general, e2e, revenue, expenses, reconciliation, cashflow, tax, assets, reporting, priority, closing)
- [x] Modificar `QuestionType` para soportar opciones de selección única (`choice`) en lugar de escala Likert
- [x] Actualizar `src/lib/surveyData.ts` con todas las preguntas y opciones literales proporcionadas
- [x] Ajustar `src/components/QuestionCard.tsx` para renderizar correctamente el tipo `choice`
- [x] Actualizar estado inicial en `src/contexts/SurveyContext.tsx`