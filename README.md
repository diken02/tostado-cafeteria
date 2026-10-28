# ☕ Tostado — Cafetería

Aplicación **frontend base** (solo UI, datos mock) para la cafetería Tostado. HTML + CSS + JS puro, sin dependencias, sin backend ni autenticación real.

## Pantallas
- `index.html` — Inicio / Login
- `admin.html` — Administración (dashboard)
- `inventario.html` — Inventario
- `menu.html` — Edición del menú
- `mesas.html` — Mesas
- `pos.html` — POS / Productos
- `reportes.html` — Reportes
- `empleados.html` — Empleados

## Ejecutar localmente
Opción 1: abre `index.html` directamente en el navegador.

Opción 2 (servidor local):
```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Diseño
- `css/styles.css`: variables globales (paleta café/crema/dorado), tipografía y componentes reutilizables (botones, cards, tablas, formularios, badges, barras). Responsive para escritorio y tablet.
- `js/app.js`: inyecta la barra lateral y la barra superior en las páginas internas.
