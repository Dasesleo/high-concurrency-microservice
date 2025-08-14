# DECISIONES

- Stack: Java 17 + Spring Boot 3 para rapidez de desarrollo y buen soporte concurrente.
- Arquitectura: separación Controller (HTTP) ↔ Servicio (lógica de negocio) ↔ Repositorio en memoria.
- Concurrencia: uso de `ReentrantLock` por cuenta con ordenamiento fijo de adquisición para evitar deadlocks; región crítica mínima para reducir contención.
- Almacenamiento: `ConcurrentHashMap` para saldos (`Long`) y mapa de claves procesadas para idempotencia.
- Idempotencia: cada transferencia se asocia a una `key`; si la key ya existe, se ignora sin afectar saldos.
- Validaciones: no permitir montos negativos ni transferencias si no hay saldo suficiente; sin saldos negativos finales.
- `/reset` reinicia cuentas, saldos e historial de keys.
- Operaciones en tiempo constante (O(1)) para garantizar baja latencia bajo alta concurrencia.
- Docker multi-stage build para minimizar imagen final; `docker-compose` con healthcheck y k6.
- Supuesto: almacenamiento solo en memoria (sin persistencia en disco) dado el alcance de la prueba.
- Observación: el umbral `invariants_ok` en k6 no se cumple por diseño del script (solo incrementa una vez en teardown), pero la consistencia final está garantizada.
