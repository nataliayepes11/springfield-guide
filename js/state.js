// state.js
// Guarda el estado de la aplicación y expone funciones puras para
// derivar la lista visible (filtrada + ordenada + paginada).

import { PAGE_SIZE } from './api.js';

export const state = {
  allCharacters: [],   // dataset completo, se llena una sola vez
  searchTerm: '',
  statusFilter: 'all',
  genderFilter: 'all',
  sortOrder: 'none',    // 'none' | 'asc' | 'desc'
  currentPage: 1,
  lastListState: null,  // guarda página/scroll antes de abrir el modal
};

/**
 * Aplica búsqueda + filtros + orden sobre el dataset completo.
 * No toca el DOM: función pura, fácil de testear.
 */
export function getFilteredCharacters() {
  const term = state.searchTerm.trim().toLowerCase();

  let result = state.allCharacters.filter((character) => {
    const matchesName = term === '' || character.name.toLowerCase().includes(term);
    const matchesStatus = state.statusFilter === 'all' || character.status === state.statusFilter;
    const matchesGender = state.genderFilter === 'all' || character.gender === state.genderFilter;
    return matchesName && matchesStatus && matchesGender;
  });

  if (state.sortOrder === 'asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  } else if (state.sortOrder === 'desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name, 'es'));
  }

  return result;
}

export function getTotalPages(filteredCount) {
  return Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
}

/**
 * Recorta la lista filtrada a la página actual.
 */
export function getCurrentPageItems(filteredCharacters) {
  const start = (state.currentPage - 1) * PAGE_SIZE;
  return filteredCharacters.slice(start, start + PAGE_SIZE);
}

export function clampCurrentPage(totalPages) {
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  if (state.currentPage < 1) state.currentPage = 1;
}

export function resetFilters() {
  state.searchTerm = '';
  state.statusFilter = 'all';
  state.genderFilter = 'all';
  state.sortOrder = 'none';
  state.currentPage = 1;
}
