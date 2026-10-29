// Inyecta la barra lateral y la barra superior compartidas (solo UI).
(function () {
  var links = [
    ['admin.html', '📊', 'Administración'],
    ['inventario.html', '📦', 'Inventario'],
    ['menu.html', '📋', 'Menú'],
    ['mesas.html', '🪑', 'Mesas'],
    ['pos.html', '🧾', 'POS / Productos'],
    ['reportes.html', '📈', 'Reportes'],
    ['empleados.html', '👥', 'Empleados']
  ];
  var current = location.pathname.split('/').pop() || 'index.html';
  var title = document.body.getAttribute('data-title') || '';
  var nav = links.map(function (l) {
    return '<a href="' + l[0] + '"' + (l[0] === current ? ' class="active"' : '') + '><span>' + l[1] + '</span>' + l[2] + '</a>';
  }).join('');
  var sidebar = '<aside class="sidebar" id="sidebar"><div class="brand">☕ Tostado<small>Cafetería</small></div><nav class="nav">' +
    '<div class="sep">Gestión</div>' + nav + '<div class="sep">Público</div><a href="menu-cliente.html"><span>🛍️</span>Menú cliente</a>' +
    '<div class="sep">Cuenta</div><a href="index.html"><span>🚪</span>Salir</a></nav></aside>';
  var topbar = '<header class="topbar"><div><button class="btn secondary sm menu-toggle" id="toggle" aria-label="Menú">☰</button> <strong>' + title +
    '</strong></div><div class="user"><span>Ana Torres · Administradora</span><div class="avatar">AT</div></div></header>';
  var content = document.getElementById('app');
  var main = document.createElement('div');
  main.className = 'main';
  main.innerHTML = topbar;
  content.className = 'content';
  content.parentNode.insertBefore(main, content);
  main.appendChild(content);
  var wrap = document.createElement('div');
  wrap.className = 'layout';
  main.parentNode.insertBefore(wrap, main);
  wrap.insertAdjacentHTML('afterbegin', sidebar);
  wrap.appendChild(main);
  document.getElementById('toggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });
})();
