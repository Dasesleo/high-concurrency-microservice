# Prueba de Ingreso – Microservicio Performante + Carga con k6 (60 min)

Bienvenido/a a la **prueba técnica de ingreso**. Evaluaremos tu capacidad para diseñar, implementar y optimizar un microservicio concurrente y performante, así como tu claridad para estructurar un proyecto y comunicar decisiones técnicas.

> ⏱️ **Tiempo sugerido:** 60 minutos  
> 🧪 **Stack base:** Docker, k6 y cualquiera de estos lenguajes y frameworks: Java, Spring Boot, .NET Core, Python, Go
> 🧰 **Qué se te entrega:** Microservicio base + script k6 + Docker Compose + CI

---

## 🎯 Objetivo

Completar/optimizar el microservicio para soportar **transferencias concurrentes** entre cuentas con **idempotencia**, manteniendo **consistencia** y **performance** bajo carga. Debes **pasar los thresholds de k6** y mantener los invariantes al finalizar la prueba.

---

## 📜 Reglas y Alcance

- **Contrato HTTP (obligatorio):**
  - `GET /health` → 200 OK
  - `POST /reset` body opcional: `{ "accounts": number, "initialBalance": number }`
  - `GET /balances` → `{[accountId: string]: number}`
  - `POST /transfer`:
    ```json
    {"from":"A1","to":"A7","amount":5,"key":"unique-id-123"}
    ```
    - **Idempotente** por `key` (mismo `key` no debe aplicar dos veces).
    - **Sin saldos negativos**.
- **Concurrencia segura:** el código inicial es ingenuo y puede no ser thread-safe. Debes corregirlo.
- **Diseño:** separa responsabilidades (HTTP vs dominio). Si puedes, aplica interfaces y patrones simples (p.ej., Repositorio, Servicio de Dominio, Actor, etc.).
- **Performance:** pasa los thresholds definidos en `scripts/transfer_test.js`.
- **Entregables:** código funcional + breve explicación técnica en `DECISIONES.md`.

---

## ▶️ Ejecución local

Requisitos: Docker + Docker Compose.

```bash
docker compose up
```
Esto levantará el servicio `api` y, cuando esté healthy, ejecutará **k6** con 200 VUs por 30s contra `http://api:8080`.

Para parar:
```bash
docker compose down -v
```

---

## ✅ Criterios de Aceptación

1. **Correctitud bajo carga**
   - p95 de latencia < 200 ms (ajustable) y <1% de errores en k6.
   - **Invariante**: suma total de saldos == `accounts * initialBalance` al finalizar.
   - **0 saldos negativos**.
2. **Concurrencia e idempotencia**
   - Sin condiciones de carrera. Reintentos con misma `key` no duplican transferencias.
3. **Diseño y claridad**
   - Separación HTTP/domino; nombres claros; manejo de errores.
   - Explica tus decisiones en `DECISIONES.md` (máx. 10-15 líneas).
4. **Calidad técnica**
   - Organización del repo; scripts; uso correcto de Docker Compose.
   - (Opcional) tests unitarios rápidos para dominio.

---

## 🧪 k6 (carga)

- Script: `scripts/transfer_test.js`.
- Umbrales: ver `export const options` en el script.
- Métricas:
  - `http_req_failed` (<1%)
  - `http_req_duration` (p95 < 200ms)
  - `invariants/ok` (>99%)

> **CI:** El workflow de GitHub ejecuta un smoke test breve (menos VUs y menor duración) para validar que no rompas la base.

---

## 📝 Entrega

1. Realiza tu solución en una rama nueva o en un fork.
2. Documenta brevemente tus decisiones en `DECISIONES.md` (máx. 15 líneas).
3. Envía un PR o comparte el enlace al repo con tu commit final.

---

## 🧭 Sugerencias (no obligatorias)

- Sincronización: `sync.Mutex` / `RWMutex`; o **actor** con un canal único.
- Idempotencia: mapa protegido o caché con expiración.
- Minimiza lock contention (regiones críticas pequeñas).
- Valida entradas y maneja errores con códigos HTTP adecuados.
- Evita trabajo pesado en la ruta caliente del handler.

---

## 🧰 Estructura del repositorio

```
.
├─ .github/workflows/ci.yml
├─ docker-compose.yml
├─ Makefile
├─ README.md
├─ DECISIONES.md       # (plantilla para el/la candidato/a)
├─ EVALUACION.md       # cómo calificamos
├─ LICENSE
├─ scripts/
│  └─ transfer_test.js
└─ service-go/
   ├─ Dockerfile
   ├─ go.mod
   └─ cmd/api/main.go  # base ingenua a mejorar
```

¡Éxitos! Cualquier duda sobre el alcance, documenta tu supuesto en `DECISIONES.md`.
