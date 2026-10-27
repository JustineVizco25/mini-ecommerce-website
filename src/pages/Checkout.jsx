import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContextValue";
import { useCart } from "../context/CartContextValue";

export default function Checkout() {
    const [checkoutError, setCheckoutError] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const { user } = useAuth();
    const { getCartItemsWithProducts, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const cartItems = getCartItemsWithProducts();
    const total = getCartTotal();

    function placeOrder() {
        setCheckoutError(null);

        if (cartItems.length === 0) {
            setCheckoutError("Your cart is empty.");
            return;
        }

        if (!user) {
            setCheckoutError("Please log in before placing your order.");
            return;
        }

        clearCart();
        setOrderPlaced(true);
    }

    if (orderPlaced) {
        return (
            <div className = "page">
                <div className = "container">
                    <div className = "order-success">
                        <h1 className = "order-success-title">Order Placed!</h1>
                        <p className = "order-success-message">
                            Thank you for shopping with ShopHub.
                        </p>
                        <Link to="/" className="btn btn-primary">Continue shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className = "page">
            <div className = "container">
                <h1 className = "page-title">
                    Checkout
                </h1>
                <div className = "checkout-container">
                    <div className = "checkout-items">
                        <h2 className = "checkout-section-title">
                            Order Summary
                        </h2>
                        {cartItems.length === 0 && (
                            <p>Your cart is empty. <Link to="/" className="auth-link">Browse products</Link></p>
                        )}
                        {cartItems.map((item) => (
                            <div className = "checkout-item" key = {item.id}>
                                <img
                                    src = {item.product.image}
                                    alt = {item.product.name}
                                    className = "checkout-item-image"
                                />

                                <div className = "checkout-item-details">
                                    <h3 className = "checkout-item-name">{item.product.name}</h3>
                                    <p className = "checkout-item-price">
                                        ${item.product.price} each
                                    </p>
                                </div>

                                <div className = "checkout-item-controls">
                                    <div className = "quantity-controls">
                                        <button className = "quantity-btn" aria-label={`Decrease quantity of ${item.product.name}`} onClick = { () => updateQuantity(item.id, item.quantity - 1) }>-</button>
                                        <span className = "quantity-value">{item.quantity}</span>
                                        <button className = "quantity-btn" aria-label={`Increase quantity of ${item.product.name}`} onClick = { () => updateQuantity(item.id, item.quantity + 1) }>+</button>
                                    </div>

                                    <p className = "checkout-item-total">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </p>

                                    <button className = "btn btn-secondary btn-small"
                                    onClick = {() => removeFromCart(item.id)}>
                                        Remove
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>

                    <div className = "checkout-summary">
                        <h2 className="checkout-section-title">Total</h2>
                        {checkoutError && (
                            <div className = "error-message" role = "alert">
                                {checkoutError}
                                {!user && cartItems.length > 0 && (
                                    <>
                                        {" "}
                                        <Link
                                            to = "/auth"
                                            state = {{ from: "/checkout", mode: "login" }}
                                            className = "auth-link"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                        <div className="checkout-total">
                            <p className="checkout-total-label">Subtotal:</p>
                            <p className="checkout-total-value">${total.toFixed(2)}</p>
                        </div>
                        <div className="checkout-total">
                            <p className="checkout-total-label">Total:</p>
                            <p className="checkout-total-value checkout-total-final">
                                ${total.toFixed(2)}
                            </p>
                        </div>
                        <button className="btn btn-primary btn-large btn-block" onClick={placeOrder}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
