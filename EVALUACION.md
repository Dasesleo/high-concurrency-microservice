# EVALUACIÓN – Rúbrica

Puntaje total: **100**

| Criterio                             | Puntos |
|-------------------------------------|:------:|
| Correctitud (invariantes cumplidos) |  30    |
| Concurrencia e idempotencia         |  25    |
| Performance (umbrales k6)           |  20    |
| Diseño y mantenibilidad             |  15    |
| Claridad en `DECISIONES.md`         |  10    |

**Aprobación sugerida:** ≥ 70 puntos.

Observaciones típicas:
- Locks mal ubicados o muy granulares producen contención o race conditions.
- Idempotencia parcial (registra key después de mutar estado → riesgo de duplicar).
- Falta de validación de entradas o códigos HTTP genéricos.
