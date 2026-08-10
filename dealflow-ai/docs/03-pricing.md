# 03 — Estrategia de Monetización B2B (Pricing SaaS)

## 1. Filosofía de pricing

- **Anclar al ROI, no al costo.** El discurso nunca es "cuesta $99": es "una sola venta rescatada paga el mes". El dashboard muestra **"Ventas rescatadas: $X este mes"** junto al precio del plan — el churn muere ahí.
- **Métrica de escala: conversaciones/mes** (una conversación = hilo con un contacto en un mes). Es fácil de entender, crece con el éxito del cliente y mapea directo a nuestro costo (LLM + Meta).
- Precio de referencia mental: un recepcionista/vendedor part-time cuesta $400–800/mes y no trabaja de noche. Todos los planes deben verse ridículamente baratos contra eso.

## 2. Los 3 planes

| | **STARTER** — "Nunca más un lead sin respuesta" | **GROWTH** — "Tu vendedor 24/7" ⭐ recomendado | **SCALE** — "Tu equipo de ventas IA" |
|---|---|---|---|
| Precio | **$49/mes** | **$149/mes** | **$399/mes** |
| Anual (2 meses gratis) | $490/año | $1,490/año | $3,990/año |
| Conversaciones/mes | 300 | 1,500 | 6,000 |
| Canales | 1 (WhatsApp **o** Instagram) | WhatsApp + Instagram | Todo + múltiples números/sucursales |
| Respuesta IA 24/7 con RAG del negocio | ✅ | ✅ | ✅ |
| Calificación y etiquetado de leads | ✅ | ✅ | ✅ |
| **Agendamiento automático** (Google Calendar/Cal.com) | — | ✅ | ✅ |
| **Cobro por chat** (Stripe del negocio) | — | ✅ | ✅ |
| Secuencias de seguimiento y recuperación (no-show, carrito) | Básico (1 follow-up) | ✅ Completo | ✅ Completo |
| Recordatorios de cita anti no-show | — | ✅ | ✅ |
| Usuarios del dashboard | 1 | 3 | Ilimitados |
| Reportes | Semanal por email | Dashboard en vivo | Dashboard + export + API |
| Personalización del agente | Plantilla por vertical | Tono y reglas custom | Multi-agente por sucursal/servicio, white-label parcial |
| Soporte | Email | Chat prioritario | Onboarding 1:1 + canal directo |
| Overage | — (upgrade forzado suave) | $10 por 100 conv. extra | $8 por 100 conv. extra |

**Trial:** 14 días del plan Growth con tarjeta (o 7 sin tarjeta), con el contador de "ventas rescatadas" activo desde el minuto 1 — el trial se vende solo.

## 3. Por qué esta estructura funciona

1. **Starter ($49) es el caballo de Troya:** precio de no-decisión ("menos que Netflix + Spotify") que mete el pie en la puerta, pero **sin agendamiento ni cobro** — el negocio ve al bot calificar leads que luego tiene que cerrar a mano, y el upgrade a Growth se vuelve obvio. Starter existe para convertir, no para retener.
2. **Growth ($149) es donde vive el negocio:** contiene el loop completo (responder → agendar → cobrar → seguir). Está anclado entre Starter (3×) y Scale para que parezca el punto racional. Objetivo: 70% de la base aquí.
3. **Scale ($399) captura a los ganadores** (clínicas con sucursales, agencias con volumen) y hace de ancla de precio: hace ver barato a Growth.
4. **El overage convierte el éxito del cliente en expansión de ingreso** (NRR > 100%) sin castigar: 100 conversaciones extra cuestan menos que una venta promedio.

## 4. Unit economics (por cliente Growth)

| Concepto | Estimado/mes |
|---|---|
| Ingreso | $149 |
| LLM (~1,000 conv. reales × ~8 turnos; Haiku clasifica, Sonnet responde) | $15–30 |
| Meta (conversaciones de servicio mayormente gratis; plantillas marketing/utility) | $5–15 |
| Infra prorrateada (hosting, DB, Redis) | $3–5 |
| **Margen bruto** | **~65–80%** |

Palancas de margen: cache de prompts (system prompt por tenant es estable → prompt caching de Claude recorta ~80% del costo de input), Haiku para todo lo que no sea la respuesta final, y límites de turnos por conversación.

## 5. Reglas comerciales

- Mensualidad sin permanencia; anual con 2 meses gratis (mejora cashflow y retención).
- Garantía de arranque: "Si en 30 días el agente no te genera al menos el valor de tu suscripción en ventas/citas, te devolvemos el mes." (Riesgo bajo: el contador de ventas rescatadas casi siempre supera $149.)
- Descuento fundadores: primeros 50 clientes, −40% de por vida (ver GTM) — crea urgencia y testimonios.
