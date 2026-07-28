// app.js
// Punto de entrada: conecta el estado, la API y el renderizado,
// y escucha los eventos del usuario.

import { fetchAllCharacters } from './api.js';
import {
  state,
  getFilteredCharacters,
  getTotalPages,
  getCurrentPageItems,
  clampCurrentPage,
  resetFilters,
} from './state.js';
import {
  showLoading,
  updateLoadingProgress,
  hideLoading,
  renderResultsCount,
  renderCards,
  renderPagination,
  openCharacterModal,
  closeCharacterModal,
  els,
} from './render.js';

const DOM = {
  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  genderFilter: document.getElementById('genderFilter'),
  sortOrder: document.getElementById('sortOrder'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  darkModeToggle: document.getElementById('darkModeToggle'),
};

let searchDebounceId = null;

/**
 * Vuelve a calcular la lista visible según el estado actual
 * y repinta grilla + contador + paginado.
 */
function renderCurrentView() {
  const filtered = getFilteredCharacters();
  const totalPages = getTotalPages(filtered.length);
  clampCurrentPage(totalPages);

  const pageItems = getCurrentPageItems(filtered);

  renderResultsCount(filtered.length);
  renderCards(pageItems, handleCardClick);
  renderPagination(state.currentPage, totalPages);
}

function goToPage(page) {
  state.currentPage = page;
  renderCurrentView();
  document.getElementById('charactersGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleCardClick(character) {
  state.lastListState = { page: state.currentPage };
  openCharacterModal(character);
}

function handleCloseModal() {
  closeCharacterModal();
  if (state.lastListState) {
    goToPage(state.lastListState.page);
  }
}

function wireFilterEvents() {
  DOM.searchInput.addEventListener('input', (event) => {
    clearTimeout(searchDebounceId);
    searchDebounceId = setTimeout(() => {
      state.searchTerm = event.target.value;
      state.currentPage = 1;
      renderCurrentView();
    }, 200);
  });

  DOM.statusFilter.addEventListener('change', (event) => {
    state.statusFilter = event.target.value;
    state.currentPage = 1;
    renderCurrentView();
  });

  DOM.genderFilter.addEventListener('change', (event) => {
    state.genderFilter = event.target.value;
    state.currentPage = 1;
    renderCurrentView();
  });

  DOM.sortOrder.addEventListener('change', (event) => {
    state.sortOrder = event.target.value;
    renderCurrentView();
  });

  DOM.clearFiltersBtn.addEventListener('click', () => {
    resetFilters();
    DOM.searchInput.value = '';
    DOM.statusFilter.value = 'all';
    DOM.genderFilter.value = 'all';
    DOM.sortOrder.value = 'none';
    renderCurrentView();
  });
}

function wirePaginationEvents() {
  els.firstPageBtn.addEventListener('click', () => goToPage(1));
  els.prevPageBtn.addEventListener('click', () => goToPage(state.currentPage - 1));
  els.nextPageBtn.addEventListener('click', () => goToPage(state.currentPage + 1));
  els.lastPageBtn.addEventListener('click', () => {
    const totalPages = getTotalPages(getFilteredCharacters().length);
    goToPage(totalPages);
  });
  els.pageSelect.addEventListener('change', (event) => {
    goToPage(Number(event.target.value));
  });
}

function wireModalEvents() {
  document.getElementById('modalCloseBtn').addEventListener('click', handleCloseModal);
  els.modalOverlay.addEventListener('click', (event) => {
    if (event.target === els.modalOverlay) handleCloseModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.modalOverlay.hidden) handleCloseModal();
  });
}

function wireDarkModeToggle() {
  const stored = null; // no usamos localStorage en este entorno de vista previa
  DOM.darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    DOM.darkModeToggle.setAttribute('aria-pressed', String(isDark));
    DOM.darkModeToggle.querySelector('.knob__icon').textContent = isDark ? '☀' : '☾';
  });
}

async function init() {
  wireFilterEvents();
  wirePaginationEvents();
  wireModalEvents();
  wireDarkModeToggle();

  showLoading();
  try {
    state.allCharacters = await fetchAllCharacters(updateLoadingProgress);
  } catch (error) {
    console.error(error);
    els.resultsCount.textContent = 'Ocurrió un error al cargar los personajes. Recargá la página.';
    hideLoading();
    return;
  }
  hideLoading();

  renderCurrentView();
}

document.addEventListener('DOMContentLoaded', init);
