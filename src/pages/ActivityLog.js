import React, { useState, useEffect, useMemo } from "react";
import {
  FaTrash,
  FaFilter,
  FaCalendarAlt,
  FaSearch,
  FaEdit,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/ActivityLog.css";

const ActivityLog = () => {
  const { user } = useAuth();
  const [allActivities, setAllActivities] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    value: "",
    unit: "",
  });

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://carbontraker-server.onrender.com/api/activities/${user.uid}/activities`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    return allActivities.filter((activity) => {
      // Date filtering
      const activityDate = new Date(activity.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const dateMatch =
        (!start || activityDate >= start) && (!end || activityDate <= end);

      // Type filtering
      const typeMatch = !filterType || activity.type === filterType;

      // Search term filtering
      const searchMatch =
        !searchTerm ||
        activity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase());

      return dateMatch && typeMatch && searchMatch;
    });
  }, [allActivities, filterType, startDate, endDate, searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }
  
    try {
      const response = await fetch(
        `https://carbontraker-server.onrender.com/api/activities/${id}`,
        {
          method: "DELETE",
          // Removed Authorization header
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      fetchActivities(); // Refresh the activity list
    } catch (error) {
      console.error("Error deleting activity:", error);
      // Optionally show error to user:
      // setError("Failed to delete activity. Please try again.");
    }
  };

  const handleEdit = (activity) => {
    setEditingId(activity._id);
    setEditForm({
      value: activity.value,
      unit: activity.unit,
    });
  };

  const handleEditSubmit = async (id) => {
    try {
      const response = await fetch(
        `https://carbontraker-server.onrender.com/api/activities/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Removed Authorization header
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEditingId(null);
      fetchActivities();
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "travel":
        return "#4CAF50";
      case "diet":
        return "#FF9800";
      case "energy":
        return "#2196F3";
      default:
        return "#9E9E9E";
    }
  };

  if (!user) {
    return (
      <div className="auth-prompt">
        <p>Please sign in to view your activity log</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      <header className="log-header">
        <h1>
          <FaCalendarAlt className="header-icon" /> Activity Log
        </h1>
        <p>View and manage your logged activities and their carbon impact</p>
      </header>
      <div
        className="filter-controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="filter-group"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <FaFilter
            className="filter-icon"
            style={{
              color: "#6c757d",
              fontSize: "1.1rem",
            }}
          />
          <label
            style={{
              fontWeight: "500",
              color: "#495057",
              fontSize: "0.9rem",
            }}
          >
            Filter by Type:
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              width:"130px",
              borderRadius: "8px",
              border: "1px solid #ced4da",
              backgroundColor: "white",
              color: "#495057",
              fontSize: "0.9rem",
              cursor: "pointer",
              outline: "none",
              transition: "all 0.2s",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              appearance: "none",
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236c757d%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.7rem top 50%",
              backgroundSize: "0.65rem auto",
            }}
          >
            <option value="">All Activities</option>
            <option value="travel">Travel</option>
            <option value="diet">Diet</option>
            <option value="energy">Energy</option>
          </select>
        </div>

        <div
          className="filter-group"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <label
            style={{
              fontWeight: "500",
              color: "#495057",
              fontSize: "0.9rem",
            }}
          >
            Date Range:
          </label>
          <div className="date-div"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ced4da",
                backgroundColor: "white",
                color: "#495057",
                fontSize: "0.9rem",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                appearance: "none",
                minWidth: "150px",
              }}
            />
            <span
              style={{
                color: "#6c757d",
                fontSize: "0.9rem",
              }}
            >
              to
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ced4da",
                backgroundColor: "white",
                color: "#495057",
                fontSize: "0.9rem",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                appearance: "none",
                minWidth: "150px",
              }}
            />
          </div>
        </div>

        <div
          className="search-group"
          style={{
            paddingRight:"0.6rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexGrow: "1",
            borderRadius: "8px",
            border: "1px solid #ced4da",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            backgroundColor: "white",
            minWidth: "250px",
          }}
        >
        
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              color: "#495057",
              border:"none",
              fontSize: "0.9rem",
              outline: "none",
              transition: "all 0.2s",
              flexGrow: "1",
              minWidth: "100px",
            }}
          />
            <FaSearch
            className="search-icon"
            style={{
              color: "#6c757d",
              fontSize: "1.1rem",
            }}
          />
        </div>
      </div>

      <div className="log-table-container">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Emissions (kg CO₂)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <tr key={activity._id}>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>
                    <span
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(activity.type) }}
                    >
                      {activity.type}
                    </span>
                  </td>
                  <td>{activity.category}</td>
                  <td>
                    {editingId === activity._id ? (
                      <input
                        type="number"
                        value={editForm.value}
                        onChange={(e) =>
                          setEditForm({ ...editForm, value: e.target.value })
                        }
                        className="edit-input"
                        min="0"
                        step="any"
                      />
                    ) : (
                      activity.value
                    )}
                  </td>
                  <td>
                    {editingId === activity._id ? (
                      <select
                        value={editForm.unit}
                        onChange={(e) =>
                          setEditForm({ ...editForm, unit: e.target.value })
                        }
                        className="edit-input"
                      >
                        {activity.type === "travel" && (
                          <>
                            <option value="km">km</option>
                            <option value="miles">miles</option>
                          </>
                        )}
                        {activity.type === "diet" && (
                          <>
                            <option value="servings">servings</option>
                            <option value="grams">grams</option>
                            <option value="kg">kg</option>
                          </>
                        )}
                        {activity.type === "energy" && (
                          <>
                            <option value="kWh">kWh</option>
                            <option value="therms">therms</option>
                            <option value="gj">gj</option>
                          </>
                        )}
                      </select>
                    ) : (
                      activity.unit
                    )}
                  </td>
                  <td>{activity.carbonEmission?.toFixed(2) || "0.00"}</td>
                  <td className="actions-cell">
                    {editingId === activity._id ? (
                      <>
                        <button
                          onClick={() => handleEditSubmit(activity._id)}
                          className="btn-save"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-cancel"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(activity)}
                          className="btn-edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(activity._id)}
                          className="btn-delete"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  No activities found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary-card">
        <h3>Total Emissions</h3>
        <p className="total-emission">
          {filteredActivities
            .reduce((sum, activity) => sum + (activity.carbonEmission || 0), 0)
            .toFixed(2)}{" "}
          kg CO₂
        </p>
        <div className="breakdown">
          {["travel", "diet", "energy"].map((type) => {
            const total = filteredActivities
              .filter((a) => a.type === type)
              .reduce(
                (sum, activity) => sum + (activity.carbonEmission || 0),
                0
              );

            return total > 0 ? (
              <div key={type} className="breakdown-item">
                <span
                  className="type-dot"
                  style={{ backgroundColor: getTypeColor(type) }}
                ></span>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}: </span>
                <span>{total.toFixed(2)} kg</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
