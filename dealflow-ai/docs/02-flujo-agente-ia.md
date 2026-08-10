# 02 — Flujo crítico del Agente de IA

## 1. Arquitectura del turno conversacional

Cada mensaje entrante dispara un **turno del agente** con dos etapas de modelo:

1. **Clasificador (claude-haiku-4-5, ~200 ms, centavos):** etiqueta el mensaje con `intent`, `sentimiento`, `urgencia` y `señal_de_compra (0–100)`. Barato, corre en cada mensaje.
2. **Conversador (claude-sonnet-5 con tool use):** genera la respuesta usando el estado de la conversación, el RAG del negocio y las herramientas. Solo corre cuando hay que responder (post-debounce).

**Estado persistente por conversación** (Redis + Postgres):
```json
{
  "fase": "descubrimiento | calificacion | propuesta | objecion | cierre | postventa",
  "intent_actual": "precio",
  "servicio_de_interes": "limpieza dental",
  "datos_capturados": { "nombre": "Ana", "preferencia_horario": "tardes" },
  "objeciones_vistas": ["precio_alto"],
  "intentos_de_cierre": 1,
  "score_lead": 72
}
```
El estado hace que el agente **avance** la venta en lugar de contestar preguntas sueltas: cada respuesta termina con el siguiente paso de la fase en la que está.

## 2. Árbol de decisión maestro

```
MENSAJE ENTRANTE
│
├─ ¿Conversación en modo HUMANO? ──► no responder; notificar al dueño
├─ ¿Opt-out ("no me escribas")? ──► confirmar baja, marcar contacto, FIN
├─ ¿Tema prohibido / legal / médico / enojo fuerte? ──► escalar_a_humano()
│
└─ CLASIFICAR INTENT
   │
   ├─ [PRECIO]        "Hola, precio" ─────────────► FLUJO A (abajo)
   ├─ [INFO/SERVICIO] "¿hacen X?"    ─────────────► responder con RAG + pivotar a calificación
   ├─ [AGENDAR]       "quiero cita"  ─────────────► FLUJO B
   ├─ [COMPRAR]       "cómo pago"    ─────────────► FLUJO C
   ├─ [OBJECIÓN]      "está caro"    ─────────────► manejo de objeciones (§4)
   ├─ [SOPORTE]       cliente existente ──────────► responder con RAG o escalar
   ├─ [RECONTACTO]    responde a follow-up ───────► retomar fase donde quedó
   └─ [OTRO/SPAM]     ──────────────► respuesta breve + recalificar en próximo mensaje
```

## 3. FLUJO A — Del "Hola, precio" al cierre (el flujo que paga el producto)

**Regla de oro: nunca soltar el precio "en seco".** El precio sin contexto mata la conversación. El agente responde el precio (transparencia = confianza) pero **envuelto en valor y con una pregunta que avanza**.

```
Cliente: "Hola, precio"
│
▼ Paso 1 — RESPUESTA INMEDIATA (< 5 s) + micro-calificación
Bot: "¡Hola! 👋 Claro que sí. Para darte el precio exacto:
      ¿es para [opción A] o [opción B]?"
      (opciones salen de services del tenant, máx. 2-3, formato botones si WhatsApp lo permite)
│
├─ Cliente responde ──► Paso 2
└─ Cliente no responde en 30 min ──► follow-up ligero dentro de ventana 24h
│
▼ Paso 2 — PRECIO CON VALOR (tool: buscar_conocimiento + services)
Bot: "Perfecto. La [servicio] cuesta $X e incluye [2-3 bullets de valor].
      La mayoría lo resuelve en [tiempo/sesiones]. ¿Te gustaría que te
      aparte un lugar esta semana? Tengo [slot1] y [slot2]." 
      (tool: consultar_disponibilidad — slots REALES, escasez honesta)
│
├─ "Sí" ────────────────► FLUJO B (agendar) o FLUJO C (pagar) según el negocio
├─ Objeción ────────────► §4
└─ Silencio ────────────► secuencia de seguimiento (§5)
```

