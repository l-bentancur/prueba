const STORAGE_KEY = 'liceoMaterialReservations';
const SESSION_KEY = 'liceoReservationDemoUser';
const DEMO_CODE = 'liceo2026';

const initialData = {
  materials: [
    { id: 'tv-55', name: 'TV 55 pulgadas', category: 'Audiovisual', total: 3, location: 'Sala audiovisual', notes: 'Para clases y presentaciones.' },
    { id: 'laptop', name: 'Computadora portátil', category: 'Informática', total: 8, location: 'Laboratorio de informática', notes: 'Equipos con conexión inalámbrica.' },
    { id: 'microscope', name: 'Microscopio', category: 'Laboratorio', total: 6, location: 'Laboratorio de biología', notes: 'Usar con cuidado y devolver limpio.' },
    { id: 'physics-kit', name: 'Kit de física', category: 'Laboratorio', total: 5, location: 'Laboratorio de física', notes: 'Circuitos, sensores y materiales de práctica.' },
    { id: 'tech-lab', name: 'Kit de laboratorio tecnológico', category: 'Tecnológico', total: 4, location: 'Taller tecnológico', notes: 'Placas y componentes de robótica.' },
    { id: 'calculators', name: 'Caja de calculadoras', category: 'Matemática', total: 15, location: 'Depósito de materias', notes: 'Calculadoras científicas.' },
    { id: 't-square', name: 'Regla T', category: 'Dibujo', total: 18, location: 'Módulo de artes', notes: 'Uso para áreas de diseño.' },
    { id: 'drawing-kit', name: 'Set de materiales para dibujo', category: 'Dibujo', total: 12, location: 'Depósito de arte', notes: 'Lápices, escuadras, compases y papeles.' }
  ],
  reservations: []
};

const state = loadState();
const loginScreen = document.getElementById('loginScreen');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const materialForm = document.getElementById('materialForm');
const reservationForm = document.getElementById('reservationForm');
const materialsList = document.getElementById('materialsList');
const reservationsList = document.getElementById('reservationsList');
const categoryFilter = document.getElementById('categoryFilter');
const reservationMaterialSelect = document.getElementById('reservationMaterial');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const editDialog = document.getElementById('editMaterialDialog');
let reservationView = 'active';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return cloneInitialData();
    const parsed = JSON.parse(saved);
    return {
      materials: Array.isArray(parsed.materials) ? parsed.materials.map((item) => ({ ...item, total: Number(item.total) || 0 })) : [],
      reservations: Array.isArray(parsed.reservations) ? parsed.reservations.map((item) => ({ ...item, quantity: Number(item.quantity) || 1, status: item.status || 'Pendiente' })) : []
    };
  } catch (error) {
    console.warn('No se pudieron leer los datos guardados; se cargará el inventario de ejemplo.', error);
    return cloneInitialData();
  }
}

function cloneInitialData() {
  return JSON.parse(JSON.stringify(initialData));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    alert('No se pudieron guardar los cambios en este navegador. Revisá el espacio disponible.');
    console.error(error);
  }
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function todayISO() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function getMaterialById(id) {
  return state.materials.find((item) => item.id === id) || null;
}

function isBlockingReservation(reservation) {
  return reservation.status === 'Pendiente' || reservation.status === 'Confirmada';
}

function datesOverlap(startA, endA, startB, endB) {
  return startA <= endB && startB <= endA;
}

function calculateAvailable(material, startDate = todayISO(), endDate = startDate, exceptReservationId = null) {
  if (!material) return 0;
  const reserved = state.reservations
    .filter((reservation) => reservation.id !== exceptReservationId && reservation.materialId === material.id && isBlockingReservation(reservation) && datesOverlap(reservation.startDate, reservation.endDate, startDate, endDate))
    .reduce((sum, reservation) => sum + reservation.quantity, 0);
  return Math.max(0, material.total - reserved);
}

