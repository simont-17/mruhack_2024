import { Link } from 'react-router-dom';
import gitHubLogo from '../imgs/Octicons-mark-github.svg.png';

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

            <a href='https://github.com/simont-17/mruhack_2024'><img className='gitHubLogo' src={gitHubLogo} alt='Github Logo'/>
            </a>
        
        </nav>
    )
}