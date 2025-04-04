import React, { useState, useEffect, useMemo } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaFire, 
  FaLeaf, 
  FaDownload,
  FaInfoCircle
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "chart.js/auto";
import "../styles/HistoricalAnalysis.css";

const HistoricalAnalysis = () => {
  const { user } = useAuth();
  const [breakdownData, setBreakdownData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonPeriod, setComparisonPeriod] = useState("none");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchBreakdownData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const endDate = new Date();
        let startDate = new Date();
        
        // Calculate date range based on selection
        switch(timeRange) {
          case "week": 
            startDate.setDate(endDate.getDate() - 7); 
            break;
          case "month": 
            startDate.setMonth(endDate.getMonth() - 1); 
            break;
          case "year": 
            startDate.setFullYear(endDate.getFullYear() - 1); 
            break;
          default: 
            startDate.setDate(endDate.getDate() - 7);
        }

        const formatDate = (date) => date.toISOString().split('T')[0];
        const url = `https://carbontraker-server.onrender.com/api/historical/${user.uid}/breakdown?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
        
        const response = await fetch(url, { signal: controller.signal });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        setBreakdownData(Array.isArray(data.breakdown) ? data.breakdown : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error fetching data:", err);
          setError(err.message);
          setBreakdownData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdownData();
    return () => controller.abort();
  }, [user, timeRange]);

  const { flattenedData, dateGroups } = useMemo(() => {
    // Safely process the breakdown data
    const safeData = Array.isArray(breakdownData) 
      ? breakdownData.filter(item => 
          item && 
          (item._id || item.type) && 
          Array.isArray(item.categories))
      : [];

    // Flatten the data for bar/pie charts
    const flattened = safeData.flatMap(entry => {
      return entry.categories
        .filter(cat => cat && cat.name && !isNaN(cat.total))
        .map(cat => ({
          mainCategory: entry._id || entry.type || 'Unknown',
          subCategory: cat.name || 'Unknown',
          total: Number(cat.total) || 0,
          date: cat.date || new Date().toISOString()
        }));
    });

    // Group by date for time series chart
    const groups = {};
    safeData.forEach(entry => {
      entry.categories.forEach(cat => {
        if (cat && cat.name && !isNaN(cat.total)) {
          const date = cat.date || new Date().toISOString();
          groups[date] = groups[date] || {};
          const categoryType = entry._id || entry.type || 'Unknown';
          groups[date][categoryType] = (groups[date][categoryType] || 0) + (Number(cat.total) || 0);
        }
      });
    });

    return { flattenedData: flattened, dateGroups: groups };
  }, [breakdownData]);

  const generateChartData = useMemo(() => {
    const labels = flattenedData.map(entry => 
      `${entry.mainCategory} - ${entry.subCategory}`
    );
    const data = flattenedData.map(entry => entry.total);
    
    const backgroundColors = [
      'rgba(46, 125, 50, 0.7)',
      'rgba(76, 175, 80, 0.7)',
      'rgba(139, 195, 74, 0.7)',
      'rgba(205, 220, 57, 0.7)',
      'rgba(255, 193, 7, 0.7)',
      'rgba(255, 152, 0, 0.7)'
    ];

    return {
      labels,
      datasets: [{
        label: "kg CO₂",
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    };
  }, [flattenedData]);

  const generateTimeSeriesData = useMemo(() => {
    const dates = Object.keys(dateGroups).sort();
    const categories = Array.from(
      new Set(
        flattenedData.map(item => item.mainCategory)
      )
    ).filter(Boolean);

    // Calculate value range for scaling
    const allValues = [];
    dates.forEach(date => {
      categories.forEach(category => {
        allValues.push(dateGroups[date][category] || 0);
      });
    });

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue;

    return {
      dates,
      categories,
      minValue,
      maxValue,
      valueRange,
      chartData: {
        labels: dates.map(date => new Date(date).toLocaleDateString()),
        datasets: categories.map((category, i) => ({
          label: category.charAt(0).toUpperCase() + category.slice(1),
          data: dates.map(date => dateGroups[date][category] || 0),
          backgroundColor: `hsla(${(i * 120) % 360}, 70%, 50%, 0.2)`,
          borderColor: `hsla(${(i * 120) % 360}, 70%, 50%, 1)`,
          borderWidth: valueRange < 0.1 ? 3 : 2,
          tension: 0.1,
          fill: true,
          pointBackgroundColor: `hsla(${(i * 120) % 360}, 70%, 50%, 1)`,
          pointRadius: valueRange < 0.1 ? 6 : 4,
          pointHoverRadius: valueRange < 0.1 ? 8 : 6
        }))
      }
    };
  }, [dateGroups, flattenedData]);

  const getEmissionExtremes = useMemo(() => {
    if (flattenedData.length === 0) return { highest: null, lowest: null };
    
    const highest = flattenedData.reduce((prev, current) => 
      (prev.total > current.total ? prev : current), 
      { total: -Infinity }
    );
    
    const lowest = flattenedData.reduce((prev, current) => 
      (prev.total < current.total ? prev : current), 
      { total: Infinity }
    );
    
    return { highest, lowest };
  }, [flattenedData]);

  const exportToCSV = () => {
    const headers = "Date,Main Category,Subcategory,Emissions (kg CO₂)\n";
    const csvContent = flattenedData
      .map(item => `"${item.date}","${item.mainCategory}","${item.subCategory}",${item.total.toFixed(4)}`)
      .join("\n");
    
    const blob = new Blob([headers + csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carbon-emissions-${timeRange}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  if (!user) {
    return (
      <div className="auth-prompt">
        <p>Please sign in to view historical analysis</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading historical data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading data: {error}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const { highest, lowest } = getEmissionExtremes;
  const { chartData: timeSeriesData, valueRange } = generateTimeSeriesData;

  return (
    <div className="historical-analysis-container">
      <header className="analysis-header">
        <div className="header-main">
          <h1><FaChartLine className="header-icon" /> Historical Analysis</h1>
          
          <div className="header-controls">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="help-btn"
              aria-label="Show help"
            >
              <FaInfoCircle />
            </button>
            <button 
              onClick={exportToCSV} 
              className="export-btn"
              disabled={flattenedData.length === 0}
            >
              <FaDownload /> Export Data
            </button>
          </div>
        </div>
        
        {showHelp && (
          <div className="help-tooltip">
            <p>This dashboard shows your historical carbon emissions data. Use the time range buttons to view different periods, and hover over charts for details.</p>
          </div>
        )}

        <div className="control-group">
          <div className="time-range-selector">
            <button 
              className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Weekly
            </button>
            <button 
              className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Monthly
            </button>
            <button 
              className={`time-range-btn ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              Yearly
            </button>
          </div>

          
        </div>
      </header>

      <section className="chart-section">
        <div className="chart-card">
          <h2><FaChartBar /> Category Breakdown</h2>
          <div className="chart-container">
            <Bar 
              data={generateChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.raw.toFixed(4)} kg CO₂`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'kg CO₂' },
                    ticks: {
                      callback: (value) => value.toFixed(value >= 1 ? 2 : 4)
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h2><FaChartPie /> Emission Distribution</h2>
          <div className="chart-container">
            <Pie 
              data={generateChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'right',
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      font: {
                        size: 12
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((context.raw / total) * 100);
                        return `${context.label}: ${context.raw.toFixed(4)} kg (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </section>

      <section className="trend-section">
        <div className="chart-card full-width">
          <h2><FaChartLine /> Emission Trends</h2>
          <div className="chart-container">
            <Line 
              data={timeSeriesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: (context) => {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(4)} kg CO₂`;
                      }
                    }
                  },
                  legend: {
                    position: 'top',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      font: {
                        size: 12
                      }
                    }
                  }
                },
                scales: {
                  y: { 
                    beginAtZero: valueRange < 0.1,
                    min: valueRange < 0.1 ? 0 : undefined,
                    title: { 
                      display: true, 
                      text: 'kg CO₂' 
                    },
                    ticks: {
                      callback: (value) => {
                        if (valueRange >= 100) return Math.round(value);
                        if (valueRange >= 1) return value.toFixed(1);
                        if (valueRange >= 0.1) return value.toFixed(2);
                        return value.toFixed(4);
                      }
                    }
                  },
                  x: { 
                    grid: { display: false },
                    ticks: {
                      autoSkip: true,
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'x',
                  intersect: false
                }
              }}
            />
          </div>
          {valueRange < 0.1 && (
            <p className="scale-note">
              <FaInfoCircle /> Note: Showing enhanced detail for small values (range: {valueRange.toFixed(4)} kg)
            </p>
          )}
        </div>
      </section>

      <section className="insights-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card highlight-red">
            <FaFire className="insight-icon" />
            <h3>Highest Emission</h3>
            {highest ? (
              <>
                <p className="insight-value">{highest.total.toFixed(4)} kg CO₂</p>
                <p className="insight-category">
                  {highest.mainCategory} - {highest.subCategory}
                </p>
                <p className="insight-date">
                  {new Date(highest.date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </div>

          <div className="insight-card highlight-green">
            <FaLeaf className="insight-icon" />
            <h3>Lowest Emission</h3>
            {lowest ? (
              <>
                <p className="insight-value">{lowest.total.toFixed(4)} kg CO₂</p>
                <p className="insight-category">
                  {lowest.mainCategory} - {lowest.subCategory}
                </p>
                <p className="insight-date">
                  {new Date(lowest.date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </section>

      {flattenedData.length === 0 && (
        <div className="empty-state">
          <p>No emission data found for the selected period</p>
        </div>
      )}
    </div>
  );
};

export default HistoricalAnalysis;