function renderMaterialSelect() {
  const selected = reservationMaterialSelect.value;
  reservationMaterialSelect.replaceChildren();
  if (!state.materials.length) {
    reservationMaterialSelect.add(new Option('Primero agregá materiales', ''));
    return;
  }
  state.materials.forEach((material) => {
    const option = new Option(`${material.name} · ${calculateAvailable(material, startDateInput.value, endDateInput.value)} disponibles`, material.id);
    option.disabled = calculateAvailable(material, startDateInput.value, endDateInput.value) < 1;
    reservationMaterialSelect.add(option);
  });
  if (state.materials.some((item) => item.id === selected)) reservationMaterialSelect.value = selected;
  if (reservationMaterialSelect.selectedOptions[0]?.disabled) {
    const firstAvailable = [...reservationMaterialSelect.options].find((option) => !option.disabled);
    if (firstAvailable) reservationMaterialSelect.value = firstAvailable.value;
  }
}

function renderMaterials() {
  const selected = categoryFilter.value;
  const materials = state.materials.filter((material) => selected === 'Todos' || material.category === selected);
  if (!materials.length) {
    materialsList.innerHTML = '<div class="empty-state">No hay materiales en esta categoría todavía.</div>';
    return;
  }
  materialsList.innerHTML = materials.map((material) => {
    const available = calculateAvailable(material);
    const reserved = material.total - available;
    return `<article class="material-item">
      <div class="material-main"><div class="material-symbol">${categoryIcon(material.category)}</div><div class="material-info"><div class="material-title-row"><h3>${escapeHTML(material.name)}</h3><span class="category-tag">${escapeHTML(material.category)}</span></div><p>${escapeHTML(material.location)}${material.notes ? ` <span class="dot-separator">·</span> ${escapeHTML(material.notes)}` : ''}</p></div></div>
      <div class="material-stock"><span class="stock-number">${available}<small> / ${material.total}</small></span><span class="stock-caption">disponibles hoy</span><span class="pill ${available ? 'success' : 'danger'}">${reserved} reservadas</span></div>
      <div class="material-actions"><button class="small-button" type="button" data-action="edit-material" data-id="${escapeHTML(material.id)}">Editar</button><button class="small-button danger-text" type="button" data-action="delete-material" data-id="${escapeHTML(material.id)}">Eliminar</button></div>
    </article>`;
  }).join('');
}

function categoryIcon(category) {
  return ({ Audiovisual: '▣', Informática: '⌘', Laboratorio: '⚗', Tecnológico: '⌁', Matemática: '∑', Dibujo: '✎', General: '▦' })[category] || '▦';
}

function getStatusClass(status) {
  return status === 'Confirmada' ? 'success' : status === 'Pendiente' ? 'warning' : status === 'Devuelta' ? 'success' : 'neutral';
}

