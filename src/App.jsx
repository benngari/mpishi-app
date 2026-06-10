import { useState } from 'react'
import './App.css'

const POPULAR_MEALS = [
  'Ugali na Sukuma Wiki', 'Nyama Choma', 'Pilau', 'Githeri',
  'Matumbo', 'Mandazi', 'Chapati', 'Mutura', 'Mokimo',
  'Samaki wa Kupaka', 'Maharagwe', 'Irio', 'Wali wa Nazi',
  'Mursik', 'Nyoyo', 'Kachumbari'
]

const MEAL_COMBOS = [
  {
    name: 'Ugali + Sukuma Wiki + Nyama Choma',
    emojis: ['🫓','🥬','🍖'],
    desc: 'The quintessential Kenyan feast — stiff ugali paired with braised collard greens and fire-grilled meat. Perfect for Sunday family lunch.',
    badge: 'classic'
  },
  {
    name: 'Pilau + Kachumbari + Mango Juice',
    emojis: ['🍚','🥗','🥭'],
    desc: 'Fragrant spiced rice with a fresh tomato-onion salad and chilled mango juice. A coastal Kenyan celebration staple.',
    badge: 'popular'
  },
  {
    name: 'Chapati + Maharagwe + Avocado',
    emojis: ['🫓','🫘','🥑'],
    desc: 'Soft flaky chapati scooped with rich red bean stew, finished with sliced avocado. Hearty Kenyan breakfast or supper.',
    badge: 'classic'
  },
  {
    name: 'Githeri + Kachumbari + Chai',
    emojis: ['🌽','🥗','☕'],
    desc: 'Boiled maize and beans, the humble schoolyard classic, elevated with spicy kachumbari and a mug of spiced Kenyan tea.',
    badge: 'classic'
  },
  {
    name: 'Mutura + Samosa + Cold Tusker',
    emojis: ['🌭','🥟','🍺'],
    desc: 'Grilled Kenyan black pudding alongside crispy beef samosas. The perfect nyama choma joint street snack combo.',
    badge: 'popular'
  },
  {
    name: 'Irio + Nyama ya Mbuzi + Mursik',
    emojis: ['🟢','🐐','🥛'],
    desc: 'Kikuyu-style mashed peas, potato and corn, served with goat stew and a cup of traditional fermented milk.',
    badge: 'festival'
  },
  {
    name: 'Wali wa Nazi + Samaki wa Kupaka + Mabuyu',
    emojis: ['🍚','🐟','🌺'],
    desc: 'Coastal coconut rice with grilled fish in coconut-tamarind sauce. A Swahili coast dinner with baobab candy dessert.',
    badge: 'festival'
  },
  {
    name: 'Mandazi + Chai ya Tangawizi',
    emojis: ['🍩','☕'],
    desc: 'Puffy deep-fried dough triangles dunked in hot ginger-spiced tea. The beloved Kenyan morning or evening snack.',
    badge: 'popular'
  }
]

async function callClaude(prompt, systemMsg) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemMsg,
      messages: [{ role: "user", content: prompt }]
    })
  })
  const data = await response.json()
  if (!data.content) throw new Error("No response from API")
  return data.content.map(b => b.text || '').join('')
}

function LoadingDots({ message }) {
  return (
    <div className="loading">
      <div className="loading-dots"><span/><span/><span/></div>
      <p>{message}</p>
    </div>
  )
}

