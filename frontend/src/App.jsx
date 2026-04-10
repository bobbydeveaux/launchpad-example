import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import DocsLayout from './docs/DocsLayout.jsx'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/docs/*" element={<DocsLayout />} />
    </Routes>
  )
}
