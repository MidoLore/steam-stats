import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { scoreColor } from '../utils/format'

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
        <div className='bg-term-bg min-h-screen font-mono text-term-body p-8 md:px-20'>
            <div className='max-w-6xl mx-auto'>
                <h1 className='text-term-accent text-lg font-medium'>SEARCH</h1>
                <p className='text-term-muted text-xs mb-5'>
                    <span className='text-term-accent'>$</span> grep "{query}" — {loading ? '...' : `${games.length} matches`}
                </p>

                {loading ? (
                    <p className='text-term-muted text-sm py-8'>
                        <span className='text-term-accent'>$</span> searching...
                    </p>
                ) : games.length === 0 ? (
                    <p className='text-term-muted text-sm py-8'>
                        <span className='text-term-red'>$</span> no games found for "{query}"
                    </p>
                ) : (
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='text-left text-term-muted border-b border-term-border'>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide w-16'>Img</th>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Name</th>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Score</th>
                                <th className='pb-2 font-normal text-[10px] uppercase tracking-wide text-right'>Reviews</th>
                            </tr>
                        </thead>
                        <tbody>
                            {games.map(game => (
                                <tr key={game.steam_id} className='border-b border-term-panel hover:bg-term-panel transition-colors'>
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
                                        <Link to={`/game/${game.steam_id}`} className='text-term-text font-sans hover:text-term-accent transition-colors'>
                                            {game.name}
                                        </Link>
                                    </td>
                                    <td className='py-2.5' style={{ color: scoreColor(game.review_score_desc) }}>
                                        {game.review_score_desc}
                                    </td>
                                    <td className='py-2.5 text-right text-term-muted tabular-nums'>
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