import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import Pagination from '../components/Pagination'
import { scoreColor } from '../utils/format'

function TagPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [showSearch, setShowSearch] = useState(false)
    const [stats, setStats] = useState(null)
    const [timeline, setTimeline] = useState([])
    const [tab, setTab] = useState('analytics')
    const [total, setTotal] = useState(0)
    const limit = 50
    const [paired, setPaired] = useState([])

    const tags = searchParams.get('tags')
        ? searchParams.get('tags').split(',').map(t => t.trim()).filter(Boolean)
        : []

    const page = parseInt(searchParams.get('page') || '1')

    useEffect(() => {
        if (tags.length === 0) {
            setGames([])
            setStats(null)
            setTimeline([])
            setTotal(0)
            setLoading(false)
            return
        }
        setLoading(true)
        const tagParam = encodeURIComponent(tags.join(','))

        Promise.all([
            axios.get(`http://localhost:8000/games/by-tags?tags=${tagParam}&page=${page}&limit=${limit}`),
            axios.get(`http://localhost:8000/tags/stats?tags=${tagParam}`),
            axios.get(`http://localhost:8000/tags/timeline?tags=${tagParam}`),
            axios.get(`http://localhost:8000/tags/paired?tags=${tagParam}`).catch(() => ({ data: [] })),
        ])
            .then(([gamesRes, statsRes, timelineRes,pairedRes]) => {
                if (Array.isArray(gamesRes.data)) {
                    setGames(gamesRes.data)
                    setTotal(gamesRes.data.length)
                } else {
                    setGames(gamesRes.data.games || [])
                    setTotal(gamesRes.data.total || 0)
                }
                setStats(statsRes.data)
                setTimeline(timelineRes.data)
                setLoading(false)
                setPaired(pairedRes.data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [searchParams])

    function addTag(tagName) {
        if (!tagName || tags.includes(tagName)) return
        const newTags = [...tags, tagName]
        setSearchParams({ tags: newTags.join(','), page: '1' })
        setShowSearch(false)
    }

    function removeTag(tag) {
        const newTags = tags.filter(t => t !== tag)
        if (newTags.length === 0) {
            setSearchParams({})
        } else {
            setSearchParams({ tags: newTags.join(','), page: '1' })
        }
    }

    function changePage(newPage) {
        setSearchParams({ tags: tags.join(','), page: String(newPage) })
    }

    const maxCount = timeline.length > 0 ? Math.max(...timeline.map(t => t.count)) : 0

    return (
        <div className='bg-term-bg min-h-screen font-mono text-term-body p-8 md:px-20'>
            <div className='max-w-6xl mx-auto'>
                <div className='text-xs text-term-muted mb-2'>
                    ~/tags / <span className='text-term-accent'>{tags.length > 0 ? tags.join(' + ') : 'browse'}</span>
                </div>

                <h1 className='text-term-text text-xl font-medium flex items-center gap-3'>
                    {tags.length > 0 ? tags.join(' + ') : 'Tags'}
                    {!loading && stats && (
                        <span className='text-[10px] px-2 py-1 rounded border border-[#00d4aa44] text-term-accent bg-[#00d4aa11]'>
                            {stats.total_games?.toLocaleString()} games
                        </span>
                    )}
                </h1>
                <p className='text-term-muted text-xs mb-4'>
                    {'// '}tag deep dive
                </p>

                {/* Active tags bar */}
                <div className='flex flex-wrap gap-2 items-center mb-5'>
                    {tags.map(tag => (
                        <span key={tag} className='text-xs px-2.5 py-1 rounded border border-[#00d4aa44] text-term-accent bg-[#00d4aa11] flex items-center gap-2'>
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className='text-term-muted hover:text-term-red text-sm leading-none'
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <div className='relative'>
                        {showSearch ? (
                            <TagSearch
                                activeTags={tags}
                                onSelect={addTag}
                                onClose={() => setShowSearch(false)}
                            />
                        ) : (
                            <button
                                onClick={() => setShowSearch(true)}
                                className='text-xs px-2.5 py-1 rounded border border-dashed border-term-border text-term-muted hover:border-[#00d4aa44] hover:text-term-accent transition-colors'
                            >
                                + add tag
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <p className='text-term-muted text-sm py-8'>
                        <span className='text-term-accent'>$</span> searching...
                    </p>
                ) : tags.length === 0 ? (
                    <BrowseTags onSelect={addTag} />
                ) : (
                    <>
                        {/* Tabs */}
                        <div className='flex gap-2 mb-5 pb-3 border-b border-term-border'>
                            <button
                                onClick={() => setTab('analytics')}
                                className={
                                    tab === 'analytics'
                                        ? 'text-xs px-3.5 py-1.5 rounded border border-[#00d4aa44] text-term-accent bg-[#00d4aa11]'
                                        : 'text-xs px-3.5 py-1.5 rounded border border-transparent text-term-muted hover:text-term-accent transition-colors'
                                }
                            >
                                analytics
                            </button>
                            <button
                                onClick={() => setTab('games')}
                                className={
                                    tab === 'games'
                                        ? 'text-xs px-3.5 py-1.5 rounded border border-[#00d4aa44] text-term-accent bg-[#00d4aa11]'
                                        : 'text-xs px-3.5 py-1.5 rounded border border-transparent text-term-muted hover:text-term-accent transition-colors'
                                }
                            >
                                games ({total.toLocaleString()})
                            </button>
                        </div>

                        {/* Analytics tab */}
                        {tab === 'analytics' && stats && (
                            <>
                                <div className='grid grid-cols-4 gap-2 mb-4'>
                                    <div className='bg-term-panel border border-term-border rounded-md p-3'>
                                        <div className='text-[9px] text-term-muted uppercase tracking-wide mb-1'>Total games</div>
                                        <div className='text-lg text-term-text'>{stats.total_games?.toLocaleString()}</div>
                                    </div>
                                    <div className='bg-term-panel border border-term-border rounded-md p-3'>
                                        <div className='text-[9px] text-term-muted uppercase tracking-wide mb-1'>First seen</div>
                                        <div className='text-lg text-term-text'>{stats.first_year || '—'}</div>
                                        {stats.first_game && (
                                            <div className='text-[9px] text-term-accent mt-0.5 truncate'>{stats.first_game}</div>
                                        )}
                                    </div>
                                    <div className='bg-term-panel border border-term-border rounded-md p-3'>
                                        <div className='text-[9px] text-term-muted uppercase tracking-wide mb-1'>Peak year</div>
                                        <div className='text-lg text-term-text'>{stats.peak_year || '—'}</div>
                                        {stats.peak_count > 0 && (
                                            <div className='text-[9px] text-term-accent mt-0.5'>{stats.peak_count} releases</div>
                                        )}
                                    </div>
                                    <div className='bg-term-panel border border-term-border rounded-md p-3'>
                                        <div className='text-[9px] text-term-muted uppercase tracking-wide mb-1'>Avg score</div>
                                        <div className='text-lg text-term-text'>{stats.avg_positive_pct || 0}%</div>
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-3'>
                                    {timeline.length > 0 && (
                                        <div className='bg-term-panel border border-term-border rounded-md p-4'>
                                            <div className='text-[9px] text-term-accent uppercase tracking-wide mb-3'>
                                                // releases per year
                                            </div>
                                            <div className='flex items-end gap-0.75 h-30'>
                                                {timeline.map(item => {
                                                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                                                    const isRecent = parseInt(item.year) >= 2023
                                                    return (
                                                        <div key={item.year} className='flex-1 flex flex-col items-center justify-end h-full group relative'>
                                                            <div className='absolute -top-5 text-[8px] text-term-muted opacity-0 group-hover:opacity-100 transition-opacity'>
                                                                {item.count}
                                                            </div>
                                                            <div
                                                                className={`w-full rounded-t-sm ${isRecent ? 'bg-term-accent opacity-80' : 'bg-term-accent opacity-40'}`}
                                                                style={{ height: `${Math.max(height, 2)}%` }}
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className='flex gap-0.75'>
                                                {timeline.map(item => (
                                                    <div key={item.year} className='flex-1 text-center text-[8px] text-term-dim mt-1.5'>
                                                        {item.year.slice(2)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className='bg-term-panel border border-term-border rounded-md p-4'>
                                        <div className='text-[9px] text-term-accent uppercase tracking-wide mb-3'>
                                            // commonly paired with
                                        </div>
                                            {paired.length === 0 ? (
                                                <p className='text-[11px] text-term-dim py-6 text-center'>no pairings found</p>
                                            ) : (
                                                <div className='flex flex-col gap-1.5'>
                                                    {paired.map(tag => {
                                                        const pct = (tag.count / paired[0].count) * 100
                                                        return (
                                                            <button
                                                                key={tag.name}
                                                                onClick={() => addTag(tag.name)}
                                                                className='relative text-left text-xs px-2.5 py-1.5 rounded border border-term-border hover:border-[#00d4aa44] overflow-hidden group'
                                                            >
                                                                <div className='absolute inset-y-0 left-0 bg-term-accent opacity-10' style={{ width: `${pct}%` }} />
                                                                <span className='relative flex justify-between'>
                                                                    <span className='text-term-text group-hover:text-term-accent'>{tag.name}</span>
                                                                    <span className='text-term-dim tabular-nums'>{tag.count.toLocaleString()}</span>
                                                                </span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Games tab */}
                        {tab === 'games' && (
                            <>
                                {games.length === 0 ? (
                                    <p className='text-term-muted text-sm py-8'>
                                        <span className='text-term-red'>$</span> no games found
                                    </p>
                                ) : (
                                    <>
                                        <table className='w-full text-sm'>
                                            <thead>
                                                <tr className='text-left text-term-muted border-b border-term-border'>
                                                    <th className='pb-2 font-normal text-[10px] uppercase tracking-wide w-12'>#</th>
                                                    <th className='pb-2 font-normal text-[10px] uppercase tracking-wide w-16'>Img</th>
                                                    <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Name</th>
                                                    <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Score</th>
                                                    <th className='pb-2 font-normal text-[10px] uppercase tracking-wide text-right'>Reviews</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {games.map((game, index) => {
                                                    const rank = (page - 1) * limit + index + 1
                                                    return (
                                                        <tr key={game.steam_id} className='border-b border-term-panel hover:bg-term-panel transition-colors'>
                                                            <td className='py-2.5 text-term-dim'>
                                                                {String(rank).padStart(2, '0')}
                                                            </td>
                                                            <td>
                                                                <img
                                                                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                                                                    alt={game.name}
                                                                    className='w-16 h-8 object-cover rounded'
                                                                />
                                                            </td>
                                                            <td className='py-2.5 pl-3'>
                                                                <Link
                                                                    to={`/game/${game.steam_id}`}
                                                                    className='text-term-text font-sans hover:text-term-accent transition-colors'
                                                                >
                                                                    {game.name}
                                                                </Link>
                                                            </td>
                                                            <td className='py-2.5' style={{ color: scoreColor(game.review_score_desc) }}>
                                                                {game.review_score_desc}
                                                            </td>
                                                            <td className='py-2.5 text-right text-term-muted tabular-nums'>
                                                                {game.positive_reviews?.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>

                                        <div className='flex items-center justify-between'>
                                            <span className='text-xs text-term-muted'>
                                                page {page} of {Math.max(1, Math.ceil(total / limit))}
                                            </span>
                                            <Pagination page={page} total={total} limit={limit} onPageChange={changePage} />
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function TagSearch({ activeTags, onSelect, onClose }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [popular, setPopular] = useState([])

    useEffect(() => {
        if (query.trim().length < 1) {
            setResults([])
            return
        }
        const timeout = setTimeout(() => {
            axios.get(`http://localhost:8000/tags/search?q=${encodeURIComponent(query)}`)
                .then(res => setResults(res.data))
        }, 300)
        return () => clearTimeout(timeout)
    }, [query])

    useEffect(() => {
        axios.get('http://localhost:8000/tags/top?limit=10')
            .then(res => setPopular(res.data))
            .catch(() => {})
    }, [])

    const shown = query.trim() ? results : popular

    return (
        <div>
            <div className='flex items-center gap-2 bg-term-bg border border-[#00d4aa44] rounded px-2.5 py-1 w-52'>
                <span className='text-term-accent text-xs'>$</span>
                <input
                    type='text'
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && onClose()}
                    placeholder='search tags...'
                    autoFocus
                    className='bg-transparent text-term-text text-xs outline-none flex-1'
                />
            </div>

            {results.length > 0 && (
                <div className='absolute top-full mt-1 w-52 bg-term-panel border border-term-border rounded shadow-xl z-50 overflow-hidden'>
                    {results.map(tag => (
                        <button
                            key={tag.name}
                            onMouseDown={() => onSelect(tag.name)}
                            disabled={activeTags.includes(tag.name)}
                            className={
                                activeTags.includes(tag.name)
                                    ? 'w-full flex items-center justify-between px-3 py-2 text-xs text-term-dim cursor-not-allowed'
                                    : 'w-full flex items-center justify-between px-3 py-2 text-xs text-term-light hover:bg-term-bg cursor-pointer border-b border-term-bg'
                            }
                        >
                            <span>{tag.name}</span>
                            <span className='text-term-dim tabular-nums'>{tag.count.toLocaleString()}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const CATEGORIES = {
    'Top-Level Genres': ['Indie', 'Casual', 'Action', 'Adventure', 'Simulation', 'Strategy', 'RPG', 'Action-Adventure', 'Sports', 'Racing', 'Fighting'],
    'Genres': ['Puzzle', 'Arcade', 'Shooter', 'Visual Novel', 'Platformer', 'Roguelike', 'Sandbox', 'Turn-Based Strategy', 'Point & Click', 'Card Game', 'Life Sim', 'Tower Defense', 'RTS', 'City Builder', 'Rhythm', 'Board Game'],
    'Themes & Moods': ['Atmospheric', 'Fantasy', 'Relaxing', 'Funny', 'Horror', 'Sci-fi', 'Family Friendly', 'Retro', 'Dark', 'Mystery', 'Survival', 'Cozy', 'Cyberpunk', 'Medieval'],
    'Visuals & Viewpoint': ['2D', '3D', 'Colorful', 'Pixel Graphics', 'Cute', 'First-Person', 'Stylized', 'Anime', 'Top-Down', 'Third Person', 'Realistic', 'Hand-drawn', 'Minimalist', 'VR', 'Isometric'],
    'Features': ['Story Rich', 'Combat', 'Controller', 'Choices Matter', 'PvE', 'PvP', 'Multiple Endings', 'Open World', 'Crafting', 'Procedural Generation', 'Base Building', 'Deckbuilding', 'Stealth', 'Moddable'],
    'Players': ['Singleplayer', 'Multiplayer', 'Co-op', 'Online Co-Op', 'Local Multiplayer', 'Local Co-Op', 'Massively Multiplayer'],
    'Scary': ['Horror', 'Psychological Horror', 'Survival Horror', 'Thriller', 'Zombies', 'Gothic', 'Vampires', 'Jump Scare'],
    'Sports': ['Sports', 'Racing', 'Driving', 'Fishing', 'Football (Soccer)', 'Golf', 'Basketball', 'Skateboarding'],
}

function BrowseTags({ onSelect }) {
    const [top, setTop] = useState([])

    useEffect(() => {
        axios.get('http://localhost:8000/tags/top?limit=300')
            .then(res => setTop(res.data))
            .catch(() => {})
    }, [])

    const counts = Object.fromEntries(top.map(t => [t.name, t.count]))

    const chip = (name) => (
        <button
            key={name}
            onClick={() => onSelect(name)}
            className='text-xs px-2.5 py-1 rounded border border-term-border text-term-body hover:border-[#00d4aa44] hover:text-term-accent hover:bg-[#00d4aa11] transition-colors'
        >
            {name} <span className='text-term-dim tabular-nums'>{counts[name]?.toLocaleString()}</span>
        </button>
    )

    function surprise() {
        const pool = top.slice(0, 100)
        if (pool.length) onSelect(pool[Math.floor(Math.random() * pool.length)].name)
    }

    return (
        <div className='py-4'>
            <div className='flex items-center justify-between mb-4'>
                <p className='text-term-muted text-sm'>
                    <span className='text-term-accent'>$</span> pick a tag to start exploring
                </p>
                <button
                    onClick={surprise}
                    className='text-xs px-3 py-1.5 rounded border border-[#00d4aa44] text-term-accent bg-[#00d4aa11] hover:bg-[#00d4aa22]'
                >
                    surprise me
                </button>
            </div>

            {Object.entries(CATEGORIES).map(([category, names]) => {
                const available = names.filter(n => counts[n])
                if (available.length === 0) return null
                return (
                    <div key={category} className='mb-4'>
                        <div className='text-[9px] text-term-accent uppercase tracking-wide mb-2'>// {category}</div>
                        <div className='flex flex-wrap gap-2'>{available.map(chip)}</div>
                    </div>
                )
            })}
            <AllTags onSelect={onSelect} />
        </div>
    )
}

function AllTags({ onSelect }) {
    const [open, setOpen] = useState(false)
    const [all, setAll] = useState([])
    const [filter, setFilter] = useState('')

    useEffect(() => {
        if (open && all.length === 0) {
            axios.get('http://localhost:8000/tags/all')
                .then(res => setAll(res.data))
                .catch(() => {})
        }
    }, [open])

    const visible = all.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))

    return (
        <div className='mt-6 pt-4 border-t border-term-border'>
            <button
                onClick={() => setOpen(!open)}
                className='text-xs text-term-muted hover:text-term-accent'
            >
                {open ? '[-]' : '[+]'} browse all tags
            </button>

            {open && (
                <div className='mt-3'>
                    <input
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder='filter tags...'
                        className='mb-3 w-52 bg-term-bg border border-term-border rounded px-2.5 py-1 text-xs text-term-text outline-none focus:border-[#00d4aa44]'
                    />
                    <div className='flex flex-wrap gap-2'>
                        {visible.map(t => (
                            <button
                                key={t.name}
                                onClick={() => onSelect(t.name)}
                                className='text-xs px-2.5 py-1 rounded border border-term-border text-term-body hover:border-[#00d4aa44] hover:text-term-accent transition-colors'
                            >
                                {t.name} <span className='text-term-dim tabular-nums'>{t.count.toLocaleString()}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
export default TagPage