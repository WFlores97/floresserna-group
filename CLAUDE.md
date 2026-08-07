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
  El hero suma dos valores propios: `--sala #06060a` (más negro que la tinta, para
  que las barras del obturador se lean como ausencia) y `--proyeccion #ece6d9`.
- **Tipografía:** Manrope (display y cuerpo), Space Mono (etiquetas y numerales).
  **Archivo** se carga sólo para el wordmark del hero, y se eligió por tener eje
  `wdth` variable: el titular ensancha con el scroll.
- **Pieza central:** el índice numerado 01–08 de divisiones en la portada.
  Ver «El índice de Divisiones» más abajo.

### El hero — «el encuadre»

Escenario pegajoso (`.reel`) de 240vh. Un solo valor de progreso 0→1 mueve tres cosas:
el obturador, el eje `wdth` del titular y el acercamiento de la toma. El obturador
**no** abre de forma continua: abre en dos cortes (2.39:1 → 1.90:1 → 1.43:1), como un
cambio de formato en proyección, y por eso la lectura de encuadre de la esquina dice
la verdad. Los cortes de toma caen en los mismos puntos.

El titular no sólo ensancha: **se acopla en registro**. Cada renglón tiene su propio
tramo (`LOCK` en `main.js`), encabalgado sobre los cortes del obturador — FLORES con
el primero, SERNA con el segundo, GROUP con el tercero. Acoplarse es ensanchar el eje
`wdth`, volver al margen izquierdo desde una escalera, subir de intensidad y dejar que
el fantasma dorado (un contorno, `-webkit-text-stroke` en `.reel__reg::before`)
converja sobre la letra. El desplazamiento del fantasma es **sólo lateral**: en
diagonal leería como sombra en relieve y chocaría con el renglón de abajo.

La entrada de carga vive en `.reel__word` y el registro en `.reel__reg`, un nivel más
adentro, porque las dos son la misma propiedad `transform` y se pisarían.

`main.js` escribe `--k`, `--push`, `--tk` y `--foot` sobre `.reel`, y `--l` y `--wdth`
por renglón, en cada cuadro. **Los valores por omisión en CSS son el estado abierto**, así que sin JS la
portada se ve terminada. El estado inicial de la entrada vive detrás de `.js`, clase
que agrega un `<script>` en línea del `<head>`; sin esa guarda el titular quedaría
invisible cuando no hay JavaScript. Con `prefers-reduced-motion` el recorrido pegajoso
desaparece (`height:auto`) para no dejar scroll muerto.

`body` usa `overflow-x:clip` (no `hidden`): `hidden` convierte a body en contenedor de
scroll y rompe el `position:sticky` del hero.
- El CSS específico de las subpáginas vive en el bloque `PÁGINAS DE DIVISIÓN` de
  `styles.css`; el de los documentos legales, en `PÁGINAS LEGALES`. Éstos reusan el
  `.dhero` de las divisiones pero **sin `.reveal`**: un texto legal se consulta, y a
  veces se llega a media página desde otro enlace, así que no debe aparecer con el
  scroll.

### El índice de Divisiones — «el visor»

Ocho filas a ancho completo con su descripción medían casi dos pantallas. El índice
se parte ahora en dos: a la derecha las ocho filas reducidas a un renglón (sólo
número y nombre) y a la izquierda un **visor** pegajoso, una sola placa 4:5 que
cambia de toma con la fila activa. La sección bajó de ~1 840 px a ~1 305 px en
escritorio, y el índice solo, de 1 118 px a 584 px.

Las filas quedaron **parejas a propósito**: se les quitaron las siglas (FS&A, RIFS,
CIFS, CDI-FS) y la etiqueta de disciplina, y la 02 se acortó a «Consultoría
Financiera» — el nombre completo se iba a dos renglones. Con la columna libre el
nombre volvió a crecer a 1.75rem y los ocho miden exactamente un renglón. Las siglas
siguen en el titular de cada página de división, y el nombre largo, en el pie.

