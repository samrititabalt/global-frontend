import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Download, Copy, Trash2, FileSpreadsheet, BarChart3, PieChart, Info, X, Settings, Plus, LineChart, TrendingUp, AreaChart, Calendar } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, AreaChart as RechartsAreaChart, Area, ScatterChart, Scatter as RechartsScatter } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { parse, isValid } from 'date-fns';
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
  const [chartConfigs, setChartConfigs] = useState(() => 
    Array(6).fill(null).map((_, idx) => ({
      id: `chart-${idx + 1}`,
      enabled: false,
      chartType: 'bar',
      xAxis: { column: '', type: 'dimension', aggregation: 'none' },
      yAxis: { column: '', type: 'measure', aggregation: 'sum' },
      title: '',
      error: null,
    }))
  );
  const [expandedChart, setExpandedChart] = useState(null);
  const gridRef = useRef(null);
  const dashboardRef = useRef(null);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  const CHART_TYPES = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'area', label: 'Area Chart', icon: AreaChart },
    { value: 'scatter', label: 'Scatter Plot', icon: TrendingUp },
  ];
  const AGGREGATIONS = [
    { value: 'none', label: 'None' },
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'mean', label: 'Mean' },
    { value: 'median', label: 'Median' },
    { value: 'cagr', label: 'CAGR (Time Series)' },
  ];

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
    const headers = [];
    const headerRow = gridData[firstDataRow];
    for (let i = 0; i < headerRow.length; i++) {
      const header = (headerRow[i] || '').trim();
      if (header !== '') {
        headers.push({ name: header, index: i });
      }
    }

    if (headers.length === 0) return [];

    // Get data rows
    const dataRows = [];
    for (let i = firstDataRow + 1; i < gridData.length; i++) {
      const row = gridData[i];
      if (row.some(cell => cell.trim() !== '')) {
        const dataObj = {};
        headers.forEach(({ name, index }) => {
          const value = (row[index] || '').trim();
          // Try to parse as number
          const numValue = parseFloat(value);
          dataObj[name] = value === '' ? null : (isNaN(numValue) ? value : numValue);
        });
        dataRows.push(dataObj);
      }
    }

    return dataRows;
  };

  // Detect column types
  const getColumnInfo = (columnName) => {
    if (!chartData.length || !columnName) return { type: 'text', isDate: false, isNumeric: false };
    
    const values = chartData.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length === 0) return { type: 'text', isDate: false, isNumeric: false };

    // Check if date
    let dateCount = 0;
    const dateFormats = [
      'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd',
      'MM-dd-yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd HH:mm', 'MM/dd/yyyy HH:mm'
    ];
    
    values.slice(0, 10).forEach(val => {
      const str = String(val);
      if (!isNaN(Date.parse(str))) {
        dateCount++;
      } else {
        dateFormats.forEach(format => {
          try {
            const parsed = parse(str, format, new Date());
            if (isValid(parsed)) dateCount++;
          } catch (e) {}
        });
      }
    });

    const isDate = dateCount / Math.min(values.length, 10) > 0.7;
    
    // Check if numeric
    const numericCount = values.filter(v => typeof v === 'number' || !isNaN(parseFloat(v))).length;
    const isNumeric = numericCount / values.length > 0.8;

    return {
      type: isDate ? 'date' : (isNumeric ? 'numeric' : 'text'),
      isDate,
      isNumeric,
    };
  };

  // Get available columns
  const getAvailableColumns = () => {
    if (!chartData.length) return [];
    return Object.keys(chartData[0] || {});
  };

  // Validate chart configuration
  const validateChartConfig = (config) => {
    if (!config.enabled) return { valid: true, error: null };

    const { chartType, xAxis, yAxis } = config;
    const columns = getAvailableColumns();
    const xInfo = xAxis.column ? getColumnInfo(xAxis.column) : null;
    const yInfo = yAxis.column ? getColumnInfo(yAxis.column) : null;

    // Basic validation
    if (!xAxis.column && !yAxis.column) {
      return { valid: false, error: 'Please select at least one variable.' };
    }

    // Pie charts need only one dimension
    if (chartType === 'pie') {
      if (!xAxis.column || xAxis.type !== 'dimension') {
        return { valid: false, error: 'Pie charts require a dimension on X-axis.' };
      }
      if (yAxis.column && yAxis.type === 'dimension') {
        return { valid: false, error: 'Pie charts cannot have two dimensions.' };
      }
    }

    // Scatter plots need two measures
    if (chartType === 'scatter') {
      if (!xAxis.column || !yAxis.column) {
        return { valid: false, error: 'Scatter plots require both X and Y axes.' };
      }
      if (xAxis.type !== 'measure' || yAxis.type !== 'measure') {
        return { valid: false, error: 'Scatter plots require numeric measures on both axes.' };
      }
    }

    // Line/Area charts work best with time on X-axis
    if ((chartType === 'line' || chartType === 'area') && xInfo && !xInfo.isDate && xAxis.type === 'dimension') {
      // Warning but not error - allow it
    }

    // Aggregation validation
    if (xAxis.aggregation !== 'none' && xAxis.type === 'dimension' && !xInfo?.isNumeric) {
      if (xAxis.aggregation === 'cagr' && !xInfo?.isDate) {
        return { valid: false, error: 'CAGR requires a date/time column. Select the right variable.' };
      }
      if (['sum', 'average', 'mean', 'median'].includes(xAxis.aggregation) && !xInfo?.isNumeric) {
        return { valid: false, error: 'This aggregation requires numeric values. Select the right variable.' };
      }
    }

    if (yAxis.aggregation !== 'none' && yAxis.type === 'dimension' && !yInfo?.isNumeric) {
      if (yAxis.aggregation === 'cagr' && !yInfo?.isDate) {
        return { valid: false, error: 'CAGR requires a date/time column. Select the right variable.' };
      }
      if (['sum', 'average', 'mean', 'median'].includes(yAxis.aggregation) && !yInfo?.isNumeric) {
        return { valid: false, error: 'This aggregation requires numeric values. Select the right variable.' };
      }
    }

    return { valid: true, error: null };
  };

  // Calculate aggregation
  const calculateAggregation = (data, column, aggregation) => {
    if (aggregation === 'none') return data;
    
    const values = data.map(row => {
      const val = row[column];
      if (val === null || val === undefined || val === '') return null;
      return typeof val === 'number' ? val : parseFloat(val);
    }).filter(v => v !== null && !isNaN(v));

    if (values.length === 0) return null;

    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'average':
      case 'mean':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'median':
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      case 'cagr':
        if (values.length < 2) return null;
        const first = values[0];
        const last = values[values.length - 1];
        const periods = values.length - 1;
        if (first === 0) return null;
        return Math.pow(last / first, 1 / periods) - 1;
      default:
        return null;
    }
  };

  // Generate chart data from configuration
  const generateChartData = (config) => {
    if (!config.enabled || chartData.length === 0) return [];

    const { chartType, xAxis, yAxis } = config;
    const validation = validateChartConfig(config);
    if (!validation.valid) return [];

    const xCol = xAxis.column;
    const yCol = yAxis.column;

    // For pie charts (single dimension)
    if (chartType === 'pie' && xCol) {
      const freq = {};
      chartData.forEach(row => {
        const key = String(row[xCol] || '').trim();
        if (key) {
          freq[key] = (freq[key] || 0) + 1;
        }
      });
      return Object.entries(freq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);
    }

    // For scatter plots (two measures)
    if (chartType === 'scatter' && xCol && yCol) {
      return chartData
        .map(row => ({
          x: row[xCol] || 0,
          y: row[yCol] || 0,
          name: `${row[xCol] || 0}, ${row[yCol] || 0}`,
        }))
        .filter(item => !isNaN(item.x) && !isNaN(item.y))
        .slice(0, 100);
    }

    // For other charts: aggregate by X-axis category
    if (xCol && yCol) {
      const groups = {};
      chartData.forEach(row => {
        const xVal = String(row[xCol] || '').trim();
        const yVal = row[yCol];
        
        if (xVal && yVal !== null && yVal !== undefined && yVal !== '') {
          if (!groups[xVal]) {
            groups[xVal] = [];
          }
          groups[xVal].push(yVal);
        }
      });

      return Object.entries(groups).map(([name, values]) => {
        let value;
        if (yAxis.aggregation !== 'none') {
          value = calculateAggregation(values.map(v => ({ [yCol]: v })), yCol, yAxis.aggregation);
        } else {
          value = values[0];
        }
        return { name, value: value || 0 };
      }).sort((a, b) => {
        // Try to sort by numeric value, otherwise alphabetically
        const aNum = parseFloat(a.name);
        const bNum = parseFloat(b.name);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.name.localeCompare(b.name);
      });
    }

    // Single column charts
    if (xCol && !yCol) {
      const freq = {};
      chartData.forEach(row => {
        const key = String(row[xCol] || '').trim();
        if (key) {
          freq[key] = (freq[key] || 0) + 1;
        }
      });
      return Object.entries(freq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);
    }

    return [];
  };

  // Update chart configuration
  const updateChartConfig = (chartId, updates) => {
    setChartConfigs(prev => prev.map(config => {
      if (config.id === chartId) {
        const updated = { ...config, ...updates };
        const validation = validateChartConfig(updated);
        return { ...updated, error: validation.error };
      }
      return config;
    }));
  };

  // Toggle chart enabled
  const toggleChart = (chartId) => {
    setChartConfigs(prev => prev.map(config => {
      if (config.id === chartId) {
        const newEnabled = !config.enabled;
        if (newEnabled && !expandedChart) {
          setExpandedChart(chartId);
        }
        return { ...config, enabled: newEnabled };
      }
      return config;
    }));
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
      setChartConfigs(Array(6).fill(null).map((_, idx) => ({
        id: `chart-${idx + 1}`,
        enabled: false,
        chartType: 'bar',
        xAxis: { column: '', type: 'dimension', aggregation: 'none' },
        yAxis: { column: '', type: 'measure', aggregation: 'sum' },
        title: '',
        error: null,
      })));
    }
  };

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

  const renderChart = (config) => {
    const data = generateChartData(config);
    const validation = validateChartConfig(config);

    if (!config.enabled) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chart disabled. Click "Configure" to enable.</p>
          </div>
        </div>
      );
    }

    if (!validation.valid) {
      return (
        <div className="h-64 flex items-center justify-center text-red-100 border-2 border-red-300 rounded-lg bg-red-50">
          <div className="text-center px-4">
            <p className="text-sm text-red-600 font-semibold">{validation.error}</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available. Check your variable selections.</p>
          </div>
        </div>
      );
    }

    const getChartTitle = () => {
      if (config.title) return config.title;
      
      if (config.chartType === 'pie') {
        return config.xAxis.column ? `Distribution: ${config.xAxis.column}` : 'Pie Chart';
      }
      
      if (config.chartType === 'scatter') {
        return `${config.xAxis.column || 'X'} vs ${config.yAxis.column || 'Y'}`;
      }
      
      if (config.yAxis.column && config.xAxis.column) {
        const agg = config.yAxis.aggregation !== 'none' ? `${config.yAxis.aggregation} of ` : '';
        return `${agg}${config.yAxis.column} by ${config.xAxis.column}`;
      }
      
      if (config.xAxis.column) {
        return `Count by ${config.xAxis.column}`;
      }
      
      return 'Chart';
    };
    
    const chartTitle = getChartTitle();

    return (
      <div id={`chart-${config.id}`} className="chart-container">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{chartTitle}</h4>
        <ResponsiveContainer width="100%" height={250}>
          {config.chartType === 'bar' && (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          )}
          {config.chartType === 'pie' && (
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          )}
          {config.chartType === 'line' && (
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={COLORS[0]} />
            </RechartsLineChart>
          )}
          {config.chartType === 'area' && (
            <RechartsAreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
            </RechartsAreaChart>
          )}
          {config.chartType === 'scatter' && (
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name={config.xAxis.column} type="number" />
              <YAxis dataKey="y" name={config.yAxis.column} type="number" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <RechartsScatter name={`${config.xAxis.column} vs ${config.yAxis.column}`} data={data} fill={COLORS[0]} />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const availableColumns = getAvailableColumns();

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
                  <h3 className="font-semibold text-blue-900 mb-2">Chart Builder Instructions</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Select variables to build your own charts.</li>
                    <li>Use dimensions for categories and measures for values.</li>
                    <li>Choose aggregation methods to analyze your data.</li>
                    <li>For time series data, select a date column and apply CAGR or trend analysis.</li>
                    <li>To reuse this tool for multiple datasets, remove the old data first.</li>
                    <li>For large datasets beyond 100 rows or 10 columns, please contact the admin.</li>
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
                <h2 className="text-2xl font-semibold text-gray-900">Chart Dashboard</h2>
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

            {availableColumns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No data available. Paste your data in the grid above to begin.</p>
                <p className="text-sm mt-2">Select variables and chart settings to begin visualizing your data.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartConfigs.map((config, index) => (
                  <div
                    key={config.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">Chart {index + 1}</h3>
                        <button
                          onClick={() => toggleChart(config.id)}
                          className={`px-3 py-1 text-xs rounded ${
                            config.enabled
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedChart(expandedChart === config.id ? null : config.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title="Configure chart"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        {config.enabled && (
                          <button
                            onClick={() => {
                              const chartElement = document.getElementById(`chart-${config.id}`);
                              copyChart(chartElement);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Copy chart"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chart Configuration Panel */}
                    {expandedChart === config.id && (
                      <div className="mb-4 p-4 bg-white rounded-lg border border-gray-300 space-y-4">
                        {/* Chart Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {CHART_TYPES.map(type => {
                              const Icon = type.icon;
                              return (
                                <button
                                  key={type.value}
                                  onClick={() => updateChartConfig(config.id, { chartType: type.value })}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    config.chartType === type.value
                                      ? 'border-blue-600 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <Icon className="h-5 w-5 mx-auto mb-1" />
                                  <span className="text-xs">{type.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* X-Axis Configuration */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                          <div className="space-y-2">
                            <select
                              value={config.xAxis.column}
                              onChange={(e) => updateChartConfig(config.id, {
                                xAxis: { ...config.xAxis, column: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">Select column...</option>
                              {availableColumns.map(col => {
                                const info = getColumnInfo(col);
                                return (
                                  <option key={col} value={col}>
                                    {col} {info.isDate && '📅'} {info.isNumeric && '🔢'}
                                  </option>
                                );
                              })}
                            </select>
                            {config.xAxis.column && (
                              <>
                                <select
                                  value={config.xAxis.type}
                                  onChange={(e) => updateChartConfig(config.id, {
                                    xAxis: { ...config.xAxis, type: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="dimension">Dimension (Category)</option>
                                  <option value="measure">Measure (Numeric)</option>
                                </select>
                                {config.xAxis.type === 'measure' && (
                                  <select
                                    value={config.xAxis.aggregation}
                                    onChange={(e) => updateChartConfig(config.id, {
                                      xAxis: { ...config.xAxis, aggregation: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  >
                                    {AGGREGATIONS.map(agg => (
                                      <option key={agg.value} value={agg.value}>{agg.label}</option>
                                    ))}
                                  </select>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Y-Axis Configuration */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                          <div className="space-y-2">
                            <select
                              value={config.yAxis.column}
                              onChange={(e) => updateChartConfig(config.id, {
                                yAxis: { ...config.yAxis, column: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">Select column...</option>
                              {availableColumns.map(col => {
                                const info = getColumnInfo(col);
                                return (
                                  <option key={col} value={col}>
                                    {col} {info.isDate && '📅'} {info.isNumeric && '🔢'}
                                  </option>
                                );
                              })}
                            </select>
                            {config.yAxis.column && (
                              <>
                                <select
                                  value={config.yAxis.type}
                                  onChange={(e) => updateChartConfig(config.id, {
                                    yAxis: { ...config.yAxis, type: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="dimension">Dimension (Category)</option>
                                  <option value="measure">Measure (Numeric)</option>
                                </select>
                                {config.yAxis.type === 'measure' && (
                                  <select
                                    value={config.yAxis.aggregation}
                                    onChange={(e) => updateChartConfig(config.id, {
                                      yAxis: { ...config.yAxis, aggregation: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  >
                                    {AGGREGATIONS.map(agg => (
                                      <option key={agg.value} value={agg.value}>{agg.label}</option>
                                    ))}
                                  </select>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Custom Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title (Optional)</label>
                          <input
                            type="text"
                            value={config.title}
                            onChange={(e) => updateChartConfig(config.id, { title: e.target.value })}
                            placeholder="Auto-generated if empty"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Chart Display */}
                    {renderChart(config)}

                    {/* Annotation Input */}
                    <div className="mt-4">
                      <textarea
                        placeholder="Add notes or annotations..."
                        value={annotations[config.id] || ''}
                        onChange={(e) => updateAnnotation(config.id, e.target.value)}
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
