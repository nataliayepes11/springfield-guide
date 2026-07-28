// api.js
// Encargado exclusivamente de la comunicación con The Simpsons API.
// https://thesimpsonsapi.com/

const BASE_URL = 'https://thesimpsonsapi.com/api';
const IMAGE_BASE_URL = 'https://cdn.thesimpsonsapi.com/500';
const PAGE_SIZE = 20; // fijo por la API, no configurable
const REQUEST_CONCURRENCY = 8; // cuántas páginas pedimos en simultáneo

/**
 * Pide una única página de personajes a la API.
 * @param {number} page
 * @returns {Promise<{count:number, pages:number, results:Array}>}
 */
async function fetchCharactersPage(page) {
  const response = await fetch(`${BASE_URL}/characters?page=${page}`);
  if (!response.ok) {
    throw new Error(`No se pudo obtener la página ${page} (status ${response.status})`);
  }
  return response.json();
}

/**
 * Trae TODOS los personajes de la API, paginando internamente en
 * lotes concurrentes. Se hace una sola vez al iniciar la app y el
 * resultado se guarda en memoria para que la búsqueda, el orden y el
 * paginado se resuelvan 100% en el frontend, como pide la consigna.
 *
 * @param {(loaded:number, total:number) => void} onProgress callback opcional para la UI
 * @returns {Promise<Array>} lista completa de personajes
 */
export async function fetchAllCharacters(onProgress) {
  const firstPage = await fetchCharactersPage(1);
  const totalPages = firstPage.pages;
  const allCharacters = [...firstPage.results];

  const remainingPages = [];
  for (let page = 2; page <= totalPages; page += 1) {
    remainingPages.push(page);
  }

  let loadedPages = 1;
  if (onProgress) onProgress(loadedPages, totalPages);

  for (let i = 0; i < remainingPages.length; i += REQUEST_CONCURRENCY) {
    const batch = remainingPages.slice(i, i + REQUEST_CONCURRENCY);
    const batchResponses = await Promise.all(batch.map(fetchCharactersPage));

    batchResponses.forEach((pageData) => {
      allCharacters.push(...pageData.results);
    });

    loadedPages += batch.length;
    if (onProgress) onProgress(loadedPages, totalPages);
  }

  return allCharacters;
}

/**
 * Arma la URL completa de la imagen de un personaje.
 * @param {string|null} portraitPath ej: "/character/1.webp"
 */
const NO_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">' +
      '<rect width="100%" height="100%" fill="%233f72af"/>' +
      '<text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">📺</text>' +
      '</svg>',
  );

export function getImageUrl(portraitPath) {
  if (!portraitPath) return NO_IMAGE_PLACEHOLDER;
  return `${IMAGE_BASE_URL}${portraitPath}`;
}

export { PAGE_SIZE };
