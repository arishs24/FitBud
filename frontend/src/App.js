import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import AddPatient from './components/AddPatient';
import Connection from './pages/Connection';



import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';

import '@fortawesome/fontawesome-svg-core/styles.css';

 
function Navbar({ signUserOut, currentUser }) {
  const [nav, setNav] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <header className="flex justify-between items-center h-24 mx-auto px-4 text-white bg-[#131128aa]">
      <h1 className="w-full text-5xl font-bold text-[#f0f2f0]">FitBud</h1>
      <ul className="hidden md:flex">
        <li className="p-4">
          <Link to="/">Home</Link>
        </li>
        {currentUser && (
          <>
            <li className="p-4">
              <Link to="/patient">Add Patient</Link>
            </li>
            <li className="p-4">
              <Link to="/connection">Connection</Link>
            </li>
            <li className="p-4">
              <button onClick={signUserOut}>Log Out</button>
            </li>
          </>
        )}
        {!currentUser && (
          <li className="p-4">
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
      {/* Mobile Navigation */}
      <div onClick={handleNav} className="block md:hidden">
        {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
      </div>
      <ul className={nav ? "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500" : "ease-in-out duration-500 fixed left-[-100%]"}>
        <h1 className="w-full text-3xl font-bold text-[#00d59a] m-4">My App</h1>
        <li className="p-4 border-b">
          <Link to="/">Home</Link>
        </li>
        {currentUser && (
          <>
            <li className="p-4 border-b border-gray-600">
              <Link to="/patient">Add Patient</Link>
            </li>
            <li className="p-4 border-b border-gray-600">
              <Link to="/connection">News</Link>
            </li>
            <li className="p-4">
              <button onClick={signUserOut}>Log Out</button>
            </li>
          </>
        )}
        {!currentUser && (
          <li className="p-4 border-b">
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </header>
  );
}


function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem('isAuth'));

  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = '/login';
    });
  };

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch the user info and update the state
        fetchUserInfo(user.uid);
        setIsAuth(true); // Make sure to set the auth state when user is authenticated
      } else {
        setIsAuth(false); // If user is logged out, set auth state to false
      }
    });
    return () => {
      unSub(); // Cleanup listener on unmount
    };
}, [fetchUserInfo]);


  if (isLoading) return <div className='loading'>Loading...</div>;

  return (
    <Router>
      <Navbar signUserOut={signUserOut} currentUser={currentUser} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/connection' element={<Connection />} />
        <Route path='/patient' element={<AddPatient />} />
        <Route path='/login' element={<Login setIsAuth={setIsAuth} />} />
      </Routes>
    </Router>
  );
}

export default App;
