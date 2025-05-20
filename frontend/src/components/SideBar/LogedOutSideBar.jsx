import './sideBar.css';
import { useRef, useEffect,useState } from 'react';
import SignInModal from '../LoginSignupPopup/SignInModal'; 
import SignUpModal from '../LoginSignupPopup/SignUpModal';
import BecomeAChefModal from '../LoginSignupPopup/BecomeAChefModal';

export default function LoggedOutSideBar({ sidebarOpen, setSidebarOpen }) {
  const sidebarRef = useRef(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showBecomeChef, setShowBecomeChef] = useState(false);

  const handleSignInClick = () => {
    setShowSignIn(true);
    setSidebarOpen(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setSidebarOpen(false);
  };
  const handleBecomeChefClick = () => {
    setShowBecomeChef(true);
    setSidebarOpen(false); 
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
    <div
      ref={sidebarRef}
      className={`sidebar ${sidebarOpen ? 'open' : ''}`}
    >
      <ul className="sidebar-menu">
        <li onClick={handleSignInClick}>Sign In</li>
        <li onClick={handleSignUpClick}>Sign Up</li>
        <li onClick={handleBecomeChefClick}>Become a Chef</li>
      </ul>

    </div>
    <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    <SignUpModal isOpen={showSignUp} onClose={() => setShowSignUp(false)} />
    <BecomeAChefModal isOpen={showBecomeChef} onClose={() => setShowBecomeChef(false)} />
    </>

  );
}
