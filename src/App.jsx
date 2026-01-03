import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from '@/Pages/Home'
import CitySearch from '@/Pages/CitySearch'
import ActivitySearch from '@/Pages/ActivitySearch'

export default function App() {
  return (
    <div className="app-root">
      <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/CitySearch" style={{ marginRight: 12 }}>Cities</Link>
        <Link to="/ActivitySearch">Activities</Link>
      </nav>

      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/CitySearch" element={<CitySearch />} />
          <Route path="/ActivitySearch" element={<ActivitySearch />} />
        </Routes>
      </main>
    </div>
  )
}