function SuggestTab() {
  const [meal, setMeal] = useState('')
  const [time, setTime] = useState('any')
  const [people, setPeople] = useState('2')
  const [mood, setMood] = useState('')
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeRecipe, setActiveRecipe] = useState(null)
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [recipe, setRecipe] = useState(null)

  const MOODS = ['Spicy 🌶️', 'Light & Healthy', 'Street Food', 'Coastal', 'Upcountry', 'Quick Meal', 'Celebration']

  const toggleMood = (m) => setSelected(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m])

  const suggest = async () => {
    setLoading(true)
    setResult(null)
    setError('')
    setRecipe(null)
    setActiveRecipe(null)
    try {
      const prompt = `Suggest 5 Kenyan meal combinations for:
- Meal type/preference: ${meal || 'any Kenyan food'}
- Time of day: ${time}
- People: ${people}
- Mood/style: ${selected.join(', ') || 'no preference'}

Return ONLY valid JSON, no markdown, no backticks. Format:
{"meals":[{"name":"...","emoji":"...","desc":"...","tags":["..."],"region":"..."}]}`

      const sys = `You are Mpishi, a Kenyan cuisine expert AI. You know all Kenyan regional foods: Luo, Kikuyu, Coastal Swahili, Maasai, Luhya, Kalenjin, Kamba, Meru cuisines. Always respond with valid JSON only, no preamble.`

      const text = await callClaude(prompt, sys)
      const clean = text.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      setResult(data.meals)
    } catch (e) {
      setError('Samahani! Could not get suggestions. Please try again.')
    }
    setLoading(false)
  }

  const getRecipe = async (mealName) => {
    setActiveRecipe(mealName)
    setRecipeLoading(true)
    setRecipe(null)
    try {
      const prompt = `Give a detailed authentic Kenyan recipe for: ${mealName}

Return ONLY valid JSON, no markdown, no backticks:
{"name":"...","emoji":"...","desc":"...","prep":"15 mins","cook":"30 mins","serves":"4","difficulty":"Easy","ingredients":["..."],"steps":["..."],"tip":"..."}`

      const sys = `You are Mpishi, a Kenyan chef AI. Give authentic traditional Kenyan recipes with local ingredient names. Respond ONLY with valid JSON.`
      const text = await callClaude(prompt, sys)
      const clean = text.replace(/```json|```/g, '').trim()
      setRecipe(JSON.parse(clean))
    } catch(e) {
      setError('Could not fetch recipe. Please try again.')
    }
    setRecipeLoading(false)
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-orb">🤖</div>
        <h3>AI Meal Suggester — Tell Mpishi what you're craving</h3>
      </div>
      <div className="ai-panel-body">
        <div className="prefs-grid">
          <div className="pref-group">
            <label>What meal?</label>
            <input value={meal} onChange={e => setMeal(e.target.value)} placeholder="e.g. rice, beef, fish, beans..." />
          </div>
          <div className="pref-group">
            <label>Time of day</label>
            <select value={time} onChange={e => setTime(e.target.value)}>
              <option value="any">Any time</option>
              <option value="breakfast">Breakfast / Chai time</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner / Supper</option>
              <option value="snack">Snack / Kadio</option>
            </select>
          </div>
          <div className="pref-group">
            <label>Serving for</label>
            <select value={people} onChange={e => setPeople(e.target.value)}>
              <option value="1">Myself (1)</option>
              <option value="2">2 people</option>
              <option value="4">Family (4)</option>
              <option value="8">Big group (8+)</option>
            </select>
          </div>
        </div>

        <div className="quick-tags-label">Mood / Style</div>
        <div className="quick-tags">
          {MOODS.map(m => (
            <button key={m} className={`quick-tag${selected.includes(m) ? ' selected' : ''}`} onClick={() => toggleMood(m)}>{m}</button>
          ))}
        </div>

        <button className="suggest-btn" onClick={suggest} disabled={loading}>
          {loading ? '⏳ Mpishi is thinking...' : '✨ Suggest Kenyan Meals'}
        </button>

        {error && <p style={{color:'var(--burnt-sienna)',marginTop:'1rem',fontSize:'0.85rem'}}>{error}</p>}

        {loading && <LoadingDots message="Mpishi is curating the perfect Kenyan combinations for you..." />}

        {result && !loading && (
          <div className="suggestions-result">
            <h4>🍽️ Mpishi's Recommendations for You</h4>
            <div className="meal-cards">
              {result.map((meal, i) => (
                <div key={i} className={`meal-card${activeRecipe === meal.name ? ' selected' : ''}`}>
                  <div className="meal-card-emoji">{meal.emoji}</div>
                  <h5>{meal.name}</h5>
                  <p>{meal.desc}</p>
                  <div className="meal-card-tags">
                    {meal.tags?.map((t,j) => <span key={j} className="meal-tag">{t}</span>)}
                    {meal.region && <span className="meal-tag" style={{background:'var(--muted-green)'}}>{meal.region}</span>}
                  </div>
                  <button className="get-recipe-btn" onClick={() => getRecipe(meal.name)}>
                    📖 Get Recipe
                  </button>
                </div>
              ))}
            </div>

            {recipeLoading && <LoadingDots message={`Fetching authentic recipe for ${activeRecipe}...`} />}

            {recipe && !recipeLoading && <RecipeCard recipe={recipe} />}
          </div>
        )}
      </div>
    </div>
  )
}

