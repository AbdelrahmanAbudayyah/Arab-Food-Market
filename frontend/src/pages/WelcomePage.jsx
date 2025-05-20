import { useState, useEffect } from 'react';
import { useGuest } from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';
import './css/welcomePage.css';

export default function WelcomePage() {
  const [showModal, setShowModal] = useState(false);
  const [stateInput, setStateInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const { guestBrowse } = useGuest();
  const { user } = useAuth();

  const handleGuestContinue = () => {
    guestBrowse({ state: stateInput, city: cityInput });
  };

  return (
    <div className="WelcomePage-container">
  <div className="WelcomePage-img">
    <img src="/images/welcomePage.jpeg" alt="Welcome" />

    {/* Text on top of left side of image */}
    <div className="welcome-text">
      <h1>Welcome to Our Kitchen</h1>
      <p>Home-cooked Arab meals, near you.</p>
    </div>
  </div>
  
      {/* Continue as Guest Button */}
      {!user &&(<button className="guest-button" onClick={() => setShowModal(true)}>
        Continue as Guest
      </button>)}

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Where Are You Located?</p>
            <input
              type="text"
              placeholder="State"
              value={stateInput}
              onChange={(e) => setStateInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="City"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleGuestContinue} disabled={!stateInput && !cityInput}>
                Continue
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

