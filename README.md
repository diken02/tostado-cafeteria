# ☕ Tostado — Cafetería

Aplicación de demostración para la cafetería Tostado, hecha con HTML, CSS y JavaScript puro, sin dependencias ni backend. Incluye menú para clientes y un panel de administración de demostración.

## Pantallas
- `index.html` — Inicio con enlaces al menú de clientes y al acceso de administración
- `menu-cliente.html` — Catálogo, carrito y registro local de pedidos
- `admin.html` — Resumen de administración
- `inventario.html` — Alta, edición, búsqueda y eliminación de insumos
- `menu.html` — Alta, edición y disponibilidad de productos
- `mesas.html` — Estado y cantidad de mesas
- `pos.html` — Punto de venta y registro de cobros de demostración
- `reportes.html` — Pedidos, totales y exportación CSV
- `empleados.html` — Alta, edición, búsqueda y eliminación de empleados

## Ejecutar localmente
Se recomienda usar un servidor local para que el menú, el carrito y la administración compartan el mismo almacenamiento:
```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```
También puedes abrir `index.html` directamente, pero el comportamiento de `localStorage` con archivos locales depende del navegador.

## Datos y limitaciones
- Los cambios se guardan en `localStorage` del navegador y no se sincronizan entre dispositivos.
- El carrito de clientes y el punto de venta registran pedidos de demostración; no realizan cobros.
- El acceso de administración es visual. No hay autenticación, permisos, backend ni protección de datos.
- El botón **Restablecer demo** del panel vuelve a cargar los datos de ejemplo y borra los cambios locales.

## Diseño
- `css/styles.css`: variables globales, componentes y diseño responsive.
- `js/app.js`: inyecta la barra lateral y la barra superior en las páginas internas.
- `js/store.js`: estado de demostración persistido en el navegador.
- `js/admin.js` y `js/client.js`: interacciones de administración y del menú para clientes.
