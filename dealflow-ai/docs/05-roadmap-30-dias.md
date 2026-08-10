# 05 — Roadmap de desarrollo: MVP funcional en 30 días

## Alcance brutal del MVP (lo que NO entra)

Fuera de la v1: app nativa, Instagram (entra en fase 2; WhatsApp primero — es donde está el dinero), multi-idioma, white-label, API pública, reportes avanzados, editor visual de flujos. **El MVP es: conectar WhatsApp → el agente responde con los datos del negocio → agenda o cobra → el dueño ve todo y puede intervenir.**

Equipo asumido: 1–2 desarrolladores full-time. Si eres solo tú: mismas semanas, recortando la bandeja en vivo a *polling* y usando Cal.com en lugar de integración propia de calendario.

---

## Semana 1 — Fundaciones y el "hello world" del canal

**Objetivo de la semana: un mensaje de WhatsApp entra, la IA responde. Fin.**

- **D1–2:** Monorepo (Turborepo: `apps/web`, `apps/api`, `packages/shared`). Next.js + NestJS + Postgres (Supabase) + Redis (Upstash) desplegados desde el día 1 (Vercel + Railway). Auth (Supabase Auth o Clerk). Esquema de BD núcleo con RLS multi-tenant.
- **D3–4:** App de Meta en modo dev, WhatsApp Cloud API con número de prueba. Webhook con verificación de firma + deduplicación + encolado BullMQ. Envío de mensajes salientes por Graph API.
- **D5–7:** Worker `agent-turn` v0: system prompt fijo + Claude Sonnet, sin tools todavía. Debounce de mensajes. Persistencia de conversaciones/mensajes. **Checkpoint: chateas con tu bot desde tu WhatsApp personal.**

## Semana 2 — El cerebro: RAG, tools y árbol de ventas

**Objetivo: el agente vende con los datos de UN negocio real (tuyo o de un amigo — primer cliente piloto).**

- **D8–9:** Pipeline de conocimiento: formulario de onboarding (servicios, precios, FAQs, horarios, tono) → chunking → embeddings → pgvector. Tool `buscar_conocimiento`.
- **D10–11:** Clasificador de intents con Haiku + máquina de estados de fases (descubrimiento → calificación → propuesta → cierre). Prompts por fase. Guardrails (no inventar precios, escalamiento, prompt injection).
- **D12–13:** Tools de negocio: `consultar_disponibilidad` + `agendar_cita` vía **Cal.com API** (gratis, se integra en horas, sincroniza con Google Calendar — no construir calendario propio en el MVP). Recordatorios de cita (jobs programados).
- **D14:** Stripe Connect (Standard) OAuth por tenant + tool `crear_link_de_pago` + webhook `checkout.session.completed` → tabla `payments`. **Checkpoint: una conversación completa termina en cita agendada o link de pago pagado.**

## Semana 3 — El producto: dashboard, onboarding y seguimientos

**Objetivo: un dueño de negocio se registra y se conecta SOLO, sin que lo ayudes.**

- **D15–16:** Dashboard: bandeja de conversaciones en vivo (WebSocket), vista de conversación, botón **"Tomar control" / "Devolver al bot"** (el killer feature de confianza), notificación push (PWA) al escalar.
- **D17–18:** Onboarding self-service: wizard de 5 pasos (negocio → servicios/precios → tono → conectar WhatsApp con Embedded Signup → probar al agente en un sandbox de chat antes de activarlo).
- **D19–20:** Motor de follow-ups: secuencias post-conversación (45 min / 22 h), plantillas HSM registradas en Meta para reactivación +3d/+7d, recuperación de no-show y de link de pago no pagado.
- **D21:** Panel de métricas mínimo: **ventas rescatadas ($)**, conversaciones atendidas, citas agendadas, tiempo de respuesta. Es el panel de retención — merece el día entero.

## Semana 4 — Cobrar, endurecer y lanzar

**Objetivo: 5 negocios piloto reales usando el producto y pagando (aunque sea con descuento fundador).**

- **D22–23:** Stripe Billing: los 3 planes, Checkout, Customer Portal, trial de 14 días, contadores de conversaciones/mes con límites por plan.
- **D24–25:** Endurecimiento: rate limits por tenant, kill-switch "pausar bot", auditoría `agent_actions` visible en el dashboard ("qué hizo la IA y por qué"), manejo de caídas de Meta/LLM (colas con reintento), opt-out automático.
- **D26–27:** **App Review de Meta** (permisos `whatsapp_business_messaging`, business verification) — empezar el trámite YA porque tarda días; mientras tanto los pilotos corren con números en modo dev. Test E2E del flujo crítico completo.
- **D28–29:** Onboarding white-glove de 5 pilotos reales (del pipeline de demos espejo — el GTM corre en paralelo desde la semana 2). Iterar prompts con conversaciones reales: aquí se gana la "hiper-realidad" del agente.
- **D30:** **Lanzamiento fundadores**: landing con video de demo espejo, oferta −40% de por vida para 50 cupos, casos de los pilotos. Publicar en comunidades del vertical.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| App Review de Meta se atrasa | Iniciarlo en semana 1 (verificación de negocio) y semana 4 (permisos); pilotos funcionan en modo dev con números de prueba mientras tanto |
| El agente alucina precios | Precios solo vía tools; test suite de conversaciones sintéticas por vertical antes de cada deploy de prompts |
| Costo de LLM se dispara | Prompt caching, Haiku para clasificación, tope de turnos por conversación, límites por plan |
| Ventana de 24 h rompe follow-ups | Plantillas HSM aprobadas desde semana 3 (aprobación tarda ~24-48 h) |
| Scope creep | Este documento es el contrato: lo que no está en el MVP, no entra hasta el cliente 20 |

## Fase 2 (post-30 días, ordenado por demanda esperada)

1. Instagram DM (misma arquitectura de canal, adapter nuevo).
2. App móvil Expo (la PWA ya validó qué pantallas importan).
3. Editor de personalidad del agente + biblioteca de plantillas por vertical.
4. Panel multi-cuenta para agencias partner (motor del canal de referidos).
5. Reportes avanzados + API pública (plan Scale).
