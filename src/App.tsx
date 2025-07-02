import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MeshProvider } from '@meshsdk/react';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Donate from './pages/Donate';
import MyProjects from './pages/MyProjects';
import MyDonations from './pages/MyDonations';
import NFTGallery from './pages/NFTGallery';
import About from './pages/About';
import Contact from './pages/Contact';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MeshProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/create-project"
                    element={
                      <ProtectedRoute>
                        <CreateProject />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/donate/:projectId"
                    element={
                      <ProtectedRoute>
                        <Donate />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/my-projects"
                    element={
                      <ProtectedRoute>
                        <MyProjects />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/my-donations"
                    element={
                      <ProtectedRoute>
                        <MyDonations />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/nft-gallery"
                    element={
                      <ProtectedRoute>
                        <NFTGallery />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </MeshProvider>
      
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;