import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Checkout from './pages/Checkout'
import Navbar from './components/Navbar'
import AuthProvider from './context/AuthContext'
import ProductDetails from './pages/ProductDetails'
import CartProvider from './context/CartContext'
import NotFound from './pages/NotFound'

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <CartProvider>
        <div className = "app">
          <Navbar />
            <Routes>
                <Route path = "/" element = { <Home />}/>
                <Route path = "/auth" element = { <Auth key={location.key} />}/>
                <Route path = "/checkout" element = { <Checkout />}/>
                <Route path = "/products/:id" element = { <ProductDetails />}/>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