El visor **no tiene texto propio**: `main.js` le copia el número y la descripción de
la fila activa, y por eso va `aria-hidden` — un lector de pantalla ya las leyó al
pasar por la fila. La descripción sigue viviendo en su `<p>` del índice,
que arriba de 1025 px se vuelve invisible pero legible (`clip-path`), nunca
`display:none`. El corte entre placas es el del hero — opacidad lineal y corta, no
disolvencia — con un acercamiento largo detrás; el pie de texto sí se funde, porque
un corte seco de texto al lado de una placa fundida se lee como error de sincronía.
`--crop` (una variable en línea por imagen, como `--i`) fija el encuadre de cada
placa. `plate-magis.jpg` es la única que retrata a su división — el original en
`Fotos/` trae el logotipo de Magis Fidem impreso abajo y se le recortó esa franja
porque caía justo sobre el HUD del visor. Las demás son tomas genéricas, y como no
alcanzan para ocho, la del archivo se repite en la 08 con el encuadre contrario.

`.visor__desc` lleva `min-height` de 3.25em, que son los dos renglones de la
descripción más larga a ese ancho: sin ese piso el pie brinca al cambiar de fila.
Es un número medido, así que si se alargan las descripciones hay que rehacerlo.

Debajo de 1025 px no cabe el visor al lado, así que desaparece y manda la
**miniatura** de cada fila — el mismo archivo y el mismo `--crop`, así que no cuesta
una descarga extra. Ahí las descripciones vuelven a ser visibles. Sin JS pasa lo
mismo a cualquier ancho: `.divs` sigue siendo un bloque, salen las miniaturas y las
descripciones, y el visor nunca aparece.

### El mapa de Presencia — «la línea del día»

`assets/img/world.svg` se generó desde el GeoJSON de Natural Earth (110m countries). La
proyección quedó verificada y es exacta: **lienzo equirectangular de 2000×1000 con la
costura en lon −20°**, de modo que

```
X = mod(lon + 20, 360) / 360 * 2000        Y = (90 - lat) / 180 * 1000
```

El `viewBox` del archivo (`416.7 122.2 1472.2 700`) es una ventana sobre ese lienzo.

Encima va un `<svg>` que **comparte ese sistema de coordenadas** y dibuja el terminador
solar real, calculado con la fórmula de baja precisión del Astronomical Almanac
(`solar()` en `main.js`, contrastada contra los cuatro solsticios y equinoccios: error
por debajo de 0.2°). El hemisferio a oscuras se apaga y el terminador se traza en oro.
Se redibuja cada minuto. Los relojes de cada plaza usan zonas IANA reales y el punto se
llena cuando ahí el sol está sobre el horizonte — el mismo cálculo, así que el mapa y
las listas nunca se contradicen.

La barra que iba encima del mapa («Luz solar en tiempo real» / «N de 5 plazas con luz»)
se retiró; el terminador y los relojes siguen vivos, sólo que ya no se anuncian. El aire
que daba esa barra lo pone ahora el `margin-top` de `.mapstage`.

**Los pines se colocan desde latitud/longitud reales** (`PLAZAS` y `OFICINAS_MX` en
`main.js`), no desde porcentajes escritos a mano como antes.

`calcVB()` deriva el alto de la ventana visible de la proporción real del contenedor
(`VB.h = VB.w / proporción`), porque el `<img>` se recorta por abajo con `cover`. Por eso
la sección puede ser 2.39:1 en escritorio y 2.103:1 en móvil sin que los pines se
despeguen de la geografía. **La proporción del contenedor nunca debe bajar de 2.103**
(la nativa de la imagen): por debajo, `cover` recortaría a lo ancho y el modelo se rompe.

Sin JS no hay terminador ni relojes, así que los relojes se ocultan (viven detrás de
`.js`) en vez de quedarse en un guion.

