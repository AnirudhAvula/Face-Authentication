import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Alert from './components/Alert';
import Dashboard from './components/Dashboard';
import IndividualReg from './components/IndividualReg';
import AuthenticationCard from './components/AuthenticationCard';
import AuthenticationCardCNN from './components/AuthenticationCardCNN';
import IndividualRegCNN from './components/IndividualRegCNN';
import UserProfile from './components/UserProfile';
import GroupAuthentication from './components/GroupAuthentication';
import History from './components/History';
import CrowdUpload from './components/CrowdUpload';
import Crowdimage from './components/crowdimage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [alert, setAlert] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem('token') // Check sessionStorage for token
  );

  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      <BrowserRouter>
        <Alert alert={alert} />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Signup showAlert={showAlert} />} />
          <Route path="/login" element={<Login showAlert={showAlert} onLogin={handleLogin} />} />

          {/* Protected routes */}
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/individualregistration"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <IndividualReg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/individualregistrationcnn"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <IndividualRegCNN />
              </ProtectedRoute>
            }
          />
          <Route
            path="/individualauthentication"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AuthenticationCard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/individualauthenticationcnn"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AuthenticationCardCNN />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groupauthentication"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <GroupAuthentication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userprofile"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crowd"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CrowdUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crowdimage"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Crowdimage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
