import React, { useState, useEffect } from 'react';
import './dashboard.css';

const Dashboard = () => {
  const [shifts, setShifts] = useState([]);
  const [appliedShifts, setAppliedShifts] = useState([]);
  const [assignedShifts, setAssignedShifts] = useState([]);
  const [completedShifts, setCompletedShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedShifts, setExpandedShifts] = useState({});
  const [activeSection, setActiveSection] = useState('profile');

  const [profilePicture, setProfilePicture] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    contact: '',
    username: '',
    role: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('No token found, please log in');
          window.location.href = '/login';
          return;
        }

        // Fetch available shifts
        const shiftsResponse = await fetch('http://localhost:5000/api/shifts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!shiftsResponse.ok) {
          throw new Error('Failed to fetch shifts');
        }

        const shiftsData = await shiftsResponse.json();
        setShifts(shiftsData);

        // Fetch assigned shifts
        const assignedResponse = await fetch('http://localhost:5000/api/shifts/assigned', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (assignedResponse.ok) {
          const assignedData = await assignedResponse.json();
          setAssignedShifts(assignedData);
        }

        // Fetch completed shifts
        const completedResponse = await fetch('http://localhost:5000/api/shifts/completed', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (completedResponse.ok) {
          const completedData = await completedResponse.json();
          setCompletedShifts(completedData);
        }

        // Fetch user profile
        const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile({
            name: profileData.name || '',
            email: profileData.email || '',
            contact: profileData.contact || '',
            username: profileData.username || '',
            role: profileData.role || ''
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle shift expansion
  const toggleShift = (shiftId) => {
    setExpandedShifts(prev => ({
      ...prev,
      [shiftId]: !prev[shiftId]
    }));
  };

  const applyForShift = async (shiftId) => {
    try {
      const token = localStorage.getItem('token');  // Retrieve token from localStorage

      if (!token) {
        throw new Error('No token found, please log in');
      }

      const response = await fetch('http://localhost:5000/api/shifts/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,  // Include the token in the Authorization header
        },
        body: JSON.stringify({ shiftId })  // Send shiftId in the request body
      });

      const data = await response.json();
      if (response.ok) {
        setAppliedShifts([...appliedShifts, shiftId]);
        alert('Shift application successful!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error applying for shift:', error);
      alert('Failed to apply for shift.');
    }
  };

  // Profile editing handlers
  const handleProfileInputChange = (e) => {
    setUserProfile({
      ...userProfile,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userProfile.name,
          email: userProfile.email,
          contact: userProfile.contact,
          profilePicture: profilePicture
        })
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');  // Clear token on logout
    window.location.href = '/login';  // Redirect to login page
  };

  // Cancel assigned shift
  const cancelShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to cancel this shift?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/shifts/${shiftId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Shift cancelled successfully!');
        // Refresh data
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to cancel shift');
      }
    } catch (error) {
      console.error('Error cancelling shift:', error);
      alert('Failed to cancel shift');
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);  // Set the uploaded image as base64 URL
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">Volunteer Dashboard</h1>
        <div className="dashboard-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">Volunteer Dashboard</h1>
        <div className="dashboard-container">
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Volunteer Dashboard</h1>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <div className="dashboard-container" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar Navigation */}
        <div className="sidebar" style={{
          width: '250px',
          minWidth: '250px',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li
              onClick={() => setActiveSection('profile')}
              style={{
                padding: '15px',
                marginBottom: '10px',
                cursor: 'pointer',
                backgroundColor: activeSection === 'profile' ? '#007bff' : '#fff',
                color: activeSection === 'profile' ? '#fff' : '#000',
                borderRadius: '5px',
                fontWeight: activeSection === 'profile' ? 'bold' : 'normal'
              }}
            >
              My Profile
            </li>
            <li
              onClick={() => setActiveSection('upcoming')}
              style={{
                padding: '15px',
                marginBottom: '10px',
                cursor: 'pointer',
                backgroundColor: activeSection === 'upcoming' ? '#007bff' : '#fff',
                color: activeSection === 'upcoming' ? '#fff' : '#000',
                borderRadius: '5px',
                fontWeight: activeSection === 'upcoming' ? 'bold' : 'normal'
              }}
            >
              Upcoming Shifts
            </li>
            <li
              onClick={() => setActiveSection('available')}
              style={{
                padding: '15px',
                marginBottom: '10px',
                cursor: 'pointer',
                backgroundColor: activeSection === 'available' ? '#007bff' : '#fff',
                color: activeSection === 'available' ? '#fff' : '#000',
                borderRadius: '5px',
                fontWeight: activeSection === 'available' ? 'bold' : 'normal'
              }}
            >
              Available Shifts
            </li>
            <li
              onClick={() => setActiveSection('completed')}
              style={{
                padding: '15px',
                marginBottom: '10px',
                cursor: 'pointer',
                backgroundColor: activeSection === 'completed' ? '#007bff' : '#fff',
                color: activeSection === 'completed' ? '#fff' : '#000',
                borderRadius: '5px',
                fontWeight: activeSection === 'completed' ? 'bold' : 'normal'
              }}
            >
              Completed Shifts
            </li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="content-area" style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 20px'
        }}>
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'upcoming' && renderUpcomingShifts()}
          {activeSection === 'available' && renderAvailableShifts()}
          {activeSection === 'completed' && renderCompletedShifts()}
        </div>
      </div>
    </div>
  );

  // Render My Profile Section
  function renderProfile() {
    return (
      <div className="profile-section" style={{ width: '100%', maxWidth: '800px' }}>
        <h2>My Profile</h2>

        {/* Profile Picture Upload */}
        <div className="profile-picture-section">
          <h3>Profile Picture</h3>
          <input type="file" accept="image/*" onChange={handleProfilePictureUpload} />
          {profilePicture && (
            <div className="profile-picture-preview">
              <img src={profilePicture} alt="Profile" />
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          <div className="profile-header">
            <h3>Profile Information</h3>
            <button
              className="edit-profile-btn"
              onClick={() => {
                if (isEditingProfile) {
                  handleSaveProfile();
                } else {
                  setIsEditingProfile(true);
                }
              }}
            >
              {isEditingProfile ? 'Save Profile' : 'Edit Profile'}
            </button>
            {isEditingProfile && (
              <button
                className="cancel-edit-btn"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </button>
            )}
          </div>

          <p>
            <strong>Username:</strong> {userProfile.username}
          </p>

          {isEditingProfile ? (
            <>
              <p>
                <strong>Name:</strong>
                <input
                  type="text"
                  name="name"
                  value={userProfile.name}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your name"
                />
              </p>
              <p>
                <strong>Email:</strong>
                <input
                  type="email"
                  name="email"
                  value={userProfile.email}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your email"
                />
              </p>
              <p>
                <strong>Contact:</strong>
                <input
                  type="text"
                  name="contact"
                  value={userProfile.contact}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your contact number"
                />
              </p>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {userProfile.name || 'Not set'}</p>
              <p><strong>Email:</strong> {userProfile.email || 'Not set'}</p>
              <p><strong>Contact:</strong> {userProfile.contact || 'Not set'}</p>
            </>
          )}
        </div>

        <p><strong>Total Hours Volunteered:</strong> {completedShifts.length * 4} hours</p>
      </div>
    );
  }

  // Render Upcoming Shifts Section
  function renderUpcomingShifts() {
    return (
      <div className="shift-list" style={{ width: '100%', maxWidth: '800px' }}>
        <h2>Upcoming Shifts</h2>
        <ul>
          {Array.isArray(assignedShifts) && assignedShifts.filter(shift => !shift.completed).length > 0 ? (
            assignedShifts.filter(shift => !shift.completed).map((shift) => (
              <li key={shift._id} className="shift-item-volunteer" style={{ minHeight: 'auto', padding: '15px', marginBottom: '10px', fontSize: '16px' }}>
                <div
                  onClick={() => toggleShift(shift._id)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>{shift.location}</strong>
                  </div>
                  <span style={{ fontSize: '20px', marginLeft: '10px' }}>{expandedShifts[shift._id] ? '▼' : '▶'}</span>
                </div>
                {expandedShifts[shift._id] && (
                  <div className="shift-details" style={{ lineHeight: '1.8', marginTop: '15px', paddingTop: '15px' }}>
                    <p><strong>Date:</strong> {shift.date}</p>
                    <p><strong>Time:</strong> {shift.time}</p>
                    <p><strong>Task:</strong> {shift.task}</p>
                    {shift.action && <p><strong>Action:</strong> {shift.action}</p>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelShift(shift._id);
                      }}
                      className="cancel-btn"
                      style={{ marginTop: '10px', padding: '10px 20px', fontSize: '14px' }}
                    >
                      Cancel Shift
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p>No upcoming shifts</p>
          )}
        </ul>
      </div>
    );
  }

  // Render Available Shifts Section
  function renderAvailableShifts() {
    return (
      <div className="shift-list" style={{ width: '100%', maxWidth: '800px' }}>
        <h2>Available Shifts</h2>
        <ul>
          {Array.isArray(shifts) && shifts.length > 0 ? (
            shifts.map((shift) => (
              <li key={shift._id} className="shift-item-volunteer" style={{ minHeight: 'auto', padding: '15px', marginBottom: '10px', fontSize: '16px' }}>
                <div
                  onClick={() => toggleShift(`available-${shift._id}`)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>{shift.location}</strong>
                  </div>
                  <span style={{ fontSize: '20px', marginLeft: '10px' }}>{expandedShifts[`available-${shift._id}`] ? '▼' : '▶'}</span>
                </div>
                {expandedShifts[`available-${shift._id}`] && (
                  <div className="shift-details" style={{ lineHeight: '1.8', marginTop: '15px', paddingTop: '15px' }}>
                    <p><strong>Date:</strong> {shift.date}</p>
                    <p><strong>Time:</strong> {shift.time}</p>
                    <p><strong>Task:</strong> {shift.task}</p>
                    {shift.action && <p><strong>Action:</strong> {shift.action}</p>}
                    <button
                      disabled={appliedShifts.includes(shift._id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        applyForShift(shift._id);
                      }}
                      className="apply-btn"
                      style={{ marginTop: '10px', padding: '10px 20px', fontSize: '14px' }}
                    >
                      {appliedShifts.includes(shift._id) ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p>No shifts available</p>
          )}
        </ul>
      </div>
    );
  }

  // Render Completed Shifts Section
  function renderCompletedShifts() {
    return (
      <div className="completed-shifts" style={{ width: '100%', maxWidth: '800px' }}>
        <h2>Completed Shifts</h2>
        <ul>
          {completedShifts.length > 0 ? (
            completedShifts.map((shift) => (
              <li key={shift._id} className="shift-item-volunteer" style={{ minHeight: 'auto', padding: '15px', marginBottom: '10px', fontSize: '16px' }}>
                <div
                  onClick={() => toggleShift(`completed-${shift._id}`)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>{shift.location}</strong>
                  </div>
                  <span style={{ fontSize: '20px', marginLeft: '10px' }}>{expandedShifts[`completed-${shift._id}`] ? '▼' : '▶'}</span>
                </div>
                {expandedShifts[`completed-${shift._id}`] && (
                  <div className="shift-details" style={{ lineHeight: '1.8', marginTop: '15px', paddingTop: '15px' }}>
                    <p><strong>Date:</strong> {shift.date}</p>
                    <p><strong>Time:</strong> {shift.time}</p>
                    <p><strong>Task:</strong> {shift.task}</p>
                    {shift.action && <p><strong>Action:</strong> {shift.action}</p>}
                  </div>
                )}
              </li>
            ))
          ) : (
            <p>No completed shifts yet</p>
          )}
        </ul>
      </div>
    );
  }
};

export default Dashboard;
