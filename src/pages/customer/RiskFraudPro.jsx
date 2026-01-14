import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Shield, AlertTriangle, FileSpreadsheet, X, RefreshCw, Send } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import api from '../../utils/axios';

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

const RiskFraudPro = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [gridData, setGridData] = useState(() => {
    const rows = 1000;
    const cols = 20;
    return Array(rows).fill(null).map(() => Array(cols).fill(''));
  });
  const [processedData, setProcessedData] = useState([]);
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [selectedMeasures, setSelectedMeasures] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState('');
  const [riskScores, setRiskScores] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [refinedAnalysis, setRefinedAnalysis] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingRefinement, setIsLoadingRefinement] = useState(false);
  const reportRef = useRef(null);

  // Process grid data
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

  const isNumericColumn = (columnName) => {
    if (!columnName || processedData.length === 0) return false;
    const sampleSize = Math.min(10, processedData.length);
    const numericCount = processedData.slice(0, sampleSize).filter(row => {
      const val = parseFloat(row[columnName]);
      return !isNaN(val) && isFinite(val);
    }).length;
    return numericCount / sampleSize > 0.7;
  };

  const toggleDimension = (col) => {
    setSelectedDimensions(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const toggleMeasure = (col) => {
    setSelectedMeasures(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  // Generate risk analysis
  const generateRiskAnalysis = async () => {
    if ((selectedDimensions.length === 0 && selectedMeasures.length === 0) || processedData.length === 0) {
      alert('Please select at least one dimension or measure');
      return;
    }

    setIsLoadingAnalysis(true);
    
    try {
      // Prepare data sample for GPT
      const sampleData = processedData.slice(0, 10).map(row => {
        const sample = {};
        [...selectedDimensions, ...selectedMeasures].forEach(col => {
          sample[col] = row[col];
        });
        return sample;
      });

      // Generate risk scores (simple calculation based on variance)
      const scores = selectedMeasures.map(measure => {
        const values = processedData
          .map(row => parseFloat(row[measure]) || 0)
          .filter(v => !isNaN(v));
        
        if (values.length === 0) return { measure, score: 0, risk: 'Low' };
        
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = avg !== 0 ? stdDev / Math.abs(avg) : 0;
        
        let risk = 'Low';
        if (coefficientOfVariation > 0.5) risk = 'High';
        else if (coefficientOfVariation > 0.2) risk = 'Medium';

        return {
          measure,
          score: Math.min(100, coefficientOfVariation * 100),
          risk,
          avg: avg.toFixed(2),
          stdDev: stdDev.toFixed(2),
        };
      });

      setRiskScores(scores);

      // Generate GPT analysis
      const response = await api.post('/public/chatbot-message', {
        message: `Please provide a comprehensive risk and fraud analysis for this dataset:

Selected Dimensions: ${selectedDimensions.join(', ') || 'None'}
Selected Measures: ${selectedMeasures.join(', ')}

Sample Data (first 10 rows):
${JSON.stringify(sampleData, null, 2)}

Risk Scores:
${scores.map(s => `${s.measure}: ${s.risk} risk (${s.score.toFixed(1)}%)`).join('\n')}

Please provide:
1. Overall risk assessment
2. Key risk indicators
3. Potential fraud patterns or anomalies
4. Recommendations for risk mitigation
5. Areas requiring immediate attention

Format with clear sections, use professional language, and focus specifically on risk and fraud detection.`,
        chatHistory: [],
      });

      if (response.data.success) {
        setRiskAnalysis(response.data.message);
      } else {
        setRiskAnalysis('Risk analysis completed. Review the risk scores and charts above.');
      }
    } catch (error) {
      console.error('Risk analysis error:', error);
      setRiskAnalysis('Risk analysis completed. Review the risk scores and charts above.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Refine analysis based on follow-up question
  const handleFollowUp = async () => {
    if (!followUpQuestion.trim()) return;

    setIsLoadingRefinement(true);
    const question = followUpQuestion.trim();
    setFollowUpQuestion('');

    try {
      const sampleData = processedData.slice(0, 10).map(row => {
        const sample = {};
        [...selectedDimensions, ...selectedMeasures].forEach(col => {
          sample[col] = row[col];
        });
        return sample;
      });

      const response = await api.post('/public/chatbot-message', {
        message: `Based on the previous risk analysis, please provide more detailed insights about this specific question:

Question: ${question}

Context:
- Dimensions: ${selectedDimensions.join(', ')}
- Measures: ${selectedMeasures.join(', ')}
- Risk Scores: ${riskScores.map(s => `${s.measure}: ${s.risk}`).join(', ')}

Sample Data:
${JSON.stringify(sampleData, null, 2)}

Please provide a focused, detailed answer about this specific risk area.`,
        chatHistory: [{ sender: 'user', text: question }],
      });

      if (response.data.success) {
        setRefinedAnalysis(prev => prev + '\n\n--- Follow-up Analysis ---\n\n' + response.data.message);
      }
    } catch (error) {
      console.error('Refinement error:', error);
    } finally {
      setIsLoadingRefinement(false);
    }
  };

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

      pdf.save('risk-analysis.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  if (!isAuthenticated || user?.role !== 'customer') {
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
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Risk & Fraud Pro
            </h1>
            <p className="text-xl text-red-100">Advanced risk assessment and fraud detection analysis</p>
          </div>

          {/* Data Input Table */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-red-600" />
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
                            className="grid-cell w-full h-8 px-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:z-10 bg-transparent"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Columns for Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dimensions (Select Multiple)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableColumns.filter(col => !isNumericColumn(col)).map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedDimensions.includes(col)}
                          onChange={() => toggleDimension(col)}
                          className="h-4 w-4 text-red-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Measures (Select Multiple)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableColumns.filter(col => isNumericColumn(col)).map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedMeasures.includes(col)}
                          onChange={() => toggleMeasure(col)}
                          className="h-4 w-4 text-red-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {(selectedDimensions.length > 0 || selectedMeasures.length > 0) && (
            <div className="mb-8">
              <button
                onClick={generateRiskAnalysis}
                disabled={isLoadingAnalysis}
                className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAnalysis ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Risk...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Analyze Risk & Fraud
                  </>
                )}
              </button>
            </div>
          )}

          {/* Risk Analysis Results */}
          {(riskScores.length > 0 || riskAnalysis) && (
            <div ref={reportRef} className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Risk Analysis Results
              </h3>

              {/* Risk Scores */}
              {riskScores.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Risk Scores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {riskScores.map((score, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border-2 ${
                        score.risk === 'High' ? 'border-red-500 bg-red-50' :
                        score.risk === 'Medium' ? 'border-orange-500 bg-orange-50' :
                        'border-green-500 bg-green-50'
                      }`}>
                        <div className="font-semibold text-gray-900 mb-1">{score.measure}</div>
                        <div className={`text-2xl font-bold ${
                          score.risk === 'High' ? 'text-red-600' :
                          score.risk === 'Medium' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {score.score.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">{score.risk} Risk</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Risk Score Chart */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Risk Visualization</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={riskScores}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="measure" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" name="Risk Score (%)">
                          {riskScores.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.risk === 'High' ? '#EF4444' :
                                entry.risk === 'Medium' ? '#F59E0B' :
                                '#10B981'
                              } 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* GPT Analysis */}
              {isLoadingAnalysis ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-red-600" />
                    <span className="text-red-800">Generating risk analysis...</span>
                  </div>
                </div>
              ) : riskAnalysis ? (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Risk & Fraud Analysis
                  </h4>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {riskAnalysis}
                  </div>
                </div>
              ) : null}

              {/* Refined Analysis */}
              {refinedAnalysis && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Refined Analysis</h4>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {refinedAnalysis}
                  </div>
                </div>
              )}

              {/* Follow-up Question */}
              {riskAnalysis && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Ask a Follow-up Question</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                      placeholder="E.g., What specific fraud patterns should I watch for?"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={handleFollowUp}
                      disabled={!followUpQuestion.trim() || isLoadingRefinement}
                      className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoadingRefinement ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Ask
                    </button>
                  </div>
                </div>
              )}

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

export default RiskFraudPro;
