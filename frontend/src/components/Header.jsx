import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';


const Header = ({ currentUser, setIsAuth }) => {
  const [nav, setNav] = useState(false);
  const navigate = useNavigate();

  const handleNav = () => {
    setNav((prevNav) => !prevNav);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      setIsAuth(false);
      navigate('/sign-up'); // Redirect to login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed w-full top-0 left-0 z-50 bg-black">
      <div className="flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white">
        <h1 className="w-full text-3xl font-bold text-[#00d59a]">S . K . S</h1>
        <ul className="hidden md:flex">
          <li className="p-4">
            <Link to="/">Home</Link>
          </li>
          {currentUser ? (
            <>
              <li className="p-4">
                <Link to="/add-patient">Add Patient</Link>
              </li>
              <li className="p-4">
                <button onClick={handleSignOut}>Log Out</button>
              </li>
            </>
          ) : (
            <li className="p-4">
              <Link to="/sign-up">Sign In</Link>
            </li>
          )}
        </ul>
        <div onClick={handleNav} className="block md:hidden">
          {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </div>
        <ul
          className={
            nav
              ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500'
              : 'ease-in-out duration-500 fixed left-[-100%]'
          }
        >
          <h1 className="w-full text-3xl font-bold text-[#00d59a] m-4">S . K . S</h1>
          <li className="p-4 border-b border-gray-600">
            <Link to="/">Home</Link>
          </li>
          {currentUser ? (
            <>
              <li className="p-4 border-b border-gray-600">
                <Link to="/add-patient">Add Patient</Link>
              </li>
              <li className="p-4 border-b border-gray-600">
                <button onClick={handleSignOut}>Log Out</button>
              </li>
            </>
          ) : (
            <li className="p-4 border-b border-gray-600">
              <Link to="/sign-up">Sign In</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Header;