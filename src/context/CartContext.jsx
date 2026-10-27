import { useEffect, useState } from "react";
import { CartContext } from "./CartContextValue";
import { getProductById } from "../data/products";
import { readJsonStorage, writeStorage } from "../utils/storage";

function getStoredCart() {
    const items = readJsonStorage("cartItems", []);
    if (!Array.isArray(items)) return [];

    return items.filter((item) =>
        item && Number.isInteger(item.id) && getProductById(item.id) &&
        Number.isSafeInteger(item.quantity) && item.quantity > 0
    );
}

export default function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(getStoredCart);

    useEffect(() => {
        writeStorage("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);
     
    function addToCart(productId) {
        const id = Number(productId);
        if (!getProductById(id)) return;

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
        const id = Number(productId);
        if (!Number.isSafeInteger(quantity)) return;
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems((currentItems) =>
            currentItems.map((item) =>
                item.id === id ? { ...item, quantity } : item
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
