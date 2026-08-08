import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function scoreColor(desc) {
    if (!desc) return '#7a7a9a'
    if (desc.includes('Negative')) return '#ff5f57'
    if (desc.includes('Mixed')) return '#f59e0b'
    return '#28c840'
}

function GamePage() {
    const { steamId } = useParams()
    const [game, setGame] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        axios.get(`http://localhost:8000/games/${steamId}`)
            .then(res => {
                setGame(res.data)
                setLoading(false)
            })
    }, [steamId])

    if (loading) return (
        <div className='bg-[#0a0a0f] min-h-screen font-mono p-8'>
            <p className='text-[#5a5a7a] text-sm'>
                <span className='text-[#00d4aa]'>$</span> loading game...
            </p>
        </div>
    )
    if (!game) return (
        <div className='bg-[#0a0a0f] min-h-screen font-mono p-8'>
            <p className='text-[#ff5f57] text-sm'>
                <span className='text-[#5a5a7a]'>$</span> error: game not found
            </p>
        </div>
    )

    const positivePercent = game.total_reviews > 0
        ? Math.round((game.positive_reviews / game.total_reviews) * 100)
        : 0

    return (
        <div className='bg-[#0a0a0f] min-h-screen text-[#a0a0b8] font-mono relative'>
            {/* Header backdrop */}
            <div className='absolute top-0 left-0 w-full h-[50vh] overflow-hidden'>
                <img
                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                    alt={game.name}
                    className='w-full h-full object-cover opacity-10 blur-md'
                />
                <div className='absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0f]' />
            </div>

            <div className='relative z-10'>

                {/* Title area */}
                <div className='flex flex-col items-center justify-center h-48'>
                    <h1 className='text-4xl font-bold text-[#e0e0f0] font-sans'>{game.name}</h1>
                    <p className='text-[#5a5a7a] text-sm mt-2'>
                        {'// '}{game.developer} · {game.publisher}
                    </p>
                </div>

                {/* Main content */}
                <div className='max-w-6xl mx-auto p-8 flex flex-col md:flex-row gap-6'>

                    {/* Left column - info panel */}
                    <div className='flex-1'>
                        <div className='border border-[#1a1a2e] rounded-xl overflow-hidden bg-[#0a0a0f]'>
                            <div className='flex items-center gap-2 px-4 py-2.5 bg-[#0f0f1a] border-b border-[#1a1a2e]'>
                                <div className='flex gap-1.5'>
                                    <div className='w-2.5 h-2.5 rounded-full bg-[#ff5f57]' />
                                    <div className='w-2.5 h-2.5 rounded-full bg-[#febc2e]' />
                                    <div className='w-2.5 h-2.5 rounded-full bg-[#28c840]' />
                                </div>
                                <span className='text-xs text-[#5a5a7a] ml-2'>info.json</span>
                            </div>
                            <table className='w-full text-sm'>
                                <tbody>
                                    <InfoRow label='App ID' value={game.steam_id} />
                                    <InfoRow label='Developer' value={game.developer} />
                                    <InfoRow label='Publisher' value={game.publisher} />
                                    <InfoRow label='Release Date' value={game.release_date} />
                                    <InfoRow label='Price' value={game.is_free ? 'Free to Play' : `$${game.price}`} />
                                    <tr className='border-b border-[#0f0f1a]'>
                                        <td className='py-3 px-4 text-[#5a5a7a] w-40'>Review Score</td>
                                        <td className='py-3 px-4' style={{ color: scoreColor(game.review_score_desc) }}>
                                            {game.review_score_desc}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='py-3 px-4 text-[#5a5a7a]'>Total Reviews</td>
                                        <td className='py-3 px-4 text-[#e0e0f0] tabular-nums'>
                                            {game.total_reviews.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className='w-full md:w-80 flex flex-col gap-4'>
                        <img
                            src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                            alt={game.name}
                            className='w-full rounded-lg border border-[#1a1a2e]'
                        />

                        {/* Review bar */}
                        <div className='bg-[#0f0f1a] border border-[#1a1a2e] p-4 rounded-lg'>
                            <div className='flex justify-between text-sm mb-2'>
                                <span className='text-[#00d4aa] font-medium'>{positivePercent}%</span>
                                <span className='text-[#5a5a7a] tabular-nums'>{game.total_reviews.toLocaleString()} reviews</span>
                            </div>
                            <div className='w-full bg-[#1a1a2e] rounded h-2 overflow-hidden'>
                                <div
                                    className='bg-[#00d4aa] h-2 rounded'
                                    style={{ width: `${positivePercent}%` }}
                                />
                            </div>
                            <div className='flex justify-between mt-2 text-xs tabular-nums'>
                                <span className='text-[#28c840]'>{game.positive_reviews.toLocaleString()} positive</span>
                                <span className='text-[#ff5f57]'>{game.negative_reviews.toLocaleString()} negative</span>
                            </div>
                        </div>

                        {/* Description */}
                        {game.short_description && (
                            <p className='text-[#a0a0b8] text-sm font-sans leading-relaxed'>
                                {game.short_description}
                            </p>
                        )}

                        {/* Tags */}
                        {game.tags.length > 0 && (
                            <div>
                                <p className='text-[#5a5a7a] text-[10px] uppercase tracking-wide mb-2'>{'// '}tags</p>
                                <div className='flex flex-wrap gap-2'>
                                    {game.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className='border border-[#1a1a2e] text-[#c9d1d9] px-2.5 py-1 rounded text-xs hover:border-[#00d4aa44] hover:text-[#00d4aa] transition-colors cursor-default'
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

function InfoRow({ label, value }) {
    return (
        <tr className='border-b border-[#0f0f1a]'>
            <td className='py-3 px-4 text-[#5a5a7a] w-40'>{label}</td>
            <td className='py-3 px-4 text-[#e0e0f0]'>{value}</td>
        </tr>
    )
}

export default GamePage