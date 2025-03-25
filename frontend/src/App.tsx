import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Loading from './components/Loading';
import Navbar from './components/Navbar';
import { AuthProvider } from './Auth/Auth';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import ProtectedRoute from './components/ProtectedRoute';

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
const Donate = lazy(() => import('./components/donations/Donate'));
const DonationSuccess = lazy(() => import('./components/donations/donation_success'));
const AdminFitness = lazy(() => import('./components/admin/AdminFitness'));
const Dashboard = lazy(() => import('./components/admin/Dashboard'));


function App() {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <AuthProvider>
          <Flex height="100vh" width="100vw" overflow="hidden">
            <Box width="200px" flexShrink={0} height="100vh" position="fixed" left={0} top={0}>
              <Navbar />
            </Box>
            <Box flex="1" height="100vh" overflowY="auto" marginLeft="200px">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/donation-success" element={<DonationSuccess />} />
                  <Route path="/donation-success" element={<DonationSuccess />} />
                  <Route element={<ProtectedRoute allowedRoles={["veteran", "admin"]} />}>
                    <Route path="/:username/feed" element={<Feed />} />
                    <Route path="/:username/chat" element={<Chat />} />
                    <Route path="/:username/groups" element={<Groups />} />
                    <Route path="/:username/fitness" element={<Fitness />} />
                    <Route path="/:username/search" element={<UserSearch />} />
                    <Route path="/:username/users" element={<Profile />} />
                    <Route path="/:username/visit/:otherUsername" element={<OtherProfile />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="/:username/fitness/admin_view" element={<AdminFitness />} />
                    <Route path="/:username/users/admin_view" element={<Profile />} />
                    <Route path="/:username/visit/:otherUsername" element={<OtherProfile />} />
                    <Route path="/:username/dashboard" element={<Dashboard />} />
                  </Route>
                </Routes>
              </Suspense>
            </Box>
          </Flex>
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}

export default App;