// render.js
// Funciones responsables de pintar el estado actual en el DOM.
// No deciden lógica de negocio: sólo reciben datos y los muestran.

import { getImageUrl } from './api.js';

const els = {
  grid: document.getElementById('charactersGrid'),
  emptyState: document.getElementById('emptyState'),
  resultsCount: document.getElementById('resultsCount'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  loadingText: document.getElementById('loadingText'),

  pagerNav: document.getElementById('pagerNav'),
  currentPageDisplay: document.getElementById('currentPageDisplay'),
  totalPagesDisplay: document.getElementById('totalPagesDisplay'),
  pageSelect: document.getElementById('pageSelect'),
  firstPageBtn: document.getElementById('firstPageBtn'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  lastPageBtn: document.getElementById('lastPageBtn'),

  modalOverlay: document.getElementById('modalOverlay'),
  modalStatic: document.getElementById('modalStatic'),
  modalImage: document.getElementById('modalImage'),
  modalStatusBadge: document.getElementById('modalStatusBadge'),
  modalName: document.getElementById('modalName'),
  modalOccupation: document.getElementById('modalOccupation'),
  modalAge: document.getElementById('modalAge'),
  modalBirthdate: document.getElementById('modalBirthdate'),
  modalGender: document.getElementById('modalGender'),
  modalStatus: document.getElementById('modalStatus'),
  modalPhrasesList: document.getElementById('modalPhrasesList'),
};

const STATUS_LABELS = {
  Alive: 'Vivo',
  Deceased: 'Fallecido',
};

const GENDER_LABELS = {
  Male: 'Masculino',
  Female: 'Femenino',
};

function statusBadgeClass(status) {
  if (status === 'Alive') return 'badge badge--alive';
  if (status === 'Deceased') return 'badge badge--deceased';
  return 'badge badge--unknown';
}

function statusLabel(status) {
  return STATUS_LABELS[status] || 'Desconocido';
}

export function showLoading(text = 'Sintonizando canal...') {
  els.loadingIndicator.hidden = false;
  els.loadingText.textContent = text;
}

export function updateLoadingProgress(loaded, total) {
  els.loadingText.textContent = `Sintonizando canal... (${loaded}/${total} páginas)`;
}

export function hideLoading() {
  els.loadingIndicator.hidden = true;
}

export function renderResultsCount(totalResults) {
  els.resultsCount.textContent = `${totalResults} ${totalResults === 1 ? 'resultado' : 'resultados'}`;
}

/**
 * Dibuja las tarjetas de personajes de la página actual.
 * @param {Array} characters
 * @param {(character:object) => void} onCardClick
 */
export function renderCards(characters, onCardClick) {
  els.grid.innerHTML = '';

  if (characters.length === 0) {
    els.emptyState.hidden = false;
    return;
  }
  els.emptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  characters.forEach((character) => {
    const li = document.createElement('li');
    li.className = 'card';
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Ver ficha de ${character.name}`);

    li.innerHTML = `
      <div class="card__media">
        <img
          class="card__image"
          src="${getImageUrl(character.portrait_path)}"
          alt="${character.name}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${getImageUrl(null)}';"
        />
      </div>

      <div class="card__body">

        <h3 class="card__name">
          ${character.name}
        </h3>

        <div class="card__tags">

          <span class="tag is-success is-light">
            ${statusLabel(character.status)}
          </span>

          <span class="tag is-info is-light">
            ${GENDER_LABELS[character.gender] || "Desconocido"}
          </span>

        </div>

        <button class="button is-warning is-fullwidth card__button">

          Ver detalle

        </button>

      </div>
    `;

    li.addEventListener('click', () => onCardClick(character));
    li.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCardClick(character);
      }
    });

    fragment.appendChild(li);
  });

  els.grid.appendChild(fragment);
}

/**
 * Dibuja el paginado tipo "dial de canales".
 */
export function renderPagination(currentPage, totalPages) {
  els.pagerNav.hidden = totalPages <= 0;

  els.currentPageDisplay.textContent = String(currentPage).padStart(2, '0');
  els.totalPagesDisplay.textContent = String(totalPages).padStart(2, '0');

  els.firstPageBtn.disabled = currentPage === 1;
  els.prevPageBtn.disabled = currentPage === 1;
  els.nextPageBtn.disabled = currentPage === totalPages;
  els.lastPageBtn.disabled = currentPage === totalPages;

  // Select de "ir a página específica"
  const needsRebuild = els.pageSelect.dataset.totalPages !== String(totalPages);
  if (needsRebuild) {
    els.pageSelect.innerHTML = '';
    for (let page = 1; page <= totalPages; page += 1) {
      const option = document.createElement('option');
      option.value = String(page);
      option.textContent = `Página ${page}`;
      els.pageSelect.appendChild(option);
    }
    els.pageSelect.dataset.totalPages = String(totalPages);
  }
  els.pageSelect.value = String(currentPage);
}

/**
 * Abre el modal de detalle con la info completa del personaje.
 */
export function openCharacterModal(character) {
  els.modalImage.src = getImageUrl(character.portrait_path);
  els.modalImage.alt = character.name;
  els.modalImage.onerror = () => {
    els.modalImage.onerror = null;
    els.modalImage.src = getImageUrl(null);
  };
  els.modalStatusBadge.textContent = statusLabel(character.status);
  els.modalStatusBadge.className = statusBadgeClass(character.status);

  els.modalName.textContent = character.name;
  els.modalOccupation.textContent = character.occupation || 'Ocupación desconocida';

  els.modalAge.textContent = character.age ? `${character.age} años` : 'Desconocida';
  els.modalBirthdate.textContent = character.birthdate || 'Desconocida';
  els.modalGender.textContent = GENDER_LABELS[character.gender] || 'Desconocido';
  els.modalStatus.textContent = statusLabel(character.status);

  els.modalPhrasesList.innerHTML = '';
  const phrases = character.phrases && character.phrases.length > 0
    ? character.phrases.slice(0, 6)
    : ['Este personaje todavía no tiene frases registradas.'];

  phrases.forEach((phrase) => {
    const li = document.createElement('li');
    li.textContent = `“${phrase}”`;
    els.modalPhrasesList.appendChild(li);
  });

  els.modalOverlay.hidden = false;
  // Reinicia la animación de estática cada vez que se abre
  els.modalStatic.style.animation = 'none';
  // eslint-disable-next-line no-unused-expressions
  els.modalStatic.offsetHeight; // fuerza reflow
  els.modalStatic.style.animation = '';

  document.body.style.overflow = 'hidden';
}

export function closeCharacterModal() {
  els.modalOverlay.hidden = true;
  document.body.style.overflow = '';
}

export { els };
