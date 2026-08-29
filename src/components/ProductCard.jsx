import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
    return (
            <div className = "product-card">
                <img src = {product.image} className = "product-card-image" />
                <div style = {{paddingLeft: "20px", marginBottom: "20px"}}> 
                    <h3 className = "product-card-name">{product.name}</h3>
                    <p className = "product-card-price">${product.price}</p>
                    <div className = "product-card-actions">
                        <Link className = "btn btn-secondary">View Details</Link>
                        <button className = "btn btn-primary">Add to Cart</button>
                    </div>
                </div>
            </div>
    )
}