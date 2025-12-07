import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin-dashboard.css';  // Ensure your custom styling is in this file
import Statistics from './Statistics'; // Import the new Statistics component

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Volunteers');
  const [volunteers, setVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedShifts, setAssignedShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dates, setDates] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allShifts, setAllShifts] = useState([]);
  const [newShift, setNewShift] = useState({
    date: '',
    time: '',
    location: '',
    task: '',
    action: ''
  });


  useEffect(() => {
    const role = localStorage.getItem('role');

    // Redirect to login if not an organizer
    if (role !== 'organizer') {
      navigate('/login');
      return;
    }

    // Fetch volunteers and shifts from API
    fetchVolunteers();
    fetchAssignedShifts();
    fetchAllShifts();
  }, [navigate]);

  // Fetch volunteers from API
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/admin/volunteers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch volunteers');
      }

      const data = await response.json();
      setVolunteers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setError(error.message);
      setLoading(false);
    }
  };


  // Fetch assigned shifts from API
  const fetchAssignedShifts = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/admin/shifts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const data = await response.json();
      // Filter shifts that have assignedUsers
      const assignedShiftsData = data.filter(shift => shift.assignedUsers && shift.assignedUsers.length > 0);

      setAssignedShifts(assignedShiftsData);

      // Extract unique dates
      const availableDates = [...new Set(assignedShiftsData.map(shift => shift.date))];
      setDates(availableDates);
    } catch (error) {
      console.error('Error fetching assigned shifts:', error);
      setError(error.message);
    }
  };

  // Fetch all shifts
  const fetchAllShifts = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/admin/shifts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const data = await response.json();
      setAllShifts(data);
    } catch (error) {
      console.error('Error fetching all shifts:', error);
      setError(error.message);
    }
  };

  // Handle new shift input change
  const handleNewShiftChange = (e) => {
    setNewShift({
      ...newShift,
      [e.target.name]: e.target.value
    });
  };

  // Create new shift
  const handleCreateShift = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/shifts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newShift)
      });

      if (response.ok) {
        alert('Shift created successfully!');
        setNewShift({ date: '', time: '', location: '', task: '', action: '' });
        fetchAllShifts(); // Refresh shift list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create shift');
      }
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('Failed to create shift');
    }
  };

  // Delete shift
  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/shifts/${shiftId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Shift deleted successfully');
        fetchAllShifts(); // Refresh shift list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete shift');
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('Failed to delete shift');
    }
  };


  // Approve application
  const handleApproveApplication = async (shiftId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/shifts/${shiftId}/approve/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Application approved successfully!');
        fetchAllShifts(); // Refresh all shifts list
        fetchAssignedShifts(); // Refresh assigned shifts list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  // Deny application  
  const handleDenyApplication = async (shiftId, userId) => {
    if (!window.confirm('Are you sure you want to deny this application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/shifts/${shiftId}/deny/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Application denied successfully');
        fetchAllShifts(); // Refresh all shifts list
        fetchAssignedShifts(); // Refresh assigned shifts list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to deny application');
      }
    } catch (error) {
      console.error('Error denying application:', error);
      alert('Failed to deny application');
    }
  };


  // Handle volunteer deletion
  const handleDelete = async (volunteerId) => {
    if (!window.confirm('Are you sure you want to delete this volunteer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/volunteers/${volunteerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Volunteer deleted successfully');
        fetchVolunteers(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete volunteer');
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      alert('Failed to delete volunteer');
    }
  };

  // Handle cancel/delete shift
  const handleCancelShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to cancel this shift?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/shifts/${shiftId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Shift cancelled successfully');
        fetchAssignedShifts(); // Refresh assigned shifts list
        fetchAllShifts(); // Refresh all shifts list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to cancel shift');
      }
    } catch (error) {
      console.error('Error cancelling shift:', error);
      alert('Failed to cancel shift');
    }
  };

  // Handle mark shift as completed
  const handleMarkComplete = async (shiftId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/shifts/${shiftId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Shift marked as completed!');
        fetchAssignedShifts(); // Refresh assigned shifts list
        fetchAllShifts(); // Refresh all shifts list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to mark shift as completed');
      }
    } catch (error) {
      console.error('Error marking shift as completed:', error);
      alert('Failed to mark shift as completed');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter volunteers based on search query
  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // Handle date change
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);

    // Get unique locations for the selected date
    const availableLocations = [
      ...new Set(assignedShifts.filter(shift => shift.date === selectedDate).map(shift => shift.location)),
    ];
    setLocations(availableLocations); // Populate locations dropdown
    setSelectedLocation(''); // Reset location selection when a new date is selected
  };

  // Handle location change
  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value); // Update the selected location
  };

  // Filter assigned shifts based on selected date and location
  const filteredShifts = assignedShifts.filter(shift => {
    return shift.date === selectedDate && (selectedLocation === '' || shift.location === selectedLocation);
  });


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Content to display based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Volunteers':
        return renderVolunteers();
      case 'Assigned Shifts':
        return renderAssignedShifts();
      case 'Pending Applications':
        return renderPendingApplications();
      case 'Available Shifts':
        return renderAvailableShifts();
      case 'Feedback':
        return <div><h1>Feedback</h1><p>View and manage feedback from volunteers.</p></div>;
      case 'Statistics':
        return <Statistics />; // Render the Statistics component  
      default:
        return null;
    }
  };

  // Render volunteers list with search bar and delete button
  const renderVolunteers = () => (
    <div className="volunteers-section">
      <h1>Volunteers Management</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name"
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-bar"
      />

      {/* Volunteer List */}
      <div className="volunteer-list">
        {loading && <p>Loading volunteers...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && filteredVolunteers.map(volunteer => (
          <div key={volunteer._id} className="volunteer-item">
            <img src={volunteer.profilePicture || 'https://via.placeholder.com/50'} alt={volunteer.name || volunteer.username} className="volunteer-img" />
            <div className="volunteer-details">
              <p><strong>Name:</strong> {volunteer.name || 'Not set'}</p>
              <p><strong>Username:</strong> {volunteer.username}</p>
              <p><strong>Email:</strong> {volunteer.email || 'Not set'}</p>
              <p><strong>Contact:</strong> {volunteer.contact || 'Not set'}</p>
            </div>
            <button onClick={() => handleDelete(volunteer._id)} className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  // Render assigned shifts list with cancel button and date drop-down
  const renderAssignedShifts = () => (
    <div className="assigned-shifts-section">
      <h1>Assigned Shifts</h1>

      {/* Date Dropdown */}
      <label htmlFor="date-select"><strong>Select Date: </strong></label>
      <select id="date-select" value={selectedDate} onChange={handleDateChange} className="date-dropdown">
        <option value="">Select a date</option>
        {dates.map(date => (
          <option key={date} value={date}>{date}</option>
        ))}
      </select>

      {/* Location Dropdown */}
      {selectedDate && (
        <>
          <label htmlFor="location-select"><strong>Select Location: </strong></label>
          <select id="location-select" value={selectedLocation} onChange={handleLocationChange} className="location-dropdown">
            <option value="">All locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </>
      )}




      <div className="assigned-shifts-list">
        {filteredShifts.length > 0 ? (
          filteredShifts.map(shift => {
            return (
              <div key={shift._id} className="shift-item-admin" style={{
                marginBottom: '15px',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: shift.completed ? '#d4edda' : '#fff' // Green background if completed
              }}>
                <p><strong>Date:</strong> {shift.date}</p>
                <p><strong>Time:</strong> {shift.time}</p>
                <p><strong>Location:</strong> {shift.location}</p>
                <p><strong>Task:</strong> {shift.task}</p>
                <p><strong>Status:</strong> {shift.completed ? 'Completed' : 'In Progress'}</p>
                <p><strong>Assigned Volunteers:</strong> {shift.assignedUsers?.length || 0}</p>
                {shift.assignedUsers && shift.assignedUsers.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Volunteer Details:</strong>
                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                      {shift.assignedUsers.map((user, idx) => (
                        <li key={user._id || idx}>
                          {user.name || user.username} ({user.email || 'No email'})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleMarkComplete(shift._id)}
                    disabled={shift.completed}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: shift.completed ? '#6c757d' : '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: shift.completed ? 'not-allowed' : 'pointer',
                      opacity: shift.completed ? 0.6 : 1
                    }}
                  >
                    {shift.completed ? 'Already Completed' : 'Mark as Completed'}
                  </button>
                  <button
                    onClick={() => handleCancelShift(shift._id)}
                    className="cancel-btn"
                  >
                    Cancel Shift
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No shifts assigned for this date.</p>
        )}
      </div>
    </div>
  );

  // Render available shifts with create form
  const renderAvailableShifts = () => (
    <div className="shifts-section">
      {/* Shift Creation Form */}
      <div className="shift-creation-form">
        <h2>Create New Shift</h2>
        <form onSubmit={handleCreateShift} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <input
            type="date"
            name="date"
            value={newShift.date}
            onChange={handleNewShiftChange}
            required
            style={{ flex: '1', minWidth: '150px', padding: '10px', fontSize: '14px' }}
          />
          <input
            type="text"
            name="time"
            value={newShift.time}
            onChange={handleNewShiftChange}
            placeholder="Time (e.g., 09:00-12:00)"
            required
            style={{ flex: '1', minWidth: '150px', padding: '10px', fontSize: '14px' }}
          />
          <input
            type="text"
            name="location"
            value={newShift.location}
            onChange={handleNewShiftChange}
            placeholder="Location (e.g., Sihlcity)"
            required
            style={{ flex: '1', minWidth: '150px', padding: '10px', fontSize: '14px' }}
          />
          <input
            type="text"
            name="task"
            value={newShift.task}
            onChange={handleNewShiftChange}
            placeholder="Task (e.g., Cinemasupport)"
            required
            style={{ flex: '1', minWidth: '150px', padding: '10px', fontSize: '14px' }}
          />
          <input
            type="text"
            name="action"
            value={newShift.action}
            onChange={handleNewShiftChange}
            placeholder="Action (optional)"
            style={{ flex: '1', minWidth: '150px', padding: '10px', fontSize: '14px' }}
          />
          <button type="submit" className="create-shift-btn" style={{ padding: '10px 20px', fontSize: '14px' }}>
            Create Shift
          </button>
        </form>
      </div>

      {/* Shifts Table */}
      <div className="shifts-list">
        <h2>All Shifts ({allShifts.length})</h2>
        {loading && <p>Loading shifts...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && allShifts.length === 0 && <p>No shifts available. Create one above!</p>}
        {!loading && !error && allShifts.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2c3e50', color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Task</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Action</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Applied</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Assigned</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {allShifts.map((shift, index) => (
                <tr key={shift._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>{shift.date}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>{shift.time}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>{shift.location}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>{shift.task}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>{shift.action || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: '#000' }}>
                    {shift.appliedUsers?.length || 0}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: '#000' }}>
                    {shift.assignedUsers?.length || 0}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={() => handleDeleteShift(shift._id)}
                      className="delete-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        display: 'inline-block',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  //Render pending applications
  const renderPendingApplications = () => {
    // Filter shifts that have applied users
    const shiftsWithApplications = allShifts.filter(shift =>
      shift.appliedUsers && shift.appliedUsers.length > 0
    );

    return (
      <div className="applications-section">
        <h1>Pending Applications</h1>

        {loading && <p>Loading applications...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && shiftsWithApplications.length === 0 && (
          <p>No pending applications</p>
        )}

        {!loading && !error && shiftsWithApplications.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            {shiftsWithApplications.map((shift) => (
              <div key={shift._id} style={{
                marginBottom: '30px',
                padding: '20px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>
                  Shift: {shift.date} | {shift.time} | {shift.location} | {shift.task}
                </h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#34495e', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Volunteer Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Username</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Contact</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shift.appliedUsers.map((user, index) => (
                      <tr key={user._id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>
                          {user.name || 'Not set'}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>
                          {user.username}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>
                          {user.email || 'Not set'}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>
                          {user.contact || 'Not set'}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                          <button
                            onClick={() => handleApproveApplication(shift._id, user._id)}
                            style={{
                              padding: '8px 16px',
                              marginRight: '10px',
                              backgroundColor: '#27ae60',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenyApplication(shift._id, user._id)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#e74c3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Deny
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeTab === 'Volunteers' ? 'active' : ''} onClick={() => setActiveTab('Volunteers')}>Volunteers Management</li>
          <li className={activeTab === 'Assigned Shifts' ? 'active' : ''} onClick={() => setActiveTab('Assigned Shifts')}>Assigned Shifts</li>
          <li className={activeTab === 'Pending Applications' ? 'active' : ''} onClick={() => setActiveTab('Pending Applications')}>Pending Applications</li>
          <li className={activeTab === 'Available Shifts' ? 'active' : ''} onClick={() => setActiveTab('Available Shifts')}>Available Shifts</li>
          <li className={activeTab === 'Feedback' ? 'active' : ''} onClick={() => setActiveTab('Feedback')}>Feedback</li>
          <li className={activeTab === 'Statistics' ? 'active' : ''} onClick={() => setActiveTab('Statistics')}>Statistics</li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {renderContent()}  {/* Display content based on active tab */}
      </div>
    </div>
  );
};

export default AdminDashboard;
