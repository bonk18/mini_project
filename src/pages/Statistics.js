import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import './statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/statistics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stats) return;

    let volunteersChart, hoursChart, participationChart, topVolunteersChart;

    const initVolunteersByCategoryChart = () => {
      const ctx1 = document.getElementById('volunteersByCategory')?.getContext('2d');
      if (!ctx1) return;

      if (volunteersChart) {
        volunteersChart.destroy();
      }

      const tasks = Object.keys(stats.volunteersByTask);
      const values = Object.values(stats.volunteersByTask);

      if (tasks.length === 0) {
        return; // No data to display
      }

      volunteersChart = new Chart(ctx1, {
        type: 'pie',
        data: {
          labels: tasks,
          datasets: [{
            label: 'Volunteers',
            data: values,
            backgroundColor: [
              '#ff6347', '#4682b4', '#32cd32', '#ffa500',
              '#2e8b57', '#da70d6', '#8b0000', '#ff69b4',
              '#20b2aa', '#daa520'
            ],
          }]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: '#ffffff'
              }
            }
          }
        }
      });
    };

    const initHoursByCategoryChart = () => {
      const ctx2 = document.getElementById('hoursByCategory')?.getContext('2d');
      if (!ctx2) return;

      if (hoursChart) {
        hoursChart.destroy();
      }

      const tasks = Object.keys(stats.hoursByTask);
      const values = Object.values(stats.hoursByTask);

      if (tasks.length === 0) {
        return;
      }

      hoursChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: tasks,
          datasets: [{
            label: 'Hours',
            data: values,
            backgroundColor: [
              '#ff6347', '#4682b4', '#32cd32', '#ffa500',
              '#2e8b57', '#da70d6', '#8b0000', '#ff69b4',
              '#20b2aa', '#daa520'
            ],
          }]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: '#ffffff'
              }
            }
          }
        }
      });
    };

    const initParticipationByCategoryChart = () => {
      const ctx3 = document.getElementById('participationByCategory')?.getContext('2d');
      if (!ctx3) return;

      if (participationChart) {
        participationChart.destroy();
      }

      const tasks = Object.keys(stats.shiftsByTask);
      const values = Object.values(stats.shiftsByTask);

      if (tasks.length === 0) {
        return;
      }

      participationChart = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: tasks,
          datasets: [{
            label: 'Number of Shifts',
            data: values,
            backgroundColor: [
              '#ff6347', '#4682b4', '#32cd32', '#ffa500',
              '#2e8b57', '#da70d6', '#8b0000', '#ff69b4',
              '#20b2aa', '#daa520'
            ],
          }]
        },
        options: {
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                color: '#ffffff'
              }
            },
            y: {
              ticks: {
                color: '#ffffff'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#ffffff'
              }
            }
          }
        }
      });
    };

    const initTopVolunteersChart = () => {
      const ctx4 = document.getElementById('topVolunteersChart')?.getContext('2d');
      if (!ctx4) return;

      if (topVolunteersChart) {
        topVolunteersChart.destroy();
      }

      if (stats.topVolunteers.length === 0) {
        return;
      }

      topVolunteersChart = new Chart(ctx4, {
        type: 'bar',
        data: {
          labels: stats.topVolunteers.map(v => v.name),
          datasets: [{
            label: 'Hours Worked',
            data: stats.topVolunteers.map(v => v.hoursWorked),
            backgroundColor: '#c4b47c',
            borderColor: '#b1a46f',
            borderWidth: 1,
          }]
        },
        options: {
          scales: {
            x: {
              ticks: {
                color: '#ffffff'
              }
            },
            y: {
              ticks: {
                color: '#ffffff'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#ffffff'
              }
            }
          }
        }
      });
    };

    // Initialize the charts
    initVolunteersByCategoryChart();
    initHoursByCategoryChart();
    initParticipationByCategoryChart();
    initTopVolunteersChart();

    // Clean up on component unmount
    return () => {
      if (volunteersChart) volunteersChart.destroy();
      if (hoursChart) hoursChart.destroy();
      if (participationChart) participationChart.destroy();
      if (topVolunteersChart) topVolunteersChart.destroy();
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="statistics-container">
        <p style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>
          Loading statistics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-container">
        <p style={{ color: 'red', textAlign: 'center', padding: '50px' }}>
          Error loading statistics: {error}
        </p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="statistics-container">
      {/* First Row with Statistics Boxes */}
      <div className="statistics-boxes">
        <div className="stat-box">Volunteers: {stats.totalVolunteers}</div>
        <div className="stat-box">Shifts Completed: {stats.completedShifts}</div>
        <div className="stat-box">Shifts Left: {stats.shiftsLeft}</div>
        <div className="stat-box">Average Volunteering Hours: {stats.averageHours} hrs</div>
        <div className="stat-box">Average Shift Rating: {stats.averageRating} ★</div>
      </div>

      {/* Second Row with Charts */}
      <div className="statistics-charts">
        <div className="chart-box">
          <h3>Volunteers by Category</h3>
          {Object.keys(stats.volunteersByTask).length > 0 ? (
            <canvas id="volunteersByCategory"></canvas>
          ) : (
            <p style={{ color: '#fff', textAlign: 'center' }}>No data available</p>
          )}
        </div>
        <div className="chart-box">
          <h3>Hours by Category</h3>
          {Object.keys(stats.hoursByTask).length > 0 ? (
            <canvas id="hoursByCategory"></canvas>
          ) : (
            <p style={{ color: '#fff', textAlign: 'center' }}>No data available</p>
          )}
        </div>
        <div className="chart-box">
          <h3>Shifts by Category</h3>
          {Object.keys(stats.shiftsByTask).length > 0 ? (
            <canvas id="participationByCategory"></canvas>
          ) : (
            <p style={{ color: '#fff', textAlign: 'center' }}>No data available</p>
          )}
        </div>
      </div>

      {/* Third Row with Chart */}
      <div className="third-row">
        <div className="chart-card">
          <h3>Hours Worked by Top {stats.topVolunteers.length} Volunteers</h3>
          {stats.topVolunteers.length > 0 ? (
            <canvas id="topVolunteersChart"></canvas>
          ) : (
            <p style={{ color: '#fff', textAlign: 'center' }}>No volunteer data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
