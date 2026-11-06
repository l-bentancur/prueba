const STORAGE_KEY = 'liceoMaterialReservations';

const initialData = {
  materials: [
    {
      id: crypto.randomUUID(),
      name: 'TV 55"',
      category: 'Audiovisual',
      total: 3,
      location: 'Sala audiovisual',
      notes: 'Para clases de historia y presentaciones.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Computadora portátil',
      category: 'Informática',
      total: 8,
      location: 'Laboratorio de informática',
      notes: 'Equipos con conexión inalámbrica.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Microscopio',
      category: 'Laboratorio',
      total: 6,
      location: 'Laboratorio de biología',
      notes: 'Usar con guantes y material de vidrio.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Kit de física',
      category: 'Laboratorio',
      total: 5,
      location: 'Laboratorio de física',
      notes: 'Incluye circuitos, sensores y cuerdas.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Laboratorio tecnológico',
      category: 'Tecnológico',
      total: 4,
      location: 'Taller tecnológico',
      notes: 'Incluye placas y componentes de robótica.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Caja de calculadoras',
      category: 'Matemática',
      total: 15,
      location: 'Depósito de materias',
      notes: 'Calculadoras científicas y gráficas.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Regla T',
      category: 'Dibujo',
      total: 18,
      location: 'Módulo de artes',
      notes: 'Uso exclusivo para áreas de diseño.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Set de materiales para dibujo',
      category: 'Dibujo',
      total: 12,
      location: 'Depósito de arte',
      notes: 'Lápices, escuadras, compases y papeles.'
    }
  ],
  reservations: [
    {
      id: crypto.randomUUID(),
      materialId: null,
      person: 'Ana López',
      type: 'Docente',
      quantity: 1,
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      notes: 'Clase de historia',
      status: 'Confirmada'
    },
    {
      id: crypto.randomUUID(),
      materialId: null,
      person: 'Mateo Silva',
      type: 'Estudiante',
      quantity: 2,
      startDate: '2026-11-08',
      endDate: '2026-11-09',
      notes: 'Práctica de laboratorio',
      status: 'Pendiente'
    }
  ]
};

const state = loadState();

const materialForm = document.getElementById('materialForm');
const reservationForm = document.getElementById('reservationForm');
const materialsList = document.getElementById('materialsList');
const reservationsList = document.getElementById('reservationsList');
const categoryFilter = document.getElementById('categoryFilter');
const reservationMaterialSelect = document.getElementById('reservationMaterial');
const resetDataBtn = document.getElementById('resetDataBtn');

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return hydrateInitialData(initialData);
  }

  try {
    const parsed = JSON.parse(saved);
    return hydrateInitialData(parsed);
  } catch (error) {
    console.error('Error leyendo localStorage:', error);
    return hydrateInitialData(initialData);
  }
}

