# Despliegue y administración de contenido

Sitio **estático** (HTML/CSS/JS, sin build). Todas las rutas son **relativas**, así
que funciona igual en un subdirectorio (GitHub Pages) o en un dominio raíz
(Netlify, Vercel, Cloudflare Pages, hosting propio).

---

## Estado actual

- **GitHub Pages** — solo vitrina de avances: https://wflores97.github.io/floresserna-group/
- El panel de administración (`/admin`) **todavía no inicia sesión aquí** (GitHub Pages
  no tiene Identity). Se activa al mover el sitio al host final. El sitio público
  funciona perfecto mientras tanto.

---

## Host recomendado: Netlify  (panel sin servidor extra)

Es la opción más cómoda para que alguien no técnico publique boletines.

### 1. Publicar el sitio
1. Entra a app.netlify.com → **Add new site → Import an existing project**.
2. Conecta el repo `WFlores97/floresserna-group`.
3. Build command: *(vacío)* · Publish directory: `.` (ya está en `netlify.toml`).
4. Deploy. Cada `git push` vuelve a desplegar solo.

### 2. Activar el panel de administración (Decap CMS)
1. En el sitio de Netlify → **Site configuration → Identity → Enable Identity**.
2. **Identity → Services → Git Gateway → Enable**.
3. **Identity → Registration**: ponlo en *Invite only* (recomendado).
4. **Identity → Invite users** → invita tu correo. Te llega un email; aceptas y creas contraseña.
5. Entra a `https://TU-SITIO/admin/` → inicia sesión → ya puedes agregar publicaciones y subir PDFs.

> Para que el enlace de invitación te redirija solo al panel, añade esto antes de
> `</body>` en `index.html` (opcional):
> ```html
> <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
> <script>
>   if (window.netlifyIdentity) {
>     window.netlifyIdentity.on("init", u => {
>       if (!u) window.netlifyIdentity.on("login", () => { location.href = "/admin/"; });
>     });
>   }
> </script>
> ```

### 3. Dominio floresserna.com
En Netlify → **Domain management** → agrega el dominio y sigue las instrucciones de DNS
(en Cloudflare). Netlify emite el certificado HTTPS automáticamente.

---

## Alternativas de host

| Host | Sitio | Panel `/admin` |
|------|-------|----------------|
| **Netlify** ⭐ | auto en push | Identity + Git Gateway (sin código) |
| **Vercel** | auto en push | backend `github` + OAuth (cambia `config.yml`) |
| **Cloudflare Pages** | auto en push | backend `github` + Cloudflare Worker OAuth |
| **GitHub Pages** (actual) | auto en push | igual que Cloudflare (Worker OAuth) |
| **Hosting propio (cPanel/FTP)** | subir la carpeta | mejor backend `github` + OAuth |

Para cualquier host **sin** Netlify Identity, en `admin/config.yml` se cambia el bloque
`backend` a `github` (ya está comentado ahí como referencia) y se agrega un relay OAuth.

---

## Cómo se administran las publicaciones

- Las tarjetas de **"Análisis y publicaciones"** se leen de `data/medios.json`.
- Desde `/admin` (una vez activo) agregas/editas entradas con un formulario y subes PDFs
  (se guardan en `assets/boletines/`). Al guardar, se hace commit y el sitio se actualiza.
- Sin panel, también puedes editar `data/medios.json` a mano: copia un bloque, cambia
  fuente / fecha (`YYYY-MM-DD`) / título / resumen / pdf, y `git push`.

## Publicar cambios manualmente
```bash
git add -A && git commit -m "mensaje" && git push
```
