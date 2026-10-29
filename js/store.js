(function () {
  var key = 'tostado-demo-v1';
  var cartKey = 'tostado-cart-v1';
  var initial = {
    products: [
      { id: 1, name: 'Espresso', category: 'Bebidas calientes', price: 3, description: 'Shot intenso de café de origen.', active: true },
      { id: 2, name: 'Capuchino', category: 'Bebidas calientes', price: 4.5, description: 'Espresso con leche vaporizada y espuma cremosa.', active: true },
      { id: 3, name: 'Latte', category: 'Bebidas calientes', price: 4.8, description: 'Suave, con leche y un toque de espuma.', active: true },
      { id: 4, name: 'Café frío', category: 'Bebidas frías', price: 5, description: 'Cold brew servido con hielo.', active: true },
      { id: 5, name: 'Cheesecake', category: 'Postres', price: 5.5, description: 'Con salsa de frutos rojos.', active: true },
      { id: 6, name: 'Croissant', category: 'Panadería', price: 3.5, description: 'De mantequilla, recién horneado.', active: true }
    ],
    inventory: [
      { id: 1, name: 'Café Arábica en grano', category: 'Café', quantity: 2, unit: 'kg', minimum: 5 },
      { id: 2, name: 'Leche entera', category: 'Lácteos', quantity: 8, unit: 'L', minimum: 10 },
      { id: 3, name: 'Azúcar', category: 'Abarrotes', quantity: 25, unit: 'kg', minimum: 8 },
      { id: 4, name: 'Croissants (masa)', category: 'Panadería', quantity: 40, unit: 'u', minimum: 10 },
      { id: 5, name: 'Vasos 12oz', category: 'Desechables', quantity: 120, unit: 'u', minimum: 150 }
    ],
    employees: [
      { id: 1, name: 'Ana Torres', email: 'ana@tostado.com', role: 'Administradora', shift: 'Mañana', status: 'Activo' },
      { id: 2, name: 'Luis Mendoza', email: 'luis@tostado.com', role: 'Barista', shift: 'Mañana', status: 'Activo' },
      { id: 3, name: 'Carla Ríos', email: 'carla@tostado.com', role: 'Mesera', shift: 'Tarde', status: 'Activo' },
      { id: 4, name: 'Jorge Salas', email: 'jorge@tostado.com', role: 'Cajero', shift: 'Tarde', status: 'Vacaciones' }
    ],
    tables: [
      { id: 1, seats: 4, status: 'Ocupada' }, { id: 2, seats: 2, status: 'Libre' },
      { id: 3, seats: 2, status: 'Ocupada' }, { id: 4, seats: 4, status: 'Reservada' },
      { id: 5, seats: 4, status: 'Libre' }, { id: 6, seats: 2, status: 'Libre' },
      { id: 7, seats: 2, status: 'Ocupada' }, { id: 8, seats: 4, status: 'Reservada' }
    ],
    orders: [
      { id: 1041, items: [{ name: 'Capuchino', quantity: 2, price: 4.5 }, { name: 'Croissant', quantity: 1, price: 3.5 }], total: 12.5, payment: 'Tarjeta', date: new Date().toISOString() },
      { id: 1042, items: [{ name: 'Latte', quantity: 1, price: 4.8 }, { name: 'Cheesecake', quantity: 1, price: 5.5 }], total: 10.3, payment: 'Efectivo', date: new Date().toISOString() }
    ],
    nextId: 10,
    nextOrderId: 1043
  };
  var state;

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    if (state) return state;
    var stored = localStorage.getItem(key);
    if (stored === null) {
      state = copy(initial);
      save();
      return state;
    }
    try {
      state = JSON.parse(stored);
    } catch (error) {
      console.error('No se pudieron leer los datos guardados de Tostado.', error);
      throw new Error('Los datos guardados están dañados. Usa “Restablecer demo” para recuperarlos.');
    }
    if (!state || !Array.isArray(state.products) || !Array.isArray(state.orders)) {
      throw new Error('El formato de los datos guardados no es válido. Usa “Restablecer demo” para recuperarlos.');
    }
    return state;
  }

  function save() {
    localStorage.setItem(key, JSON.stringify(state));
  }

  function getCart() {
    var stored = localStorage.getItem(cartKey);
    if (!stored) return [];
    try {
      var cart = JSON.parse(stored);
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.error('No se pudo leer el carrito guardado.', error);
      throw new Error('El carrito guardado está dañado. Vacíalo para continuar.');
    }
  }

  function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  function reset() {
    state = copy(initial);
    save();
    saveCart([]);
    return state;
  }

  window.TostadoStore = {
    get: load,
    save: save,
    getCart: getCart,
    saveCart: saveCart,
    reset: reset
  };
})();