function RecipeTab() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const [error, setError] = useState('')

  const fetchRecipe = async (meal) => {
    const q = meal || query
    if (!q.trim()) return
    setLoading(true)
    setRecipe(null)
    setError('')
    setQuery(q)
    try {
      const prompt = `Give a detailed authentic Kenyan recipe for: ${q}

Return ONLY valid JSON, no markdown, no backticks:
{"name":"...","emoji":"...","desc":"...","prep":"15 mins","cook":"30 mins","serves":"4","difficulty":"Easy","ingredients":["..."],"steps":["..."],"tip":"..."}`

      const sys = `You are Mpishi, a Kenyan chef. Give authentic traditional Kenyan recipes. Use local Swahili/tribal ingredient names where relevant. Respond ONLY with valid JSON.`
      const text = await callClaude(prompt, sys)
      const clean = text.replace(/```json|```/g, '').trim()
      setRecipe(JSON.parse(clean))
    } catch(e) {
      setError('Samahani! Could not fetch that recipe. Please try another meal.')
    }
    setLoading(false)
  }

  return (
    <div className="recipe-panel">
      <div className="recipe-search">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchRecipe()}
          placeholder="Search any Kenyan meal... e.g. Pilau, Mukimo, Matumbo"
        />
        <button className="search-btn" onClick={() => fetchRecipe()} disabled={loading}>
          {loading ? '⏳' : '🔍 Get Recipe'}
        </button>
      </div>

      {!recipe && !loading && (
        <div className="popular-meals">
          <h4>Popular Kenyan Meals</h4>
          <div className="popular-grid">
            {POPULAR_MEALS.map(m => (
              <button key={m} className="popular-chip" onClick={() => fetchRecipe(m)}>{m}</button>
            ))}
          </div>
        </div>
      )}

      {loading && <LoadingDots message="Mpishi is preparing the recipe..." />}
      {error && <p style={{padding:'1rem', color:'var(--burnt-sienna)', fontSize:'0.85rem'}}>{error}</p>}

      {recipe && !loading && (
        <div className="recipe-display">
          <RecipeCard recipe={recipe} />
          <button className="suggest-btn" style={{marginTop:'1.5rem'}} onClick={() => { setRecipe(null); setQuery('') }}>
            ← Search Another Meal
          </button>
        </div>
      )}
    </div>
  )
}

