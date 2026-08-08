import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function scoreColor(desc) {
    if (!desc) return '#7a7a9a'
    if (desc.includes('Negative')) return '#ff5f57'
    if (desc.includes('Mixed')) return '#f59e0b'
    return '#28c840'
}

function Home() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {
        setLoading(true)
        axios.get(`http://localhost:8000/games/top?page=${page}`)
            .then(res => {
                setGames(res.data)
                setLoading(false)
            })
    }, [page])

    return (
        <div className='bg-[#0a0a0f] min-h-screen font-mono text-[#a0a0b8] p-8 md:px-20'>
            <div className='max-w-6xl mx-auto border border-[#1a1a2e] rounded-xl overflow-hidden bg-[#0a0a0f]'>

                {/* terminal titlebar */}
                <div className='flex items-center gap-2 px-4 py-2.5 bg-[#0f0f1a] border-b border-[#1a1a2e]'>
                    <div className='flex gap-1.5'>
                        <div className='w-2.5 h-2.5 rounded-full bg-[#ff5f57]' />
                        <div className='w-2.5 h-2.5 rounded-full bg-[#febc2e]' />
                        <div className='w-2.5 h-2.5 rounded-full bg-[#28c840]' />
                    </div>
                    <span className='text-xs text-[#5a5a7a] ml-2'>steamstats@analytics:~/games</span>
                </div>

                <div className='p-6'>
                    <h1 className='text-[#00d4aa] text-lg font-medium'>TOP GAMES</h1>
                    <p className='text-[#5a5a7a] text-xs mb-5'>
                        {'// '}ranked by positive reviews — snapshot 2026-06 — page {page}
                    </p>

                    {loading ? (
                        <p className='text-[#5a5a7a] text-sm py-8'>
                            <span className='text-[#00d4aa]'>$</span> loading games...
                        </p>
                    ) : (
                        <>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='text-left text-[#5a5a7a] border-b border-[#1a1a2e]'>
                                        <th className='pb-2 font-normal text-[10px] uppercase tracking-wide w-12'>#</th>
                                        <th className='pb-2 font-normal text-[10px] uppercase tracking-wide w-16'>Img</th>
                                        <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Name</th>
                                        <th className='pb-2 font-normal text-[10px] uppercase tracking-wide'>Score</th>
                                        <th className='pb-2 font-normal text-[10px] uppercase tracking-wide text-right'>Reviews</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {games.map((game, index) => {
                                        const rank = (page - 1) * 50 + index + 1
                                        return (
                                            <tr key={game.steam_id} className='border-b border-[#0f0f1a] hover:bg-[#0f0f1a] transition-colors'>
                                                <td className={`py-2.5 ${rank <= 3 ? 'text-[#f59e0b]' : 'text-[#3a3a5a]'}`}>
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
                                                        className='text-[#e0e0f0] font-sans hover:text-[#00d4aa] transition-colors'
                                                    >
                                                        {game.name}
                                                    </Link>
                                                </td>
                                                <td className='py-2.5' style={{ color: scoreColor(game.review_score_desc) }}>
                                                    {game.review_score_desc}
                                                </td>
                                                <td className='py-2.5 text-right text-[#7a7a9a] tabular-nums'>
                                                    {game.positive_reviews.toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            <div className='flex gap-2 mt-5 items-center justify-between text-xs'>
                                <span className='text-[#5a5a7a]'>page {page}</span>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page === 1}
                                        className='px-3 py-1.5 rounded border border-[#1a1a2e] bg-[#0f0f1a] text-[#5a5a7a] hover:text-[#00d4aa] hover:border-[#00d4aa44] disabled:opacity-40 disabled:hover:text-[#5a5a7a] disabled:hover:border-[#1a1a2e] transition-colors'
                                    >
                                        prev
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        className='px-3 py-1.5 rounded border border-[#1a1a2e] bg-[#0f0f1a] text-[#5a5a7a] hover:text-[#00d4aa] hover:border-[#00d4aa44] transition-colors'
                                    >
                                        next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home