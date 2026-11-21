import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <footer className="footer">
      <div><b>SympoConnect</b><p className="muted">Discover genuine college events. Always verify before you pay.</p></div>
      <div className="links"><Link to="/p/about">About</Link><Link to="/p/contact">Contact</Link><Link to="/p/privacy">Privacy Policy</Link><Link to="/p/terms">Terms</Link></div>
    </footer>
  )
}
