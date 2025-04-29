// Importer la fonction pour obtenir les saints du jour
import { getSaintsOfDay } from './saints.js';

// API Keys et URLs
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
        // Utiliser un proxy CORS pour éviter les erreurs
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.worldnewsapi.com/search-news?api-key=${WORLD_NEWS_API_KEY}&text=world&language=fr&number=5`)}`);
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        return JSON.parse(data.contents);
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
        // Utiliser un proxy CORS pour éviter les erreurs
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${randomCompany}&apikey=${ALPHA_VANTAGE_API_KEY}`)}`);
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        return { ...JSON.parse(data.contents), symbol: randomCompany };
    } catch (error) {
        console.error('Erreur marché boursier:', error);
        showError('stock-market', 'Impossible de charger les données financières.');
        return null;
    }
}

// Remplacer la fonction fetchSpecialDays par une fonction locale
function fetchSpecialDays() {
    showLoading('special-day');
    // Utiliser les données locales
    return Promise.resolve(getSaintsOfDay());
}

// Remplacer fetchDailyQuote par une version qui utilise une API compatible CORS
async function fetchDailyQuote() {
    showLoading('daily-quote');
    try {
        // Utiliser l'API quotable.io qui est compatible CORS
        const response = await fetch('https://api.quotable.io/random');
        if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
        
        const data = await response.json();
        // Adapter le format de la réponse pour correspondre à l'ancien format
        return {
            q: data.content,
            a: data.author
        };
    } catch (error) {
        console.error('Erreur citation:', error);
        showError('daily-quote', 'Impossible de charger la citation du jour.');
        return null;
    }
}

// Supprimer la fonction fetchFeteDuJour car nous utilisons maintenant fetchSpecialDays

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

// Mettre à jour la fonction updateSpecialDays pour utiliser le nouveau format
function updateSpecialDays(data) {
    const specialDaysElement = document.getElementById('special-day');
    const contentElement = specialDaysElement.querySelector('.card-content');
    
    if (data && data.success) {
        const saintsHtml = data.saints.map(saint => `<p>${saint}</p>`).join('');
        contentElement.innerHTML = `
            <div class="special-day-item">
                <h3>Fête du jour - ${data.date}</h3>
                ${saintsHtml}
            </div>
        `;
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

// Supprimer la fonction updateFeteDuJour car nous utilisons maintenant updateSpecialDays

// Fonction principale pour charger les données
async function loadData() {
    const worldNewsData = await fetchWorldNews();
    updateWorldNews(worldNewsData);

    const stockMarketData = await fetchStockMarket();
    updateStockMarket(stockMarketData);

    const specialDaysData = fetchSpecialDays();
    updateSpecialDays(specialDaysData);

    const quoteData = await fetchDailyQuote();
    updateDailyQuote(quoteData);

    // Mettre à jour les données toutes les 15 minutes
    setInterval(async () => {
        const newWorldNewsData = await fetchWorldNews();
        updateWorldNews(newWorldNewsData);

        const newStockMarketData = await fetchStockMarket();
        updateStockMarket(newStockMarketData);

        const newQuoteData = await fetchDailyQuote();
        updateDailyQuote(newQuoteData);
    }, 900000); // 15 minutes
}

// Démarrer le chargement des données quand la page est prête
document.addEventListener('DOMContentLoaded', loadData);