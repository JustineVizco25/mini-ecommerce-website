import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <main className="page">
            <div className="container">
                <h1 className="page-title">Page not found</h1>
                <p>This page does not exist. <Link to="/" className="auth-link">Browse products</Link></p>
            </div>
        </main>
    );
}