**Decisión cierre-cita vs cierre-pago** (configurable por tenant en onboarding):
- Clínicas/servicios locales → cierre = **cita agendada** (con seña opcional vía Stripe para matar no-shows).
- Consultores/agencias → cierre = **llamada de diagnóstico agendada**.
- Productos/servicios de precio fijo → cierre = **link de pago directo**.

## 4. Manejo de objeciones (máx. 2 intentos, luego ofrecer alternativa)

| Objeción | Respuesta del agente |
|---|---|
| "Está caro" | Reencuadre de valor (costo de no resolver, comparación por día/uso) + opción de entrada más barata si existe. **Nunca** inventa descuentos: solo ofrece los configurados por el negocio. |
| "Lo voy a pensar" | Valida + pregunta aislante: "¿Es por el precio, los horarios u otra cosa?" → responde la real. |
| "¿Y la competencia?" | Diferenciadores del RAG, sin atacar a nadie. |
| "No tengo tiempo" | Ofrece el slot más conveniente + recordatorios automáticos. |
| 2 objeciones sin avance | Baja presión: "Te dejo la info y te escribo [día]. ¿Va?" → programa follow-up. |

## 5. Seguimiento automático (donde se rescatan las ventas perdidas)

```
Lead calificado que no cerró
├─ +45 min  (ventana 24h): "¿Te quedó alguna duda de X?"
├─ +22 h    (ventana 24h): último mensaje libre — mejor oferta de valor
├─ +3 días  (PLANTILLA HSM): "Hola {{nombre}}, ¿sigues interesado en {{servicio}}?"
│            [Sí, agendar] [Más info] [No, gracias]
├─ +7 días  (HSM): caso de éxito / novedad + CTA
└─ Sin respuesta ──► marcar frío; reactivación mensual opcional
```
- Cita agendada → confirmación inmediata + recordatorio 24 h y 2 h antes (reduce no-shows 40–60%).
- No-show → "¿Reagendamos? Tengo [slots]" automático.
- Link de pago no pagado en 2 h → recordatorio con el link (carrito abandonado).
- **Toda respuesta del cliente a un follow-up reabre la ventana de 24 h y devuelve al árbol maestro.**

## 6. Escalamiento a humano (el seguro del producto)

Dispara `escalar_a_humano(motivo)` cuando:
- El cliente lo pide explícitamente.
- Sentimiento muy negativo o queja formal.
- 2 intentos de cierre fallidos con lead de score alto (que lo remate el dueño).
- El agente no encuentra la respuesta en el RAG (jamás inventar).
- Tema fuera de límites (médico/legal/reembolsos por encima del monto configurado).

Efecto: conversación pasa a modo `humano`, push al dueño (PWA/WhatsApp del dueño), el bot calla hasta que el humano devuelva el control con un botón "Devolver al bot". **Handoff visible = confianza del dueño en el producto.**

## 7. Ejemplo de definición de tools (contrato con Claude)

```typescript
const tools = [
  {
    name: "consultar_disponibilidad",
    description: "Slots reales disponibles para un servicio. Úsala SIEMPRE antes de ofrecer horarios.",
    input_schema: z.object({
      servicio_id: z.string(),
      rango: z.enum(["hoy", "manana", "esta_semana", "proxima_semana"]),
    }),
  },
  {
    name: "crear_link_de_pago",
    description: "Genera link de Stripe Checkout del negocio para un servicio configurado. NUNCA con montos inventados.",
    input_schema: z.object({ servicio_id: z.string() }),
  },
  {
    name: "agendar_cita",
    input_schema: z.object({
      servicio_id: z.string(),
      slot_iso: z.string(),
      nombre_cliente: z.string(),
    }),
  },
  { name: "buscar_conocimiento", input_schema: z.object({ query: z.string() }) },
  { name: "escalar_a_humano", input_schema: z.object({ motivo: z.string() }) },
];
```

El system prompt se compone por tenant: `identidad + tono del negocio + reglas duras + fase actual + resumen de la conversación + chunks RAG`. Los precios y horarios **solo** pueden venir de tools — si no está en el RAG/tools, el agente dice "déjame confirmarlo" y escala.
