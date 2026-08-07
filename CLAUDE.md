# CLAUDE.md

Contexto del proyecto para Claude Code.

## Qué es

Sitio institucional de **Flores Serna Group**, consorcio multidisciplinario fundado por
el Dr. Marcelo Flores Serna. Reemplaza al sitio de WordPress de Flores Serna & Asociados
que aún corre en floresserna.com.

Idioma del sitio: **español (México)**. Todo el contenido, los commits y la documentación
van en español.

## Stack

Sitio estático puro: HTML + CSS + JavaScript vanilla. **Sin build, sin dependencias, sin
backend.** No hay npm install, no hay bundler, no hay framework. Los archivos que están en
el repo son exactamente los que se sirven.

```
index.html              Portada
divisiones/*.html       Una subpágina por cada una de las 8 divisiones
assets/css/styles.css   Hoja de estilos única
assets/js/main.js       Parallax y navegación
assets/img/             Logos, fotografía y el mapa mundial (world.svg)
```

**Todas las rutas internas son relativas** (`../assets/...`, `index.html#seccion`). Esto es
lo que permite que el sitio funcione bajo la subcarpeta `/floresserna-group/` de GitHub
Pages. No introducir rutas absolutas que empiecen con `/`.

## Desarrollo local

```bash
npx serve -l 4321
```

También está configurado en `.claude/launch.json` con el nombre `fsg-static`.

## Publicación — YA ESTÁ EN VIVO

- **URL:** https://wflores97.github.io/floresserna-group/
- **Repo:** `WFlores97/floresserna-group` (público — GitHub Pages en cuenta free lo exige)
- **Deploy:** `git push` a `main`. Pages reconstruye solo, sin workflow que mantener.
- `.nojekyll` está presente para que Pages sirva los archivos tal cual.
- `Fotos/` está en `.gitignore`: son los originales duplicados de `assets/img/`, no los
  referencia nada del sitio.

### Dominio pendiente de migrar

floresserna.com sigue apuntando al WordPress viejo. Para migrarlo: poner el dominio en
Settings → Pages → Custom domain, y en Cloudflare crear cuatro registros `A` del apex hacia
`185.199.108.153`, `.109.153`, `.110.153`, `.111.153` más un `CNAME` de `www` hacia
`wflores97.github.io`. El proxy de Cloudflare debe estar en "DNS only" hasta que GitHub
emita el certificado.

## Diseño

Sistema editorial "broadsheet × private banking", con un look comprometido (no hay modo
oscuro ni toggle de tema).

- **Paleta:** tinta `#100f0d`, papel crema `#f4efe3`, oro `#b9974f` / `#d8b381`.
  Son los hexes reales de marca, tomados de los SVG del logo.
- **Tipografía:** Fraunces (display), Inter (cuerpo), Space Mono (etiquetas y numerales).
- **Pieza central:** el índice numerado 01–08 de divisiones en la portada.
- El CSS específico de las subpáginas vive en el bloque `PÁGINAS DE DIVISIÓN` de
  `styles.css`.

### El mapa de Presencia

`assets/img/world.svg` se generó desde el GeoJSON de Natural Earth (110m countries) con una
proyección equirectangular y la costura en lon −20°, para que quede centrado en el Pacífico
(Asia a la izquierda, América a la derecha). Los pines son elementos HTML posicionados por
porcentaje calculado con esa misma proyección. La lista de oficinas debajo del mapa es la
fuente de verdad accesible.

## Datos de contacto reales

`contacto@floresserna.com` · `+52 55 4824 5744`

## Pendientes

- Enlaces reales de los artículos de la sección Medios (hoy están en `#`)
- **Aviso de privacidad** — requisito de la LFPDPPP, cerrar antes de migrar el dominio
- Términos y condiciones
