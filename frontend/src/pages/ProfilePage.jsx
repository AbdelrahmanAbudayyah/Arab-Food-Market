import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../axiosInstance';
import './css/profilePage.css';

export default function ProfilePage() {
  const { user,setUser,logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageEditMode, setPageEditMode] = useState(false);
  const [editMode, setEditMode] = useState({
    name: false,
    bio: false,
    address: false,
    image_url: false,
  });
  const [tempDetails, setTempDetails] = useState({});
  const [passwordMode, setPasswordMode] = useState(false);
const [passwordData, setPasswordData] = useState({
  oldPassword: '',
  newPassword: '',
});
const [password, setPassword] = useState('');
const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (user) {
        fetchUserDetails();
      }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      const res = await axiosInstance.get(`/users/user/${user.id}`, {
        withCredentials: true,
      });
      setUserDetails(res.data);
    } catch (err) {
      console.error('Error fetching user details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
    setTempDetails({ ...tempDetails, [field]: userDetails[field] });
  };

  const handleCancel = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setTempDetails({ ...tempDetails, [field]: '' });
  };

  const handleSave = async (field) => {
    if (field === 'name' && !tempDetails.name.trim()) {
      alert('Name cannot be empty');
      return;
    }
    try {
      const updated = { ...userDetails, [field]: tempDetails[field] };
      // If editing address (city/state together)
      if (field === 'address') {
        updated.city = tempDetails.city;
        updated.state = tempDetails.state;
      }

      await axiosInstance.put(`/users/put/${field}`, updated, {
        withCredentials: true,
      });

      setUserDetails(updated);
      setEditMode({ ...editMode, [field]: false });
    } catch (err) {
        if (err.response?.status === 401) {
          try {
            await axiosInstance.post('/refresh-token', {}, { withCredentials: true });
            const updated = { ...userDetails, [field]: tempDetails[field] };
            if (field === 'address') {
                updated.city = tempDetails.city;
                updated.state = tempDetails.state;
            }
            await axiosInstance.put(`/users/put/${field}`, updated, {
                withCredentials: true,
            });
            setUserDetails(updated);
            setEditMode({ ...editMode, [field]: false });
          } catch (refreshError) {
            console.error('Token refresh failed or retry failed:', refreshError);
          }
        } else {
          console.error('update error:', err);
        }
      }
    };

  const handleImage = async () => {
    try {
      const formData = new FormData();
      formData.append('image_url', tempDetails.image_url);
  
      const res = await axiosInstance.put(`/users/put/image_url`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      // Update state with new image URL from server response
      setUserDetails((prev) => ({
        ...prev,
        image_url: res.data.image_url,
      }));
  
      setEditMode({ ...editMode, image_url: false });
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          await axiosInstance.post('/refresh-token', {}, { withCredentials: true });
      const formData = new FormData();
      formData.append('image_url', tempDetails.image_url);
  
      const res = await axiosInstance.put(`/users/put/image_url`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setUserDetails((prev) => ({
        ...prev,
        image_url: res.data.image_url,
      }));
  
      setEditMode({ ...editMode, image_url: false });
         
        } catch (refreshError) {
          console.error('Token refresh failed or retry failed:', refreshError);
        }
      } else {
        console.error('update error:', err);
      }
    }
  };

  const handlePasswordUpdate = async () => {
    if(!passwordData.oldPassword || !passwordData.newPassword){
      alert("missing old or new password");
      return;
    }

    try {
      await axiosInstance.put(
        `/users/put/password`,
        passwordData,
        { withCredentials: true }
      );
      alert("Password updated successfully.");
      setPasswordMode(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) {
        if (err.response?.status === 403) {
          try {
            await axiosInstance.post('/refresh-token', {}, { withCredentials: true });
            await axiosInstance.put(
                `/users/put/password`,
                passwordData,
                { withCredentials: true }
              );
              alert("Password updated successfully.");
              setPasswordMode(false);
              setPasswordData({ oldPassword: '', newPassword: '' });
           
          } catch (refreshError) {
            console.error('Token refresh failed or retry failed:', refreshError);
          }
        } else {
            console.error('Failed to update password:', err);
            alert("Failed to update password, old password dont match");
        }
      }
    };
  

  const handleDeleteAccount = async () => {
    if (!password) {
        alert('Please enter your password.');
        return;
    }
  
    try {
      await axiosInstance.delete(`/users/delete`,{
        data:{password},
        withCredentials: true,
      });
      logout();
    } catch (err) {
        if (err.response?.status === 401) {
          try {
            await axiosInstance.post('/refresh-token', {}, { withCredentials: true });
            await axiosInstance.delete(`/users/delete`, {
                data:{password},
                withCredentials: true,
              });
              logout();
           
          } catch (refreshError) {
            console.error('Token refresh failed or retry failed:', refreshError);
          }
        } else {
          console.error('delete error:', err);
        }
      }
    };
  
  if (loading) return <div className="profile-container">Loading profile...</div>;
  if (!userDetails) return <div className="profile-container">No user data found.</div>;

  const { name,bio,image_url ,city, state } = userDetails;

  return (
    <div className="background-wrapper">
        <div className="dark-overlay"></div>

  
    <div className="profile-container">
              
      <div className="profile-card">

        {/* Edit Mode Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button onClick={() => setPageEditMode((prev) => !prev)}>
            {pageEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </button>
        </div>

        {/* Profile Picture */}
        <div className="profile-section">
          <img
            src={
              userDetails?.image_url
                ? `${process.env.REACT_APP_API_URL}${userDetails.image_url}`
                : '/default-profile.png'
            }
            alt="Profile"
            className="profile-image"
          />
          {editMode.image_url ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setTempDetails({ ...tempDetails, image_url: e.target.files[0] })
                }
              />
              <button onClick={handleImage}>Save</button>
              <button onClick={() => handleCancel('image_url')}>Cancel</button>
            </div>
          ) : (
            pageEditMode && (
              <button onClick={() => handleEdit('image_url')}>Edit</button>
            )
          )}
        </div>

        {/* Name */}
