import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import Home from './pages/Home'
import GamePage from './pages/GamePage'
import SearchPage from './pages/SearchPage'

function App() {
    return (
        <BrowserRouter>
            <Topbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:steamId" element={<GamePage />} />
                <Route path="/search" element={<SearchPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App