function formatDate(value) {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function renderReservations() {
  const visible = state.reservations.filter((item) => reservationView === 'active' ? isBlockingReservation(item) : !isBlockingReservation(item));
  visible.sort((a, b) => a.startDate.localeCompare(b.startDate));
  document.getElementById('activeReservationsCount').textContent = state.reservations.filter(isBlockingReservation).length;
  if (!visible.length) {
    reservationsList.innerHTML = `<div class="empty-state">${reservationView === 'active' ? 'No hay reservas activas. Podés registrar una usando el formulario.' : 'Todavía no hay reservas en el historial.'}</div>`;
    return;
  }
  reservationsList.innerHTML = visible.map((reservation) => {
    const material = getMaterialById(reservation.materialId);
    const history = !isBlockingReservation(reservation);
    return `<article class="reservation-item">
      <div class="reservation-person"><div class="person-avatar">${escapeHTML(reservation.person.trim().charAt(0).toUpperCase() || '?')}</div><div><h3>${escapeHTML(reservation.person)}</h3><p>${escapeHTML(reservation.type)} <span class="dot-separator">·</span> ${escapeHTML(material?.name || 'Material eliminado')}</p></div></div>
      <div class="reservation-detail"><span class="detail-label">Fechas</span><strong>${formatDate(reservation.startDate)} – ${formatDate(reservation.endDate)}</strong></div>
      <div class="reservation-detail"><span class="detail-label">Cantidad</span><strong>${reservation.quantity} ${reservation.quantity === 1 ? 'unidad' : 'unidades'}</strong></div>
      <span class="pill ${getStatusClass(reservation.status)}">${escapeHTML(reservation.status)}</span>
      ${reservation.notes ? `<p class="reservation-note">${escapeHTML(reservation.notes)}</p>` : ''}
      <div class="reservation-actions">${!history ? `<button class="small-button" type="button" data-action="confirm" data-id="${escapeHTML(reservation.id)}" ${reservation.status === 'Confirmada' ? 'disabled' : ''}>Confirmar</button><button class="small-button" type="button" data-action="return" data-id="${escapeHTML(reservation.id)}">Marcar devuelta</button><button class="small-button danger-text" type="button" data-action="cancel" data-id="${escapeHTML(reservation.id)}">Cancelar</button>` : ''}<button class="small-button danger-text" type="button" data-action="delete-reservation" data-id="${escapeHTML(reservation.id)}">Eliminar registro</button></div>
    </article>`;
  }).join('');
}

function updateDashboard() {
  document.getElementById('materialsCount').textContent = state.materials.length;
  document.getElementById('confirmedReservations').textContent = state.reservations.filter((item) => item.status === 'Confirmada').length;
  document.getElementById('pendingCount').textContent = state.reservations.filter((item) => item.status === 'Pendiente').length;
  document.getElementById('availableCount').textContent = state.materials.reduce((sum, material) => sum + calculateAvailable(material), 0);
}

function render() {
  renderMaterialSelect();
  renderMaterials();
  renderReservations();
  updateDashboard();
  saveState();
}

function updateLoginVisibility() {
  let user = null;
  try { user = JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (_) { sessionStorage.removeItem(SESSION_KEY); }
  const loggedIn = Boolean(user?.name);
  loginScreen.hidden = loggedIn;
  app.hidden = !loggedIn;
  if (loggedIn) document.getElementById('welcomeLabel').textContent = `Hola, ${user.name}`;
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('loginName').value.trim();
  const code = document.getElementById('loginCode').value;
  const error = document.getElementById('loginError');
  if (code !== DEMO_CODE) {
    error.textContent = 'El código no coincide. Probá con el código demo indicado abajo.';
    error.hidden = false;
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name }));
  error.hidden = true;
  updateLoginVisibility();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  updateLoginVisibility();
});

materialForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const material = {
    id: crypto.randomUUID(),
    name: document.getElementById('materialName').value.trim(),
    category: document.getElementById('materialCategory').value,
    total: Number(document.getElementById('materialTotal').value),
    location: document.getElementById('materialLocation').value.trim(),
    notes: document.getElementById('materialNotes').value.trim()
  };
  if (!material.name || !material.location || material.total < 1) return;
  state.materials.push(material);
  materialForm.reset();
  document.getElementById('materialTotal').value = 1;
  render();
});

reservationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const person = document.getElementById('studentName').value.trim();
  const materialId = reservationMaterialSelect.value;
  const quantity = Number(document.getElementById('reservationQty').value);
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  const material = getMaterialById(materialId);
  if (!person || !material || !startDate || !endDate || quantity < 1) return;
  if (endDate < startDate) {
    alert('La fecha de finalización no puede ser anterior a la fecha de inicio.');
    return;
  }
  const available = calculateAvailable(material, startDate, endDate);
  if (quantity > available) {
    alert(`No hay suficiente disponibilidad para esas fechas. Quedan ${available} unidades.`);
    return;
  }
  state.reservations.push({
    id: crypto.randomUUID(), materialId, person,
    type: document.getElementById('reservationType').value,
    quantity, startDate, endDate,
    notes: document.getElementById('reservationNotes').value.trim(), status: 'Pendiente'
  });
  reservationForm.reset();
  document.getElementById('reservationQty').value = 1;
  startDateInput.value = todayISO();
  endDateInput.value = todayISO();
  render();
});

function openEditMaterial(material) {
  document.getElementById('editMaterialId').value = material.id;
  document.getElementById('editMaterialName').value = material.name;
  document.getElementById('editMaterialCategory').value = material.category;
  document.getElementById('editMaterialTotal').value = material.total;
  document.getElementById('editMaterialLocation').value = material.location;
  document.getElementById('editMaterialNotes').value = material.notes || '';
  editDialog.showModal();
}

materialsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const material = getMaterialById(button.dataset.id);
  if (!material) return;
  if (button.dataset.action === 'edit-material') openEditMaterial(material);
  if (button.dataset.action === 'delete-material') {
    const hasReservations = state.reservations.some((item) => item.materialId === material.id);
    if (hasReservations) {
      alert('No se puede eliminar un material con reservas registradas. Cancelá o eliminá primero sus reservas.');
      return;
    }
    if (confirm(`¿Eliminar “${material.name}” del inventario?`)) {
      state.materials = state.materials.filter((item) => item.id !== material.id);
      render();
    }
  }
});

document.getElementById('editMaterialForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const material = getMaterialById(document.getElementById('editMaterialId').value);
  if (!material) return;
  const total = Number(document.getElementById('editMaterialTotal').value);
  const reserved = state.reservations.filter((item) => item.materialId === material.id && isBlockingReservation(item)).reduce((sum, item) => sum + item.quantity, 0);
  if (total < reserved) {
    alert(`La cantidad total no puede ser menor a las ${reserved} unidades comprometidas en reservas activas.`);
    return;
  }
  material.name = document.getElementById('editMaterialName').value.trim();
  material.category = document.getElementById('editMaterialCategory').value;
  material.total = total;
  material.location = document.getElementById('editMaterialLocation').value.trim();
  material.notes = document.getElementById('editMaterialNotes').value.trim();
  editDialog.close();
  render();
});

function closeEditDialog() { editDialog.close(); }
document.getElementById('closeEditDialog').addEventListener('click', closeEditDialog);
document.getElementById('cancelEditDialog').addEventListener('click', closeEditDialog);

reservationsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const reservation = state.reservations.find((item) => item.id === button.dataset.id);
  if (!reservation) return;
  switch (button.dataset.action) {
    case 'confirm': reservation.status = 'Confirmada'; break;
    case 'return': reservation.status = 'Devuelta'; break;
    case 'cancel': reservation.status = 'Cancelada'; break;
    case 'delete-reservation':
      if (!confirm('¿Eliminar este registro permanentemente? Esta acción no se puede deshacer.')) return;
      state.reservations = state.reservations.filter((item) => item.id !== reservation.id);
      break;
    default: return;
  }
  render();
});

function setReservationView(view) {
  reservationView = view;
  const isActive = view === 'active';
  document.getElementById('activeTab').classList.toggle('active', isActive);
  document.getElementById('historyTab').classList.toggle('active', !isActive);
  document.getElementById('activeTab').setAttribute('aria-selected', String(isActive));
  document.getElementById('historyTab').setAttribute('aria-selected', String(!isActive));
  renderReservations();
}
document.getElementById('activeTab').addEventListener('click', () => setReservationView('active'));
document.getElementById('historyTab').addEventListener('click', () => setReservationView('history'));

categoryFilter.addEventListener('change', renderMaterials);
startDateInput.value = todayISO();
endDateInput.value = todayISO();
startDateInput.addEventListener('change', () => {
  endDateInput.min = startDateInput.value;
  if (endDateInput.value < startDateInput.value) endDateInput.value = startDateInput.value;
  renderMaterialSelect();
});
endDateInput.addEventListener('change', renderMaterialSelect);
reservationMaterialSelect.addEventListener('change', () => {
  const material = getMaterialById(reservationMaterialSelect.value);
  const available = calculateAvailable(material, startDateInput.value, endDateInput.value);
  document.getElementById('availabilityHint').textContent = material ? `${available} unidades disponibles en las fechas elegidas.` : 'Seleccioná un material para ver disponibilidad.';
  document.getElementById('reservationQty').max = Math.max(available, 1);
});

 document.getElementById('resetDataBtn').addEventListener('click', () => {
  if (!confirm('Esto reemplazará los datos de este navegador por el inventario de ejemplo. ¿Continuar?')) return;
  const fresh = cloneInitialData();
  state.materials = fresh.materials;
  state.reservations = fresh.reservations;
  setReservationView('active');
  render();
});

updateLoginVisibility();
render();
