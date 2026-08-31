import { useState } from "react";
import { CartContext } from "./CartContextValue";
import { getProductById } from "../data/products";

export default function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]); // id: and quantity:
     
    function addToCart(productId) {
        const id = Number(productId);

        setCartItems((currentItems) => {
            const existing = currentItems.find((item) => item.id === id);

            if (existing) {
                return currentItems.map((item) => item.id === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }

            return [...currentItems, { id, quantity: 1 }];
        });
    }

    function getCartItemsWithProducts() {
        return cartItems
        .map((item) => ({
            ...item, 
            product: getProductById(item.id),
        }))
        .filter((item) => item.product);
        
    }
    
    function removeFromCart(productId) {
    setCartItems((currentItems) =>
        currentItems.filter(
        (item) => item.id !== Number(productId)
        )
    );
}

    function updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(
            cartItems.map((item) => 
                item.id === productId ? { ...item, quantity } : item
            )
        );
    }

    function getCartTotal() {
        const total = cartItems.reduce((total, item) => {
            const product = getProductById(item.id)
            return total + (product ? (product.price * item.quantity) : 0);
        }, 0)

        return total;
    }

    function clearCart() {
        setCartItems([]);
    }
      return (
            <CartContext.Provider value = {{ cartItems, addToCart, getCartItemsWithProducts, removeFromCart, updateQuantity, getCartTotal, clearCart}}>
                { children }
            </CartContext.Provider>
      )
}
