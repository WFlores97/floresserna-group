# Flores Serna Group — Sitio web

Sitio institucional de **Flores Serna Group**, consorcio multidisciplinario fundado por
el Dr. Marcelo Flores Serna. Reemplaza al sitio anterior de Flores Serna & Asociados.

## Stack

Sitio estático puro: HTML + CSS + JavaScript. Sin build, sin dependencias, sin backend.

```
index.html              Portada
divisiones/*.html       Subpágina por cada una de las 8 divisiones
assets/css/styles.css   Hoja de estilos única
assets/js/main.js       Interacciones (parallax, navegación)
assets/img/             Logos, fotografía y mapa mundial (SVG)
```

## Desarrollo local

```bash
npx serve -l 4321
```

Y abrir <http://localhost:4321>.

## Publicación

Cada `git push` a `main` republica el sitio en GitHub Pages automáticamente.

- **Producción:** https://wflores97.github.io/floresserna-group/

## Divisiones

1. Flores Serna & Asociados — legal y fiscal
2. Consultoría Financiera
3. Relaciones Institucionales (RIFS)
4. Comunicación Institucional (CIFS)
5. Financiera Flores Serna
6. Centro de Investigación (CDI-FS)
7. Magis Fidem A.C.
8. Centro Cultural Floreser

## Pendientes

- [ ] Enlaces reales de los artículos en la sección Medios
- [ ] Aviso de privacidad (requisito LFPDPPP)
- [ ] Términos y condiciones
- [ ] Conectar el dominio `floresserna.com`
