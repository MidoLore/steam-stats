import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function GamePage() {
    const { steamId } = useParams()
    const [game, setGame] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`http://localhost:8000/games/${steamId}`)
            .then(res => {
                setGame(res.data)
                setLoading(false)
            })
    }, [steamId])

    if (loading) return <p className='text-white p-4'>Loading...</p>
    if (!game) return <p className='text-white p-4'>Game not found</p>

    const positivePercent = game.total_reviews > 0
        ? Math.round((game.positive_reviews / game.total_reviews) * 100)
        : 0

    return (
        <div className='bg-gray-900 min-h-screen text-white relative'>
            {/* Header */}
            <div className='absolute top-0 left-0 w-full h-[50vh] overflow-hidden'>
                <img
                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                    alt={game.name}
                    className='w-full h-full object-cover opacity-20 blur-md'
                />
                <div className='absolute inset-0 bg-gradient-to-b from-transparent to-gray-900' />
            </div>

            {/* All content sits on top */}
            <div className='relative z-10'>

                {/* Title area */}
                <div className='flex flex-col items-center justify-center h-48'>
                    <h1 className='text-4xl font-bold'>{game.name}</h1>
                    <p className='text-gray-400 mt-1'>{game.developer} · {game.publisher}</p>
                </div>

                {/* Main content */}
                <div className='max-w-6xl mx-auto p-8 flex gap-8'>

                    {/* Left column - info table */}
                    <div className='flex-1'>
                        <table className='w-full text-sm'>
                            <tbody>
                                <tr className='border-b border-gray-800'>
                                    <td className='py-3 text-gray-400 w-40'>App ID</td>
                                    <td className='py-3'>{game.steam_id}</td>
                                </tr>
                                <tr className='border-b border-gray-800'>
                                    <td className='py-3 text-gray-400'>Developer</td>
                                    <td className='py-3'>{game.developer}</td>
                                </tr>
                                <tr className='border-b border-gray-800'>
                                    <td className='py-3 text-gray-400'>Publisher</td>
                                    <td className='py-3'>{game.publisher}</td>
                                </tr>
                                <tr className='border-b border-gray-800'>
                                    <td className='py-3 text-gray-400'>Release Date</td>
                                    <td className='py-3'>{game.release_date}</td>
                                </tr>
                                <tr className='border-b border-gray-800'>
                                    <td className='py-3 text-gray-400'>Price</td>
                                    <td className='py-3'>{game.is_free ? 'Free to Play' : `$${game.price}`}</td>
                                </tr>
                                <tr className='border-b border-gray-800'>
                                    <td className='py-3 text-gray-400'>Review Score</td>
                                    <td className='py-3 text-green-400'>{game.review_score_desc}</td>
                                </tr>
                                <tr className='border-b border-gray-800'>
                                    <td className='py-3 text-gray-400'>Total Reviews</td>
                                    <td className='py-3'>{game.total_reviews.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right column */}
                    <div className='w-80 flex flex-col gap-4'>
                        <img
                            src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                            alt={game.name}
                            className='w-full rounded'
                        />

                        {/* Review bar */}
                        <div className='bg-gray-800 p-4 rounded'>
                            <div className='flex justify-between text-sm mb-2'>
                                <span className='text-green-400'>{positivePercent}%</span>
                                <span className='text-gray-400'>{game.total_reviews.toLocaleString()} reviews</span>
                            </div>
                            <div className='w-full bg-gray-700 rounded h-3'>
                                <div
                                    className='bg-green-500 h-3 rounded'
                                    style={{ width: `${positivePercent}%` }}
                                />
                            </div>
                            <div className='flex justify-between mt-2 text-xs'>
                                <span className='text-green-400'>{game.positive_reviews.toLocaleString()} positive</span>
                                <span className='text-red-400'>{game.negative_reviews.toLocaleString()} negative</span>
                            </div>
                        </div>

                        {/* Description */}
                        {game.short_description && (
                            <p className='text-gray-300 text-sm'>{game.short_description}</p>
                        )}

                        {/* Tags */}
                        {game.tags.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                                {game.tags.map(tag => (
                                    <span key={tag} className='bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs'>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default GamePage