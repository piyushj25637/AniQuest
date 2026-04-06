const animeGrid = document.getElementById('anime-grid');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const genreFilter = document.getElementById('genre-filter');
const gridTitle = document.getElementById('grid-title');

const API_BASE = 'https://kitsu.io/api/edge/anime';
let activeGenres = new Set();

async function fetchAnime() {
    showLoading();

    const query = searchInput.value;
    const sort = sortSelect.value;

    gridTitle.textContent = query ? `Results for "${query}"` : "Trending Now";

    try {
        const PAGE_SIZE = 20;
        const PAGES_TO_FETCH = 3;
        let allFetchedAnime = [];

        const promises = [];
        for (let i = 0; i < PAGES_TO_FETCH; i++) {
            let url = `${API_BASE}?page[limit]=${PAGE_SIZE}&page[offset]=${i * PAGE_SIZE}`;

            if (query) {
                url += `&filter[text]=${encodeURIComponent(query)}`;
            }
            if (activeGenres.size > 0) {
                url += `&filter[categories]=${Array.from(activeGenres).join(',')}`;
            }
            if (sort !== 'canonicalTitle') {
                url += `&sort=${sort}`;
            }

            promises.push(fetch(url).then(res => res.json()));
        }

        const results = await Promise.all(promises);
        results.forEach(data => {
            if (data.data) {
                allFetchedAnime = [...allFetchedAnime, ...data.data];
            }
        });

        if (sort === 'canonicalTitle') {
            allFetchedAnime.sort((a, b) => {
                const titleA = (a.attributes.canonicalTitle || '').toLowerCase();
                const titleB = (b.attributes.canonicalTitle || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });
        }

        renderAnime(allFetchedAnime.slice(0, 60));
    } catch (error) {
        console.error('Fetch error:', error);
        animeGrid.innerHTML = `<div class="loader-container"><p style="color:var(--error)">Failed to load data. Please check your connection.</p></div>`;
    }
}

function showLoading() {
    animeGrid.innerHTML = `
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Updating archive...</p>
                </div>
            `;
}

function renderAnime(animeList) {
    if (!animeList || animeList.length === 0) {
        animeGrid.innerHTML = `<div class="loader-container"><p>No results found for your search criteria.</p></div>`;
        return;
    }

    animeGrid.innerHTML = '';
    animeList.forEach((anime, index) => {
        const attr = anime.attributes;
        const title = attr.canonicalTitle || 'Unknown Title';
        const poster = attr.posterImage ? attr.posterImage.medium : 'https://placehold.co/400x600?text=No+Poster';
        const rating = attr.averageRating ? (attr.averageRating / 10).toFixed(1) : 'N/A';
        const type = attr.showType || 'TV';
        const status = attr.status ? attr.status.replace('_', ' ') : '';

        const card = document.createElement('div');
        card.className = 'anime-card fade-in';
        card.style.animationDelay = `${index * 0.015}s`;

        card.innerHTML = `
                    <div class="card-image-wrapper">
                        <img alt="${title}" loading="lazy" src="${poster}"/>
                        <div class="card-overlay"></div>
                        <div class="rating-badge">${rating}</div>
                    </div>
                    <h3 class="card-title" title="${title}">${title}</h3>
                    <div class="card-meta">
                        <span>${type}</span>
                        <span>•</span>
                        <span style="text-transform: uppercase">${status}</span>
                    </div>
                `;
        animeGrid.appendChild(card);
    });
}

let debounceTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchAnime(), 600);
});
sortSelect.addEventListener('change', fetchAnime);

genreFilter.addEventListener('click', (e) => {
    const chip = e.target.closest('.genre-chip');
    if (!chip) return;

    const genre = chip.dataset.genre;
    if (activeGenres.has(genre)) {
        activeGenres.delete(genre);
        chip.classList.remove('active');
    } else {
        activeGenres.add(genre);
        chip.classList.add('active');
    }
    fetchAnime();
});

document.addEventListener('DOMContentLoaded', () => fetchAnime());