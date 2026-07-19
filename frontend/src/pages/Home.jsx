import { useState, useEffect } from 'react'
import axios from 'axios'

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

    if (loading) return <p className='text-white p-4'>Loading...</p>

    return (
        <div className='bg-gray-900 min-h-screen p-8 pl-20 pr-20'>
            <h1 className='text-white text-3xl font-bold mb-6'>Most positively reviewed games </h1>
            <table className='w-full text-white'>
                <thead>
                    <tr className='text-left text-gray-400 border-b border-gray-700'>
                        <th className='pb-3 w-12'>Rank</th>
                        <th className='pb-3 w-16'>Image</th>
                        <th className='pb-3'>Name</th>
                        <th className='pb-3'>Review Score</th>
                        <th className='pb-3'>Reviews</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game, index) => (
                        <tr key={game.steam_id} className='border-b border-gray-800 hover:bg-gray-800'>
                            <td className='py-3 text-gray-400'>{(page - 1) * 50 + index + 1}</td>
                            <td>
                                <img
                                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/header.jpg`}
                                    alt={game.name}
                                    className='w-16 h-8 object-cover'
                                />
                            </td>
                            <td className='py-3 font-medium pl-3'>{game.name}</td>
                            <td className='py-3 text-green-400'>{game.review_score_desc}</td>
                            <td className='py-3 text-gray-400'>{game.positive_reviews.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='flex gap-4 mt-6 items-center justify-center'>
                <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className='bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50'
                >
                    Previous
                </button>
                <span className='text-gray-400'>Page {page}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    className='bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600'
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default Home