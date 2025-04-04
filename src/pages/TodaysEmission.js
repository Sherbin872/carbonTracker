import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { FaCar, FaUtensils, FaBolt, FaLeaf, FaPlus, FaChartPie, FaChartBar } from "react-icons/fa";
import { GiEarthAmerica } from "react-icons/gi";
import "chart.js/auto";
import "../styles/TodaysEmission.css";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";

// Configure Modal for accessibility
Modal.setAppElement('#root');

const TodaysEmission = () => {
  const { user } = useAuth();
  const [totalEmission, setTotalEmission] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activityType, setActivityType] = useState("travel");
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("km");
  const [error, setError] = useState(null);

  const categoryOptions = {
    travel: ["Car (Petrol)", "Car (Diesel)", "Bus", "Train", "Bike", "Walking"],
    diet: ["Beef", "Chicken", "Fish", "Pork", "Dairy", "Vegetables", "Fruits", "Grains"],
    energy: ["Electricity (Grid)", "Electricity (Solar)", "Natural Gas", "Heating Oil", "Propane"]
  };

  const unitOptions = {
    travel: ["km", "miles"],
    diet: ["servings", "grams", "kg"],
    energy: ["kWh", "therms", "gj"]
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const userId = user.uid;
      const today = new Date().toISOString().split("T")[0];
      
      const [totalRes, breakdownRes, suggestionsRes] = await Promise.all([
        fetch(`https://carbontraker-server.onrender.com/api/today/${userId}/total?startDate=${today}&endDate=${today}`),
        fetch(`https://carbontraker-server.onrender.com/api/today/${userId}/breakdown`),
        fetch(`https://carbontraker-server.onrender.com/api/today/${userId}/suggestions`)
      ]);
  
      if (!totalRes.ok) throw new Error("Failed to fetch total emissions");
      if (!breakdownRes.ok) throw new Error("Failed to fetch breakdown data");
      if (!suggestionsRes.ok) throw new Error("Failed to fetch suggestions");
  
      const [totalData, breakdownData, suggestionsData] = await Promise.all([
        totalRes.json(),
        breakdownRes.json(),
        suggestionsRes.json()
      ]);
  
      setTotalEmission(totalData.totalEmission || 0);
      setBreakdown(Array.isArray(breakdownData.breakdown) ? breakdownData.breakdown : []);
      setSuggestions(suggestionsData.suggestions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchData();
    return () => abortController.abort();
  }, [fetchData]);

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!category || !value) {
      setError("Please fill all fields");
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      setError("Please enter a valid number");
      return;
    }

    if (numericValue <= 0) {
      setError("Value must be greater than 0");
      return;
    }

    const data = {
      type: activityType,
      category,
      value: numericValue,
      unit,
      date: new Date().toISOString()
    };

    try {
      setLoading(true);
      const response = await fetch(`https://carbontraker-server.onrender.com/api/today/${user.uid}/add-activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add activity");
      }

      // Reset form and refresh data
      setModalOpen(false);
      setCategory("");
      setValue("");
      setError(null);
      await fetchData();
    } catch (error) {
      console.error("Error submitting activity:", error);
      setError(error.message || "Failed to add activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset unit when activity type changes
    setUnit(unitOptions[activityType][0]);
    setCategory("");
  }, [activityType]);

  const categoryIcons = {
    travel: <FaCar className="category-icon" />,
    diet: <FaUtensils className="category-icon" />,
    energy: <FaBolt className="category-icon" />
  };

  // Memoize chart data calculations
  const { chartLabels, chartData } = useMemo(() => {
    const labels = breakdown.map(item => 
      item._id.charAt(0).toUpperCase() + item._id.slice(1)
    );
    const data = breakdown.map(item =>
      item.categories.reduce((acc, curr) => acc + curr.total, 0)
    );
    return { chartLabels: labels, chartData: data };
  }, [breakdown]);

  const chartColors = [
    "#2E7D32", "#388E3C", "#43A047", "#4CAF50", "#66BB6A", "#81C784"
  ];

  if (!user) {
    return (
      <div className="auth-prompt">
        <GiEarthAmerica className="earth-icon" />
        <h2>Welcome to Carbon Tracker</h2>
        <p>Please sign in to view your emissions dashboard</p>
      </div>
    );
  }

  if (loading && !modalOpen) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Calculating your carbon footprint...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>
            <FaLeaf className="header-icon" /> Carbon Footprint Dashboard
          </h1>
          <p>Track and reduce your environmental impact</p>
        </div>
        <button 
          className="add-activity-btn" 
          onClick={() => setModalOpen(true)}
          aria-label="Add new activity"
        >
          <FaPlus /> Log Activity
        </button>
      </header>

      {/* Error Display */}
      {error && !modalOpen && (
        <div className="global-error">
          {error}
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        {/* Summary Card */}
        <section className="summary-card" aria-labelledby="summary-heading">
          <div className="summary-header">
            <h2 id="summary-heading">Today's Carbon Footprint</h2>
            <span className="date-display">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="total-emission">
            <div className="emission-value">
              {totalEmission.toFixed(2)} <span>kg CO₂</span>
            </div>
            <div className="emission-comparison">
              Equivalent to {Math.round(totalEmission * 2.5)} miles driven in an average car
            </div>
          </div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${Math.min(totalEmission / 20 * 100, 100)}%` }}
              aria-valuenow={Math.min(totalEmission / 20 * 100, 100)}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <div className="progress-labels">
              <span>0 kg</span>
              <span>Daily Goal: 20 kg</span>
            </div>
          </div>
        </section>

        {/* Breakdown Section */}
        <section className="breakdown-section" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading"><FaChartPie /> Emission Breakdown</h2>
          <div className="breakdown-cards">
            {breakdown.length > 0 ? (
              breakdown.map((item) => {
                const categoryTotal = item.categories.reduce(
                  (acc, curr) => acc + curr.total, 0
                );
                const percentage = totalEmission > 0 
                  ? (categoryTotal / totalEmission * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={item._id} className="breakdown-card">
                    <div className="card-header">
                      {categoryIcons[item._id]}
                      <h3>{item._id.charAt(0).toUpperCase() + item._id.slice(1)}</h3>
                    </div>
                    <div className="card-content">
                      <div className="emission-value">{categoryTotal.toFixed(2)} kg</div>
                      <div className="percentage">{percentage}%</div>
                    </div>
                    <div className="card-footer">
                      {item.categories.slice(0, 3).map((cat, idx) => (
                        <span key={idx} className="category-tag">
                          {cat.name}: {cat.total.toFixed(1)}kg
                        </span>
                      ))}
                      {item.categories.length > 3 && (
                        <span className="more-tag">+{item.categories.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No emission data recorded today</p>
                <button 
                  className="add-first-activity"
                  onClick={() => setModalOpen(true)}
                >
                  <FaPlus /> Add your first activity
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section" aria-labelledby="charts-heading">
          <h2 id="charts-heading"><FaChartBar /> Visualization</h2>
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Emission Distribution</h3>
              {chartData.length > 0 ? (
                <div className="chart-container">
                  <Pie
                    data={{
                      labels: chartLabels,
                      datasets: [{
                        data: chartData,
                        backgroundColor: chartColors,
                        borderWidth: 0
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 20,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value}kg (${percentage}%)`;
                            }
                          }
                        }
                      },
                      cutout: "65%"
                    }}
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <p>No data available for visualization</p>
                </div>
              )}
            </div>

            <div className="chart-card">
              <h3>Emissions Comparison</h3>
              {chartData.length > 0 ? (
                <div className="chart-container">
                  <Bar
                    data={{
                      labels: chartLabels,
                      datasets: [{
                        label: "kg CO₂",
                        data: chartData,
                        backgroundColor: "#4CAF50",
                        borderRadius: 8,
                        borderWidth: 0
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "rgba(0, 0, 0, 0.05)"
                          },
                          title: {
                            display: true,
                            text: 'kg CO₂'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.raw} kg CO₂`
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <p>No data available for visualization</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Suggestions Section */}
        <section className="suggestions-section" aria-labelledby="suggestions-heading">
          <h2 id="suggestions-heading">Sustainability Tips</h2>
          {suggestions.length > 0 ? (
            <div className="tips-grid">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="tip-card">
                  <div className="tip-number">{index + 1}</div>
                  <p>{suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-tips">
              <p>Complete more activities to get personalized suggestions</p>
            </div>
          )}
        </section>
      </main>

      {/* Activity Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          setError(null);
        }}
        contentLabel="Add Activity"
        className="activity-modal"
        overlayClassName="modal-overlay"
        shouldCloseOnOverlayClick={!loading}
      >
        <div className="modal-container">
          <div className="modal-header">
            <h2>Log New Activity</h2>
            <button 
              className="close-btn" 
              onClick={() => {
                setModalOpen(false);
                setError(null);
              }}
              disabled={loading}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleActivitySubmit} className="activity-form">
            {error && <div className="form-error">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="activityType">Activity Type</label>
              <div className="type-selector">
                {["travel", "diet", "energy"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`type-option ${activityType === type ? "active" : ""}`}
                    onClick={() => setActivityType(type)}
                    disabled={loading}
                  >
                    {type === "travel" && <FaCar />}
                    {type === "diet" && <FaUtensils />}
                    {type === "energy" && <FaBolt />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select {activityType} category</option>
                {categoryOptions[activityType]?.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="value">Amount</label>
                <input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={loading}
                >
                  {unitOptions[activityType]?.map((unitOpt, index) => (
                    <option key={index} value={unitOpt}>
                      {unitOpt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={!category || !value || loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  "Log Activity"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default TodaysEmission;