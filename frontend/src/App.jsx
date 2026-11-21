import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Submit from './pages/Submit'
import Staff from './pages/Staff'
import Admin from './pages/Admin'
import About from './pages/About'
import Contact from './pages/Contact'
import Static from './pages/Static'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/p/about" element={<About />} />
          <Route path="/p/contact" element={<Contact />} />
          <Route path="/p/:slug" element={<Static />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/submit" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute roles={['staff', 'admin']}><Staff /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="*" element={<p className="center">Page not found.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
