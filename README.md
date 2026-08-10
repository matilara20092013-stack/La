# Lara Global Export

Aplicación web para el negocio de exportación de productos a Europa. Dos páginas:

- **`index.html`** — página pública para clientes: Quiénes somos, Servicios, Cómo
  funciona, chat con **LIA** (recepcionista inteligente) y Donaciones ($5 – $1,000 USD).
- **`admin.html`** — panel **privado** solo para Luigi: chat con LIA para recibir
  avisos de clientes nuevos y controlar la fila de espera.

## LIA — la recepcionista inteligente

- El cliente habla con LIA en la página pública; ella toma su nombre y su mensaje
  y lo entrega al Gmail de Luigi (asunto: «LIA — Nuevo cliente»).
- En el panel privado, LIA avisa: «🔔 Hay un cliente que quiere trabajar contigo».
- Si Luigi le dice **«ocupado»**, los siguientes clientes ven:
  «Por favor espere a que le atendamos», y LIA avisa a Luigi de cada uno.
- Cuando Luigi le dice **«disponible»**, LIA les dice a los que esperan
  «Ya podemos atenderle» y les muestra el formulario de contacto.

### Puesta en marcha del panel (una sola vez)

1. Abre `admin.html` en tu sitio publicado. Código de acceso: **2026**
   (cámbialo en la línea `var ADMIN_PIN = "2026";` de `admin.html`).
2. Dile a LIA **«crear canal»**. Ella crea el canal de control y te muestra el
   **enlace para clientes** — ese es el link que debes compartir (incluye `#c=...`).
3. Listo: usa los botones «Ocupado» / «Disponible» o escríbeselo en el chat.

Nota: el canal usa un servicio gratuito (jsonblob.com). Si pasa más de un mes sin
ninguna visita, puede expirar; en ese caso dile a LIA «crear canal» otra vez y
comparte el enlace nuevo.

## Cómo publicar el sitio con GitHub Pages (gratis)

1. Entra a este repositorio en GitHub: `https://github.com/matilara20092013-stack/la`
2. Ve a **Settings** (Configuración) → **Pages** (menú izquierdo).
3. En **Source**, elige **Deploy from a branch**.
4. En **Branch**, selecciona la rama donde está `index.html` y la carpeta `/ (root)`. Guarda.
5. Espera 1–2 minutos. Tu sitio quedará en:
   **https://matilara20092013-stack.github.io/la/**

## Cómo activar el formulario de contacto (llega a tu Gmail)

El formulario usa [FormSubmit](https://formsubmit.co), que envía los mensajes
directamente a **luigilara@gmail.com** sin necesidad de servidor.

1. Publica el sitio (paso anterior) y envía un mensaje de prueba desde el formulario.
2. La **primera vez**, FormSubmit te mandará un correo a luigilara@gmail.com con un
   botón **"Activate Form"**. Haz clic para confirmarlo.
3. A partir de ahí, cada mensaje de un cliente (nombre, correo y mensaje) llegará
   a tu bandeja de Gmail automáticamente.

## Cómo activar las donaciones (llegan a tu cuenta ligada a tu Gmail)

Las donaciones usan **PayPal.Me**:

1. Crea una cuenta PayPal con el correo **luigilara@gmail.com** (si no la tienes).
2. Crea tu enlace en https://www.paypal.com/paypalme y anota tu usuario
   (por ejemplo `luigilara`).
3. Abre `index.html` y busca la línea:
   ```js
   var PAYPAL_ME_USER = "luigilara";
   ```
   Cambia `"luigilara"` por tu usuario real de PayPal.Me y guarda.
4. Los botones de $5, $25, $50, $100, $250, $500 y $1,000 (y el monto
   personalizado de 5 a 1000 USD) abrirán PayPal con el monto ya puesto, y el
   dinero se acredita a tu cuenta PayPal; PayPal te notifica cada pago por
   correo a tu Gmail.
