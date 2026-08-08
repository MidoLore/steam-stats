import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Topbar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([])
            return
        }
        const timeout = setTimeout(() => {
            axios.get(`http://localhost:8000/games/search?q=${encodeURIComponent(query)}&limit=10`)
                .then(res => {
                    setResults(res.data)
                    setShowDropdown(true)
                })
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
        if (query.trim()) {
            setShowDropdown(false)
            navigate(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <nav className='bg-[#0f0f1a] border-b border-[#1a1a2e] px-8 py-3 flex items-center relative z-50 font-mono'>
            <a href='/' className='flex items-center gap-2 group'>
                <div className='flex gap-1.5'>
                    <div className='w-2.5 h-2.5 rounded-full bg-[#ff5f57]' />
                    <div className='w-2.5 h-2.5 rounded-full bg-[#febc2e]' />
                    <div className='w-2.5 h-2.5 rounded-full bg-[#28c840]' />
                </div>
                <span className='text-[#00d4aa] text-sm font-medium ml-2 group-hover:text-[#e0e0f0] transition-colors'>
                    steamstats
                </span>
                <span className='text-[#3a3a5a] text-sm'>:~$</span>
            </a>

            <div className='absolute left-1/2 -translate-x-1/2 flex items-center gap-4'>
                <div className='relative'>
                    <form onSubmit={handleSubmit}>
                        <div className='flex items-center gap-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded px-3 py-2 w-72 focus-within:border-[#00d4aa44] transition-colors'>
                            <span className='text-[#00d4aa] text-sm'>$</span>
                            <input
                                type='text'
                                placeholder='search games...'
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                onFocus={() => results.length > 0 && setShowDropdown(true)}
                                className='bg-transparent text-[#e0e0f0] text-sm placeholder-[#5a5a7a] outline-none flex-1'
                            />
                        </div>
                    </form>
                    {showDropdown && results.length > 0 && (
                        <div className='absolute top-full mt-1 w-72 bg-[#0f0f1a] border border-[#1a1a2e] rounded shadow-xl z-50 overflow-hidden'>
                            {results.map(game => (
                                <div
                                    key={game.steam_id}
                                    onClick={() => goToGame(game.steam_id)}
                                    className='flex items-center gap-3 p-2 hover:bg-[#0a0a0f] cursor-pointer border-b border-[#0a0a0f] last:border-b-0'
                                >
                                    <img
                                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                                        alt={game.name}
                                        className='w-16 h-8 object-cover rounded'
                                    />
                                    <span className='text-[#c9d1d9] text-sm font-sans'>{game.name}</span>
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