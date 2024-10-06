import { Link } from 'react-router-dom';

export default function Nav() {
    return (
        <nav>
            <div className="link-container">
                <Link to="/" className="nav-links">Home</Link>
             <Link to="/about" className="nav-links">About</Link>
            </div>
            <div>
                <h1>Projectivity</h1>
            </div>
            <div>
                <p>Img placeholder</p>
            </div>

        </nav>
    )
}