function hydrateInitialData(data) {
  const safeData = data || { materials: [], reservations: [] };
  if (!safeData.materials) safeData.materials = [];
  if (!safeData.reservations) safeData.reservations = [];

  const materials = safeData.materials.map((material) => ({
    ...material,
    total: Number(material.total) || 0
  }));

  const reservations = safeData.reservations.map((reservation) => ({
    ...reservation,
    quantity: Number(reservation.quantity) || 1,
    status: reservation.status || 'Pendiente'
  }));

  return { materials, reservations };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureSampleMappings() {
  const materials = state.materials;
  const reservations = state.reservations;
  if (materials.length === 0) return;

  reservations.forEach((reservation) => {
    if (!reservation.materialId || !materials.some((material) => material.id === reservation.materialId)) {
      const fallbackMaterial = materials[0];
      reservation.materialId = fallbackMaterial.id;
    }
  });
}

function getMaterialById(materialId) {
  return state.materials.find((material) => material.id === materialId) || null;
}

function calculateAvailable(material) {
  if (!material) return 0;
  const reservedQty = state.reservations
    .filter((reservation) => reservation.materialId === material.id && reservation.status !== 'Devuelta' && reservation.status !== 'Cancelada')
    .reduce((total, reservation) => total + Number(reservation.quantity || 0), 0);
  return Math.max(material.total - reservedQty, 0);
}

function getStatusClass(status) {
  if (status === 'Confirmada') return 'success';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Devuelta') return 'success';
  return 'danger';
}

function renderReservationSelect() {
  reservationMaterialSelect.innerHTML = '';
  const materials = state.materials;

  if (!materials.length) {
    reservationMaterialSelect.innerHTML = '<option value="">No hay materiales cargados</option>';
    return;
  }

  materials.forEach((material) => {
    const option = document.createElement('option');
    option.value = material.id;
    option.textContent = `${material.name} (${calculateAvailable(material)} disponibles)`;
    reservationMaterialSelect.appendChild(option);
  });
}

function renderMaterials() {
  const selectedCategory = categoryFilter.value;
  const visibleMaterials = selectedCategory === 'Todos'
    ? state.materials
    : state.materials.filter((material) => material.category === selectedCategory);

  if (!visibleMaterials.length) {
    materialsList.innerHTML = '<div class="empty-state">No hay materiales para esta categoría.</div>';
    return;
  }

  materialsList.innerHTML = visibleMaterials.map((material) => {
    const available = calculateAvailable(material);
    const stateClass = available > 0 ? 'success' : 'danger';
    const stateText = available > 0 ? `${available} disponibles` : 'Sin disponibilidad';

    return `
      <article class="material-item">
        <div class="material-top">
          <div>
            <div class="material-name">${material.name}</div>
            <div class="material-meta">
              <span>${material.category}</span>
              <span>Ubicación: ${material.location}</span>
            </div>
          </div>
          <span class="meta-badge">Total ${material.total}</span>
        </div>

        <div class="availability">
          <span class="pill ${stateClass}">${stateText}</span>
          <span class="pill warning">Reservados: ${Math.max(material.total - available, 0)}</span>
        </div>

        <div class="material-meta">
          <span>${material.notes || 'Sin observaciones'}</span>
        </div>
      </article>
    `;
  }).join('');
}

function renderReservations() {
  const activeReservations = state.reservations.filter((reservation) => reservation.status !== 'Devuelta' && reservation.status !== 'Cancelada');

  if (!activeReservations.length) {
    reservationsList.innerHTML = '<div class="empty-state">No hay reservas activas.</div>';
    return;
  }

  reservationsList.innerHTML = activeReservations.map((reservation) => {
    const material = getMaterialById(reservation.materialId);
    const materialName = material ? material.name : 'Material no disponible';
    const dateRange = `${reservation.startDate} → ${reservation.endDate}`;

    return `
      <article class="reservation-item">
        <div class="reservation-top">
          <div>
            <div class="reservation-name">${reservation.person}</div>
            <div class="reservation-meta">
              <span>${reservation.type}</span>
              <span>${materialName}</span>
            </div>
          </div>
          <span class="pill ${getStatusClass(reservation.status)}">${reservation.status}</span>
        </div>

        <div class="reservation-meta">
          <span>Cantidad: ${reservation.quantity}</span>
          <span>Fechas: ${dateRange}</span>
        </div>

        <div class="reservation-meta">
          <span>${reservation.notes || 'Sin observaciones'}</span>
        </div>

        <div class="reservation-actions">
          <button class="status-button" type="button" data-action="confirm" data-id="${reservation.id}">Confirmar</button>
          <button class="status-button cancel" type="button" data-action="return" data-id="${reservation.id}">Devolver</button>
          <button class="delete-button" type="button" data-action="cancel" data-id="${reservation.id}">Cancelar</button>
        </div>
      </article>
    `;
  }).join('');
}

function updateDashboard() {
  const materialsCount = state.materials.length;
  const confirmedReservations = state.reservations.filter((reservation) => reservation.status === 'Confirmada').length;
  const pendingReservations = state.reservations.filter((reservation) => reservation.status === 'Pendiente').length;
  const available = state.materials.reduce((total, material) => total + calculateAvailable(material), 0);

  document.getElementById('materialsCount').textContent = materialsCount;
  document.getElementById('confirmedReservations').textContent = confirmedReservations;
  document.getElementById('availableCount').textContent = available;
  document.getElementById('pendingCount').textContent = pendingReservations;
}

function render() {
  ensureSampleMappings();
  renderReservationSelect();
  renderMaterials();
  renderReservations();
  updateDashboard();
  saveState();
}

materialForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('materialName').value.trim();
  const category = document.getElementById('materialCategory').value;
  const total = Number(document.getElementById('materialTotal').value);
  const location = document.getElementById('materialLocation').value.trim();
  const notes = document.getElementById('materialNotes').value.trim();

  if (!name || !location || !total || total <= 0) {
    return;
  }

  state.materials.push({
    id: crypto.randomUUID(),
    name,
    category,
    total,
    location,
    notes
  });

  materialForm.reset();
  document.getElementById('materialTotal').value = 1;
  render();
});

reservationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const person = document.getElementById('studentName').value.trim();
  const type = document.getElementById('reservationType').value;
  const materialId = reservationMaterialSelect.value;
  const quantity = Number(document.getElementById('reservationQty').value);
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const notes = document.getElementById('reservationNotes').value.trim();

  const material = getMaterialById(materialId);
  if (!person || !material || !startDate || !endDate || quantity <= 0) {
    return;
  }

  const available = calculateAvailable(material);
  if (quantity > available) {
    alert(`No hay suficiente stock disponible para ${material.name}. Quedan ${available} unidades.`);
    return;
  }

  state.reservations.push({
    id: crypto.randomUUID(),
    materialId,
    person,
    type,
    quantity,
    startDate,
    endDate,
    notes,
    status: 'Pendiente'
  });

  reservationForm.reset();
  document.getElementById('reservationQty').value = 1;
  render();
});

reservationsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  const reservation = state.reservations.find((item) => item.id === id);
  if (!reservation) return;

  if (action === 'confirm') {
    reservation.status = 'Confirmada';
  }

  if (action === 'return') {
    reservation.status = 'Devuelta';
  }

  if (action === 'cancel') {
    reservation.status = 'Cancelada';
  }

  render();
});

categoryFilter.addEventListener('change', renderMaterials);

resetDataBtn.addEventListener('click', () => {
  const shouldReset = window.confirm('¿Deseas volver a los datos iniciales del sistema?');
  if (!shouldReset) return;

  const seeded = hydrateInitialData(initialData);
  state.materials = seeded.materials;
  state.reservations = seeded.reservations;
  render();
});

const today = new Date();
const isoToday = today.toISOString().split('T')[0];
const dateInputStart = document.getElementById('startDate');
const dateInputEnd = document.getElementById('endDate');
dateInputStart.value = isoToday;
dateInputEnd.value = isoToday;

render();






