function CombosTab() {
  const [activeCombo, setActiveCombo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comboDetail, setComboDetail] = useState(null)
  const [error, setError] = useState('')

  const getComboRecipe = async (combo) => {
    setActiveCombo(combo.name)
    setLoading(true)
    setComboDetail(null)
    setError('')
    try {
      const prompt = `Describe this classic Kenyan meal combination: "${combo.name}"
Include how each item is prepared and why they go well together.

Return ONLY valid JSON:
{"name":"...","emoji":"🍽️","desc":"...","prep":"20 mins","cook":"45 mins","serves":"4","difficulty":"Medium","ingredients":["..."],"steps":["..."],"tip":"..."}`

      const sys = `You are Mpishi, a Kenyan cuisine expert. Describe how to prepare this full meal combination. Respond ONLY with valid JSON.`
      const text = await callClaude(prompt, sys)
      const clean = text.replace(/```json|```/g, '').trim()
      setComboDetail(JSON.parse(clean))
    } catch(e) {
      setError('Could not load this combination. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="combos-panel">
      <h3>Classic Kenyan Combinations</h3>
      <p>Time-honoured pairings that Kenyans have loved for generations. Click any to get the full recipe.</p>

      {MEAL_COMBOS.map((combo, i) => (
        <div key={i} className="combo-card" onClick={() => getComboRecipe(combo)}>
          <div className="combo-emojis">
            {combo.emojis.map((e,j) => (
              <span key={j}>{e}{j < combo.emojis.length-1 && <span className="combo-plus"> + </span>}</span>
            ))}
          </div>
          <div className="combo-info">
            <h5>{combo.name}</h5>
            <p>{combo.desc}</p>
          </div>
          <span className={`combo-badge ${combo.badge}`}>
            {combo.badge === 'classic' ? '⭐ Classic' : combo.badge === 'festival' ? '🎉 Festival' : '🔥 Popular'}
          </span>
        </div>
      ))}

      {loading && <LoadingDots message={`Loading ${activeCombo} combination recipe...`} />}
      {error && <p style={{color:'var(--burnt-sienna)',fontSize:'0.85rem'}}>{error}</p>}
      {comboDetail && !loading && (
        <div style={{marginTop:'1.5rem', borderTop:'2px solid var(--soft-sand)', paddingTop:'1.5rem'}}>
          <RecipeCard recipe={comboDetail} />
        </div>
      )}
    </div>
  )
}

function RecipeCard({ recipe }) {
  return (
    <div>
      <div className="recipe-header">
        <div className="recipe-emoji">{recipe.emoji}</div>
        <div className="recipe-title">
          <h3>{recipe.name}</h3>
          <p>{recipe.desc}</p>
          <div className="recipe-meta">
            <span className="meta-chip">⏱ Prep: {recipe.prep}</span>
            <span className="meta-chip">🔥 Cook: {recipe.cook}</span>
            <span className="meta-chip">👥 Serves: {recipe.serves}</span>
            <span className="meta-chip">📊 {recipe.difficulty}</span>
          </div>
        </div>
      </div>
      <div className="recipe-body">
        <div className="ingredients-section">
          <h4>Ingredients</h4>
          <ul className="ingredient-list">
            {recipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </div>
        <div className="steps-section">
          <h4>How to Cook</h4>
          <ol className="steps-list">
            {recipe.steps?.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          {recipe.tip && (
            <div className="tips-box">
              <h4>💡 Mpishi's Tip</h4>
              <p>{recipe.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('suggest')

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🫕</div>
          <div>
            <h1>Mpishi</h1>
            <span>Kenyan AI Chef</span>
          </div>
        </div>
        <p className="header-tagline">Chakula Bora • Ladha ya Kenya</p>
      </header>

      <div className="hero">
        <div className="hero-content">
          <h2>Your Personal <em>Kenyan Chef</em>, Powered by AI</h2>
          <p>From Ugali to Pilau, Mutura to Wali wa Nazi — Mpishi knows Kenya's rich culinary heritage and guides you through every dish.</p>
          <div className="hero-badges">
            <span className="badge">🌍 All 47 Counties' Cuisine</span>
            <span className="badge">🫕 Coastal & Upcountry</span>
            <span className="badge">🌶️ Authentic Recipes</span>
            <span className="badge">✨ AI-Powered</span>
          </div>
        </div>
      </div>

      <main className="main">
        <div className="tabs">
          <button className={`tab${tab === 'suggest' ? ' active' : ''}`} onClick={() => setTab('suggest')}>
            <span className="tab-icon">✨</span> Suggest Meals
          </button>
          <button className={`tab${tab === 'recipe' ? ' active' : ''}`} onClick={() => setTab('recipe')}>
            <span className="tab-icon">📖</span> Get Recipe
          </button>
          <button className={`tab${tab === 'combos' ? ' active' : ''}`} onClick={() => setTab('combos')}>
            <span className="tab-icon">🍽️</span> Classic Combos
          </button>
        </div>

        {tab === 'suggest' && <SuggestTab />}
        {tab === 'recipe' && <RecipeTab />}
        {tab === 'combos' && <CombosTab />}
      </main>

      <footer className="footer">
        <p>🫕 <span>Mpishi</span> — Celebrating Kenya's culinary heritage, one meal at a time · <span>Nakupenda Kenya</span> 🇰🇪</p>
      </footer>
    </div>
  )
}
