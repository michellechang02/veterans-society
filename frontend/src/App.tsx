import React from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Groups from './components/Groups';
import Chat from './components/Chat';

// Define the component types
type ComponentType = React.ComponentType;

const App: React.FC = () => {

  const components: ComponentType[] = [Home, Login, Register, Navbar, Profile, Groups, Chat];

  return (
    <Router>
      <Navbar />
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
  );
};

export default App;
