import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import Home from './pages/Home'
import GamePage from './pages/GamePage'

function App() {
    return (
        <BrowserRouter>
            <Topbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:steamId" element={<GamePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App