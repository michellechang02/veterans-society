import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Groups from './components/Groups';

// all routes
function App() {

  const components = [Home, Login, Register, Navbar, Profile, Groups];

  return (
    <>
    <Router>
    <Navbar/>
      <Routes>
        {components.map((Component, index) => (
          <Route 
            key={index} 
            path={Component.name === 'Home' ? '/' : `/${Component.name.toLowerCase()}`} 
            element={<Component />} 
          />
        ))}
      </Routes>
    </Router>
    </>
  )
}

export default App
