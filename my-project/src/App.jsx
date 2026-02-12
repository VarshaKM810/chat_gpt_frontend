import { Routes, Route, BrowserRouter as Router, useLocation } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import About from './pages/about'
import Contact from './pages/Contact'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Ask_AI from './pages/Ask_AI'

const Layout = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/ask';

  return (
    <>
      {!isChatPage && <Header />}
      {children}
      {!isChatPage && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ask" element={<Ask_AI />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
