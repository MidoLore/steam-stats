import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('http://localhost:8000/games/top')
            .then(res => {
                setGames(res.data)
                setLoading(false)
            })
    }, [])

    if (loading) return <p className='text-white p-4'>Loading...</p>

    return (
        <div className='bg-gray-900 min-h-screen p-8'>
            <h1 className='text-white text-3xl font-bold mb-6'>Top 50 Games</h1>
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
                            <td className='py-3 text-gray-400'>{index + 1}</td>
                            <td className='py-3'>
                                <img
                                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/capsule_sm_120.jpg`}
                                    alt={game.name}
                                    className='w-16 h-8 object-cover rounded'
                                />
                            </td>
                            <td className='py-3 font-medium'>{game.name}</td>
                            <td className='py-3 text-green-400'>{game.review_score_desc}</td>
                            <td className='py-3 text-gray-400'>{game.positive_reviews.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default App