import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Pagination from '../components/Pagination'
import { scoreColor } from '../utils/format'
import Filters from '../components/Filters'

function Home() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 50
    const [filters, setFilters] = useState({})


    useEffect(() => {
        setLoading(true)
        const params = new URLSearchParams({ page, limit, ...filters })
        axios.get(`http://localhost:8000/games/top?${params}`)
            .then(res => {
                setGames(res.data.games)
                setTotal(res.data.total)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [page, filters])

    if (loading) return (
        <div className='bg-term-bg min-h-screen font-mono p-8'>
            <p className='text-term-muted text-sm'>
                <span className='text-term-accent'>$</span> loading games...
            </p>
        </div>
    )

    return (
        <div className='bg-term-bg min-h-screen font-mono text-term-body p-8 md:px-20'>
            <div className='max-w-6xl mx-auto'>
                <h1 className='text-term-accent text-lg font-medium'>TOP GAMES</h1>
                <p className='text-term-muted text-xs mb-5'>
                    {'// '}ranked by positive reviews — {total.toLocaleString()} games
                </p>

                <Filters onApply={f => { setFilters(f); setPage(1) }} />

                {loading ? (
                    <p className='text-term-muted text-sm py-8'>
                        <span className='text-term-accent'>$</span> loading games...
                    </p>
                ) : (
                    <>
                    </>
                )}

                <table className='w-full text-sm'>
                    <thead>
                        <tr className='text-left text-term-muted border-b border-term-border'>
                            <th className='pb-2 font-normal text-xs uppercase tracking-wide w-12'>#</th>
                            <th className='pb-2 font-normal text-xs uppercase tracking-wide w-16'>Img</th>
                            <th className='pb-2 font-normal text-xs uppercase tracking-wide'>Name</th>
                            <th className='pb-2 font-normal text-xs uppercase tracking-wide text-right pr-8'>Price</th>
                            <th className='pb-2 font-normal text-xs uppercase tracking-wide'>Rating</th>
                            <th className='pb-2 font-normal text-xs uppercase tracking-wide'>Score</th>
                            <th className='pb-2 font-normal text-xs uppercase tracking-wide text-right'>Reviews</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map((game, index) => {
                            const rank = (page - 1) * limit + index + 1
                            const rating = game.total_reviews > 0
                                ? Math.round((game.positive_reviews / game.total_reviews) * 100)
                                : null
                            return (
                                <tr key={game.steam_id} className='border-b border-term-panel hover:bg-term-panel transition-colors'>
                                    <td className={`py-2.5 ${rank <= 3 ? 'text-term-yellow' : 'text-term-dim'}`}>
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
                                        <Link to={`/game/${game.steam_id}`} className='text-term-text font-sans hover:text-term-accent transition-colors'>
                                            {game.name}
                                        </Link>
                                    </td>
                                    <td className='py-2.5 pr-8 text-right text-term-muted tabular-nums'>
                                        {game.price > 0 ? `$${game.price.toFixed(2)}` : 'Free'}
                                    </td>
                                    <td className='py-2.5 tabular-nums' style={{ color: scoreColor(game.review_score_desc) }}>
                                        {rating !== null ? `${rating}%` : '—'}
                                    </td>
                                    <td className='py-2.5' style={{ color: scoreColor(game.review_score_desc) }}>
                                        {game.review_score_desc}
                                    </td>
                                    <td className='py-2.5 text-right text-term-muted tabular-nums'>
                                        {game.positive_reviews.toLocaleString()}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <div className='flex items-center justify-between'>
                    <span className='text-xs text-term-muted'>page {page} of {Math.ceil(total / limit)}</span>
                    <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
                </div>
            </div>
        </div>
    )
}

export default Home