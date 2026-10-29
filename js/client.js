(function () {
  var app = document.getElementById('client-menu');
  var state;
  var category = 'Todos';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function money(value) {
    return '$' + Number(value || 0).toFixed(2);
  }

  function render() {
    try {
      state = window.TostadoStore.get();
      var products = state.products.filter(function (product) {
        return product.active && (category === 'Todos' || product.category === category);
      });
      var cart = window.TostadoStore.getCart();
      var subtotal = cart.reduce(function (sum, line) { return sum + line.price * line.quantity; }, 0);
      var tax = subtotal * 0.16;
      var categories = ['Todos'].concat(Array.from(new Set(state.products.filter(function (product) { return product.active; }).map(function (product) { return product.category; }))));
      app.innerHTML = '<div class="page-head"><div><h1>Menú para clientes</h1><p>Elige tus favoritos y arma tu pedido.</p></div></div>' +
        '<div class="filters" aria-label="Filtrar por categoría">' + categories.map(function (item) { return '<button class="btn ' + (category === item ? '' : 'secondary') + ' sm" data-category="' + escapeHtml(item) + '">' + escapeHtml(item) + '</button>'; }).join('') + '</div>' +
        '<div class="grid cols-3">' + (products.length ? products.map(function (product) {
          return '<article class="card product"><div class="img">☕</div><h3>' + escapeHtml(product.name) + '</h3><p class="desc">' + escapeHtml(product.description) + '</p><div class="product-foot"><strong class="price">' + money(product.price) + '</strong><button class="btn sm" data-client-action="add" data-id="' + product.id + '">Agregar</button></div></article>';
        }).join('') : '<p>No hay productos disponibles en esta categoría.</p>') + '</div>' +
        '<section id="carrito" class="card cart-panel"><h2>Tu carrito (' + cart.reduce(function (sum, line) { return sum + line.quantity; }, 0) + ')</h2>' +
        (cart.length ? '<div class="table-wrap"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th></th></tr></thead><tbody>' +
          cart.map(function (line, index) { return '<tr><td>' + escapeHtml(line.name) + '</td><td>' + line.quantity + '</td><td>' + money(line.price * line.quantity) + '</td><td><button class="btn secondary sm" data-client-action="remove" data-index="' + index + '">Quitar uno</button></td></tr>'; }).join('') +
          '</tbody></table></div><div class="cart-totals"><p>Subtotal: ' + money(subtotal) + '</p><p>Impuesto (16%): ' + money(tax) + '</p><strong>Total: ' + money(subtotal + tax) + '</strong></div>' +
          '<div class="form-grid"><div class="form-row"><label for="customer-payment">Método de pago</label><select id="customer-payment"><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option></select></div><div class="form-row"><label for="customer-name">Nombre (opcional)</label><input id="customer-name" placeholder="Tu nombre"></div></div>' +
          '<button class="btn" data-client-action="checkout">Confirmar pedido</button> <button class="btn secondary" data-client-action="clear">Vaciar carrito</button>' :
          '<p>Tu carrito está vacío. Agrega productos para empezar.</p>') + '</section>' +
        '<section id="como-pagarlo" class="card info-panel"><h2>Cómo pagar</h2><p>Aceptamos efectivo, tarjeta y transferencia. Este pedido es una demostración y no procesa pagos.</p></section>' +
        '<section id="contacto" class="card info-panel"><h2>Contacto</h2><p>Visítanos en Tostado o comunícate con nuestro equipo para consultar disponibilidad.</p></section>';
    } catch (error) {
      app.innerHTML = '<div class="card"><h2>No se pudo cargar el menú</h2><p>' + escapeHtml(error.message) + '</p><button class="btn danger" data-client-action="reset">Restablecer demo</button></div>';
    }
  }

  app.addEventListener('click', function (event) {
    var button = event.target.closest('[data-client-action], [data-category]');
    if (!button) return;
    try {
      if (button.hasAttribute('data-category')) {
        category = button.getAttribute('data-category');
        render();
        return;
      }
      var action = button.getAttribute('data-client-action');
      var cart = window.TostadoStore.getCart();
      if (action === 'add') {
        var product = state.products.find(function (item) { return item.id === Number(button.getAttribute('data-id')) && item.active; });
        if (!product) throw new Error('El producto ya no está disponible.');
        var line = cart.find(function (item) { return item.id === product.id; });
        if (line) line.quantity += 1;
        else cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        window.TostadoStore.saveCart(cart);
        render();
      } else if (action === 'remove') {
        var index = Number(button.getAttribute('data-index'));
        if (cart[index]) cart[index].quantity > 1 ? cart[index].quantity -= 1 : cart.splice(index, 1);
        window.TostadoStore.saveCart(cart);
        render();
      } else if (action === 'clear') {
        window.TostadoStore.saveCart([]);
        render();
      } else if (action === 'checkout') {
        if (!cart.length) return;
        var subtotal = cart.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
        state.orders.push({
          id: state.nextOrderId++,
          items: cart,
          total: subtotal * 1.16,
          payment: document.getElementById('customer-payment').value,
          customer: document.getElementById('customer-name').value.trim(),
          date: new Date().toISOString()
        });
        window.TostadoStore.save();
        window.TostadoStore.saveCart([]);
        render();
        window.alert('Pedido registrado en esta demostración. No se realizó ningún cobro.');
      } else if (action === 'reset' && window.confirm('¿Restablecer los datos de demostración?')) {
        window.TostadoStore.reset();
        render();
      }
    } catch (error) {
      window.alert(error.message || 'No se pudo completar la acción.');
    }
  });

  render();
})();
