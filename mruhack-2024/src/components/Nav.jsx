import { Link } from 'react-router-dom';

export default function Nav() {
    return (
        <nav>
            <Link to="/" className="nav-links">Home</Link>
            <Link to="/about" className="nav-links">About</Link>
        </nav>
    )
}