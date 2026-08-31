import { Navigate, useParams } from "react-router-dom";
import { getProductById } from "../data/products";
import { useCart } from "../context/CartContextValue";

export default function ProductDetails() {
    const { addToCart, cartItems } = useCart();
    const { id } = useParams();
    const product = getProductById(id);

    if (!product) {
        return <Navigate to="/" replace />;
    }

    const productInCart = cartItems.find((item) => item.id === product.id);
    const productQuantityLabel = productInCart ? `(${productInCart.quantity})` : "";

    return (
        <div className = "page">
            <div className="container">
                <div className = "product-detail">
                    <div className = "product-detail-image">
                        <img src = {product.image} alt = {product.name} />
                    </div>

                    <div className = "product-detail-content">
                        <h1 className = "product-detail-name">{product.name}</h1>
                        <p className = "product-detail-price">${product.price}</p>
                        <p>{product.description}</p>
                        <button className = "btn btn-primary" style = {{marginTop: 30}} onClick={() => addToCart(product.id)} >
                            Add to Cart {productQuantityLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
