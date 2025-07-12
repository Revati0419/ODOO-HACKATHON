import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Layout, Context, and Pages/Components
import Navbar from './components/Navbar'; // Assuming you have a Navbar component
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Import all your page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tags from './pages/Tags';
import AskQuestion from './pages/AskQuestion';
import QuestionDetail from './pages/QuestionDetail';
import Profile from './pages/Profile';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    // <Router> must be the top-level component
    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />

            {/* Authenticated User Routes */}
            <Route
              path="/ask"
              element={
                <PrivateRoute>
                  <AskQuestion />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Admin Only Route */}
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminPanel />
                </PrivateRoute>
              }
            />

            {/* A 404 Not Found Route */}
            <Route path="*" element={
              <div className="text-center py-10">
                <h1 className="text-3xl font-bold">404 - Not Found</h1>
                <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;