Debajo del mapa quedan dos columnas: las sedes (CDMX y San Pedro) y las plazas
internacionales. **El listado de las oficinas de México se retiró**, así que los doce
pines chicos (`OFICINAS_MX` en `main.js`) ya no tienen contraparte en texto y el mapa es
`aria-hidden`: la afirmación accesible que las cubre es la entrada de la sección
(«oficinas en las principales ciudades de la República Mexicana») y el titular «Más de
quince oficinas». Si alguna vez hay que nombrarlas, ese listado es lo que hay que
reponer.

### Medios & Boletín — dos bloques, dos archivos

La sección 04 se parte en dos bloques con la misma pieza editorial que separa todo lo
demás (rótulo a la izquierda, nota en versalitas a la derecha, hilo debajo):

- **Publicaciones** — `#mediosGrid`, alimentado por `data/medios.json`. Cada tarjeta
  admite una `imagen` de portada **opcional**, recortada a 16:10; sin ella la tarjeta
  queda de puro texto, que es como se veía antes. Por eso el relleno vive en
  `.post__body` y no en `.post`: la imagen tiene que llegar a sangre.
- **Boletín** — `#boletinesGrid`, alimentado por `data/boletines.json`. Las portadas van
  en **1:1.414, o sea A4**, que es el formato del PDF: así la portada cabe entera y no
  se recorta, que es la única manera de que una portada se lea como portada.

Los dos traen su respaldo estático escrito en el HTML, así que un `fetch` que no llega
deja la sección como está en vez de vaciarla. Lo que `main.js` inserta **no lleva
`.reveal`**: el IntersectionObserver ya corrió cuando el fetch resuelve, así que una
tarjeta con esa clase se quedaría invisible para siempre.

**Mientras un boletín no tenga `portada` subida, se dibuja una portada tipográfica**
(`.bol__ph`) con la paleta de la casa — número, hilo dorado, el tema entre comillas y la
edición al pie. No es un hueco de relleno: es la misma portada dicha en tipografía, para
que la sección no enseñe un agujero. En cuanto se sube la imagen desde el panel, el
`<img>` la sustituye y `.bol__ph` deja de dibujarse.

`admin/config.yml` tiene una colección **Boletín** aparte de la de publicaciones, y las
dos guardan sus archivos en `assets/boletines/`.

## Datos de contacto reales

`contacto@floresserna.com` · `+52 55 4824 5744`

## Pendientes

- Enlaces reales de los artículos de la sección Medios (`pdf`, `url` e `imagen` vacíos
  en `data/medios.json`; ya se pueden llenar desde el panel)
- **Portadas y PDFs del boletín.** `data/boletines.json` tiene las tres ediciones de
  2024 con su número, fecha y tema, pero `portada` y `pdf` están vacíos: las portadas
  reales viven todavía en el WordPress de floresserna.com. Mientras tanto se dibuja la
  portada tipográfica. Al subirlas desde el panel (van a `assets/boletines/`), la
  imagen entra sola y la tarjeta se vuelve un enlace al PDF.
- **Validar los documentos legales.** `legal/aviso-de-privacidad.html` y
  `legal/terminos.html` existen y están enlazados desde el pie de las nueve páginas,
  pero son **borradores**: llevan `noindex` y marcadores `.legal__pend` en oro sobre
  cada dato que sólo la firma puede confirmar (razón social, RFC, domicilio, correo
  del área de datos, transferencias internacionales, plazos ARCO, autoridad vigente).
  Al aprobarlos hay que sustituir los marcadores, borrar el bloque `.legal__draft` y
  quitar el `noindex`. **El aviso de privacidad es requisito de la LFPDPPP y bloquea
  la migración del dominio.**
- Canonical o `noindex` en las copias de Netlify y GitHub Pages cuando floresserna.com
  entre, para no repartir el posicionamiento entre tres URLs idénticas
