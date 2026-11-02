import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import axios from 'axios'

function Topbar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (query.trim().length < 2) { setResults([]); return }
        const timeout = setTimeout(() => {
            axios.get(`http://localhost:8000/games/search?q=${encodeURIComponent(query)}&limit=10`)
                .then(res => { setResults(res.data); setShowDropdown(true) })
        }, 300)
        return () => clearTimeout(timeout)
    }, [query])

    function goToGame(steamId) {
        setShowDropdown(false)
        setQuery('')
        navigate(`/game/${steamId}`)
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (query.trim()) { setShowDropdown(false); navigate(`/search?q=${encodeURIComponent(query)}`) }
    }

    const navClass = (isActive) => `text-xs px-3 py-1.5 ${isActive ? 'text-term-accent' : 'text-term-muted hover:text-term-accent transition-colors'}`

    return (
        <nav className='sticky top-0 bg-term-panel border-b border-term-border px-8 py-3 flex items-center z-50 font-mono'>
            <a href='/' className='flex items-center gap-2 group'>
                <div className='flex gap-1.5'>
                    <div className='w-2.5 h-2.5 rounded-full bg-term-red' />
                    <div className='w-2.5 h-2.5 rounded-full bg-term-yellow' />
                    <div className='w-2.5 h-2.5 rounded-full bg-term-green' />
                </div>
                <span className='text-term-accent text-sm font-medium ml-2 group-hover:text-term-text transition-colors'>steamstats</span>
                <span className='text-term-dim text-sm'>:~$</span>
            </a>

            <NavLink to='/' end className={({ isActive }) => navClass(isActive)}>Games</NavLink>
            <NavLink to='/tags' className={({ isActive }) => navClass(isActive)}>Tags</NavLink>

            <div className='absolute left-1/2 -translate-x-1/2'>
                <div className='relative'>
                    <form onSubmit={handleSubmit}>
                        <div className='flex items-center gap-2 bg-term-bg border border-term-border rounded px-3 py-2 w-72'>
                            <span className='text-term-accent text-sm'>$</span>
                            <input
                                type='text'
                                placeholder='search games...'
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                onFocus={() => results.length > 0 && setShowDropdown(true)}
                                className='bg-transparent text-term-text text-sm outline-none flex-1'
                            />
                        </div>
                    </form>
                    {showDropdown && results.length > 0 && (
                        <div className='absolute top-full mt-1 w-72 bg-term-panel border border-term-border rounded shadow-xl z-50 overflow-hidden'>
                            {results.map(game => (
                                <div
                                    key={game.steam_id}
                                    onClick={() => goToGame(game.steam_id)}
                                    className='flex items-center gap-3 p-2 hover:bg-term-bg cursor-pointer border-b border-term-bg'
                                >
                                    <img
                                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                                        alt={game.name}
                                        className='w-16 h-8 object-cover rounded'
                                    />
                                    <span className='text-term-light text-sm font-sans'>{game.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Topbar