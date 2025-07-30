// Importer la fonction pour obtenir les saints du jour
import { getSaintsOfDay } from "./saints.js"

// API Keys et URLs
const WORLD_NEWS_API_KEY = "2a585ad910e741aebe3d54a25ff37deb"
const ALPHA_VANTAGE_API_KEY = "K2RWMAP64LYVK2MN"

// Liste d'entreprises pour AlphaVantage
const companies = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "BTC", "ETH", "USD", "META", "MC"]

// Helper function to show loading state
function showLoading(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.querySelector(".card-content").innerHTML = "<p>Chargement...</p>"
  }
}

// Helper function to show error state
function showError(elementId, message) {
  const element = document.getElementById(elementId)
  if (element) {
    element.querySelector(".card-content").innerHTML = `<p class="error">${message}</p>`
  }
}

// Function to fetch world news
async function fetchWorldNews() {
  showLoading("world-news")
  try {
    // Essayer plusieurs proxies CORS
    const proxies = [
      "https://api.allorigins.win/get?url=",
      "https://corsproxy.io/?",
      "https://cors-anywhere.herokuapp.com/",
    ]

    for (const proxy of proxies) {
      try {
        const url = `${proxy}${encodeURIComponent(`https://api.worldnewsapi.com/search-news?api-key=${WORLD_NEWS_API_KEY}&text=world&language=fr&number=5`)}`
        const response = await fetch(url)
        if (!response.ok) continue

        const data = await response.json()
        if (proxy.includes("allorigins") && data && data.contents) {
          return JSON.parse(data.contents)
        } else if (data) {
          return data
        }
      } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error)
        continue
      }
    }
    throw new Error("Tous les proxies ont échoué")
  } catch (error) {
    console.error("Erreur actualités:", error)
    showError("world-news", "Impossible de charger les actualités.")
    return null
  }
}

// Function to fetch stock market data améliorée
async function fetchStockMarket() {
  showLoading("stock-market")
  const randomCompany = companies[Math.floor(Math.random() * companies.length)]

  // APIs financières alternatives
  const stockAPIs = [
    {
      name: "AlphaVantage",
      url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${randomCompany}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      transform: (data, symbol) => {
        if (data && data["Global Quote"]) {
          const quote = data["Global Quote"]
          return {
            symbol: symbol,
            name: symbol,
            price: quote["05. price"],
            change: quote["09. change"],
            changePercent: quote["10. change percent"],
            volume: quote["06. volume"],
          }
        }
        return null
      },
    },
    {
      name: "Yahoo Finance",
      url: `https://query1.finance.yahoo.com/v8/finance/chart/${randomCompany}`,
      transform: (data, symbol) => {
        if (data && data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0]
          const meta = result.meta
          return {
            symbol: symbol,
            name: meta.longName || symbol,
            price: meta.regularMarketPrice?.toFixed(2) || "N/A",
            change: (meta.regularMarketPrice - meta.previousClose || 0).toFixed(2),
            changePercent:
              (((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100 || 0).toFixed(2) + "%",
            volume: meta.regularMarketVolume?.toLocaleString() || "N/A",
          }
        }
        return null
      },
    },
  ]

  // Proxies CORS à essayer
  const proxies = [
    "", // Sans proxy d'abord
    "https://api.allorigins.win/get?url=",
    "https://corsproxy.io/?",
    "https://cors-anywhere.herokuapp.com/",
  ]

  // Essayer chaque API avec chaque proxy
  for (const api of stockAPIs) {
    for (const proxy of proxies) {
      try {
        const url = proxy
          ? proxy.includes("allorigins")
            ? `${proxy}${encodeURIComponent(api.url)}`
            : `${proxy}${api.url}`
          : api.url

        console.log(`Tentative ${api.name} avec proxy: ${proxy || "aucun"}`)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          console.log(`${api.name} réponse non OK: ${response.status}`)
          continue
        }

        let data = await response.json()

        // Si on utilise allorigins, extraire le contenu
        if (proxy && proxy.includes("allorigins") && data.contents) {
          data = JSON.parse(data.contents)
        }

        const stockData = api.transform(data, randomCompany)
        if (stockData && stockData.price !== "N/A") {
          console.log(`Données boursières obtenues via ${api.name}:`, stockData)
          return stockData
        }
      } catch (error) {
        console.log(`Erreur ${api.name} avec proxy ${proxy}:`, error)
        continue
      }
    }
  }

  // Si toutes les APIs échouent, retourner null
  console.log("Toutes les APIs boursières ont échoué")
  return null
}

