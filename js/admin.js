(function () {
  var app = document.getElementById('app');
  var state;
  var query = '';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function money(value) {
    return '$' + Number(value || 0).toFixed(2);
  }

  function message(error) {
    window.alert(error.message || 'No se pudo completar la acción.');
  }

  function commit() {
    window.TostadoStore.save();
    state = window.TostadoStore.get();
  }

  function nextId(items) {
    return items.reduce(function (max, item) { return Math.max(max, Number(item.id) || 0); }, 0) + 1;
  }

  function statusFor(item) {
    if (item.quantity <= 0) return ['Agotado', 'danger'];
    if (item.quantity <= item.minimum) return ['Stock bajo', 'warn'];
    return ['Disponible', 'ok'];
  }

  function filtered(items, fields) {
    var needle = query.trim().toLocaleLowerCase();
    if (!needle) return items;
    return items.filter(function (item) {
      return fields.some(function (field) {
        return String(item[field] || '').toLocaleLowerCase().includes(needle);
      });
    });
  }

  function editForm(type, item) {
    var product = type === 'product';
    var title = item ? 'Editar ' + (product ? 'producto' : 'insumo') : 'Nuevo ' + (product ? 'producto' : 'insumo');
    var fields = product
      ? '<div class="form-row"><label>Nombre</label><input name="name" required value="' + escapeHtml(item && item.name) + '"></div>' +
        '<div class="form-row"><label>Categoría</label><select name="category"><option>Bebidas calientes</option><option>Bebidas frías</option><option>Postres</option><option>Panadería</option><option>Snacks</option></select></div>' +
        '<div class="form-row"><label>Precio</label><input name="price" type="number" min="0.01" step="0.01" required value="' + escapeHtml(item && item.price) + '"></div>' +
        '<div class="form-row"><label>Descripción</label><textarea name="description" rows="3">' + escapeHtml(item && item.description) + '</textarea></div>' +
        '<div class="form-row"><label>Disponibilidad</label><select name="active"><option value="true">Activo</option><option value="false">Pausado</option></select></div>'
      : '<div class="form-row"><label>Nombre</label><input name="name" required value="' + escapeHtml(item && item.name) + '"></div>' +
        '<div class="form-row"><label>Categoría</label><input name="category" required value="' + escapeHtml(item && item.category) + '"></div>' +
        '<div class="form-grid"><div class="form-row"><label>Existencia</label><input name="quantity" type="number" min="0" step="0.01" required value="' + escapeHtml(item && item.quantity) + '"></div>' +
        '<div class="form-row"><label>Unidad</label><input name="unit" required value="' + escapeHtml(item && item.unit) + '"></div></div>' +
        '<div class="form-row"><label>Mínimo de existencias</label><input name="minimum" type="number" min="0" step="0.01" required value="' + escapeHtml(item && item.minimum) + '"></div>';
    var form = '<form class="card" data-form="' + type + '"><h3>' + title + '</h3>' +
      '<input type="hidden" name="id"' + (item ? ' data-edit-id' : '') + ' value="' + escapeHtml(item && item.id) + '">' + fields +
      '<button class="btn block" type="submit">Guardar</button>' +
      (item ? '<button class="btn secondary block" type="button" data-action="cancel-edit" style="margin-top:.5rem">Cancelar</button>' : '') +
      '</form>';
    return form;
  }

  function renderAdmin() {
    var sales = state.orders.reduce(function (sum, order) { return sum + order.total; }, 0);
    var low = state.inventory.filter(function (item) { return item.quantity <= item.minimum; });
    app.innerHTML = '<div class="page-head"><div><h1>Panel de administración</h1><p>Resumen actualizado con los datos de este navegador</p></div>' +
      '<button class="btn danger" data-action="reset">Restablecer demo</button></div>' +
      '<div class="grid cols-4"><div class="card stat"><div class="label">Ventas registradas</div><div class="value">' + money(sales) + '</div></div>' +
      '<div class="card stat"><div class="label">Pedidos</div><div class="value">' + state.orders.length + '</div></div>' +
      '<div class="card stat"><div class="label">Mesas ocupadas</div><div class="value">' + state.tables.filter(function (table) { return table.status === 'Ocupada'; }).length + '/' + state.tables.length + '</div></div>' +
      '<div class="card stat"><div class="label">Productos activos</div><div class="value">' + state.products.filter(function (product) { return product.active; }).length + '</div></div></div>' +
      '<div class="grid cols-2" style="margin-top:1.25rem"><section class="card"><h3>Alertas de inventario</h3>' +
      (low.length ? '<ul class="list">' + low.map(function (item) { var status = statusFor(item); return '<li>' + escapeHtml(item.name) + '<span class="badge ' + status[1] + '">' + escapeHtml(item.quantity) + ' ' + escapeHtml(item.unit) + ' · ' + status[0] + '</span></li>'; }).join('') + '</ul>' : '<p>Sin alertas de inventario.</p>') +
      '</section><section class="card"><h3>Accesos rápidos</h3><div class="filters"><a class="btn" href="pos.html">Nueva venta</a><a class="btn secondary" href="inventario.html">Inventario</a><a class="btn secondary" href="menu.html">Editar menú</a></div><p>Los cambios se guardan en este navegador; no se sincronizan entre dispositivos.</p></section></div>' +
      '<section class="card" style="margin-top:1.25rem"><h3>Últimos pedidos</h3>' + ordersTable(state.orders.slice().reverse().slice(0, 5)) + '</section>';
  }

  function ordersTable(orders) {
    if (!orders.length) return '<p>Aún no hay pedidos.</p>';
    return '<div class="table-wrap"><table><thead><tr><th>Pedido</th><th>Fecha</th><th>Detalle</th><th>Pago</th><th>Total</th></tr></thead><tbody>' +
      orders.map(function (order) {
        return '<tr><td>#' + escapeHtml(order.id) + '</td><td>' + new Date(order.date).toLocaleString('es-MX') + '</td><td>' +
          order.items.map(function (item) { return escapeHtml(item.quantity) + ' × ' + escapeHtml(item.name); }).join(', ') +
          '</td><td>' + escapeHtml(order.payment) + '</td><td>' + money(order.total) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function renderProducts() {
    var editId = Number(app.querySelector('[data-edit-id]') && app.querySelector('[data-edit-id]').value);
    var edit = state.products.find(function (item) { return item.id === editId; });
    var products = filtered(state.products, ['name', 'category']);
    app.innerHTML = '<div class="page-head"><div><h1>Menú de productos</h1><p>Administra el catálogo visible en el punto de venta y menú cliente.</p></div></div>' +
      '<div class="grid cols-2 admin-split"><section class="card"><div class="filters"><input data-search type="search" placeholder="Buscar producto..." value="' + escapeHtml(query) + '"></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' +
      products.map(function (item) { return '<tr><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.category) + '</td><td>' + money(item.price) + '</td><td><span class="badge ' + (item.active ? 'ok' : 'warn') + '">' + (item.active ? 'Activo' : 'Pausado') + '</span></td><td><button class="btn secondary sm" data-action="edit-product" data-id="' + item.id + '">Editar</button> <button class="btn danger sm" data-action="delete-product" data-id="' + item.id + '">Eliminar</button></td></tr>'; }).join('') +
      '</tbody></table></div></section>' + editForm('product', edit) + '</div>';
    if (edit) app.querySelector('[name="category"]').value = edit.category;
    if (edit) app.querySelector('[name="active"]').value = String(edit.active);
  }

  function renderInventory() {
    var editId = Number(app.querySelector('[data-edit-id]') && app.querySelector('[data-edit-id]').value);
    var edit = state.inventory.find(function (item) { return item.id === editId; });
    var items = filtered(state.inventory, ['name', 'category']);
    app.innerHTML = '<div class="page-head"><div><h1>Inventario</h1><p>Control de insumos y existencias.</p></div></div>' +
      '<div class="grid cols-2 admin-split"><section class="card"><div class="filters"><input data-search type="search" placeholder="Buscar insumo..." value="' + escapeHtml(query) + '"></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Insumo</th><th>Categoría</th><th>Existencia</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' +
      items.map(function (item) { var status = statusFor(item); return '<tr><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.category) + '</td><td>' + escapeHtml(item.quantity) + ' ' + escapeHtml(item.unit) + '</td><td><span class="badge ' + status[1] + '">' + status[0] + '</span></td><td><button class="btn secondary sm" data-action="edit-inventory" data-id="' + item.id + '">Editar</button> <button class="btn danger sm" data-action="delete-inventory" data-id="' + item.id + '">Eliminar</button></td></tr>'; }).join('') +
      '</tbody></table></div></section>' + editForm('inventory', edit) + '</div>';
  }

  function renderEmployees() {
    var editId = Number(app.querySelector('[data-edit-id]') && app.querySelector('[data-edit-id]').value);
    var edit = state.employees.find(function (item) { return item.id === editId; });
    var employees = filtered(state.employees, ['name', 'email', 'role']);
    app.innerHTML = '<div class="page-head"><div><h1>Empleados</h1><p>Administra el equipo y sus turnos (demo local).</p></div></div>' +
      '<div class="grid cols-2 admin-split"><section class="card"><div class="filters"><input data-search type="search" placeholder="Buscar empleado..." value="' + escapeHtml(query) + '"></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Turno</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' +
      employees.map(function (item) { return '<tr><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.email) + '</td><td>' + escapeHtml(item.role) + '</td><td>' + escapeHtml(item.shift) + '</td><td>' + escapeHtml(item.status) + '</td><td><button class="btn secondary sm" data-action="edit-employee" data-id="' + item.id + '">Editar</button> <button class="btn danger sm" data-action="delete-employee" data-id="' + item.id + '">Eliminar</button></td></tr>'; }).join('') +
      '</tbody></table></div></section><form class="card" data-form="employee"><h3>' + (edit ? 'Editar empleado' : 'Nuevo empleado') + '</h3><input type="hidden" name="id"' + (edit ? ' data-edit-id' : '') + ' value="' + escapeHtml(edit && edit.id) + '">' +
      '<div class="form-row"><label>Nombre completo</label><input name="name" required value="' + escapeHtml(edit && edit.name) + '"></div>' +
      '<div class="form-row"><label>Correo</label><input name="email" type="email" required value="' + escapeHtml(edit && edit.email) + '"></div>' +
      '<div class="form-row"><label>Rol</label><select name="role"><option>Barista</option><option>Mesero</option><option>Cajero</option><option>Administradora</option></select></div>' +
      '<div class="form-row"><label>Turno</label><select name="shift"><option>Mañana</option><option>Tarde</option><option>Noche</option></select></div>' +
      '<div class="form-row"><label>Estado</label><select name="status"><option>Activo</option><option>Inactivo</option><option>Vacaciones</option></select></div>' +
      '<button class="btn block" type="submit">Guardar</button>' + (edit ? '<button class="btn secondary block" type="button" data-action="cancel-edit" style="margin-top:.5rem">Cancelar</button>' : '') + '</form></div>';
    if (edit) {
      app.querySelector('[name="role"]').value = edit.role;
      app.querySelector('[name="shift"]').value = edit.shift;
      app.querySelector('[name="status"]').value = edit.status;
    }
  }

  function renderTables() {
    app.innerHTML = '<div class="page-head"><div><h1>Mesas</h1><p>Actualiza el estado del salón. Los cambios se guardan en este navegador.</p></div><button class="btn" data-action="add-table">+ Agregar mesa</button></div>' +
      '<div class="grid cols-4">' + state.tables.map(function (table) {
        var type = table.status === 'Libre' ? 'ok' : table.status === 'Ocupada' ? 'danger' : 'warn';
        var css = table.status.toLocaleLowerCase();
        return '<article class="card mesa ' + css + '"><div class="num">Mesa ' + table.id + '</div><p>' + table.seats + ' asientos</p><span class="badge ' + type + '">' + escapeHtml(table.status) + '</span>' +
          '<div class="form-row" style="margin-top:1rem"><label for="table-' + table.id + '">Estado</label><select id="table-' + table.id + '" data-table-status="' + table.id + '"><option>Libre</option><option>Reservada</option><option>Ocupada</option></select></div>' +
          '<button class="btn danger sm" data-action="delete-table" data-id="' + table.id + '">Quitar mesa</button></article>';
      }).join('') + '</div>';
    state.tables.forEach(function (table) { app.querySelector('[data-table-status="' + table.id + '"]').value = table.status; });
  }

  function renderPos() {
    var available = state.products.filter(function (product) { return product.active; });
    var cart = window.TostadoStore.getCart();
    var subtotal = cart.reduce(function (sum, line) { return sum + line.price * line.quantity; }, 0);
    var tax = subtotal * 0.16;
    app.innerHTML = '<div class="page-head"><div><h1>Punto de venta</h1><p>Agrega productos y registra el cobro (demo local).</p></div></div>' +
      '<div class="grid admin-split"><section><div class="filters"><input data-search type="search" placeholder="Buscar producto..." value="' + escapeHtml(query) + '"></div><div class="grid cols-3">' +
      filtered(available, ['name', 'category']).map(function (product) { return '<article class="card product"><div class="img">☕</div><strong>' + escapeHtml(product.name) + '</strong><div class="price">' + money(product.price) + '</div><button class="btn sm" data-action="add-cart" data-id="' + product.id + '">Agregar</button></article>'; }).join('') +
      '</div></section><section class="card"><h3>Orden actual</h3>' +
      (cart.length ? '<ul class="list">' + cart.map(function (line, index) { return '<li><span>' + escapeHtml(line.quantity) + ' × ' + escapeHtml(line.name) + '</span><span>' + money(line.price * line.quantity) + ' <button class="btn danger sm" data-action="remove-cart" data-index="' + index + '" aria-label="Quitar ' + escapeHtml(line.name) + '">−</button></span></li>'; }).join('') + '</ul>' : '<p>Agrega productos para iniciar una orden.</p>') +
      '<ul class="list"><li><span>Subtotal</span><span>' + money(subtotal) + '</span></li><li><span>Impuesto (16%)</span><span>' + money(tax) + '</span></li><li><strong>Total</strong><strong>' + money(subtotal + tax) + '</strong></li></ul>' +
      '<form data-form="checkout"><div class="form-row" style="margin-top:1rem"><label>Método de pago</label><select name="payment"><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option></select></div><button class="btn block" type="submit" ' + (cart.length ? '' : 'disabled') + '>Cobrar</button></form>' +
      '<button class="btn secondary block" data-action="clear-cart" style="margin-top:.5rem" ' + (cart.length ? '' : 'disabled') + '>Cancelar orden</button></section></div>';
  }

  function renderReports() {
    var sales = state.orders.reduce(function (sum, order) { return sum + order.total; }, 0);
    var units = state.orders.reduce(function (sum, order) { return sum + order.items.reduce(function (count, item) { return count + item.quantity; }, 0); }, 0);
    app.innerHTML = '<div class="page-head"><div><h1>Reportes</h1><p>Resumen de pedidos registrados en este navegador.</p></div><button class="btn secondary" data-action="export">Exportar CSV</button></div>' +
      '<div class="grid cols-3"><div class="card stat"><div class="label">Ventas totales</div><div class="value">' + money(sales) + '</div></div><div class="card stat"><div class="label">Pedidos</div><div class="value">' + state.orders.length + '</div></div><div class="card stat"><div class="label">Unidades vendidas</div><div class="value">' + units + '</div></div></div>' +
      '<section class="card" style="margin-top:1.25rem"><h3>Pedidos</h3>' + ordersTable(state.orders.slice().reverse()) + '</section>';
  }

  function render() {
    try {
      state = window.TostadoStore.get();
      var page = document.body.getAttribute('data-page');
      query = page === 'products' || page === 'inventory' || page === 'employees' || page === 'pos' ? query : '';
      if (page === 'admin') renderAdmin();
      else if (page === 'products') renderProducts();
      else if (page === 'inventory') renderInventory();
      else if (page === 'employees') renderEmployees();
      else if (page === 'tables') renderTables();
      else if (page === 'pos') renderPos();
      else if (page === 'reports') renderReports();
    } catch (error) {
      app.innerHTML = '<div class="card"><h2>No se pudo cargar la administración</h2><p>' + escapeHtml(error.message) + '</p><button class="btn danger" data-action="reset">Restablecer demo</button></div>';
    }
  }

  function saveEntity(form, collection, fields) {
    var data = new FormData(form);
    var id = Number(data.get('id'));
    var item = {};
    fields.forEach(function (field) {
      var value = data.get(field);
      if (field === 'price' || field === 'quantity' || field === 'minimum') value = Number(value);
      if (field === 'active') value = value === 'true';
      item[field] = value;
    });
    var current = state[collection].find(function (entry) { return entry.id === id; });
    if (id && current) Object.assign(current, item);
    else {
      item.id = nextId(state[collection]);
      state[collection].push(item);
    }
    commit();
    query = '';
    render();
  }

  app.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.matches('[data-form]')) return;
    event.preventDefault();
    try {
      var type = form.getAttribute('data-form');
      if (type === 'product') saveEntity(form, 'products', ['name', 'category', 'price', 'description', 'active']);
      else if (type === 'inventory') saveEntity(form, 'inventory', ['name', 'category', 'quantity', 'unit', 'minimum']);
      else if (type === 'employee') saveEntity(form, 'employees', ['name', 'email', 'role', 'shift', 'status']);
      else if (type === 'checkout') {
        var cart = window.TostadoStore.getCart();
        if (!cart.length) return;
        var subtotal = cart.reduce(function (sum, line) { return sum + line.price * line.quantity; }, 0);
        state.orders.push({ id: state.nextOrderId++, items: cart, total: subtotal * 1.16, payment: new FormData(form).get('payment'), date: new Date().toISOString() });
        commit();
        window.TostadoStore.saveCart([]);
        render();
        window.alert('Venta registrada correctamente.');
      }
    } catch (error) { message(error); }
  });

  app.addEventListener('click', function (event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;
    var action = button.getAttribute('data-action');
    var id = Number(button.getAttribute('data-id'));
    try {
      if (action === 'edit-product' || action === 'edit-inventory' || action === 'edit-employee') {
        var page = document.body.getAttribute('data-page');
        var target = page === 'products' ? state.products : page === 'inventory' ? state.inventory : state.employees;
        var item = target.find(function (entry) { return entry.id === id; });
        var form = app.querySelector('[data-form]');
        if (form && item) {
          render();
          var renderedForm = app.querySelector('[data-form]');
          renderedForm.querySelector('[name="id"]').value = item.id;
          renderedForm.querySelector('[name="id"]').setAttribute('data-edit-id', '');
          renderedForm.querySelectorAll('[name]').forEach(function (input) {
            if (Object.prototype.hasOwnProperty.call(item, input.name)) input.value = String(item[input.name]);
          });
          var submit = renderedForm.querySelector('[type="submit"]');
          submit.textContent = 'Guardar cambios';
          renderedForm.querySelector('h3').textContent = 'Editar ' + (page === 'products' ? 'producto' : page === 'inventory' ? 'insumo' : 'empleado');
        }
      } else if (action === 'delete-product' || action === 'delete-inventory' || action === 'delete-employee') {
        var collection = action === 'delete-product' ? 'products' : action === 'delete-inventory' ? 'inventory' : 'employees';
        if (window.confirm('¿Eliminar este registro?')) {
          state[collection] = state[collection].filter(function (item) { return item.id !== id; });
          commit(); render();
        }
      } else if (action === 'cancel-edit') render();
      else if (action === 'add-table') {
        state.tables.push({ id: nextId(state.tables), seats: 4, status: 'Libre' });
        commit(); render();
      } else if (action === 'delete-table') {
        if (window.confirm('¿Quitar esta mesa?')) {
          state.tables = state.tables.filter(function (table) { return table.id !== id; });
          commit(); render();
        }
      } else if (action === 'add-cart') {
        var product = state.products.find(function (item) { return item.id === id && item.active; });
        if (!product) throw new Error('El producto ya no está disponible.');
        var cart = window.TostadoStore.getCart();
        var line = cart.find(function (item) { return item.id === product.id; });
        if (line) line.quantity += 1;
        else cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        window.TostadoStore.saveCart(cart); render();
      } else if (action === 'remove-cart') {
        var posCart = window.TostadoStore.getCart();
        var index = Number(button.getAttribute('data-index'));
        if (posCart[index]) posCart[index].quantity > 1 ? posCart[index].quantity -= 1 : posCart.splice(index, 1);
        window.TostadoStore.saveCart(posCart); render();
      } else if (action === 'clear-cart') {
        window.TostadoStore.saveCart([]); render();
      } else if (action === 'reset') {
        if (window.confirm('Esto borrará los cambios locales y restaurará los datos de demostración. ¿Continuar?')) {
          window.TostadoStore.reset(); query = ''; render();
        }
      } else if (action === 'export') {
        var rows = [['Pedido', 'Fecha', 'Productos', 'Pago', 'Total']].concat(state.orders.map(function (order) {
          return [order.id, new Date(order.date).toLocaleString('es-MX'), order.items.map(function (item) { return item.quantity + ' x ' + item.name; }).join('; '), order.payment, order.total.toFixed(2)];
        }));
        var csv = rows.map(function (row) { return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
        var link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
        link.download = 'reporte-tostado.csv';
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) { message(error); }
  });

  app.addEventListener('change', function (event) {
    var select = event.target.closest('[data-table-status]');
    if (!select) return;
    var table = state.tables.find(function (item) { return item.id === Number(select.getAttribute('data-table-status')); });
    if (!table) return;
    table.status = select.value;
    try { commit(); render(); } catch (error) { message(error); }
  });

  app.addEventListener('input', function (event) {
    if (!event.target.matches('[data-search]')) return;
    query = event.target.value;
    var start = event.target.selectionStart;
    render();
    var input = app.querySelector('[data-search]');
    if (input) { input.focus(); input.setSelectionRange(start, start); }
  });

  render();
})();
