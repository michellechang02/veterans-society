import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Loading from './components/Loading';
import Navbar from './components/Navbar';
import { AuthProvider } from './Auth/Auth';
import { ChakraProvider } from '@chakra-ui/react';

// Lazy imports
const Home = lazy(() => import('./components/Home'));
const Profile = lazy(() => import('./components/Profile'));
const Register = lazy(() => import('./components/Register'));
const Login = lazy(() => import('./components/Login'));
const Feed = lazy(() => import('./components/Feed'));
const Chat = lazy(() => import('./components/Chat'));
const Groups = lazy(() => import('./components/Groups'));
const Fitness = lazy(() => import('./components/Fitness'));
const UserSearch = lazy(() => import('./components/UserSearch'));
const Resources = lazy(() => import('./components/Resources'));
const OtherProfile = lazy(() => import('./components/OtherProfile'));

function App() {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <AuthProvider>
          <Navbar />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/:username/feed" element={<Feed />} />
              <Route path="/:username/chat" element={<Chat />} />
              <Route path="/:username/groups" element={<Groups />} />
              <Route path="/:username/fitness" element={<Fitness />} />
              <Route path="/:username/search" element={<UserSearch />} />
              <Route path="/:username/users" element={<Profile />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/:username/visit/:otherUsername" element={<OtherProfile />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}

export default App;