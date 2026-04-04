const animeGrid = document.getElementById('anime-grid');
const searchInput = document.getElementById('search-input');
const API_BASE = 'https://kitsu.io/api/edge/anime';

async function fetchAnime(query = '') {
    showLoading();
    let url = `${API_BASE}?page[limit]=10&sort=-averageRating`;
    if (query) {
        url = `${API_BASE}?filter[text]=${encodeURIComponent(query)}&page[limit]=10`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        renderAnime(data.data);
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
    if (animeList.length === 0) {
        animeGrid.innerHTML = `<div class="loader-container"><p>No results found for your search.</p></div>`;
        return;
    }

    animeGrid.innerHTML = '';
    animeList.forEach((anime, index) => {
        const attr = anime.attributes;
        const title = attr.canonicalTitle || 'Unknown Title';
        const poster = attr.posterImage ? attr.posterImage.medium : '';
        const rating = attr.averageRating ? (attr.averageRating / 10).toFixed(1) : 'N/A';
        const type = attr.showType || 'TV';
        const status = attr.status || '';

        const card = document.createElement('div');
        card.className = 'anime-card fade-in';
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${poster}" alt="${title}" loading="lazy">
                <div class="card-overlay"></div>
                <div class="rating-badge">${rating}</div>
            </div>
            <h3 class="card-title">${title}</h3>
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
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetchAnime(e.target.value);
    }, 500);
});

document.addEventListener('DOMContentLoaded', () => fetchAnime());