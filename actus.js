// API Keys and URLs
const WORLD_NEWS_API_KEY = '2a585ad910e741aebe3d54a25ff37deb';
const ALPHA_VANTAGE_API_KEY = 'K2RWMAP64LYVK2MN';
const CALENDARIFIC_API_KEY = 'HnkrSAWviepO5lKMUS1edPgvVj69gAMC';

// Liste d'entreprises pour AlphaVantage
const companies = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'BTC', 'ETH', 'USD', 'META', 'MC'];

// Helper function to show loading state
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.querySelector('.card-content').innerHTML = '<p>Chargement...</p>';
    }
}

// Helper function to show error state
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.querySelector('.card-content').innerHTML = `<p class="error">${message}</p>`;
    }
}

// Function to fetch world news
async function fetchWorldNews() {
    showLoading('world-news');
    try {
        const response = await fetch(`https://api.worldnewsapi.com/search-news?api-key=${WORLD_NEWS_API_KEY}&text=world&language=fr&number=5`);
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur actualités:', error);
        showError('world-news', 'Impossible de charger les actualités.');
        return null;
    }
}

// Function to fetch stock market data
async function fetchStockMarket() {
    showLoading('stock-market');
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${randomCompany}&apikey=${ALPHA_VANTAGE_API_KEY}`);
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        return { ...data, symbol: randomCompany };
    } catch (error) {
        console.error('Erreur marché boursier:', error);
        showError('stock-market', 'Impossible de charger les données financières.');
        return null;
    }
}

async function fetchSpecialDays() {
    showLoading('special-day');
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    try {
        const types = ['national', 'local', 'religious', 'observance'].join(',');
        const response = await fetch(
            `https://calendarific.com/api/v2/holidays?` +
            `api_key=${CALENDARIFIC_API_KEY}` +
            `&country=FR` +
            `&year=${year}` +
            `&month=${month}` +
            `&day=${day}` +
            `&type=${types}`
        );
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur jours spéciaux:', error);
        showError('special-day', 'Impossible de charger les jours spéciaux.');
        return null;
    }
}

// Add ZenQuotes API function
async function fetchDailyQuote() {
    showLoading('daily-quote');
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
        
        const data = await response.json();
        console.log(data); // Debugging: vérifier la structure de la réponse
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('Erreur citation:', error);
        showError('daily-quote', 'Impossible de charger la citation du jour.');
        return null;
    }
}

// Ajouter ces nouvelles fonctions après les autres fonctions fetch
async function fetchFeteDuJour() {
    showLoading('special-day');
    try {
        const response = await fetch('https://fetedujour.fr/api/v2/KILuXlDD9QaGlBg2/json-normal');
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur fête du jour:', error);
        showError('special-day', 'Impossible de charger la fête du jour.');
        return null;
    }
}

// Update world news display
function updateWorldNews(data) {
    const worldNewsElement = document.getElementById('world-news');
    const contentElement = worldNewsElement.querySelector('.card-content');
    if (data && data.news && data.news.length > 0) {
        const newsHtml = data.news.map(article => `
            <article>
                <h3>${article.title}</h3>
                <p>${article.text.substring(0, 100)}...</p>
                <a href="${article.url}" target="_blank">Lire plus</a>
            </article>
        `).join('');
        contentElement.innerHTML = newsHtml;
    } else {
        contentElement.innerHTML = '<p>Aucune actualité disponible pour le moment.</p>';
    }
}

// Update stock market display
function updateStockMarket(data) {
    const stockMarketElement = document.getElementById('stock-market');
    const contentElement = stockMarketElement.querySelector('.card-content');
    if (data && data['Global Quote']) {
        const quote = data['Global Quote'];
        contentElement.innerHTML = `
            <h3>${data.symbol}</h3>
            <p>Prix: ${quote['05. price']}</p>
            <p>Variation: ${quote['09. change']} (${quote['10. change percent']})</p>
            <p>Volume: ${quote['06. volume']}</p>
        `;
    } else {
        contentElement.innerHTML = '<p>Données du marché boursier indisponibles.</p>';
    }
}

// Update special days display
function updateSpecialDays(data) {
    const specialDaysElement = document.getElementById('special-day');
    const contentElement = specialDaysElement.querySelector('.card-content');
    if (data && data.response && data.response.holidays && data.response.holidays.length > 0) {
        const specialDays = data.response.holidays;
        const specialDaysHtml = specialDays.map(day => {
            // Format the types for display
            const types = Array.isArray(day.type) ? day.type.join(', ') : day.type;
            return `
                <div class="special-day-item">
                    <h3>${day.name}</h3>
                    <p>Date: ${new Date(day.date.iso).toLocaleDateString('fr-FR')}</p>
                    <p class="holiday-type">Type: ${types}</p>
                    ${day.description ? `<p class="holiday-description">${day.description}</p>` : ''}
                </div>
            `;
        }).join('');
        contentElement.innerHTML = specialDaysHtml;
    } else {
        const currentDate = new Date();
        contentElement.innerHTML = `<p>Aucun jour spécial aujourd'hui (${currentDate.toLocaleDateString('fr-FR')}).</p>`;
    }
}

function updateDailyQuote(data) {
    const quoteElement = document.getElementById('daily-quote');
    const contentElement = quoteElement.querySelector('.card-content');
    if (data && typeof data.q === 'string' && typeof data.a === 'string') {
        contentElement.innerHTML = `
            <blockquote class="quote">
                <p>"${data.q}"</p>
                <footer>— ${data.a}</footer>
            </blockquote>
        `;
    } else {
        contentElement.innerHTML = '<p>Aucune citation disponible pour le moment.</p>';
    }
}

function updateFeteDuJour(data) {
    const specialDayElement = document.getElementById('special-day');
    const contentElement = specialDayElement.querySelector('.card-content');
    if (data && data.name) {
        contentElement.innerHTML += `
            <div class="fete-du-jour">
                <h3>Fête du jour</h3>
                <p>${data.name}</p>
            </div>
        `;
    } else {
        contentElement.innerHTML += '<p>Aucune fête du jour disponible.</p>';
    }
}

// Update functions (updateWorldNews, updateStockMarket, updateSpecialDays, updateDailyQuote) remain the same
async function loadData() {
    const worldNewsData = await fetchWorldNews();
    updateWorldNews(worldNewsData);

    const stockMarketData = await fetchStockMarket();
    updateStockMarket(stockMarketData);

    const specialDaysData = await fetchSpecialDays();
    updateSpecialDays(specialDaysData);

    const quoteData = await fetchDailyQuote();
    updateDailyQuote(quoteData);

    const feteDuJourData = await fetchFeteDuJour();
    updateFeteDuJour(feteDuJourData);

    // Update the refresh interval to include quotes
    setInterval(async () => {
        const newWorldNewsData = await fetchWorldNews();
        updateWorldNews(newWorldNewsData);

        const newStockMarketData = await fetchStockMarket();
        updateStockMarket(newStockMarketData);

        const newQuoteData = await fetchDailyQuote();
        updateDailyQuote(newQuoteData);

        const newFeteDuJourData = await fetchFeteDuJour();
        updateFeteDuJour(newFeteDuJourData);
    }, 900000); // 15 minutes
}

// Start loading data when page is ready
document.addEventListener('DOMContentLoaded', loadData);