<div className="profile-section">
  {editMode.name ? (
    <div>
      <label>Name:</label>
      <input
        type="text"
        value={tempDetails.name}
        onChange={(e) => setTempDetails({ ...tempDetails, name: e.target.value })}
      />
      <button onClick={() => handleSave('name')}>Save</button>
      <button onClick={() => handleCancel('name')}>Cancel</button>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <p><strong>Name:</strong> {name}</p>
      {pageEditMode && (
        <button onClick={() => handleEdit('name')} style={{ marginLeft: '10px' }}>Edit</button>
      )}
    </div>
  )}
</div>

{/* Email */}
<div  style={{ display: 'flex', alignItems: 'center' }}className="profile-section">
          <p><strong>Email:</strong> {userDetails.email}</p>
        </div>

{/* Bio */}
{user.type === 'chef' && (
  <div className="profile-section">
    {editMode.bio ? (
      <div>
        <label>Bio:</label>
        <textarea
          value={tempDetails.bio}
          onChange={(e) => setTempDetails({ ...tempDetails, bio: e.target.value })}
        />
        <button onClick={() => handleSave('bio')}>Save</button>
        <button onClick={() => handleCancel('bio')}>Cancel</button>
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p><strong>Bio:</strong> {bio || 'No bio yet.'}</p>
        {pageEditMode && (
          <button onClick={() => handleEdit('bio')} style={{ marginLeft: '10px' }}>Edit</button>
        )}
      </div>
    )}
  </div>
)}


        {/* Address */}
<div className="profile-section">
  {editMode.address ? (
    <div>
      <label>Address:</label>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          placeholder="City"
          value={tempDetails.city}
          onChange={(e) => {
            setTempDetails({ ...tempDetails, city: e.target.value });
            setUser((prevUser) => ({ ...prevUser, city: e.target.value }));
          }}
        />
        <input
          type="text"
          placeholder="State"
          value={tempDetails.state}
          onChange={(e) => {
            setTempDetails({ ...tempDetails, state: e.target.value });
            setUser((prevUser) => ({ ...prevUser, state: e.target.value }));
          }}
        />
      </div>
      <button onClick={() => handleSave('address')}>Save</button>
      <button onClick={() => handleCancel('address')}>Cancel</button>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <p><strong>Address:</strong> {city}, {state}</p>
      {pageEditMode && (
        <button onClick={() => handleEdit('address')} style={{ marginLeft: '10px' }}>Edit</button>
      )}
    </div>
  )}
</div>

        {/* Password */}
        <div className="profile-section">
          {!passwordMode ? (
            pageEditMode && (
              <button onClick={() => setPasswordMode(true)}>Change Password</button>
            )
          ) : (
            <div>
              <input
                type="password"
                placeholder="Old Password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPassword: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="New Password: must be more than 6"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <button onClick={handlePasswordUpdate}>Submit</button>
              <button onClick={() => {
                setPasswordMode(false);
                setPasswordData({ oldPassword: '', newPassword: '' });
              }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-section">
  {confirming ? (
    <>
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button
        onClick={handleDeleteAccount}
        style={{ backgroundColor: 'red', color: 'white' }}
      >
        Confirm Delete
      </button>
      <button
        onClick={() => setConfirming(false)}
        style={{
          backgroundColor: 'gray', 
          color: 'white', 
          marginLeft: '10px'
        }}
      >
        Cancel
      </button>
    </>
  ) : (
    <button
      onClick={() => setConfirming(true)}
      className='delete-account'
    >
      Delete Account
    </button>
  )}
</div>

      </div>
    </div>
    </div>
  );
}
