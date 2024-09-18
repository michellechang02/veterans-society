import { Routes, Route } from 'react-router-dom';
import { Home, Login, Register, Navbar, Profile, Groups } from './components';

// all routes
function App() {

  const components = [Home, Login, Register, Navbar, Profile, Groups];

  return (
    <>
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
    </>
  )
}

export default App
