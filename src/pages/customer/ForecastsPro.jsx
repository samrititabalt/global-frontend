import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, TrendingUp, BarChart3, FileSpreadsheet, X, ArrowRight, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../utils/axios';

const ForecastsPro = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [gridData, setGridData] = useState(() => {
    const rows = 1000;
    const cols = 20;
    return Array(rows).fill(null).map(() => Array(cols).fill(''));
  });
  const [processedData, setProcessedData] = useState([]);
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [selectedCells, setSelectedCells] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedDimension, setSelectedDimension] = useState('');
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [forecastData, setForecastData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [gptCommentary, setGptCommentary] = useState('');
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [isLoadingGPT, setIsLoadingGPT] = useState(false);
  const reportRef = useRef(null);

  // Process grid data to extract columns
  useEffect(() => {
    const processed = processGridData();
    setProcessedData(processed);
    
    if (processed.length > 0) {
      const headers = Object.keys(processed[0]);
      setAvailableColumns(headers);
    }
  }, [gridData]);

  const processGridData = () => {
    let firstDataRow = -1;
    for (let i = 0; i < gridData.length; i++) {
      if (gridData[i].some(cell => cell.trim() !== '')) {
        firstDataRow = i;
        break;
      }
    }
    if (firstDataRow === -1) return [];

    const headers = [];
    const headerRow = gridData[firstDataRow];
    for (let i = 0; i < headerRow.length; i++) {
      const header = (headerRow[i] || '').trim();
      if (header !== '') {
        headers.push({ name: header, index: i });
      }
    }
    if (headers.length === 0) return [];

    const dataRows = [];
    for (let i = firstDataRow + 1; i < gridData.length; i++) {
      const row = gridData[i];
      if (row.some(cell => cell.trim() !== '')) {
        const dataObj = {};
        headers.forEach(({ name, index }) => {
          const cellValue = (row[index] || '').trim();
          dataObj[name] = cellValue;
        });
        dataRows.push(dataObj);
      }
    }
    return dataRows;
  };

  // Handle cell changes
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = gridData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const newRow = [...row];
        newRow[colIndex] = value;
        return newRow;
      }
      return row;
    });
    setGridData(newData);
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const lines = paste.split('\n');
    const activeRow = activeCell.row;
    const activeCol = activeCell.col;

    lines.forEach((line, lineIdx) => {
      const cells = line.split('\t');
      cells.forEach((cell, cellIdx) => {
        const row = activeRow + lineIdx;
        const col = activeCol + cellIdx;
        if (row < 1000 && col < 20) {
          handleCellChange(row, col, cell);
        }
      });
    });
  };

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' && e.target.classList.contains('grid-cell')) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !e.target.value) {
          e.preventDefault();
          const { row, col } = activeCell;
          let newRow = row;
          let newCol = col;

          if (e.key === 'ArrowUp' && row > 0) newRow = row - 1;
          if (e.key === 'ArrowDown' && row < 999) newRow = row + 1;
          if (e.key === 'ArrowLeft' && col > 0) newCol = col - 1;
          if (e.key === 'ArrowRight' && col < 19) newCol = col + 1;

          if (newRow !== row || newCol !== col) {
            setActiveCell({ row: newRow, col: newCol });
            setTimeout(() => {
              const cell = document.getElementById(`cell-${newRow}-${newCol}`);
              if (cell) cell.focus();
            }, 10);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell]);

  // Forecast function using moving average
  const generateForecast = () => {
    if (!selectedDimension || !selectedMeasure || processedData.length === 0) {
      alert('Please select both a dimension (e.g., Month) and a measure (e.g., Sales)');
      return;
    }

    setIsLoadingForecast(true);
    
    try {
      // Extract and sort data
      const data = processedData
        .map(row => ({
          dimension: String(row[selectedDimension] || ''),
          measure: parseFloat(row[selectedMeasure]) || 0,
        }))
        .filter(d => d.dimension && !isNaN(d.measure))
        .sort((a, b) => a.dimension.localeCompare(b.dimension));

      if (data.length === 0) {
        alert('No valid data found. Please check your selections.');
        setIsLoadingForecast(false);
        return;
      }

      // Simple moving average forecast (forecast next 3 periods)
      const values = data.map(d => d.measure);
      const windowSize = Math.min(3, Math.floor(values.length / 2));
      const lastWindow = values.slice(-windowSize);
      const avg = lastWindow.reduce((a, b) => a + b, 0) / lastWindow.length;
      
      // Calculate trend
      const trend = values.length > 1 
        ? (values[values.length - 1] - values[0]) / values.length 
        : 0;

      // Generate forecast (next 3 periods)
      const lastDimension = data[data.length - 1].dimension;
      const forecastPeriods = [];
      
      for (let i = 1; i <= 3; i++) {
        const forecastValue = avg + (trend * i);
        forecastPeriods.push({
          dimension: `${lastDimension} +${i}`,
          measure: forecastValue,
          isForecast: true,
        });
      }

      // Combine actual and forecast data
      const combined = [
        ...data.map(d => ({ ...d, isForecast: false })),
        ...forecastPeriods,
      ];

      setCombinedData(combined);
      setForecastData(forecastPeriods);
      
      // Automatically generate GPT commentary
      generateGPTCommentary(combined, data, forecastPeriods);
      
    } catch (error) {
      console.error('Forecast error:', error);
      alert('Error generating forecast. Please try again.');
    } finally {
      setIsLoadingForecast(false);
    }
  };

  // Generate GPT commentary
  const generateGPTCommentary = async (combined, actualData, forecastData) => {
    setIsLoadingGPT(true);
    
    try {
      const response = await api.post('/public/chatbot-message', {
        message: `Please provide a professional forecasting analysis for this data:
        
Dimension: ${selectedDimension}
Measure: ${selectedMeasure}

Actual Data (last 5 values):
${actualData.slice(-5).map(d => `${d.dimension}: ${d.measure.toFixed(2)}`).join('\n')}

Forecasted Values:
${forecastData.map(d => `${d.dimension}: ${d.measure.toFixed(2)}`).join('\n')}

Please provide:
1. A brief summary of the trend
2. Key insights from the forecast
3. Recommendations
Format with clear sections and use professional business language.`,
        chatHistory: [],
      });

      if (response.data.success) {
        setGptCommentary(response.data.message);
      } else {
        setGptCommentary('Forecast analysis completed. Review the charts and forecasted values above.');
      }
    } catch (error) {
      console.error('GPT commentary error:', error);
      setGptCommentary('Forecast analysis completed. Review the charts and forecasted values above.');
    } finally {
      setIsLoadingGPT(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('forecast-analysis.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  // Detect column type
  const isNumericColumn = (columnName) => {
    if (!columnName || processedData.length === 0) return false;
    const sampleSize = Math.min(10, processedData.length);
    const numericCount = processedData.slice(0, sampleSize).filter(row => {
      const val = parseFloat(row[columnName]);
      return !isNaN(val) && isFinite(val);
    }).length;
    return numericCount / sampleSize > 0.7;
  };

  const hasProAccess = user?.role === 'customer' || (user?.role === 'agent' && user?.pro_access_enabled);

  if (!isAuthenticated || !hasProAccess) {
    return (
      <ProtectedRoute role="customer">
        <div>Loading...</div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Forecast Pro</h1>
            <p className="text-xl text-purple-100">Predict future trends and make data-driven decisions</p>
          </div>

          {/* Data Input Table */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              Data Input
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste your data below. The first row should contain column headers.
            </p>
            
            <div className="overflow-auto border border-gray-300 rounded-lg max-h-96">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="border border-gray-300 p-2 text-xs font-semibold text-gray-600 bg-gray-100 w-12"></th>
                    {Array.from({ length: 20 }, (_, i) => {
                      const colLabel = String.fromCharCode(65 + i);
                      return (
                        <th key={i} className="border border-gray-300 p-2 text-xs font-semibold text-gray-600 bg-gray-100 min-w-24">
                          {colLabel}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {gridData.slice(0, 50).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border border-gray-300 p-1 text-xs text-gray-500 bg-gray-50 text-center font-semibold">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 p-0">
                          <input
                            id={`cell-${rowIndex}-${colIndex}`}
                            type="text"
                            className="grid-cell w-full h-8 px-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 bg-transparent"
                            value={cell}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
                            onPaste={handlePaste}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column Selection */}
          {availableColumns.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Columns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimension (e.g., Month, Product, Region)
                  </label>
                  <select
                    value={selectedDimension}
                    onChange={(e) => setSelectedDimension(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select dimension...</option>
                    {availableColumns.filter(col => !isNumericColumn(col)).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Measure (e.g., Sales, Revenue)
                  </label>
                  <select
                    value={selectedMeasure}
                    onChange={(e) => setSelectedMeasure(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select measure...</option>
                    {availableColumns.filter(col => isNumericColumn(col)).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Forecast Button */}
          {selectedDimension && selectedMeasure && (
            <div className="mb-8">
              <button
                onClick={generateForecast}
                disabled={isLoadingForecast}
                className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingForecast ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Generating Forecast...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Forecast Data
                  </>
                )}
              </button>
            </div>
          )}

          {/* Forecast Results */}
          {combinedData.length > 0 && (
            <div ref={reportRef} className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Forecast Results
              </h3>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Trend Analysis</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={combinedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dimension" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="measure" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        name="Value"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Actual vs Forecast</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={combinedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dimension" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="measure" name="Value">
                        {combinedData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.isForecast ? '#F59E0B' : '#8B5CF6'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2 justify-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-600 rounded"></div>
                      <span>Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>Forecast</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecast Table */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Forecast Table</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">{selectedDimension}</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">{selectedMeasure}</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedData.map((row, idx) => (
                        <tr key={idx} className={row.isForecast ? 'bg-orange-50' : ''}>
                          <td className="border border-gray-300 px-4 py-2">{row.dimension}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.measure.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {row.isForecast ? (
                              <span className="text-orange-600 font-semibold">Forecast</span>
                            ) : (
                              <span className="text-gray-600">Actual</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GPT Commentary */}
              {isLoadingGPT ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-blue-800">Generating analysis...</span>
                  </div>
                </div>
              ) : gptCommentary ? (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Forecast Analysis
                  </h4>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {gptCommentary}
                  </div>
                </div>
              ) : null}

              {/* Download Button */}
              <div className="mt-6">
                <button
                  onClick={exportToPDF}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForecastsPro;
