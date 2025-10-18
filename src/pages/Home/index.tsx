import { FiCompass, FiLogIn, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import './styles.css';

import logo from '../../assets/logo.svg';

const Home = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta" />

                    <Link className="header-cta" to="/create-point">
                        Become a partner
                    </Link>
                </header>

                <main className="hero">
                    <div className="hero-copy">
                        <span className="eyebrow">Together for a cleaner future</span>
                        <h1>Your waste collection marketplace.</h1>
                        <p>
                            Connect with certified points, track recyclable items and help your city
                            stay green with just a few clicks.
                        </p>

                        <div className="hero-actions">
                            <Link className="primary-cta" to="/create-point">
                                <span>
                                    <FiLogIn />
                                </span>
                                <strong>Register a collection point</strong>
                            </Link>

                            <a className="secondary-cta" href="#how-it-works">
                                Learn how it works
                            </a>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <strong>1.2k+</strong>
                                <span>Active collection partners</span>
                            </div>
                            <div className="stat">
                                <strong>150</strong>
                                <span>Cities with Ecoleta routes</span>
                            </div>
                            <div className="stat">
                                <strong>54%</strong>
                                <span>Average recycling increase</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-panel" />
                        <div className="hero-card">
                            <h2>Schedule drop-offs with ease</h2>
                            <p>
                                Visualize nearby collection hubs and build a smarter recycling routine.
                                Ecoleta makes sustainability part of everyday life.
                            </p>
                        </div>
                    </div>
                </main>

                <section id="how-it-works" className="highlights">
                    <h2>How Ecoleta Helps</h2>
                    <div className="highlight-grid">
                        <article>
                            <span className="icon">
                                <FiMapPin />
                            </span>
                            <h3>Locate points instantly</h3>
                            <p>Discover certified drop-off spots with live maps tailored to your city.</p>
                        </article>
                        <article>
                            <span className="icon">
                                <FiRefreshCw />
                            </span>
                            <h3>Recycle smarter</h3>
                            <p>View supported materials and learn how to prep each item for delivery.</p>
                        </article>
                        <article>
                            <span className="icon">
                                <FiCompass />
                            </span>
                            <h3>Receive guided support</h3>
                            <p>Follow curated tips to engage communities and grow conscious habits.</p>
                        </article>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
