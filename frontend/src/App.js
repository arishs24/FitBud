import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import { auth } from './firebase';
import { useUserStore } from './lib/userStore';
import Home from './pages/Home';
import AddPatient from './components/AddPatient';
import PatientData from './components/PatientData';
import Login from './pages/Login';
import Header from './components/Header';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid); // Fetch user info if logged in
    });
    return () => {
      unSub(); // Cleanup subscription
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <Header currentUser={currentUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        {currentUser && (
          <>
            <Route path="/add-patient" element={<AddPatient />} />
            <Route path="/view-patient/:patientId" element={<PatientData />} />
          </>
        )}
        <Route path="/sign-up" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
