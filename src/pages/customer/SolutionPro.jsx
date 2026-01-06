import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Download, Copy, Trash2, FileSpreadsheet, BarChart3, PieChart, Info, X } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const SolutionPro = () => {
  const [gridData, setGridData] = useState(() => {
    // Initialize 100 rows x 10 columns
    const rows = 100;
    const cols = 10;
    return Array(rows).fill(null).map(() => Array(cols).fill(''));
  });
  const [chartData, setChartData] = useState([]);
  const [annotations, setAnnotations] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const gridRef = useRef(null);
  const dashboardRef = useRef(null);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  // Process grid data and generate chart data
  useEffect(() => {
    const processed = processGridData();
    setChartData(processed);
  }, [gridData]);

  const processGridData = () => {
    // Find the first row with data
    let firstDataRow = -1;
    for (let i = 0; i < gridData.length; i++) {
      if (gridData[i].some(cell => cell.trim() !== '')) {
        firstDataRow = i;
        break;
      }
    }

    if (firstDataRow === -1) return [];

    // Assume first row is headers
    const headers = gridData[firstDataRow].filter(h => h.trim() !== '');
    if (headers.length === 0) return [];

    // Get data rows
    const dataRows = [];
    for (let i = firstDataRow + 1; i < gridData.length; i++) {
      const row = gridData[i];
      if (row.some(cell => cell.trim() !== '')) {
        const dataObj = {};
        headers.forEach((header, idx) => {
          const value = row[idx] || '';
          // Try to parse as number
          const numValue = parseFloat(value);
          dataObj[header] = isNaN(numValue) ? value : numValue;
        });
        dataRows.push(dataObj);
      }
    }

    return dataRows;
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...gridData];
    newData[rowIndex][colIndex] = value;
    setGridData(newData);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const lines = paste.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) return;
    
    const startRow = activeCell.row;
    const startCol = activeCell.col;
    
    lines.forEach((line, lineIdx) => {
      const cells = line.split('\t');
      cells.forEach((cell, cellIdx) => {
        const targetRow = startRow + lineIdx;
        const targetCol = startCol + cellIdx;
        if (targetRow < 100 && targetCol < 10) {
          handleCellChange(targetRow, targetCol, cell.trim());
        }
      });
    });
  };

  const handleCellFocus = (rowIndex, colIndex) => {
    setActiveCell({ row: rowIndex, col: colIndex });
  };

  const clearGrid = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setGridData(Array(100).fill(null).map(() => Array(10).fill('')));
      setAnnotations({});
    }
  };

  const generateCharts = () => {
    if (chartData.length === 0) return [];

    const charts = [];
    const headers = Object.keys(chartData[0] || {});
    const numericHeaders = headers.filter(h => {
      return chartData.some(row => typeof row[h] === 'number');
    });

    // Chart 1: Bar chart of first numeric column
    if (numericHeaders.length > 0) {
      const firstNumeric = numericHeaders[0];
      charts.push({
        type: 'bar',
        title: `Bar Chart: ${firstNumeric}`,
        data: chartData.map((row, idx) => ({
          name: `Item ${idx + 1}`,
          value: row[firstNumeric] || 0,
        })),
        key: 'chart1',
      });
    }

    // Chart 2: Pie chart of first numeric column
    if (numericHeaders.length > 0) {
      const firstNumeric = numericHeaders[0];
      const pieData = chartData.slice(0, 8).map((row, idx) => ({
        name: `Item ${idx + 1}`,
        value: Math.abs(row[firstNumeric] || 0),
      }));
      charts.push({
        type: 'pie',
        title: `Pie Chart: ${firstNumeric}`,
        data: pieData,
        key: 'chart2',
      });
    }

    // Chart 3: Bar chart comparing first two numeric columns
    if (numericHeaders.length >= 2) {
      charts.push({
        type: 'bar',
        title: `Comparison: ${numericHeaders[0]} vs ${numericHeaders[1]}`,
        data: chartData.slice(0, 10).map((row, idx) => ({
          name: `Item ${idx + 1}`,
          [numericHeaders[0]]: row[numericHeaders[0]] || 0,
          [numericHeaders[1]]: row[numericHeaders[1]] || 0,
        })),
        key: 'chart3',
        multiBar: true,
      });
    }

    // Chart 4: Pie chart of second numeric column
    if (numericHeaders.length >= 2) {
      const secondNumeric = numericHeaders[1];
      const pieData = chartData.slice(0, 6).map((row, idx) => ({
        name: `Item ${idx + 1}`,
        value: Math.abs(row[secondNumeric] || 0),
      }));
      charts.push({
        type: 'pie',
        title: `Pie Chart: ${secondNumeric}`,
        data: pieData,
        key: 'chart4',
      });
    }

    // Chart 5: Bar chart of third numeric column (if exists)
    if (numericHeaders.length >= 3) {
      const thirdNumeric = numericHeaders[2];
      charts.push({
        type: 'bar',
        title: `Bar Chart: ${thirdNumeric}`,
        data: chartData.slice(0, 10).map((row, idx) => ({
          name: `Item ${idx + 1}`,
          value: row[thirdNumeric] || 0,
        })),
        key: 'chart5',
      });
    }

    // Chart 6: Pie chart aggregating all numeric values
    if (numericHeaders.length > 0) {
      const aggregated = numericHeaders.slice(0, 5).map(header => ({
        name: header,
        value: chartData.reduce((sum, row) => sum + Math.abs(row[header] || 0), 0),
      }));
      charts.push({
        type: 'pie',
        title: 'Aggregated Overview',
        data: aggregated,
        key: 'chart6',
      });
    }

    // Fill up to 6 charts
    while (charts.length < 6) {
      charts.push({
        type: 'bar',
        title: `Chart ${charts.length + 1}`,
        data: [],
        key: `chart${charts.length + 1}`,
        empty: true,
      });
    }

    return charts.slice(0, 6);
  };

  const charts = generateCharts();

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
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

      pdf.save('sams-smart-reports-dashboard.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const copyChart = (chartElement) => {
    if (!chartElement) return;
    
    html2canvas(chartElement, { scale: 2, useCORS: true }).then(canvas => {
      canvas.toBlob(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          alert('Chart copied to clipboard! You can paste it into Word, Excel, or email.');
        }).catch(() => {
          alert('Failed to copy chart. Please try right-clicking and copying the image manually.');
        });
      });
    });
  };

  const updateAnnotation = (chartKey, annotation) => {
    setAnnotations(prev => ({
      ...prev,
      [chartKey]: annotation,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Solution Pro</h1>
            <p className="text-gray-600">Transform your data into professional dashboards</p>
          </div>

          {/* Instructions Panel */}
          {showInstructions && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6 relative">
              <button
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 text-blue-600 hover:text-blue-800"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>To reuse this tool for multiple datasets, remove the old data first.</li>
                    <li>Paste your data, download or copy the charts, then clear the sheet to start again.</li>
                    <li>For large datasets beyond 100 rows or 10 columns, please contact the admin.</li>
                    <li>Charts are automatically generated from your data. Right-click any chart to copy it.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Excel Grid */}
          <div className="bg-white rounded-lg shadow-lg mb-8">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Data Input (100 rows × 10 columns)</h2>
              </div>
              <button
                onClick={clearGrid}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
            <div
              ref={gridRef}
              className="overflow-auto max-h-96 border-t border-gray-200"
            >
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="border border-gray-300 p-2 text-xs font-semibold text-gray-600 bg-gray-100 w-12"></th>
                    {Array.from({ length: 10 }, (_, i) => (
                      <th key={i} className="border border-gray-300 p-2 text-xs font-semibold text-gray-600 bg-gray-100 min-w-24">
                        {String.fromCharCode(65 + i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border border-gray-300 p-1 text-xs text-gray-500 bg-gray-50 text-center font-semibold">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 p-0">
                          <input
                            id={`cell-${rowIndex}-${colIndex}`}
                            type="text"
                            className="grid-cell w-full h-8 px-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10"
                            value={cell}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            onFocus={() => handleCellFocus(rowIndex, colIndex)}
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

          {/* Dashboard */}
          <div ref={dashboardRef} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Auto-Generated Dashboard</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No data available. Paste your data in the grid above to generate charts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {charts.map((chart, index) => (
                  <div
                    key={chart.key}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                      <button
                        onClick={() => {
                          const chartElement = document.getElementById(`chart-${chart.key}`);
                          copyChart(chartElement);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Copy chart to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                    </div>
                    
                    {chart.empty || chart.data.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No data available for this chart</p>
                        </div>
                      </div>
                    ) : (
                      <div id={`chart-${chart.key}`} className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                          {chart.type === 'bar' ? (
                            <BarChart data={chart.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {chart.multiBar ? (
                                <>
                                  {Object.keys(chart.data[0] || {}).filter(k => k !== 'name').map((key, idx) => (
                                    <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />
                                  ))}
                                </>
                              ) : (
                                <Bar dataKey="value" fill={COLORS[index % COLORS.length]} />
                              )}
                            </BarChart>
                          ) : (
                            <RechartsPieChart>
                              <Pie
                                data={chart.data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {chart.data.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </RechartsPieChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Annotation Input */}
                    <div className="mt-4">
                      <textarea
                        placeholder="Add notes or annotations..."
                        value={annotations[chart.key] || ''}
                        onChange={(e) => updateAnnotation(chart.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copy Instructions */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Copy className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">How to Copy Charts:</p>
                <p>Click the "Copy" button on any chart, or right-click the chart and select "Copy Image" to paste it into Word, Excel, or email.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SolutionPro;