// Fonction pour obtenir les saints du jour (locale)
function fetchSpecialDays() {
  showLoading("special-day")
  try {
    // Utiliser les données locales
    const data = getSaintsOfDay()
    return data
  } catch (error) {
    console.error("Erreur saints du jour:", error)
    showError("special-day", "Impossible de charger les saints du jour.")
    return {
      success: false,
      message: "Erreur lors du chargement des saints du jour",
    }
  }
}

// Citations statiques étendues pour plus de variété
const fallbackQuotes = [
  { q: "La vie est un mystère qu'il faut vivre, et non un problème à résoudre.", a: "Gandhi" },
  { q: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", a: "Winston Churchill" },
  { q: "La simplicité est la sophistication suprême.", a: "Léonard de Vinci" },
  { q: "La créativité, c'est l'intelligence qui s'amuse.", a: "Albert Einstein" },
  { q: "Le bonheur n'est pas au bout du chemin, le bonheur est le chemin.", a: "Bouddha" },
  { q: "L'imagination est plus importante que la connaissance.", a: "Albert Einstein" },
  { q: "Soyez vous-même, tous les autres sont déjà pris.", a: "Oscar Wilde" },
  { q: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", a: "Steve Jobs" },
  {
    q: "Dans vingt ans, vous serez plus déçu par les choses que vous n'avez pas faites que par celles que vous avez faites.",
    a: "Mark Twain",
  },
  { q: "Il n'y a qu'une façon d'éviter les critiques : ne rien faire, ne rien dire et n'être rien.", a: "Aristote" },
  { q: "Le futur appartient à ceux qui croient en la beauté de leurs rêves.", a: "Eleanor Roosevelt" },
  { q: "Ce n'est pas la montagne que nous conquérons, mais nous-mêmes.", a: "Sir Edmund Hillary" },
]

// Fonction améliorée pour obtenir une citation
async function fetchDailyQuote() {
  showLoading("daily-quote")

  // Essayer plusieurs APIs de citations
  const quoteAPIs = [
    {
      url: "https://api.quotable.io/random",
      transform: (data) => ({ q: data.content, a: data.author }),
    },
    {
      url: "https://zenquotes.io/api/random",
      transform: (data) => ({ q: data[0].q, a: data[0].a }),
    },
  ]

  // Essayer plusieurs proxies CORS
  const proxies = [
    "", // Essayer d'abord sans proxy
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
  ]

  for (const api of quoteAPIs) {
    for (const proxy of proxies) {
      try {
        const url = proxy + encodeURIComponent(api.url)
        console.log(`Tentative avec: ${url}`)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          console.log(`Réponse non OK: ${response.status}`)
          continue
        }

        const data = await response.json()
        console.log("Données reçues:", data)

        const quote = api.transform(data)
        if (quote && quote.q && quote.a) {
          console.log("Citation obtenue avec succès:", quote)
          return quote
        }
      } catch (error) {
        console.log(`Erreur avec ${api.url} via ${proxy}:`, error)
        continue
      }
    }
  }

  // Si toutes les APIs échouent, utiliser une citation de secours
  console.log("Toutes les APIs ont échoué, utilisation d'une citation de secours")
  const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
  return randomQuote
}

// Update world news display
function updateWorldNews(data) {
  const worldNewsElement = document.getElementById("world-news")
  const contentElement = worldNewsElement.querySelector(".card-content")
  if (data && data.news && data.news.length > 0) {
    const newsHtml = data.news
      .map(
        (article) => `
            <article>
                <h3>${article.title}</h3>
                <p>${article.text.substring(0, 100)}...</p>
                <a href="${article.url}" target="_blank">Lire plus</a>
            </article>
        `,
      )
      .join("")
    contentElement.innerHTML = newsHtml
  } else {
    contentElement.innerHTML = "<p>Aucune actualité disponible pour le moment.</p>"
  }
}

// Mettre à jour la fonction updateStockMarket pour le nouveau format
function updateStockMarket(data) {
  const stockMarketElement = document.getElementById("stock-market")
  const contentElement = stockMarketElement.querySelector(".card-content")

  if (data && data.symbol) {
    const changeColor = data.change && data.change.startsWith("+") ? "#00ff00" : "#ff4444"

    contentElement.innerHTML = `
      <div class="stock-info">
        <h3>${data.symbol}</h3>
        <p class="stock-price">Prix: $${data.price}</p>
        <p class="stock-change" style="color: ${changeColor};">
          Variation: ${data.change} (${data.changePercent})
        </p>
        <p class="stock-volume">Volume: ${data.volume}</p>
      </div>
    `
  } else {
    contentElement.innerHTML = "<p>Données du marché boursier indisponibles.</p>"
  }
}

// Mettre à jour la fonction updateSpecialDays pour utiliser le nouveau format
function updateSpecialDays(data) {
  const specialDaysElement = document.getElementById("special-day")
  const contentElement = specialDaysElement.querySelector(".card-content")

  if (data && data.success && data.saints && data.saints.length > 0) {
    const saintsHtml = data.saints.map((saint) => `<p>${saint}</p>`).join("")
    contentElement.innerHTML = `
            <div class="special-day-item">
                <h3>Fête du jour - ${data.date}</h3>
                ${saintsHtml}
            </div>
        `
  } else {
    const currentDate = new Date()
    contentElement.innerHTML = `<p>Aucun jour spécial aujourd'hui (${currentDate.toLocaleDateString("fr-FR")}).</p>`
  }
}

function updateDailyQuote(data) {
  const quoteElement = document.getElementById("daily-quote")
  const contentElement = quoteElement.querySelector(".card-content")
  if (data && typeof data.q === "string" && typeof data.a === "string") {
    contentElement.innerHTML = `
            <blockquote class="quote">
                <p>"${data.q}"</p>
                <footer>— ${data.a}</footer>
            </blockquote>
        `
  } else {
    contentElement.innerHTML = "<p>Aucune citation disponible pour le moment.</p>"
  }
}

// Fonction principale pour charger les données
async function loadData() {
  try {
    console.log("Début du chargement des données...")

    // Charger les saints du jour (données locales)
    const specialDaysData = fetchSpecialDays()
    updateSpecialDays(specialDaysData)

    // Charger la citation avec plus de logs
    console.log("Chargement de la citation...")
    const quoteData = await fetchDailyQuote()
    console.log("Citation chargée:", quoteData)
    updateDailyQuote(quoteData)

    // Charger les actualités
    const worldNewsData = await fetchWorldNews()
    updateWorldNews(worldNewsData)

    // Charger les données boursières
    const stockMarketData = await fetchStockMarket()
    updateStockMarket(stockMarketData)

    // Mettre à jour les données toutes les 15 minutes
    setInterval(async () => {
      const newWorldNewsData = await fetchWorldNews()
      updateWorldNews(newWorldNewsData)

      const newStockMarketData = await fetchStockMarket()
      updateStockMarket(newStockMarketData)

      const newQuoteData = await fetchDailyQuote()
      updateDailyQuote(newQuoteData)
    }, 900000) // 15 minutes
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error)
  }
}

// Démarrer le chargement des données quand la page est prête
document.addEventListener("DOMContentLoaded", loadData)
