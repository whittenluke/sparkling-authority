import Parser from 'rss-parser'

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
  description?: string
}

const parser = new Parser()
const CACHE_DURATION = 1800000 // 30 minutes in milliseconds
const MAX_ARTICLES = 10

// In-memory cache
let newsCache: {
  items: NewsItem[]
  lastFetched: number
} = {
  items: [],
  lastFetched: 0
}

const searchTerms = [
  'sparkling water',
  'mineral water',
  'seltzer water',
  'bubbly water'
]

// Helper function to normalize titles for comparison
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    // Remove source from title (typically after " - ")
    .split(' - ')[0]
    // Remove common filler words
    .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, '')
    // Remove punctuation
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim()
}

// Helper function to check if titles are similar
function areTitlesSimilar(title1: string, title2: string): boolean {
  const normalized1 = normalizeTitle(title1)
  const normalized2 = normalizeTitle(title2)
  
  // If either title contains the other, they're probably about the same thing
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true
  }
  
  // Calculate word overlap
  const words1 = new Set(normalized1.split(' '))
  const words2 = new Set(normalized2.split(' '))
  const overlap = [...words1].filter(word => words2.has(word)).length
  const totalWords = Math.max(words1.size, words2.size)
  
  // If more than 35% of words overlap, consider them similar
  return overlap / totalWords > 0.35
}

export async function fetchSparklingWaterNews(): Promise<NewsItem[]> {
  // Check cache
  if (
    newsCache.items.length > 0 &&
    Date.now() - newsCache.lastFetched < CACHE_DURATION
  ) {
    return newsCache.items
  }

  try {
    const allItems: NewsItem[] = []
    const seenUrls = new Set<string>()

    // Fetch news for each search term
    for (const term of searchTerms) {
      const encodedTerm = encodeURIComponent(term)
      const url = `https://news.google.com/rss/search?q=${encodedTerm}&hl=en-US&gl=US&ceid=US:en`
      
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const xmlText = await response.text()
        const feed = await parser.parseString(xmlText)
        
        feed.items.forEach(item => {
          if (item.link && !seenUrls.has(item.link)) {
            // Check if we already have a similar article
            const hasSimilarArticle = allItems.some(existingItem => 
              areTitlesSimilar(existingItem.title, item.title || '')
            )
            
            if (!hasSimilarArticle) {
              seenUrls.add(item.link)
              allItems.push({
                title: item.title || '',
                link: item.link,
                pubDate: item.pubDate || '',
                source: item.source?.name || extractSourceFromTitle(item.title || ''),
                description: item.contentSnippet
              })
            }
          }
        })
      } catch (error) {
        console.error(`Error fetching news for term "${term}":`, error)
      }
    }

    // Sort by date, most recent first, and limit to MAX_ARTICLES
    const sortedItems = allItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, MAX_ARTICLES)

    // Update cache
    newsCache = {
      items: sortedItems,
      lastFetched: Date.now()
    }

    return sortedItems
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

function extractSourceFromTitle(title: string): string {
  const parts = title.split(' - ')
  return parts.length > 1 ? parts[parts.length - 1] : ''
} 