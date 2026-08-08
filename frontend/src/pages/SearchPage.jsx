import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

function scoreColor(desc) {
    if (!desc) return '#7a7a9a'
    if (desc.includes('Negative')) return '#ff5f57'
    if (desc.includes('Mixed')) return '#f59e0b'
    return '#28c840'
}

function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q')
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!query) return
        setLoading(true)
        axios.get(`http://localhost:8000/games/search?q=${encodeURIComponent(query)}`)
            .then(res => {
                setGames(res.data)
                setLoading(false)
            })
    }, [query])

    return (
        <div className='bg-[#0a0a0f] min-h-screen font-mono text-[#a0a0b8] p-8 md:px-20'>
            <div className='max-w-6xl mx-auto'>
                <h1 className='text-[#00d4aa] text-lg font-medium'>SEARCH</h1>
                <p className='text-[#5a5a7a] text-xs mb-5'>
                    <span className='text-[#00d4aa]'>$</span> grep "{query}" — {loading ? '...' : `${games.length} matches`}
                </p>

                {loading ? (
                    <p className='text-[#5a5a7a] text-sm py-8'>
                        <span className='text-[#00d4aa]'>$</span> searching...
                    </p>
                ) : games.length === 0 ? (
                    <p className='text-[#5a5a7a] text-sm py-8'>
                        <span className='text-[#ff5f57]'>$</span> no games found for "{query}"
                    </p>
                ) : (
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='text-left text-[#5a5a7a] border-b border-[#1a1a2e]'>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide w-16'>Img</th>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Name</th>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Score</th>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide text-right'>Reviews</th>
                            </tr>
                        </thead>
                        <tbody>
                            {games.map(game => (
                                <tr key={game.steam_id} className='border-b border-[#0f0f1a] hover:bg-[#0f0f1a] transition-colors'>
                                    <td className='py-2.5'>
                                        <Link to={`/game/${game.steam_id}`}>
                                            <img
                                                src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                                                alt={game.name}
                                                className='w-16 h-8 object-cover rounded'
                                            />
                                        </Link>
                                    </td>
                                    <td className='py-2.5 pl-3'>
                                        <Link to={`/game/${game.steam_id}`} className='text-[#e0e0f0] font-sans hover:text-[#00d4aa] transition-colors'>
                                            {game.name}
                                        </Link>
                                    </td>
                                    <td className='py-2.5' style={{ color: scoreColor(game.review_score_desc) }}>
                                        {game.review_score_desc}
                                    </td>
                                    <td className='py-2.5 text-right text-[#5a5a7a] tabular-nums'>
                                        {game.total_reviews?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default SearchPage