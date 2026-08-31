import { Link } from "react-router-dom";
import { useCart } from "../context/CartContextValue";

export default function ProductCard({ product }) {
    const {addToCart, cartItems} = useCart();
    const productInCart = cartItems.find((item) => item.id === product.id);

    const productQuantityLabel = productInCart ? `(${productInCart.quantity})` : "";
    return (
            <div className = "product-card">
                <img src = {product.image} alt = {product.name} className = "product-card-image" />
                <div style = {{paddingLeft: "20px", marginBottom: "20px"}}> 
                    <h3 className = "product-card-name">{product.name}</h3>
                    <p className = "product-card-price">${product.price}</p>
                    <div className = "product-card-actions">
                        <Link to={`/products/${product.id}`} className = "btn btn-secondary">View Details</Link>
                        <button className = "btn btn-primary" onClick = { () => addToCart(product.id)} >
                            Add to Cart {productQuantityLabel}
                        </button>
                    </div>
                </div>
            </div>
    )
}
