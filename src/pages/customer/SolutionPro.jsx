import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Download, Copy, Trash2, FileSpreadsheet, BarChart3, PieChart, Info, X, Settings, LineChart, AreaChart, Palette, Eye, EyeOff, ChevronRight, ChevronLeft, Image as ImageIcon, MessageCircle, Send, Minimize2, Maximize2, Filter, Search } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, AreaChart as RechartsAreaChart, Area, LabelList, Text } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { parse, isValid } from 'date-fns';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import api from '../../utils/axios';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Filter Multi-Select Component
const FilterMultiSelect = ({ filter, uniqueValues, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedValues = filter.values || [];
  const filteredValues = uniqueValues.filter(v => 
    v.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleValue = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onUpdate({ ...filter, values: newValues });
  };

  const selectAll = () => {
    onUpdate({ ...filter, values: [...uniqueValues] });
  };

  const clearAll = () => {
    onUpdate({ ...filter, values: [] });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center justify-between"
      >
        <span className="truncate">
          {selectedValues.length === 0 
            ? 'Select values...' 
            : selectedValues.length === uniqueValues.length
            ? `All (${selectedValues.length})`
            : `${selectedValues.length} selected`}
        </span>
        <ChevronRight className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={selectAll}
                className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="flex-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredValues.length === 0 ? (
              <div className="p-2 text-xs text-gray-500 text-center">No values found</div>
            ) : (
              filteredValues.map((value) => (
                <label
                  key={value}
                  className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(value)}
                    onChange={() => toggleValue(value)}
                    className="mr-2 h-3 w-3 text-blue-600"
                  />
                  <span className="text-xs text-gray-700 truncate">{value}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SolutionPro = () => {
  const [gridData, setGridData] = useState(() => {
    // Initialize 1000 rows x 20 columns
    const rows = 1000;
    const cols = 20;
    return Array(rows).fill(null).map(() => Array(cols).fill(''));
  });
  const [chartData, setChartData] = useState([]);
  const [annotations, setAnnotations] = useState({});
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [selectedCells, setSelectedCells] = useState([]); // Array of {row, col}
  const [copiedCells, setCopiedCells] = useState(null); // {data: [[...]], startRow, startCol}
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState(null);
  const [isDraggingFill, setIsDraggingFill] = useState(false);
  const [fillStartCell, setFillStartCell] = useState(null);
  const [pptSlides, setPptSlides] = useState([]);
  const [showPptBuilder, setShowPptBuilder] = useState(false);
  const [dashboardCharts, setDashboardCharts] = useState([]); // Charts arranged on dashboard canvas
  const [chartConfigs, setChartConfigs] = useState(() => 
    Array(40).fill(null).map((_, idx) => ({
      id: `chart-${idx + 1}`,
      enabled: false,
      chartType: 'bar',
      xAxis: { columns: [], type: 'dimension', aggregation: 'none', label: '', showLabel: true }, // Changed to array for multiple dimensions
      yAxis: { columns: [], type: 'measure', aggregation: 'sum', label: '', showLabel: true }, // Changed to array for multiple dimensions
      zAxis: { columns: [], type: 'dimension', aggregation: 'none', label: '', showLabel: true }, // Added Z-axis
      filters: [], // Added filters bucket: [{ column: '', type: 'dimension'|'measure', filterType: 'single'|'multi'|'range', values: [] }]
      title: '',
      showTitle: true,
      error: null,
      sortOrder: 'none', // 'none', 'ascending', 'descending'
      // Appearance customization
      appearance: {
        fontSize: 'medium', // 'small', 'medium', 'large', or custom px
        customFontSize: 14,
        fontColor: '#000000',
        colors: COLORS,
        useMultiColor: true,
        legendPosition: 'bottom', // 'top', 'bottom', 'left', 'right'
        legendFontSize: 12,
        legendFontColor: '#000000',
        showLegend: true,
        showDataLabels: true, // Changed default to true to show labels on bars
        barThickness: 20,
        lineThickness: 2,
        opacity: 1,
      },
    }))
  );
  const [dateHierarchies, setDateHierarchies] = useState({}); // { columnName: 'year'|'quarter'|'month'|'week'|'day' }
  const [expandedChart, setExpandedChart] = useState('chart-1'); // Default to Chart 1
  const [showCustomization, setShowCustomization] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [draggedField, setDraggedField] = useState(null);
  const [fieldRoles, setFieldRoles] = useState({}); // { columnName: 'dimension' | 'measure' }
  const [fieldModes, setFieldModes] = useState({}); // { columnName: 'discrete' | 'continuous' }
  const [editingLabel, setEditingLabel] = useState(null); // { chartId, type, key, value }
  const [editedLabels, setEditedLabels] = useState({}); // { chartId: { xAxis: {...}, yAxis: {...}, categories: {...}, title: '', legend: {...} } }
  const [currentChartIndex, setCurrentChartIndex] = useState(0); // Currently viewing chart index (0-39)
  const [activeChartIds, setActiveChartIds] = useState(new Set(['chart-1'])); // Track which charts have been configured
  const [pptPreviewMode, setPptPreviewMode] = useState(false);
  const [iconLibrary, setIconLibrary] = useState([]); // Icon repository
  const [selectedSlideForEdit, setSelectedSlideForEdit] = useState(null);
  const [draggingElement, setDraggingElement] = useState(null); // { slideId, elementId, type: 'image' | 'icon', offsetX, offsetY }
  const [resizingElement, setResizingElement] = useState(null); // { slideId, elementId, type, startWidth, startHeight, startX, startY }
  const [xAxisLabelOptions, setXAxisLabelOptions] = useState({}); // { chartId: { reduceFont: boolean, horizontalScroll: boolean, skipLabels: number } }
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const gridRef = useRef(null);
  const dashboardRef = useRef(null);
  const chatbotRef = useRef(null);
  const CHART_TYPES = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'area', label: 'Area Chart', icon: AreaChart },
    { value: 'table', label: 'Table', icon: FileSpreadsheet },
    { value: 'heatmap', label: 'Heatmap', icon: BarChart3 },
  ];
  const SORT_OPTIONS = [
    { value: 'none', label: 'No Sorting' },
    { value: 'ascending', label: 'Increasing (Ascending)' },
    { value: 'descending', label: 'Decreasing (Descending)' },
  ];
  const AGGREGATIONS = [
    { value: 'none', label: 'None' },
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'count_distinct', label: 'Count Distinct' },
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

  // Enhanced date parsing with strict format matching (prevents numeric fields from being misclassified as dates)
  const parseDate = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    if (!str) return null;

    // Reject pure numeric strings (e.g., "12345", "1234567890") - these are not dates
    // Only accept if it looks like a date format (has separators like /, -, or spaces)
    const looksLikeNumericOnly = /^[\d.]+$/.test(str);
    if (looksLikeNumericOnly && str.length < 8) {
      // Short numeric strings are definitely not dates
      return null;
    }
    
    // Reject if it's a valid number but doesn't have date-like structure
    const numValue = parseFloat(str);
    if (!isNaN(numValue) && isFinite(numValue)) {
      // Check if it has date separators - if not, it's just a number
      const hasDateSeparators = /[-/]/.test(str) || /\s/.test(str);
      if (!hasDateSeparators && str.length <= 10) {
        // Pure numeric without separators - likely not a date
        return null;
      }
    }

    // Try date-fns formats (strict format matching only)
    const dateFormats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'yyyy/MM/dd',
      'MM-dd-yyyy',
      'dd-MM-yyyy',
      'yyyy-MM-dd HH:mm',
      'MM/dd/yyyy HH:mm',
      'dd-MM-yyyy HH:mm',
      'yyyy/MM/dd HH:mm:ss',
      'dd/MM/yyyy HH:mm:ss',
      'yyyy-MM-dd HH:mm:ss',
    ];

    for (const format of dateFormats) {
      try {
        const parsed = parse(str, format, new Date());
        if (isValid(parsed)) {
          // Additional validation: ensure parsed date is reasonable
          const year = parsed.getFullYear();
          if (year >= 1900 && year <= 2100) {
            return parsed;
          }
        }
      } catch (e) {
        // Continue to next format
      }
    }

    // Only try standard Date.parse as last resort if it looks date-like
    if (/[-/\s]/.test(str)) {
      const standardDate = new Date(str);
      if (!isNaN(standardDate.getTime()) && standardDate.toString() !== 'Invalid Date') {
        const year = standardDate.getFullYear();
        // Reject if year is unreasonable (likely a mis-parsed number)
        if (year >= 1900 && year <= 2100) {
          return standardDate;
        }
      }
    }

    return null;
  };

  // Detect column types with strict date detection (prevents numeric misclassification)
  const getColumnInfo = (columnName) => {
    if (!chartData.length || !columnName) return { type: 'text', isDate: false, isNumeric: false, parsedDates: [] };
    
    const values = chartData.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length === 0) return { type: 'text', isDate: false, isNumeric: false, parsedDates: [] };

    // FIRST: Check if numeric (priority check to prevent misclassification)
    const numericValues = values.filter(v => {
      if (typeof v === 'number') return true;
      const str = String(v).trim();
      const num = parseFloat(str);
      // Must be a valid number AND not look like a date string
      return !isNaN(num) && isFinite(num) && !/[-/\s]/.test(str);
    });
    const numericRatio = numericValues.length / values.length;
    const isNumeric = numericRatio > 0.8;

    // SECOND: Check if date (only if not clearly numeric)
    // Use stricter criteria: require more date-like patterns
    let dateCount = 0;
    const parsedDates = [];
    
    // Sample more values for better accuracy
    const sampleSize = Math.min(values.length, 30);
    const samples = values.slice(0, sampleSize);
    
    samples.forEach(val => {
      const str = String(val).trim();
      // Skip if it's clearly a number without date separators
      if (/^[\d.]+$/.test(str) && str.length < 8) {
        return; // Skip pure numeric strings
      }
      
      const parsed = parseDate(val);
      if (parsed) {
        dateCount++;
        parsedDates.push(parsed);
      }
    });

    // Stricter threshold: require at least 80% of samples to be valid dates
    // AND ensure we have at least 5 date samples (prevents small datasets from misclassifying)
    const dateRatio = dateCount / sampleSize;
    const isDate = dateRatio > 0.8 && dateCount >= 3 && !isNumeric;

    // Determine final type
    let type;
    if (isDate) {
      type = 'date';
    } else if (isNumeric) {
      type = 'numeric';
    } else {
      type = 'text';
    }

    return {
      type,
      isDate: !!isDate,
      isNumeric: !!isNumeric,
      parsedDates: parsedDates.slice(0, 10), // Store sample parsed dates for hierarchy generation
    };
  };

  // Get available columns
  const getAvailableColumns = () => {
    if (!chartData.length) return [];
    return Object.keys(chartData[0] || {});
  };

  // Validate chart configuration (updated for multiple dimensions and filters)
  const validateChartConfig = (config) => {
    if (!config.enabled) return { valid: true, error: null };

    const { chartType, xAxis, yAxis } = config;
    const xCols = Array.isArray(xAxis.columns) ? xAxis.columns : (xAxis.column ? [xAxis.column] : []);
    const yCols = Array.isArray(yAxis.columns) ? yAxis.columns : (yAxis.column ? [yAxis.column] : []);

    // Basic validation
    if (xCols.length === 0 && yCols.length === 0) {
      return { valid: false, error: 'Please select at least one variable.' };
    }

    // Pie charts need at least one dimension
    if (chartType === 'pie') {
      if (xCols.length === 0) {
        return { valid: false, error: 'Pie charts require at least one dimension on X-axis.' };
      }
    }

    // Date fields should never be aggregated numerically (only hierarchies allowed)
    xCols.forEach(col => {
      const colInfo = getColumnInfo(col);
      if (colInfo.isDate && xAxis.aggregation && xAxis.aggregation !== 'none') {
        // Dates can only use hierarchies, not numeric aggregations
        // This is handled in the UI by showing hierarchy selector instead
      }
    });

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

  // Date hierarchy functions
  const getDateHierarchy = (date, hierarchy = 'month') => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarter = Math.floor(month / 3) + 1;
    const week = getWeekNumber(date);
    const day = date.getDate();
    
    switch (hierarchy) {
      case 'year':
        return String(year);
      case 'quarter':
        return `Q${quarter} ${year}`;
      case 'month':
        return `${getMonthName(month)} ${year}`;
      case 'week':
        return `Week ${week}, ${year}`;
      case 'day':
        return `${day}/${month}/${year}`;
      default:
        return `${getMonthName(month)} ${year}`;
    }
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  // Get unique values from a column
  const getUniqueValues = (columnName) => {
    if (!chartData.length || !columnName) return [];
    const values = chartData.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '');
    const unique = [...new Set(values.map(v => String(v).trim()))].sort();
    return unique;
  };

  // Get min/max values from a numeric column
  const getMinMaxValues = (columnName) => {
    if (!chartData.length || !columnName) return { min: 0, max: 100 };
    const values = chartData.map(row => row[columnName])
      .filter(v => v !== null && v !== undefined && v !== '')
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v) && isFinite(v));
    
    if (values.length === 0) return { min: 0, max: 100 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  // Apply filters to data (updated to work correctly)
  const applyFilters = (data, filters) => {
    if (!filters || filters.length === 0) return data;
    
    let filtered = [...data];
    
    filters.forEach(filter => {
      if (!filter.column) return;
      
      // Skip if no values selected (show all)
      if (filter.filterType === 'range') {
        // Range filter for dates and numbers
        if (!filter.minValue && !filter.maxValue) return; // No range set, show all
        
        filtered = filtered.filter(row => {
          const value = row[filter.column];
          
          if (filter.isDate) {
            const rowDate = parseDate(value);
            const minDate = filter.minValue ? parseDate(filter.minValue) : null;
            const maxDate = filter.maxValue ? parseDate(filter.maxValue) : null;
            
            if (rowDate) {
              if (minDate && maxDate) {
                return rowDate >= minDate && rowDate <= maxDate;
              } else if (minDate) {
                return rowDate >= minDate;
              } else if (maxDate) {
                return rowDate <= maxDate;
              }
            }
            return false;
          } else {
            // Numeric range
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return false;
            
            const minNum = filter.minValue !== undefined && filter.minValue !== null ? parseFloat(filter.minValue) : null;
            const maxNum = filter.maxValue !== undefined && filter.maxValue !== null ? parseFloat(filter.maxValue) : null;
            
            if (minNum !== null && maxNum !== null) {
              return numValue >= minNum && numValue <= maxNum;
            } else if (minNum !== null) {
              return numValue >= minNum;
            } else if (maxNum !== null) {
              return numValue <= maxNum;
            }
            return true;
          }
        });
      } else {
        // Multi-select filter
        // If no values selected OR all unique values are selected, show all (no filtering)
        const uniqueValues = getUniqueValues(filter.column);
        const selectedValues = filter.values || [];
        
        // If all values are selected, don't filter (show all)
        if (selectedValues.length === 0 || selectedValues.length === uniqueValues.length) {
          return; // No filtering needed
        }
        
        // Filter to only selected values
        filtered = filtered.filter(row => {
          const value = String(row[filter.column] || '').trim();
          return selectedValues.includes(value);
        });
      }
    });
    
    return filtered;
  };

  // Generate chart data from configuration with support for multiple dimensions, date hierarchies, and filters
  const generateChartData = (config) => {
    if (!config.enabled || chartData.length === 0) return [];

    const { chartType, xAxis, yAxis, filters } = config;
    const validation = validateChartConfig(config);
    if (!validation.valid) return [];

    // Apply filters first
    let workingData = applyFilters(chartData, filters || []);

    // Support legacy single column format and new array format
    const xCols = Array.isArray(xAxis.columns) ? xAxis.columns : (xAxis.column ? [xAxis.column] : []);
    const yCols = Array.isArray(yAxis.columns) ? yAxis.columns : (yAxis.column ? [yAxis.column] : []);

    // Handle date hierarchies for X-axis columns
    const getXAxisValue = (row, col) => {
      const colInfo = getColumnInfo(col);
      const rawValue = row[col];
      
      if (colInfo.isDate) {
        const parsedDate = parseDate(rawValue);
        if (parsedDate) {
          const hierarchy = dateHierarchies[col] || 'month';
          return getDateHierarchy(parsedDate, hierarchy);
        }
      }
      
      return String(rawValue || '').trim();
    };

    // Handle Y-axis: support dimensions as measures (COUNT/COUNT DISTINCT)
    const getYAxisValue = (row, col, aggregation, isDimension) => {
      if (isDimension) {
        // Dimension used as measure: return 1 for COUNT, or use distinct logic
        if (aggregation === 'count_distinct') {
          return String(row[col] || '').trim();
        }
        return 1; // COUNT
      }
      
      // Regular measure
      const val = row[col];
      if (val === null || val === undefined || val === '') return null;
      return typeof val === 'number' ? val : parseFloat(val);
    };

    // For pie charts (single dimension)
    if (chartType === 'pie' && xCols.length > 0) {
      const xCol = xCols[0];
      const freq = {};
      workingData.forEach(row => {
        const key = getXAxisValue(row, xCol);
        if (key) {
          freq[key] = (freq[key] || 0) + 1;
        }
      });
      let result = Object.entries(freq)
        .map(([name, value]) => ({ name, value }));

      // Apply sorting
      if (config.sortOrder === 'ascending') {
        result = result.sort((a, b) => a.value - b.value);
      } else if (config.sortOrder === 'descending') {
        result = result.sort((a, b) => b.value - a.value);
      } else {
        result = result.sort((a, b) => b.value - a.value); // Default descending for pie
      }

      return result.slice(0, 15);
    }

    // For other charts: aggregate by X-axis category(ies) with support for multiple dimensions
    if (xCols.length > 0 && yCols.length > 0) {
      const groups = {};
      
      workingData.forEach(row => {
        // Create composite key for multiple X dimensions
        const xKeys = xCols.map(col => getXAxisValue(row, col)).filter(k => k);
        if (xKeys.length === 0) return;
        
        const compositeKey = xKeys.join(' | '); // Use separator for multiple dimensions
        
        if (!groups[compositeKey]) {
          groups[compositeKey] = { xKeys, yValues: [] };
        }
        
        // Handle multiple Y columns
        yCols.forEach(yCol => {
          const colInfo = getColumnInfo(yCol);
          const isDimension = !colInfo.isNumeric && !colInfo.isDate;
          const yAxisConfig = yAxis.columns?.find(c => c.column === yCol) || yAxis;
          const aggregation = yAxisConfig.aggregation || yAxis.aggregation;
          
          const yVal = getYAxisValue(row, yCol, aggregation, isDimension);
          if (yVal !== null && yVal !== undefined && yVal !== '') {
            groups[compositeKey].yValues.push({ column: yCol, value: yVal, isDimension, aggregation });
          }
        });
      });

      let result = Object.entries(groups).map(([compositeKey, group]) => {
        const name = xCols.length === 1 ? group.xKeys[0] : compositeKey;
        
        // Aggregate Y values
        let value = 0;
        if (group.yValues.length > 0) {
          const firstY = group.yValues[0];
          if (firstY.isDimension) {
            // COUNT or COUNT DISTINCT
            if (firstY.aggregation === 'count_distinct') {
              const distinct = new Set(group.yValues.map(v => String(v.value))).size;
              value = distinct;
            } else {
              value = group.yValues.length; // COUNT
            }
          } else {
            // Regular measure aggregation
            const numericValues = group.yValues.map(v => parseFloat(v.value)).filter(v => !isNaN(v));
            if (numericValues.length > 0) {
              const aggregation = firstY.aggregation || 'sum';
              if (aggregation === 'sum') {
                value = numericValues.reduce((a, b) => a + b, 0);
              } else if (aggregation === 'average' || aggregation === 'mean') {
                value = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
              } else if (aggregation === 'count') {
                value = numericValues.length;
              } else if (aggregation === 'median') {
                const sorted = [...numericValues].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                value = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
              } else {
                value = numericValues[0] || 0;
              }
            }
          }
        }
        
        return { name, value: value || 0, xKeys: group.xKeys }; // Store xKeys for grouped bars
      });

      // Apply sorting
      if (config.sortOrder === 'ascending') {
        result = result.sort((a, b) => a.value - b.value);
      } else if (config.sortOrder === 'descending') {
        result = result.sort((a, b) => b.value - a.value);
      } else {
        // Default: try to sort by name if numeric, otherwise alphabetically
        result = result.sort((a, b) => {
          const aNum = parseFloat(a.name);
          const bNum = parseFloat(b.name);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return a.name.localeCompare(b.name);
        });
      }

      return result;
    }

    // Single column charts (dimension only - count frequency)
    if (xCols.length > 0 && yCols.length === 0) {
      const xCol = xCols[0];
      const freq = {};
      workingData.forEach(row => {
        const key = getXAxisValue(row, xCol);
        if (key) {
          freq[key] = (freq[key] || 0) + 1;
        }
      });
      let result = Object.entries(freq)
        .map(([name, value]) => ({ name, value }));

      // Apply sorting
      if (config.sortOrder === 'ascending') {
        result = result.sort((a, b) => a.value - b.value);
      } else if (config.sortOrder === 'descending') {
        result = result.sort((a, b) => b.value - a.value);
      } else {
        result = result.sort((a, b) => b.value - a.value); // Default descending for frequency
      }

      return result.slice(0, 15);
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

  // Handle right-click context menu for sorting
  const handleChartLabelRightClick = (e, chartId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      chartId,
    });
  };

  // Handle label click for editing
  const handleLabelClick = (e, chartId, labelType, labelKey, currentValue) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLabel({
      chartId,
      type: labelType, // 'title', 'xAxis', 'yAxis', 'category', 'legend'
      key: labelKey, // For categories/legend: the original value
      value: currentValue || '',
      position: { x: e.clientX, y: e.clientY },
    });
  };

  // Save edited label
  const saveEditedLabel = (chartId, labelType, labelKey, newValue) => {
    setEditedLabels(prev => {
      const chartLabels = prev[chartId] || {};
      const updated = { ...chartLabels };
      
      if (labelType === 'title') {
        updated.title = newValue;
      } else if (labelType === 'xAxis') {
        updated.xAxis = newValue;
      } else if (labelType === 'yAxis') {
        updated.yAxis = newValue;
      } else if (labelType === 'category') {
        updated.categories = { ...(updated.categories || {}), [labelKey]: newValue };
      } else if (labelType === 'legend') {
        updated.legend = { ...(updated.legend || {}), [labelKey]: newValue };
      }
      
      return { ...prev, [chartId]: updated };
    });
    setEditingLabel(null);
  };

  // Get edited label value
  const getEditedLabel = (chartId, labelType, labelKey, defaultValue) => {
    const chartLabels = editedLabels[chartId];
    if (!chartLabels) return defaultValue;
    
    if (labelType === 'title') {
      return chartLabels.title !== undefined ? chartLabels.title : defaultValue;
    } else if (labelType === 'xAxis') {
      return chartLabels.xAxis !== undefined ? chartLabels.xAxis : defaultValue;
    } else if (labelType === 'yAxis') {
      return chartLabels.yAxis !== undefined ? chartLabels.yAxis : defaultValue;
    } else if (labelType === 'category') {
      return chartLabels.categories?.[labelKey] !== undefined 
        ? chartLabels.categories[labelKey] 
        : defaultValue;
    } else if (labelType === 'legend') {
      return chartLabels.legend?.[labelKey] !== undefined 
        ? chartLabels.legend[labelKey] 
        : defaultValue;
    }
    
    return defaultValue;
  };

  // Handle context menu selection
  const handleContextMenuAction = (action, chartId) => {
    if (action === 'sort-ascending') {
      updateChartConfig(chartId, { sortOrder: 'ascending' });
    } else if (action === 'sort-descending') {
      updateChartConfig(chartId, { sortOrder: 'descending' });
    } else if (action === 'clear-sorting') {
      updateChartConfig(chartId, { sortOrder: 'none' });
    }
    setContextMenu(null);
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Handle drag start
  const handleDragStart = (e, columnName) => {
    setDraggedField(columnName);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop on axis (updated for multiple dimensions and filters)
  const handleDrop = (e, chartId, axis) => {
    e.preventDefault();
    if (!draggedField) return;

    const columnInfo = getColumnInfo(draggedField);
    // Improved role assignment: numeric = measure, date/text = dimension
    // Use user override if exists, otherwise auto-detect
    let role = fieldRoles[draggedField];
    if (!role) {
      // Auto-assign based on type: numeric fields are measures, others are dimensions
      role = columnInfo.isNumeric ? 'measure' : 'dimension';
      // Initialize the role in state
      setFieldRoles(prev => ({ ...prev, [draggedField]: role }));
    }
    
    // Mode assignment: discrete for dimensions, continuous for measures
    const mode = fieldModes[draggedField] || (role === 'dimension' ? 'discrete' : 'continuous');
    if (!fieldModes[draggedField]) {
      setFieldModes(prev => ({ ...prev, [draggedField]: mode }));
    }

    const config = chartConfigs.find(c => c.id === chartId);
    if (!config) return;

    // Handle filters bucket
    if (axis === 'filters') {
      const existingFilters = config.filters || [];
      const filterExists = existingFilters.some(f => f.column === draggedField);
      
      if (!filterExists) {
        const colInfo = getColumnInfo(draggedField);
        let newFilter;
        
        if (colInfo.isDate || colInfo.isNumeric) {
          // Range filter for dates and numbers
          const minMax = colInfo.isNumeric ? getMinMaxValues(draggedField) : null;
          newFilter = {
            column: draggedField,
            type: role,
            filterType: 'range',
            minValue: colInfo.isNumeric ? minMax.min : null,
            maxValue: colInfo.isNumeric ? minMax.max : null,
            isDate: colInfo.isDate,
          };
        } else {
          // Multi-select filter for dimensions
          const uniqueValues = getUniqueValues(draggedField);
          newFilter = {
            column: draggedField,
            type: role,
            filterType: 'multi',
            values: [...uniqueValues], // Default to all values selected (copy array)
            isDate: false,
          };
        }
        updateChartConfig(chartId, { filters: [...existingFilters, newFilter] });
      }
      setDraggedField(null);
      return;
    }

    // Handle X, Y, Z axes with support for multiple dimensions
    const currentAxis = config[axis] || { columns: [], type: 'dimension', aggregation: 'none', label: '', showLabel: true };
    const currentColumns = Array.isArray(currentAxis.columns) ? currentAxis.columns : (currentAxis.column ? [currentAxis.column] : []);
    
    // Don't add if already exists
    if (currentColumns.includes(draggedField)) {
      setDraggedField(null);
      return;
    }

    // For dimensions dropped into measure slots (Y-axis), auto-apply COUNT
    if (axis === 'yAxis' && role === 'dimension' && !columnInfo.isDate) {
      role = 'measure'; // Treat as measure
      // Will use COUNT aggregation
    }

    // Determine aggregation
    let aggregation = 'none';
    if (axis === 'yAxis') {
      if (role === 'measure') {
        aggregation = columnInfo.isNumeric ? 'sum' : 'count';
      } else if (role === 'dimension' && !columnInfo.isDate) {
        aggregation = 'count'; // Dimension as measure
      }
    }

    // For date fields, set default hierarchy
    if (columnInfo.isDate && !dateHierarchies[draggedField]) {
      setDateHierarchies(prev => ({ ...prev, [draggedField]: 'month' }));
    }

    const axisUpdate = {
      columns: [...currentColumns, draggedField], // Add to array
      type: role,
      aggregation: aggregation,
      label: '',
      showLabel: true,
    };

    updateChartConfig(chartId, { [axis]: axisUpdate, enabled: true });
    setDraggedField(null);
  };

  // Remove field from axis (updated for multiple dimensions)
  const removeFieldFromAxis = (chartId, axis, columnToRemove) => {
    const config = chartConfigs.find(c => c.id === chartId);
    if (!config) return;

    if (axis === 'filters') {
      const currentFilters = config.filters || [];
      const updatedFilters = currentFilters.filter(f => f.column !== columnToRemove);
      updateChartConfig(chartId, { filters: updatedFilters });
      return;
    }

    const currentAxis = config[axis] || { columns: [], type: 'dimension', aggregation: 'none', label: '', showLabel: true };
    const currentColumns = Array.isArray(currentAxis.columns) ? currentAxis.columns : (currentAxis.column ? [currentAxis.column] : []);
    const updatedColumns = currentColumns.filter(col => col !== columnToRemove);
    
    const axisUpdate = {
      ...currentAxis,
      columns: updatedColumns,
    };

    updateChartConfig(chartId, { [axis]: axisUpdate });
  };

  // Toggle field role
  const toggleFieldRole = (columnName) => {
    const newRole = fieldRoles[columnName] === 'dimension' ? 'measure' : 'dimension';
    setFieldRoles(prev => ({
      ...prev,
      [columnName]: newRole,
    }));

    // Update chart configs that use this field
    setChartConfigs(prev => prev.map(config => {
      let updated = false;
      const updates = {};

      if (config.xAxis.column === columnName) {
        updates.xAxis = {
          ...config.xAxis,
          type: newRole,
          aggregation: newRole === 'measure' ? 'none' : 'none',
        };
        updated = true;
      }

      if (config.yAxis.column === columnName) {
        updates.yAxis = {
          ...config.yAxis,
          type: newRole,
          aggregation: newRole === 'measure' ? 'sum' : 'none',
        };
        updated = true;
      }

      return updated ? { ...config, ...updates } : config;
    }));
  };

  // Toggle field mode
  const toggleFieldMode = (columnName) => {
    setFieldModes(prev => ({
      ...prev,
      [columnName]: prev[columnName] === 'discrete' ? 'continuous' : 'discrete',
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
        // Mark chart as active when enabled
        if (newEnabled) {
          setActiveChartIds(prev => new Set([...prev, chartId]));
        }
        return { ...config, enabled: newEnabled };
      }
      return config;
    }));
  };

  // Navigate to next chart
  const moveToNextChart = () => {
    const nextIndex = currentChartIndex + 1;
    if (nextIndex < 40) {
      setCurrentChartIndex(nextIndex);
      const nextChartId = `chart-${nextIndex + 1}`;
      setExpandedChart(nextChartId);
      // Mark as active when navigating to it
      setActiveChartIds(prev => new Set([...prev, nextChartId]));
    }
  };

  // Navigate to previous chart
  const moveToPreviousChart = () => {
    if (currentChartIndex > 0) {
      const prevIndex = currentChartIndex - 1;
      setCurrentChartIndex(prevIndex);
      const prevChartId = `chart-${prevIndex + 1}`;
      setExpandedChart(prevChartId);
      // Mark as active
      setActiveChartIds(prev => new Set([...prev, prevChartId]));
    }
  };
  
  // Track chart configuration to mark as active
  useEffect(() => {
    chartConfigs.forEach(config => {
      if (config.xAxis.column || config.yAxis.column) {
        setActiveChartIds(prev => new Set([...prev, config.id]));
      }
    });
  }, [chartConfigs.map(c => c.xAxis.column + c.yAxis.column).join(',')]);

  // Get active charts only
  const getActiveCharts = () => {
    return chartConfigs.filter(config => activeChartIds.has(config.id) && config.enabled);
  };

  // Initialize icon library with common business icons
  useEffect(() => {
    // Common business/consulting icons (using Unicode/emoji as lightweight alternatives)
    const icons = [
      { id: 'arrow-up', name: 'Arrow Up', symbol: '↑', unicode: '↑' },
      { id: 'arrow-down', name: 'Arrow Down', symbol: '↓', unicode: '↓' },
      { id: 'arrow-right', name: 'Arrow Right', symbol: '→', unicode: '→' },
      { id: 'arrow-left', name: 'Arrow Left', symbol: '←', unicode: '←' },
      { id: 'check', name: 'Check Mark', symbol: '✓', unicode: '✓' },
      { id: 'cross', name: 'Cross', symbol: '✗', unicode: '✗' },
      { id: 'star', name: 'Star', symbol: '★', unicode: '★' },
      { id: 'growth', name: 'Growth', symbol: '📈', unicode: '📈' },
      { id: 'chart', name: 'Chart', symbol: '📊', unicode: '📊' },
      { id: 'people', name: 'People', symbol: '👥', unicode: '👥' },
      { id: 'lightbulb', name: 'Lightbulb', symbol: '💡', unicode: '💡' },
      { id: 'target', name: 'Target', symbol: '🎯', unicode: '🎯' },
      { id: 'money', name: 'Money', symbol: '💰', unicode: '💰' },
      { id: 'rocket', name: 'Rocket', symbol: '🚀', unicode: '🚀' },
      { id: 'shield', name: 'Shield', symbol: '🛡️', unicode: '🛡️' },
      { id: 'clock', name: 'Clock', symbol: '⏰', unicode: '⏰' },
      { id: 'trophy', name: 'Trophy', symbol: '🏆', unicode: '🏆' },
      { id: 'medal', name: 'Medal', symbol: '🏅', unicode: '🏅' },
      { id: 'fire', name: 'Fire', symbol: '🔥', unicode: '🔥' },
      { id: 'gem', name: 'Gem', symbol: '💎', unicode: '💎' },
    ];
    setIconLibrary(icons);
  }, []);
  
  // Mark chart as active when configured
  useEffect(() => {
    if (expandedChart && !activeChartIds.has(expandedChart)) {
      const config = chartConfigs.find(c => c.id === expandedChart);
      if (config && (config.xAxis.column || config.yAxis.column)) {
        setActiveChartIds(prev => new Set([...prev, expandedChart]));
      }
    }
  }, [expandedChart, chartConfigs]);

  // Handle dragging and resizing elements on slides
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingElement) {
        const slideIdx = pptSlides.findIndex(s => s.id === draggingElement.slideId);
        if (slideIdx === -1) return;
        const newSlides = [...pptSlides];
        const slide = newSlides[slideIdx];
        
        if (draggingElement.type === 'image' && slide.images) {
          const imgIdx = parseInt(draggingElement.elementId.split('-')[1]);
          const slideElement = document.getElementById(`preview-slide-${slide.id}`);
          if (slideElement) {
            const rect = slideElement.getBoundingClientRect();
            const img = slide.images[imgIdx];
            if (img) {
              img.x = Math.max(0, Math.min(rect.width - (img.width || 150), e.clientX - rect.left - draggingElement.offsetX));
              img.y = Math.max(0, Math.min(rect.height - (img.height || 150), e.clientY - rect.top - draggingElement.offsetY));
              setPptSlides(newSlides);
            }
          }
        } else if (draggingElement.type === 'icon' && slide.icons) {
          const iconIdx = parseInt(draggingElement.elementId.split('-')[1]);
          const slideElement = document.getElementById(`preview-slide-${slide.id}`);
          if (slideElement) {
            const rect = slideElement.getBoundingClientRect();
            const icon = slide.icons[iconIdx];
            if (icon) {
              if (!icon.x) icon.x = 0;
              if (!icon.y) icon.y = 0;
              if (!icon.width) icon.width = 80;
              if (!icon.height) icon.height = 80;
              icon.x = Math.max(0, Math.min(rect.width - (icon.width || 80), e.clientX - rect.left - draggingElement.offsetX));
              icon.y = Math.max(0, Math.min(rect.height - (icon.height || 80), e.clientY - rect.top - draggingElement.offsetY));
              setPptSlides(newSlides);
            }
          }
        }
      }
      
      if (resizingElement) {
        const slideIdx = pptSlides.findIndex(s => s.id === resizingElement.slideId);
        if (slideIdx === -1) return;
        const newSlides = [...pptSlides];
        const slide = newSlides[slideIdx];
        
        const deltaX = e.clientX - resizingElement.startX;
        const deltaY = e.clientY - resizingElement.startY;
        const newWidth = Math.max(50, resizingElement.startWidth + deltaX);
        const newHeight = Math.max(50, resizingElement.startHeight + deltaY);
        
        if (resizingElement.type === 'image' && slide.images) {
          const imgIdx = parseInt(resizingElement.elementId.split('-')[1]);
          const img = slide.images[imgIdx];
          if (img) {
            img.width = newWidth;
            img.height = newHeight;
            setPptSlides(newSlides);
          }
        } else if (resizingElement.type === 'icon' && slide.icons) {
          const iconIdx = parseInt(resizingElement.elementId.split('-')[1]);
          const icon = slide.icons[iconIdx];
          if (icon) {
            icon.width = newWidth;
            icon.height = newHeight;
            setPptSlides(newSlides);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingElement(null);
      setResizingElement(null);
    };

    if (draggingElement || resizingElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingElement, resizingElement, pptSlides]);

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
        if (targetRow < 1000 && targetCol < 20) {
          handleCellChange(targetRow, targetCol, cell.trim());
        }
      });
    });
  };

  const handleCellFocus = (rowIndex, colIndex) => {
    setActiveCell({ row: rowIndex, col: colIndex });
    if (!isDragging) {
      setSelectedCells([{ row: rowIndex, col: colIndex }]);
    }
  };

  // Excel-like interactions
  const handleCellMouseDown = (rowIndex, colIndex, e) => {
    if (e.shiftKey && activeCell.row !== -1) {
      // Multi-select with Shift
      const startRow = Math.min(activeCell.row, rowIndex);
      const endRow = Math.max(activeCell.row, rowIndex);
      const startCol = Math.min(activeCell.col, colIndex);
      const endCol = Math.max(activeCell.col, colIndex);
      const cells = [];
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          cells.push({ row: r, col: c });
        }
      }
      setSelectedCells(cells);
    } else {
      setActiveCell({ row: rowIndex, col: colIndex });
      setSelectedCells([{ row: rowIndex, col: colIndex }]);
      setIsDragging(true);
      setDragStartCell({ row: rowIndex, col: colIndex });
    }
  };

  const handleCellMouseEnter = (rowIndex, colIndex) => {
    if (isDraggingFill && fillStartCell) {
      // Visual feedback for drag fill
      const cells = [];
      const startRow = Math.min(fillStartCell.row, rowIndex);
      const endRow = Math.max(fillStartCell.row, rowIndex);
      const startCol = Math.min(fillStartCell.col, colIndex);
      const endCol = Math.max(fillStartCell.col, colIndex);
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r !== fillStartCell.row || c !== fillStartCell.col) {
            cells.push({ row: r, col: c });
          }
        }
      }
      setSelectedCells([{ row: fillStartCell.row, col: fillStartCell.col }, ...cells]);
    } else if (isDragging && dragStartCell) {
      const startRow = Math.min(dragStartCell.row, rowIndex);
      const endRow = Math.max(dragStartCell.row, rowIndex);
      const startCol = Math.min(dragStartCell.col, colIndex);
      const endCol = Math.max(dragStartCell.col, colIndex);
      const cells = [];
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          cells.push({ row: r, col: c });
        }
      }
      setSelectedCells(cells);
    }
  };

  const handleCellMouseUp = () => {
    if (isDraggingFill && fillStartCell && selectedCells.length > 1) {
      // Get the last selected cell (the target)
      const targetCell = selectedCells[selectedCells.length - 1];
      if (targetCell.row !== fillStartCell.row || targetCell.col !== fillStartCell.col) {
        handleDragFill(fillStartCell.row, fillStartCell.col, targetCell.row, targetCell.col);
      }
      setIsDraggingFill(false);
      setFillStartCell(null);
      setSelectedCells([{ row: fillStartCell.row, col: fillStartCell.col }]);
    }
    setIsDragging(false);
    setDragStartCell(null);
  };

  // Copy selected cells
  const handleCopy = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (selectedCells.length > 0) {
        const sortedCells = [...selectedCells].sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.col - b.col;
        });
        const minRow = Math.min(...sortedCells.map(c => c.row));
        const minCol = Math.min(...sortedCells.map(c => c.col));
        const maxRow = Math.max(...sortedCells.map(c => c.row));
        const maxCol = Math.max(...sortedCells.map(c => c.col));
        
        const data = [];
        for (let r = minRow; r <= maxRow; r++) {
          const row = [];
          for (let c = minCol; c <= maxCol; c++) {
            row.push(gridData[r]?.[c] || '');
          }
          data.push(row);
        }
        
        const text = data.map(row => row.join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        setCopiedCells({ data, startRow: minRow, startCol: minCol });
        e.preventDefault();
      }
    }
  };

  // Paste cells
  const handlePasteCells = (startRow, startCol) => {
    if (copiedCells) {
      const newData = [...gridData];
      copiedCells.data.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          const targetRow = startRow + rowIdx;
          const targetCol = startCol + colIdx;
          if (targetRow < 1000 && targetCol < 20) {
            if (!newData[targetRow]) newData[targetRow] = Array(20).fill('');
            newData[targetRow][targetCol] = cell;
          }
        });
      });
      setGridData(newData);
    }
  };

  // Drag-fill functionality
  const handleDragFill = (sourceRow, sourceCol, targetRow, targetCol) => {
    const sourceValue = gridData[sourceRow]?.[sourceCol] || '';
    const newData = [...gridData];
    
    // Detect pattern
    const isNumber = !isNaN(parseFloat(sourceValue)) && isFinite(sourceValue);
    const isDate = !isNaN(Date.parse(sourceValue));
    const textMatch = sourceValue.match(/^([A-Za-z]+)(\d+)$/);
    
    if (isNumber) {
      const num = parseFloat(sourceValue);
      const rowDiff = targetRow - sourceRow;
      const colDiff = targetCol - sourceCol;
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      const increment = rowDiff !== 0 ? (gridData[sourceRow + 1]?.[sourceCol] ? parseFloat(gridData[sourceRow + 1][sourceCol]) - num : 1) : 
                       (gridData[sourceRow]?.[sourceCol + 1] ? parseFloat(gridData[sourceRow][sourceCol + 1]) - num : 1);
      
      for (let i = 1; i <= steps; i++) {
        const r = sourceRow + (rowDiff > 0 ? i : rowDiff < 0 ? -i : 0);
        const c = sourceCol + (colDiff > 0 ? i : colDiff < 0 ? -i : 0);
        if (r < 1000 && c < 20) {
          if (!newData[r]) newData[r] = Array(20).fill('');
          newData[r][c] = String(num + (increment * i));
        }
      }
    } else if (textMatch) {
      const [, prefix, numStr] = textMatch;
      const num = parseInt(numStr);
      const rowDiff = targetRow - sourceRow;
      const colDiff = targetCol - sourceCol;
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      
      for (let i = 1; i <= steps; i++) {
        const r = sourceRow + (rowDiff > 0 ? i : rowDiff < 0 ? -i : 0);
        const c = sourceCol + (colDiff > 0 ? i : colDiff < 0 ? -i : 0);
        if (r < 1000 && c < 20) {
          if (!newData[r]) newData[r] = Array(20).fill('');
          newData[r][c] = `${prefix}${num + i}`;
        }
      }
    } else {
      // Fill with same value
      const rowDiff = targetRow - sourceRow;
      const colDiff = targetCol - sourceCol;
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      
      for (let i = 1; i <= steps; i++) {
        const r = sourceRow + (rowDiff > 0 ? i : rowDiff < 0 ? -i : 0);
        const c = sourceCol + (colDiff > 0 ? i : colDiff < 0 ? -i : 0);
        if (r < 1000 && c < 20) {
          if (!newData[r]) newData[r] = Array(20).fill('');
          newData[r][c] = sourceValue;
        }
      }
    }
    
    setGridData(newData);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Arrow key navigation (only when not typing in input or when input is empty)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const activeInput = document.activeElement;
        if (activeInput && activeInput.classList.contains('grid-cell')) {
          // If input has no value or cursor is at start/end, allow navigation
          const inputValue = activeInput.value || '';
          const selectionStart = activeInput.selectionStart || 0;
          const selectionEnd = activeInput.selectionEnd || 0;
          const isAtStart = selectionStart === 0 && selectionEnd === 0;
          const isAtEnd = selectionStart === inputValue.length && selectionEnd === inputValue.length;
          
          if (!inputValue || isAtStart || isAtEnd) {
            e.preventDefault();
            let newRow = activeCell.row;
            let newCol = activeCell.col;
            
            if (e.key === 'ArrowUp' && newRow > 0) {
              newRow--;
            } else if (e.key === 'ArrowDown' && newRow < 999) {
              newRow++;
            } else if (e.key === 'ArrowLeft' && newCol > 0) {
              newCol--;
            } else if (e.key === 'ArrowRight' && newCol < 19) {
              newCol++;
            }
            
            setActiveCell({ row: newRow, col: newCol });
            setSelectedCells([{ row: newRow, col: newCol }]);
            
            // Focus the new cell
            setTimeout(() => {
              const nextCell = document.getElementById(`cell-${newRow}-${newCol}`);
              if (nextCell) {
                nextCell.focus();
                if (nextCell.value) {
                  nextCell.setSelectionRange(nextCell.value.length, nextCell.value.length);
                }
              }
            }, 10);
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        handleCopy(e);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (copiedCells && activeCell.row !== -1) {
          handlePasteCells(activeCell.row, activeCell.col);
          e.preventDefault();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        handleCopy(e);
        if (selectedCells.length > 0) {
          const newData = [...gridData];
          selectedCells.forEach(({ row, col }) => {
            if (newData[row]) newData[row][col] = '';
          });
          setGridData(newData);
        }
        e.preventDefault();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeInput = document.activeElement;
        if (activeInput && activeInput.classList.contains('grid-cell')) {
          // If input is focused, let it handle backspace/delete normally
          return;
        }
        if (selectedCells.length > 0) {
          const newData = [...gridData];
          selectedCells.forEach(({ row, col }) => {
            if (newData[row]) newData[row][col] = '';
          });
          setGridData(newData);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCells, copiedCells, activeCell, gridData]);

  const clearGrid = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setGridData(Array(1000).fill(null).map(() => Array(20).fill('')));
      setAnnotations({});
      setChartConfigs(Array(40).fill(null).map((_, idx) => ({
        id: `chart-${idx + 1}`,
        enabled: false,
        chartType: 'bar',
        xAxis: { columns: [], type: 'dimension', aggregation: 'none', label: '', showLabel: true },
        yAxis: { columns: [], type: 'measure', aggregation: 'sum', label: '', showLabel: true },
        zAxis: { columns: [], type: 'dimension', aggregation: 'none', label: '', showLabel: true },
        filters: [],
        title: '',
        showTitle: true,
        error: null,
        sortOrder: 'none',
        appearance: {
          fontSize: 'medium',
          customFontSize: 14,
          fontColor: '#000000',
          colors: COLORS,
          useMultiColor: true,
          legendPosition: 'bottom',
          legendFontSize: 12,
          legendFontColor: '#000000',
          showLegend: true,
          showDataLabels: true, // Default to true to show labels on bars
          barThickness: 20,
          lineThickness: 2,
          opacity: 1,
        },
      })));
      setShowCustomization({});
      setFieldRoles({});
      setFieldModes({});
      setContextMenu(null);
      setEditedLabels({});
      setEditingLabel(null);
      setDateHierarchies({});
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
    const appearance = config.appearance || {};
    const fontSize = appearance.fontSize === 'small' ? 12 : appearance.fontSize === 'large' ? 16 : appearance.customFontSize || 14;
    
    // Get edited labels or use defaults
    const editedTitle = getEditedLabel(config.id, 'title', '', config.title || chartTitle);
    const xAxisLabel = getEditedLabel(config.id, 'xAxis', '', config.xAxis.label || config.xAxis.column || '');
    const yAxisLabel = getEditedLabel(config.id, 'yAxis', '', config.yAxis.label || config.yAxis.column || '');
    const colors = appearance.useMultiColor ? (appearance.colors || COLORS) : [appearance.colors?.[0] || COLORS[0]];

    // Apply edited category labels to data
    const dataWithEditedLabels = data.map(item => ({
      ...item,
      name: getEditedLabel(config.id, 'category', item.name, item.name),
    }));

    // For table charts, use different rendering (no chart container wrapper)
    if (config.chartType === 'table') {
      const xCols = Array.isArray(config.xAxis.columns) ? config.xAxis.columns : (config.xAxis.column ? [config.xAxis.column] : []);
      const yCols = Array.isArray(config.yAxis.columns) ? config.yAxis.columns : (config.yAxis.column ? [config.yAxis.column] : []);
      const allColumns = [...xCols, ...yCols];
      
      if (allColumns.length === 0) {
        return (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Add fields to X or Y axis to generate table</p>
            </div>
          </div>
        );
      }

      // Get filtered raw data for table (not aggregated chart data)
      const filteredData = applyFilters(chartData, config.filters || []);
      
      // Remove duplicate columns - ensure each column appears only once
      const uniqueColumns = Array.from(new Set(allColumns));
      
      // Handle date hierarchies for date columns
      const getCellValue = (row, col) => {
        const colInfo = getColumnInfo(col);
        const rawValue = row[col];
        
        if (colInfo.isDate && rawValue) {
          const parsedDate = parseDate(rawValue);
          if (parsedDate) {
            const hierarchy = dateHierarchies[col] || 'month';
            return getDateHierarchy(parsedDate, hierarchy);
          }
        }
        
        return rawValue !== null && rawValue !== undefined ? String(rawValue) : '';
      };

      return (
        <div id={`chart-${config.id}`} className="chart-container w-full h-full">
          <div className="w-full h-full overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px' }}>
            <table className="min-w-full border-collapse bg-white">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  {uniqueColumns.map((col, idx) => (
                    <th
                      key={`header-${idx}-${col}`}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 whitespace-nowrap min-w-[120px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={uniqueColumns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                      No data available after filtering
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, rowIdx) => (
                    <tr
                      key={`row-${rowIdx}`}
                      className={`${rowIdx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                    >
                      {uniqueColumns.map((col, colIdx) => {
                        const cellValue = getCellValue(row, col);
                        return (
                          <td
                            key={`cell-${rowIdx}-${colIdx}-${col}`}
                            className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap align-top"
                          >
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Calculate chart dimensions for scrollbars (for non-table charts)
    const labelOptions = xAxisLabelOptions[config.id] || { reduceFont: false, horizontalScroll: false, skipLabels: 0 };
    const needsHorizontalScroll = (data.length > 20 && (config.chartType === 'bar' || config.chartType === 'line' || config.chartType === 'area')) || labelOptions.horizontalScroll;
    const chartWidth = needsHorizontalScroll ? Math.max(800, data.length * 40) : '100%';
    const chartHeight = 250;

    // Check if we're editing this chart's title
    const isEditingTitle = editingLabel?.chartId === config.id && editingLabel?.type === 'title';

    return (
      <div id={`chart-${config.id}`} className="chart-container">
        <div 
          className="relative"
          style={{ 
            width: '100%', 
            height: `${chartHeight}px`,
            overflow: needsHorizontalScroll ? 'auto' : 'visible'
          }}
          onContextMenu={(e) => {
            // Only show context menu if clicking on chart area (not on controls)
            if (e.target.closest('.chart-container') || e.target.closest('.recharts-wrapper')) {
              handleChartLabelRightClick(e, config.id);
            }
          }}
        >
          <div style={{ minWidth: needsHorizontalScroll ? chartWidth : '100%', height: '100%' }}>
            {config.chartType === 'heatmap' ? (
              <div className="w-full h-full">
                {(() => {
                  const xCols = Array.isArray(config.xAxis.columns) ? config.xAxis.columns : (config.xAxis.column ? [config.xAxis.column] : []);
                  const yCols = Array.isArray(config.yAxis.columns) ? config.yAxis.columns : (config.yAxis.column ? [config.yAxis.column] : []);
                  
                  if (xCols.length === 0 || yCols.length === 0 || data.length === 0) {
                    return (
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Add fields to X and Y axes to generate heatmap</p>
                        </div>
                      </div>
                    );
                  }

                  const values = data.map(d => parseFloat(d.value) || 0);
                  const minValue = Math.min(...values);
                  const maxValue = Math.max(...values);
                  const range = maxValue - minValue || 1;

                  const getColor = (value) => {
                    const normalized = (value - minValue) / range;
                    if (normalized < 0.5) {
                      const ratio = normalized * 2;
                      const r = Math.round(ratio * 255);
                      const g = 255;
                      const b = Math.round((1 - ratio) * 100);
                      return `rgb(${r}, ${g}, ${b})`;
                    } else {
                      const ratio = (normalized - 0.5) * 2;
                      const r = 255;
                      const g = Math.round((1 - ratio) * 255);
                      const b = 0;
                      return `rgb(${r}, ${g}, ${b})`;
                    }
                  };

                  return (
                    <>
                      <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart data={dataWithEditedLabels} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={150}
                            tick={{ fontSize: fontSize, fill: appearance.fontColor || '#000000' }}
                          />
                          <Tooltip 
                            contentStyle={{ fontSize: `${fontSize}px` }}
                            formatter={(value) => [value, 'Value']}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[0, 4, 4, 0]}
                          >
                            {dataWithEditedLabels.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                            ))}
                            {appearance.showDataLabels && (
                              <LabelList 
                                dataKey="value" 
                                position="right" 
                                style={{ fontSize: `${fontSize}px`, fill: appearance.fontColor || '#000000' }} 
                              />
                            )}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-gray-600">Low:</span>
                        <div className="flex-1 h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded"></div>
                        <span className="text-gray-600">High:</span>
                        <span className="font-semibold">{minValue.toFixed(2)}</span>
                        <span className="text-gray-400">-</span>
                        <span className="font-semibold">{maxValue.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={chartHeight}>
          {config.chartType === 'bar' && (
            <BarChart data={dataWithEditedLabels}>
              <XAxis 
                dataKey="name" 
                label={config.xAxis.showLabel ? { 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: 10, 
                  style: { fontSize: `${fontSize}px`, fill: appearance.fontColor || '#000000', cursor: 'pointer' },
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLabelClick(e, config.id, 'xAxis', '', xAxisLabel);
                  }
                } : undefined}
                tick={(props) => {
                  const { x, y, payload, index } = props;
                  const edited = getEditedLabel(config.id, 'category', payload.value, payload.value);
                  const isEditing = editingLabel?.chartId === config.id && editingLabel?.type === 'category' && editingLabel?.key === payload.value;
                  
                  const labelOptions = xAxisLabelOptions[config.id] || { reduceFont: false, horizontalScroll: false, skipLabels: 0 };
                  const effectiveFontSize = labelOptions.reduceFont ? Math.max(8, fontSize * 0.7) : fontSize;
                  const skipEveryN = labelOptions.skipLabels || 0;
                  const shouldShowLabel = skipEveryN === 0 || index % (skipEveryN + 1) === 0;
                  
                  if (!shouldShowLabel) return null;
                  
                  if (isEditing) {
                    return (
                      <foreignObject x={x - 50} y={y + 10} width="100" height="20">
                        <input
                          type="text"
                          value={editingLabel.value}
                          onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                          onBlur={() => saveEditedLabel(config.id, 'category', payload.value, editingLabel.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedLabel(config.id, 'category', payload.value, editingLabel.value);
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border-2 border-blue-500 rounded"
                          style={{ fontSize: `${effectiveFontSize}px` }}
                        />
                      </foreignObject>
                    );
                  }
                  
                  return (
                    <Text
                      x={x}
                      y={y + 15}
                      dy={5}
                      textAnchor={data.length > 10 ? 'end' : 'middle'}
                      angle={data.length > 10 ? -45 : 0}
                      fontSize={effectiveFontSize}
                      fill={appearance.fontColor || '#000000'}
                      cursor="pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLabelClick(e, config.id, 'category', payload.value, edited);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleChartLabelRightClick(e, config.id);
                      }}
                    >
                      {edited}
                    </Text>
                  );
                }}
                height={data.length > 10 ? 100 : 50}
              />
              <YAxis 
                label={config.yAxis.showLabel ? { 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: `${fontSize}px`, fill: appearance.fontColor || '#000000', cursor: 'pointer' },
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLabelClick(e, config.id, 'yAxis', '', yAxisLabel);
                  }
                } : undefined}
                tick={{ fontSize: fontSize, fill: appearance.fontColor || '#000000' }}
              />
              <Tooltip 
                contentStyle={{ fontSize: `${fontSize}px` }}
                labelFormatter={(value) => {
                  const originalValue = data.find(d => getEditedLabel(config.id, 'category', d.name, d.name) === value)?.name || value;
                  return getEditedLabel(config.id, 'category', originalValue, value);
                }}
              />
              {appearance.showLegend && (
                <Legend 
                  wrapperStyle={{ fontSize: `${appearance.legendFontSize || 12}px`, color: appearance.legendFontColor || '#000000' }}
                  verticalAlign={appearance.legendPosition === 'top' ? 'top' : appearance.legendPosition === 'bottom' ? 'bottom' : appearance.legendPosition === 'left' ? 'left' : 'right'}
                />
              )}
              <Bar 
                dataKey="value" 
                fill={colors[0]} 
                fillOpacity={appearance.opacity || 1}
                barSize={appearance.barThickness || 20}
              >
                {appearance.showDataLabels && (
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    style={{ fontSize: `${fontSize}px`, fill: appearance.fontColor || '#000000' }} 
                  />
                )}
              </Bar>
            </BarChart>
          )}
          {config.chartType === 'pie' && (
            <RechartsPieChart>
              <Pie
                data={dataWithEditedLabels}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={appearance.showDataLabels ? ({ name, percent }) => {
                  const originalValue = data.find(d => getEditedLabel(config.id, 'category', d.name, d.name) === name)?.name || name;
                  const editedName = getEditedLabel(config.id, 'category', originalValue, name);
                  return `${editedName}: ${(percent * 100).toFixed(0)}%`;
                } : false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dataWithEditedLabels.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} opacity={appearance.opacity || 1} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ fontSize: `${fontSize}px` }}
                labelFormatter={(value) => {
                  const originalValue = data.find(d => getEditedLabel(config.id, 'category', d.name, d.name) === value)?.name || value;
                  return getEditedLabel(config.id, 'category', originalValue, value);
                }}
              />
              {appearance.showLegend && (
                <Legend 
                  wrapperStyle={{ fontSize: `${appearance.legendFontSize || 12}px`, color: appearance.legendFontColor || '#000000', cursor: 'pointer' }}
                  verticalAlign={appearance.legendPosition === 'top' ? 'top' : appearance.legendPosition === 'bottom' ? 'bottom' : appearance.legendPosition === 'left' ? 'left' : 'right'}
                  formatter={(value) => {
                    const originalValue = data.find(d => getEditedLabel(config.id, 'category', d.name, d.name) === value)?.name || value;
                    return getEditedLabel(config.id, 'category', originalValue, value);
                  }}
                />
              )}
            </RechartsPieChart>
          )}
          {config.chartType === 'line' && (
            <RechartsLineChart data={dataWithEditedLabels}>
              <XAxis 
                dataKey="name" 
                label={config.xAxis.showLabel ? ({ viewBox }) => {
                  const isEditing = editingLabel?.chartId === config.id && editingLabel?.type === 'xAxis';
                  if (isEditing) {
                    return (
                      <foreignObject x={viewBox.x + viewBox.width / 2 - 50} y={viewBox.y + viewBox.height - 15} width="100" height="20">
                        <input
                          type="text"
                          value={editingLabel.value}
                          onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                          onBlur={() => saveEditedLabel(config.id, 'xAxis', '', editingLabel.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedLabel(config.id, 'xAxis', '', editingLabel.value);
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border-2 border-blue-500 rounded text-center"
                          style={{ fontSize: `${fontSize}px` }}
                        />
                      </foreignObject>
                    );
                  }
                  return (
                    <text
                      x={viewBox.x + viewBox.width / 2}
                      y={viewBox.y + viewBox.height + 5}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill={appearance.fontColor || '#000000'}
                      cursor="pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLabelClick(e, config.id, 'xAxis', '', xAxisLabel);
                      }}
                    >
                      {xAxisLabel}
                    </text>
                  );
                } : undefined}
                tick={(props) => {
                  const { x, y, payload, index } = props;
                  const edited = getEditedLabel(config.id, 'category', payload.value, payload.value);
                  const isEditing = editingLabel?.chartId === config.id && editingLabel?.type === 'category' && editingLabel?.key === payload.value;
                  
                  const labelOptions = xAxisLabelOptions[config.id] || { reduceFont: false, horizontalScroll: false, skipLabels: 0 };
                  const effectiveFontSize = labelOptions.reduceFont ? Math.max(8, fontSize * 0.7) : fontSize;
                  const skipEveryN = labelOptions.skipLabels || 0;
                  const shouldShowLabel = skipEveryN === 0 || index % (skipEveryN + 1) === 0;
                  
                  if (!shouldShowLabel) return null;
                  
                  if (isEditing) {
                    return (
                      <foreignObject x={x - 50} y={y + 10} width="100" height="20">
                        <input
                          type="text"
                          value={editingLabel.value}
                          onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                          onBlur={() => saveEditedLabel(config.id, 'category', payload.value, editingLabel.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedLabel(config.id, 'category', payload.value, editingLabel.value);
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border-2 border-blue-500 rounded"
                          style={{ fontSize: `${effectiveFontSize}px` }}
                        />
                      </foreignObject>
                    );
                  }
                  
                  return (
                    <Text
                      x={x}
                      y={y + 15}
                      dy={5}
                      textAnchor={data.length > 10 ? 'end' : 'middle'}
                      angle={data.length > 10 ? -45 : 0}
                      fontSize={effectiveFontSize}
                      fill={appearance.fontColor || '#000000'}
                      cursor="pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLabelClick(e, config.id, 'category', payload.value, edited);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleChartLabelRightClick(e, config.id);
                      }}
                    >
                      {edited}
                    </Text>
                  );
                }}
                height={data.length > 10 ? 100 : 50}
              />
              <YAxis 
                label={config.yAxis.showLabel ? ({ viewBox }) => {
                  const isEditing = editingLabel?.chartId === config.id && editingLabel?.type === 'yAxis';
                  if (isEditing) {
                    return (
                      <foreignObject x={viewBox.x + 5} y={viewBox.y + viewBox.height / 2 - 10} width="100" height="20">
                        <input
                          type="text"
                          value={editingLabel.value}
                          onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                          onBlur={() => saveEditedLabel(config.id, 'yAxis', '', editingLabel.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedLabel(config.id, 'yAxis', '', editingLabel.value);
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border-2 border-blue-500 rounded"
                          style={{ fontSize: `${fontSize}px` }}
                        />
                      </foreignObject>
                    );
                  }
                  return (
                    <text
                      x={viewBox.x + 15}
                      y={viewBox.y + viewBox.height / 2}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill={appearance.fontColor || '#000000'}
                      cursor="pointer"
                      transform={`rotate(-90, ${viewBox.x + 15}, ${viewBox.y + viewBox.height / 2})`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLabelClick(e, config.id, 'yAxis', '', yAxisLabel);
                      }}
                    >
                      {yAxisLabel}
                    </text>
                  );
                } : undefined}
                tick={{ fontSize: fontSize, fill: appearance.fontColor || '#000000' }}
              />
              <Tooltip 
                contentStyle={{ fontSize: `${fontSize}px` }}
                labelFormatter={(value) => {
                  const originalValue = data.find(d => getEditedLabel(config.id, 'category', d.name, d.name) === value)?.name || value;
                  return getEditedLabel(config.id, 'category', originalValue, value);
                }}
              />
              {appearance.showLegend && (
                <Legend 
                  wrapperStyle={{ fontSize: `${appearance.legendFontSize || 12}px`, color: appearance.legendFontColor || '#000000' }}
                  verticalAlign={appearance.legendPosition === 'top' ? 'top' : appearance.legendPosition === 'bottom' ? 'bottom' : appearance.legendPosition === 'left' ? 'left' : 'right'}
                />
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                strokeWidth={appearance.lineThickness || 2}
                strokeOpacity={appearance.opacity || 1}
              >
                {appearance.showDataLabels && (
                  <LabelList dataKey="value" position="top" style={{ fontSize: `${fontSize}px`, fill: appearance.fontColor || '#000000' }} />
                )}
              </Line>
            </RechartsLineChart>
          )}
          {config.chartType === 'area' && (
            <RechartsAreaChart data={dataWithEditedLabels}>
              <XAxis 
                dataKey="name" 
                label={config.xAxis.showLabel ? ({ viewBox }) => {
                  const isEditing = editingLabel?.chartId === config.id && editingLabel?.type === 'xAxis';
                  if (isEditing) {
                    return (
                      <foreignObject x={viewBox.x + viewBox.width / 2 - 50} y={viewBox.y + viewBox.height - 15} width="100" height="20">
                        <input
                          type="text"
                          value={editingLabel.value}
                          onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                          onBlur={() => saveEditedLabel(config.id, 'xAxis', '', editingLabel.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedLabel(config.id, 'xAxis', '', editingLabel.value);
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border-2 border-blue-500 rounded text-center"
                          style={{ fontSize: `${fontSize}px` }}
                        />
                      </foreignObject>
                    );
                  }
                  return (
                    <text
                      x={viewBox.x + viewBox.width / 2}
                      y={viewBox.y + viewBox.height + 5}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill={appearance.fontColor || '#000000'}
                      cursor="pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLabelClick(e, config.id, 'xAxis', '', xAxisLabel);
                      }}
                    >
                      {xAxisLabel}
                    </text>
                  );
                } : undefined}
                tick={(props) => {
                  const { x, y, payload, index } = props;
                  const edited = getEditedLabel(config.id, 'category', payload.value, payload.value);
                  const isEditing = editingLabel?.chartId === config.id && editingLabel?.type === 'category' && editingLabel?.key === payload.value;
                  
                  const labelOptions = xAxisLabelOptions[config.id] || { reduceFont: false, horizontalScroll: false, skipLabels: 0 };
                  const effectiveFontSize = labelOptions.reduceFont ? Math.max(8, fontSize * 0.7) : fontSize;
                  const skipEveryN = labelOptions.skipLabels || 0;
                  const shouldShowLabel = skipEveryN === 0 || index % (skipEveryN + 1) === 0;
                  
                  if (!shouldShowLabel) return null;
                  
                  if (isEditing) {
                    return (
                      <foreignObject x={x - 50} y={y + 10} width="100" height="20">
                        <input
                          type="text"
                          value={editingLabel.value}
                          onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                          onBlur={() => saveEditedLabel(config.id, 'category', payload.value, editingLabel.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedLabel(config.id, 'category', payload.value, editingLabel.value);
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border-2 border-blue-500 rounded"
                          style={{ fontSize: `${effectiveFontSize}px` }}
                        />
                      </foreignObject>
                    );
                  }
                  
                  return (
                    <Text
                      x={x}
                      y={y + 15}
                      dy={5}
                      textAnchor={data.length > 10 ? 'end' : 'middle'}
                      angle={data.length > 10 ? -45 : 0}
                      fontSize={effectiveFontSize}
                      fill={appearance.fontColor || '#000000'}
                      cursor="pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLabelClick(e, config.id, 'category', payload.value, edited);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleChartLabelRightClick(e, config.id);
                      }}
                    >
                      {edited}
                    </Text>
                  );
                }}
                height={data.length > 10 ? 100 : 50}
              />
              <YAxis 
                label={config.yAxis.showLabel ? ({ viewBox }) => {
                  const isEditing = editingLabel?.chartId === config.id && editingLabel?.type === 'yAxis';
                  if (isEditing) {
                    return (
                      <foreignObject x={viewBox.x + 5} y={viewBox.y + viewBox.height / 2 - 10} width="100" height="20">
                        <input
                          type="text"
                          value={editingLabel.value}
                          onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                          onBlur={() => saveEditedLabel(config.id, 'yAxis', '', editingLabel.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedLabel(config.id, 'yAxis', '', editingLabel.value);
                            } else if (e.key === 'Escape') {
                              setEditingLabel(null);
                            }
                          }}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border-2 border-blue-500 rounded"
                          style={{ fontSize: `${fontSize}px` }}
                        />
                      </foreignObject>
                    );
                  }
                  return (
                    <text
                      x={viewBox.x + 15}
                      y={viewBox.y + viewBox.height / 2}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill={appearance.fontColor || '#000000'}
                      cursor="pointer"
                      transform={`rotate(-90, ${viewBox.x + 15}, ${viewBox.y + viewBox.height / 2})`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLabelClick(e, config.id, 'yAxis', '', yAxisLabel);
                      }}
                    >
                      {yAxisLabel}
                    </text>
                  );
                } : undefined}
                tick={{ fontSize: fontSize, fill: appearance.fontColor || '#000000' }}
              />
              <Tooltip 
                contentStyle={{ fontSize: `${fontSize}px` }}
                labelFormatter={(value) => {
                  const originalValue = data.find(d => getEditedLabel(config.id, 'category', d.name, d.name) === value)?.name || value;
                  return getEditedLabel(config.id, 'category', originalValue, value);
                }}
              />
              {appearance.showLegend && (
                <Legend 
                  wrapperStyle={{ fontSize: `${appearance.legendFontSize || 12}px`, color: appearance.legendFontColor || '#000000' }}
                  verticalAlign={appearance.legendPosition === 'top' ? 'top' : appearance.legendPosition === 'bottom' ? 'bottom' : appearance.legendPosition === 'left' ? 'left' : 'right'}
                />
              )}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                fill={colors[0]} 
                fillOpacity={(appearance.opacity || 1) * 0.6}
                strokeWidth={appearance.lineThickness || 2}
              >
                {appearance.showDataLabels && (
                  <LabelList dataKey="value" position="top" style={{ fontSize: `${fontSize}px`, fill: appearance.fontColor || '#000000' }} />
                )}
              </Area>
            </RechartsAreaChart>
          )}
            </ResponsiveContainer>
            )}
          </div>
          
          {/* Chart Title - Below Chart, Centered (NOT for table charts) */}
          {config.showTitle && config.chartType !== 'table' && (
            <div className="mt-4 text-center">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editingLabel.value}
                  onChange={(e) => setEditingLabel({ ...editingLabel, value: e.target.value })}
                  onBlur={() => saveEditedLabel(config.id, 'title', '', editingLabel.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEditedLabel(config.id, 'title', '', editingLabel.value);
                    } else if (e.key === 'Escape') {
                      setEditingLabel(null);
                    }
                  }}
                  autoFocus
                  className="text-sm font-semibold px-2 py-1 mx-auto text-center border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  style={{ color: appearance.fontColor || '#000000', fontSize: `${fontSize}px` }}
                />
              ) : (
                <h4 
                  className="text-sm font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors inline-block" 
                  style={{ color: appearance.fontColor || '#000000', fontSize: `${fontSize}px` }}
                  onClick={(e) => handleLabelClick(e, config.id, 'title', '', editedTitle)}
                  title="Click to edit title"
                >
                  {editedTitle}
                </h4>
              )}
            </div>
          )}
          
          {/* Editable Label Overlay */}
          {editingLabel && editingLabel.chartId === config.id && editingLabel.type !== 'title' && (
            <EditableLabelOverlay
              editingLabel={editingLabel}
              onSave={(newValue) => saveEditedLabel(editingLabel.chartId, editingLabel.type, editingLabel.key, newValue)}
              onCancel={() => setEditingLabel(null)}
              position={editingLabel.position}
            />
          )}
        </div>
      </div>
    );
  };

  // Editable Label Overlay Component
  const EditableLabelOverlay = ({ editingLabel, onSave, onCancel, position }) => {
    const [value, setValue] = useState(editingLabel.value);
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, []);

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onSave(value);
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (!position) {
      // If no position provided, center it
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => onSave(value)}
              onKeyDown={handleKeyDown}
              className="px-3 py-2 border-2 border-blue-500 rounded text-sm"
              style={{ minWidth: '200px' }}
            />
            <div className="text-xs text-gray-500 mt-2">Press Enter to save, Escape to cancel</div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="fixed z-50 bg-white p-2 rounded-lg shadow-lg border-2 border-blue-500"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onSave(value)}
          onKeyDown={handleKeyDown}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          style={{ minWidth: '150px' }}
        />
        <div className="text-xs text-gray-500 mt-1">Enter to save, Esc to cancel</div>
      </div>
    );
  };

  const availableColumns = getAvailableColumns();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Rich Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl mb-8 overflow-hidden">
            <div className="p-8 md:p-12 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-10 w-10 md:h-12 md:w-12" />
                    <h1 className="text-3xl md:text-5xl font-bold">Sam's Smart Reports Pro</h1>
                  </div>
                  <p className="text-lg md:text-xl text-blue-100 mb-6">Transform your data into professional dashboards</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-sm font-medium">Chart Builder</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <FileSpreadsheet className="h-5 w-5" />
                      <span className="text-sm font-medium">Data Tables</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Download className="h-5 w-5" />
                      <span className="text-sm font-medium">PPT Export</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">{availableColumns.length}</div>
                      <div className="text-sm text-blue-100">Columns Detected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot at Top - First Step */}
          {showChatbot && (
            <div 
              ref={chatbotRef}
              className="bg-white rounded-xl shadow-xl border border-gray-200 mb-8 flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Chart Builder Assistant - Your First Step</h3>
                </div>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                {chatbotMessages.length === 0 && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold mb-2 text-blue-900">👋 Welcome to Sam's Smart Reports Pro!</p>
                    <p className="mb-3 text-gray-700">I'm your Chart Builder Assistant. Let's get started:</p>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-gray-600">
                      <li><strong>Step 1:</strong> Paste or enter your data into the table below</li>
                      <li><strong>Step 2:</strong> I'll help you drag dimensions to build charts</li>
                      <li><strong>Step 3:</strong> Guide you to drag charts to the dashboard canvas</li>
                      <li><strong>Step 4:</strong> Assist in exporting to PPT</li>
                    </ol>
                    <p className="mt-3 text-xs text-gray-500 italic">I'm focused on helping you build charts, format dashboards, and export to PPT. Ask me anything about these features!</p>
                  </div>
                )}
                {chatbotMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {chatbotLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 p-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!chatbotInput.trim() || chatbotLoading) return;

                    const userMessage = chatbotInput.trim();
                    setChatbotInput('');
                    setChatbotMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
                    setChatbotLoading(true);

                    try {
                      // Get current data table state (limit to avoid huge payloads)
                      const tableData = {
                        columns: availableColumns,
                        sampleData: gridData.slice(0, 5).map((row) => {
                          const rowData = {};
                          availableColumns.forEach((col, colIdx) => {
                            rowData[col] = row[colIdx] || '';
                          });
                          return rowData;
                        }),
                        currentChart: {
                          chartType: chartConfigs[currentChartIndex].chartType,
                          xAxis: chartConfigs[currentChartIndex].xAxis.column,
                          yAxis: chartConfigs[currentChartIndex].yAxis.column,
                        },
                        fieldRoles: Object.fromEntries(Object.entries(fieldRoles).slice(0, 10)),
                      };

                      // Build context message with guardrails
                      const contextMessage = `I'm working with Sam's Smart Reports Pro chart builder. `;
                      const dataContext = availableColumns.length > 0 
                        ? `My data has ${availableColumns.length} columns: ${availableColumns.slice(0, 5).join(', ')}${availableColumns.length > 5 ? '...' : ''}. ` 
                        : 'I haven\'t entered data yet. ';
                      const chartContext = chartConfigs[currentChartIndex].xAxis.column || chartConfigs[currentChartIndex].yAxis.column
                        ? `Current chart: ${chartConfigs[currentChartIndex].xAxis.column || 'No X-axis'} vs ${chartConfigs[currentChartIndex].yAxis.column || 'No Y-axis'}. `
                        : '';
                      const fullMessage = contextMessage + dataContext + chartContext + `My question: ${userMessage}`;

                      // Call chatbot API using axios
                      const response = await api.post('/public/chatbot-message', {
                        message: fullMessage,
                        chatHistory: chatbotMessages.map(m => ({
                          sender: m.sender === 'user' ? 'user' : 'bot',
                          text: m.text
                        }))
                      });

                      if (response.data && response.data.success) {
                        setChatbotMessages(prev => [...prev, { sender: 'bot', text: response.data.message }]);
                      } else {
                        setChatbotMessages(prev => [...prev, { 
                          sender: 'bot', 
                          text: response.data?.message || 'Sorry, I encountered an error. Please try again.' 
                        }]);
                      }
                    } catch (error) {
                      console.error('Chatbot error:', error);
                      const errorMessage = error.response?.data?.message || 
                                           error.message || 
                                           'Sorry, I encountered an error. Please try again.';
                      setChatbotMessages(prev => [...prev, { 
                        sender: 'bot', 
                        text: `Error: ${errorMessage}` 
                      }]);
                    } finally {
                      setChatbotLoading(false);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatbotInput}
                    onChange={(e) => setChatbotInput(e.target.value)}
                    placeholder="Ask about building charts, formatting dashboards, or PPT export..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={chatbotLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatbotLoading || !chatbotInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Chatbot Toggle Button - Top Right */}
          {!showChatbot && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowChatbot(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                title="Open Chart Builder Assistant"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">Get Started with Assistant</span>
              </button>
            </div>
          )}

          {/* Instructions Panel - Collapsible */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
            >
              <Info className="h-4 w-4" />
              How to use the tool
            </button>
          </div>
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
                    <li>Select variables to build your own charts using dropdowns or drag-and-drop.</li>
                    <li>Use dimensions for categories and measures for values.</li>
                    <li>Drag fields from the field list onto X or Y axis drop zones.</li>
                    <li>Toggle between Dimension/Measure and Discrete/Continuous for each field.</li>
                    <li>Right-click on chart labels to sort data (Ascending, Descending, or Clear).</li>
                    <li>Click on any label (title, axis labels, category names) to edit them directly.</li>
                    <li>Choose aggregation methods to analyze your data.</li>
                    <li>For time series data, select a date column and apply CAGR or trend analysis.</li>
                    <li>To reuse this tool for multiple datasets, remove the old data first.</li>
                    <li>For large datasets beyond 1000 rows or 20 columns, please contact the admin.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Instructions Panel - Collapsible */}
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
                    <li>Select variables to build your own charts using dropdowns or drag-and-drop.</li>
                    <li>Use dimensions for categories and measures for values.</li>
                    <li>Drag fields from the field list onto X or Y axis drop zones.</li>
                    <li>Toggle between Dimension/Measure and Discrete/Continuous for each field.</li>
                    <li>Right-click on chart labels to sort data (Ascending, Descending, or Clear).</li>
                    <li>Click on any label (title, axis labels, category names) to edit them directly.</li>
                    <li>Choose aggregation methods to analyze your data.</li>
                    <li>For time series data, select a date column and apply CAGR or trend analysis.</li>
                    <li>To reuse this tool for multiple datasets, remove the old data first.</li>
                    <li>For large datasets beyond 1000 rows or 20 columns, please contact the admin.</li>
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
                <h2 className="text-xl font-semibold text-gray-900">Data Input (1000 rows × 20 columns)</h2>
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
              style={{ scrollBehavior: 'smooth' }}
            >
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="border border-gray-300 p-2 text-xs font-semibold text-gray-600 bg-gray-100 w-12"></th>
                    {Array.from({ length: 20 }, (_, i) => {
                      let colLabel;
                      if (i < 26) {
                        colLabel = String.fromCharCode(65 + i);
                      } else {
                        const first = Math.floor((i - 26) / 26);
                        const second = (i - 26) % 26;
                        colLabel = String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
                      }
                      return (
                        <th key={i} className="border border-gray-300 p-2 text-xs font-semibold text-gray-600 bg-gray-100 min-w-24">
                          {colLabel}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border border-gray-300 p-1 text-xs text-gray-500 bg-gray-50 text-center font-semibold">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => {
                        const isSelected = selectedCells.some(sc => sc.row === rowIndex && sc.col === colIndex);
                        return (
                          <td 
                            key={colIndex} 
                            className={`border border-gray-300 p-0 relative ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}
                            onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
                            onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                            onMouseUp={handleCellMouseUp}
                          >
                            <input
                              id={`cell-${rowIndex}-${colIndex}`}
                              type="text"
                              className="grid-cell w-full h-8 px-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 bg-transparent"
                              value={cell}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              onFocus={() => handleCellFocus(rowIndex, colIndex)}
                              onPaste={handlePaste}
                              onKeyDown={(e) => {
                                // Enter key: move to next row in same column
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const nextRow = Math.min(rowIndex + 1, 999);
                                  setActiveCell({ row: nextRow, col: colIndex });
                                  setSelectedCells([{ row: nextRow, col: colIndex }]);
                                  setTimeout(() => {
                                    const nextCell = document.getElementById(`cell-${nextRow}-${colIndex}`);
                                    if (nextCell) {
                                      nextCell.focus();
                                    }
                                  }, 10);
                                }
                                // Arrow keys: navigate cells (handled by global handler, but allow default if typing)
                                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                  const activeInput = document.activeElement;
                                  if (activeInput && activeInput.classList.contains('grid-cell') && activeInput.value) {
                                    // If cell has value, allow default cursor movement within input
                                    return;
                                  }
                                  // Otherwise, global handler will take over
                                }
                              }}
                            />
                            {rowIndex === activeCell.row && colIndex === activeCell.col && (
                              <div 
                                className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 cursor-nwse-resize rounded-sm hover:bg-blue-700 transition-colors" 
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  setIsDraggingFill(true);
                                  setFillStartCell({ row: rowIndex, col: colIndex });
                                }}
                                title="Drag to fill cells"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Placeholder - Below Data Input */}
          {availableColumns.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Drag & Drop Chart Builder</h3>
              
              {/* Draggable Column Headers */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Drag column headers to axes below:</p>
                <div className="flex flex-wrap gap-2">
                  {availableColumns.map((col) => {
                    const columnInfo = getColumnInfo(col);
                    const role = fieldRoles[col] || (columnInfo.isNumeric ? 'measure' : 'dimension');
                    const roleColor = role === 'dimension' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-green-100 text-green-700 border-green-300';
                    return (
                      <button
                        key={col}
                        draggable
                        onDragStart={(e) => handleDragStart(e, col)}
                        className={`px-4 py-2 rounded-lg border-2 border-dashed cursor-move hover:shadow-md transition-all ${roleColor} font-medium text-sm`}
                        title={`${col} (${role}) - Drag to X, Y, or Z axis`}
                      >
                        {col}
                        <span className="ml-2 text-xs opacity-75">({role})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filters Bucket - Functional */}
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-yellow-700" />
                  <div className="text-xs font-semibold text-gray-700">Filters</div>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, chartConfigs[currentChartIndex].id, 'filters')}
                  className={`min-h-[60px] p-3 rounded border-2 border-dashed transition-colors ${
                    draggedField ? 'border-yellow-500 bg-yellow-100' : 'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  {chartConfigs[currentChartIndex].filters && chartConfigs[currentChartIndex].filters.length > 0 ? (
                    <div className="space-y-3">
                      {chartConfigs[currentChartIndex].filters.map((filter, idx) => {
                        const colInfo = getColumnInfo(filter.column);
                        return (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-yellow-300 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">{filter.column}</span>
                              <button
                                onClick={() => removeFieldFromAxis(chartConfigs[currentChartIndex].id, 'filters', filter.column)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {filter.filterType === 'range' ? (
                              // Range filter for measures/dates
                              <div className="space-y-2">
                                <div className="flex gap-2 items-center">
                                  <input
                                    type={colInfo.isDate ? 'date' : 'number'}
                                    value={filter.minValue || ''}
                                    onChange={(e) => {
                                      const updatedFilters = [...(chartConfigs[currentChartIndex].filters || [])];
                                      updatedFilters[idx] = { ...filter, minValue: e.target.value };
                                      updateChartConfig(chartConfigs[currentChartIndex].id, { filters: updatedFilters });
                                    }}
                                    placeholder="Min"
                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                  />
                                  <span className="text-xs text-gray-500">to</span>
                                  <input
                                    type={colInfo.isDate ? 'date' : 'number'}
                                    value={filter.maxValue || ''}
                                    onChange={(e) => {
                                      const updatedFilters = [...(chartConfigs[currentChartIndex].filters || [])];
                                      updatedFilters[idx] = { ...filter, maxValue: e.target.value };
                                      updateChartConfig(chartConfigs[currentChartIndex].id, { filters: updatedFilters });
                                    }}
                                    placeholder="Max"
                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                  />
                                </div>
                              </div>
                            ) : (
                              // Multi-select filter for dimensions
                              <FilterMultiSelect
                                filter={filter}
                                uniqueValues={getUniqueValues(filter.column)}
                                onUpdate={(updatedFilter) => {
                                  const updatedFilters = [...(chartConfigs[currentChartIndex].filters || [])];
                                  updatedFilters[idx] = updatedFilter;
                                  updateChartConfig(chartConfigs[currentChartIndex].id, { filters: updatedFilters });
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-2">Drop fields here to filter data</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[400px] p-6">
                {/* Chart Axis Placeholders */}
                <div className="flex flex-col h-full">
                  {/* Y-Axis Placeholder (Left) */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, chartConfigs[currentChartIndex].id, 'yAxis')}
                      className={`w-40 p-4 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-start min-h-[200px] ${
                        draggedField ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-100'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-600 mb-2">Y-Axis (Measures)</div>
                      {(() => {
                        const yCols = Array.isArray(chartConfigs[currentChartIndex].yAxis.columns) 
                          ? chartConfigs[currentChartIndex].yAxis.columns 
                          : (chartConfigs[currentChartIndex].yAxis.column ? [chartConfigs[currentChartIndex].yAxis.column] : []);
                        return yCols.length > 0 ? (
                          <div className="w-full space-y-2">
                            {yCols.map((col, idx) => (
                              <div key={idx} className="bg-white px-2 py-1 rounded border border-gray-200 text-xs flex items-center justify-between">
                                <span className="font-medium truncate">{col}</span>
                                <button
                                  onClick={() => removeFieldFromAxis(chartConfigs[currentChartIndex].id, 'yAxis', col)}
                                  className="text-red-600 hover:text-red-800 ml-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 text-center">Drop measure here</div>
                        );
                      })()}
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 flex flex-col">
                      {/* X-Axis Placeholder (Bottom) */}
                      <div className="flex-1 flex items-end mb-4">
                        <div
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, chartConfigs[currentChartIndex].id, 'xAxis')}
                          className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center min-h-[80px] ${
                            draggedField ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'
                          }`}
                        >
                          <div className="text-xs font-semibold text-gray-600 mb-2">X-Axis (Dimensions)</div>
                          {(() => {
                            const xCols = Array.isArray(chartConfigs[currentChartIndex].xAxis.columns) 
                              ? chartConfigs[currentChartIndex].xAxis.columns 
                              : (chartConfigs[currentChartIndex].xAxis.column ? [chartConfigs[currentChartIndex].xAxis.column] : []);
                            return xCols.length > 0 ? (
                              <div className="flex flex-wrap gap-2 justify-center">
                                {xCols.map((col, idx) => {
                                  const colInfo = getColumnInfo(col);
                                  return (
                                    <div key={idx} className="bg-white px-3 py-1 rounded border border-gray-200 text-sm flex items-center gap-2">
                                      <span className="font-medium">{col}</span>
                                      {colInfo.isDate && (
                                        <select
                                          value={dateHierarchies[col] || 'month'}
                                          onChange={(e) => setDateHierarchies(prev => ({ ...prev, [col]: e.target.value }))}
                                          className="text-xs border border-gray-300 rounded px-1 py-0.5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <option value="year">Year</option>
                                          <option value="quarter">Quarter</option>
                                          <option value="month">Month</option>
                                          <option value="week">Week</option>
                                          <option value="day">Day</option>
                                        </select>
                                      )}
                                      <button
                                        onClick={() => removeFieldFromAxis(chartConfigs[currentChartIndex].id, 'xAxis', col)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">Drop dimension here</div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Chart Preview Area */}
                      <div className="flex-1 bg-white rounded border border-gray-200 p-4 flex items-center justify-center min-h-[300px]">
                        {(() => {
                          const xCols = Array.isArray(chartConfigs[currentChartIndex].xAxis.columns) 
                            ? chartConfigs[currentChartIndex].xAxis.columns 
                            : (chartConfigs[currentChartIndex].xAxis.column ? [chartConfigs[currentChartIndex].xAxis.column] : []);
                          const yCols = Array.isArray(chartConfigs[currentChartIndex].yAxis.columns) 
                            ? chartConfigs[currentChartIndex].yAxis.columns 
                            : (chartConfigs[currentChartIndex].yAxis.column ? [chartConfigs[currentChartIndex].yAxis.column] : []);
                          return xCols.length > 0 && yCols.length > 0 ? (
                            <div className="w-full h-full">
                              {renderChart(chartConfigs[currentChartIndex])}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400">
                              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-sm">Drag fields to X and Y axes to generate chart</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Z-Axis Placeholder (Right - Optional) */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, chartConfigs[currentChartIndex].id, 'zAxis')}
                      className={`w-40 p-4 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-start min-h-[200px] ${
                        draggedField ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-600 mb-2">Z-Axis (Optional)</div>
                      {(() => {
                        const zCols = Array.isArray(chartConfigs[currentChartIndex].zAxis?.columns) 
                          ? chartConfigs[currentChartIndex].zAxis.columns 
                          : (chartConfigs[currentChartIndex].zAxis?.column ? [chartConfigs[currentChartIndex].zAxis.column] : []);
                        return zCols.length > 0 ? (
                          <div className="w-full space-y-2">
                            {zCols.map((col, idx) => (
                              <div key={idx} className="bg-white px-2 py-1 rounded border border-gray-200 text-xs flex items-center justify-between">
                                <span className="font-medium truncate">{col}</span>
                                <button
                                  onClick={() => removeFieldFromAxis(chartConfigs[currentChartIndex].id, 'zAxis', col)}
                                  className="text-red-600 hover:text-red-800 ml-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 text-center">For color/size encoding</div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <div className="space-y-6">
                {/* Chart Navigation */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Chart {currentChartIndex + 1}
                    </h3>
                    <button
                      onClick={() => toggleChart(chartConfigs[currentChartIndex].id)}
                      className={`px-3 py-1 text-xs rounded ${
                        chartConfigs[currentChartIndex].enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {chartConfigs[currentChartIndex].enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <span className="text-sm text-gray-500">
                      {Array.from(activeChartIds).length} active chart(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={moveToPreviousChart}
                      disabled={currentChartIndex === 0}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={moveToNextChart}
                      disabled={currentChartIndex >= 39}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Move to Chart {currentChartIndex + 2} →
                    </button>
                  </div>
                </div>

                {/* Single Chart View */}
                {(() => {
                  const config = chartConfigs[currentChartIndex];
                  return (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
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
                        {/* Filter Button for Dashboard */}
                        {config.filters && config.filters.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs text-gray-600">{config.filters.length} filter(s) active</span>
                          </div>
                        )}
                      </div>

                      {/* Filters Display in Dashboard */}
                      {config.filters && config.filters.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-xs font-semibold text-gray-700 mb-2">Filters</div>
                          <div className="space-y-2">
                            {config.filters.map((filter, idx) => {
                              const colInfo = getColumnInfo(filter.column);
                              return (
                                <div key={idx} className="bg-white p-2 rounded border border-yellow-300">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-700">{filter.column}</span>
                                    <button
                                      onClick={() => removeFieldFromAxis(config.id, 'filters', filter.column)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                  
                                  {filter.filterType === 'range' ? (
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type={colInfo.isDate ? 'date' : 'number'}
                                        value={filter.minValue || ''}
                                        onChange={(e) => {
                                          const updatedFilters = [...(config.filters || [])];
                                          updatedFilters[idx] = { ...filter, minValue: e.target.value };
                                          updateChartConfig(config.id, { filters: updatedFilters });
                                        }}
                                        placeholder="Min"
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                      />
                                      <span className="text-xs text-gray-500">to</span>
                                      <input
                                        type={colInfo.isDate ? 'date' : 'number'}
                                        value={filter.maxValue || ''}
                                        onChange={(e) => {
                                          const updatedFilters = [...(config.filters || [])];
                                          updatedFilters[idx] = { ...filter, maxValue: e.target.value };
                                          updateChartConfig(config.id, { filters: updatedFilters });
                                        }}
                                        placeholder="Max"
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                      />
                                    </div>
                                  ) : (
                                    <FilterMultiSelect
                                      filter={filter}
                                      uniqueValues={getUniqueValues(filter.column)}
                                      onUpdate={(updatedFilter) => {
                                        const updatedFilters = [...(config.filters || [])];
                                        updatedFilters[idx] = updatedFilter;
                                        updateChartConfig(config.id, { filters: updatedFilters });
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Chart Configuration Panel */}
                    {expandedChart === config.id && (
                      <div className="mb-4 p-4 bg-white rounded-lg border border-gray-300 space-y-4">
                        {/* Drag-and-Drop Interface */}
                        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                          <h4 className="text-sm font-semibold text-indigo-900 mb-3">Drag & Drop Fields</h4>
                          
                          {/* Drop Zones */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* X-Axis Drop Zone */}
                            <div
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, config.id, 'xAxis')}
                              className={`min-h-20 p-3 rounded-lg border-2 border-dashed transition-colors ${
                                draggedField ? 'border-indigo-400 bg-indigo-100' : 'border-gray-300 bg-gray-50'
                              }`}
                            >
                              <div className="text-xs font-medium text-gray-600 mb-2">X-Axis</div>
                              {config.xAxis.column ? (
                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                  <span className="text-sm font-medium text-gray-700">{config.xAxis.column}</span>
                                  <button
                                    onClick={() => removeFieldFromAxis(config.id, 'xAxis')}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Drop a field here</div>
                              )}
                            </div>

                            {/* Y-Axis Drop Zone */}
                            <div
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, config.id, 'yAxis')}
                              className={`min-h-20 p-3 rounded-lg border-2 border-dashed transition-colors ${
                                draggedField ? 'border-indigo-400 bg-indigo-100' : 'border-gray-300 bg-gray-50'
                              }`}
                            >
                              <div className="text-xs font-medium text-gray-600 mb-2">Y-Axis</div>
                              {config.yAxis.column ? (
                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                  <span className="text-sm font-medium text-gray-700">{config.yAxis.column}</span>
                                  <button
                                    onClick={() => removeFieldFromAxis(config.id, 'yAxis')}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Drop a field here</div>
                              )}
                            </div>
                          </div>

                          {/* Draggable Fields List */}
                          {availableColumns.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-2">Available Fields</div>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {availableColumns.map(col => {
                                  const info = getColumnInfo(col);
                                  const role = fieldRoles[col] || (info.isNumeric ? 'measure' : 'dimension');
                                  const mode = fieldModes[col] || (role === 'dimension' ? 'discrete' : 'continuous');
                                  
                                  return (
                                    <div
                                      key={col}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, col)}
                                      className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:border-indigo-400 cursor-move"
                                    >
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-700">{col}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <button
                                            onClick={() => toggleFieldRole(col)}
                                            className={`text-xs px-2 py-0.5 rounded ${
                                              role === 'dimension'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}
                                          >
                                            {role === 'dimension' ? 'Dimension' : 'Measure'}
                                          </button>
                                          <button
                                            onClick={() => toggleFieldMode(col)}
                                            className={`text-xs px-2 py-0.5 rounded ${
                                              mode === 'discrete'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}
                                          >
                                            {mode === 'discrete' ? 'Discrete' : 'Continuous'}
                                          </button>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {info.isDate && '📅'} {info.isNumeric && '🔢'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

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
                              onChange={(e) => {
                                const col = e.target.value;
                                const role = fieldRoles[col] || (col ? (getColumnInfo(col).isNumeric ? 'measure' : 'dimension') : 'dimension');
                                updateChartConfig(config.id, {
                                  xAxis: { 
                                    ...config.xAxis, 
                                    column: col,
                                    type: role,
                                    aggregation: role === 'measure' ? 'none' : 'none'
                                  }
                                });
                              }}
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
                              onChange={(e) => {
                                const col = e.target.value;
                                const role = fieldRoles[col] || (col ? (getColumnInfo(col).isNumeric ? 'measure' : 'dimension') : 'measure');
                                updateChartConfig(config.id, {
                                  yAxis: { 
                                    ...config.yAxis, 
                                    column: col,
                                    type: role,
                                    aggregation: role === 'measure' ? 'sum' : 'none'
                                  }
                                });
                              }}
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
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Chart Title</label>
                            <button
                              onClick={() => updateChartConfig(config.id, { showTitle: !config.showTitle })}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              {config.showTitle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={config.title}
                            onChange={(e) => updateChartConfig(config.id, { title: e.target.value })}
                            placeholder="Auto-generated if empty"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        {/* Sorting */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                          <select
                            value={config.sortOrder}
                            onChange={(e) => updateChartConfig(config.id, { sortOrder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {SORT_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Axis Labels */}
                        {config.xAxis.column && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">X-Axis Label</label>
                              <button
                                onClick={() => updateChartConfig(config.id, {
                                  xAxis: { ...config.xAxis, showLabel: !config.xAxis.showLabel }
                                })}
                                className="text-xs text-gray-600 hover:text-gray-800"
                              >
                                {config.xAxis.showLabel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <input
                              type="text"
                              value={config.xAxis.label}
                              onChange={(e) => updateChartConfig(config.id, {
                                xAxis: { ...config.xAxis, label: e.target.value }
                              })}
                              placeholder={config.xAxis.column}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        )}

                        {config.yAxis.column && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">Y-Axis Label</label>
                              <button
                                onClick={() => updateChartConfig(config.id, {
                                  yAxis: { ...config.yAxis, showLabel: !config.yAxis.showLabel }
                                })}
                                className="text-xs text-gray-600 hover:text-gray-800"
                              >
                                {config.yAxis.showLabel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <input
                              type="text"
                              value={config.yAxis.label}
                              onChange={(e) => updateChartConfig(config.id, {
                                yAxis: { ...config.yAxis, label: e.target.value }
                              })}
                              placeholder={config.yAxis.column}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        )}

                        {/* X-Axis Label Options for Many Labels */}
                        {config.xAxis.column && (() => {
                          const chartData = generateChartData(config);
                          const hasManyLabels = chartData && chartData.length > 10;
                          const labelOptions = xAxisLabelOptions[config.id] || { reduceFont: false, horizontalScroll: false, skipLabels: 0 };
                          return hasManyLabels ? (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">X-Axis Label Options (Many Labels Detected)</label>
                              <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={labelOptions.reduceFont || false}
                                    onChange={(e) => setXAxisLabelOptions(prev => ({
                                      ...prev,
                                      [config.id]: { ...prev[config.id], reduceFont: e.target.checked }
                                    }))}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-gray-700">Reduce Font Size</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={labelOptions.horizontalScroll || false}
                                    onChange={(e) => setXAxisLabelOptions(prev => ({
                                      ...prev,
                                      [config.id]: { ...prev[config.id], horizontalScroll: e.target.checked }
                                    }))}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-gray-700">Enable Horizontal Scroll</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-gray-700">Skip Labels:</label>
                                  <select
                                    value={labelOptions.skipLabels || 0}
                                    onChange={(e) => setXAxisLabelOptions(prev => ({
                                      ...prev,
                                      [config.id]: { ...prev[config.id], skipLabels: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="0">Show All</option>
                                    <option value="1">Skip Every 2nd</option>
                                    <option value="2">Skip Every 3rd</option>
                                    <option value="3">Skip Every 4th</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {/* Customization Toggle */}
                        <div>
                          <button
                            onClick={() => setShowCustomization(prev => ({
                              ...prev,
                              [config.id]: !prev[config.id]
                            }))}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <Palette className="h-4 w-4" />
                            {showCustomization[config.id] ? 'Hide' : 'Show'} Customization
                          </button>
                        </div>

                        {/* Appearance Customization Panel */}
                        {showCustomization[config.id] && (
                          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
                            <h4 className="font-semibold text-purple-900 mb-3">Appearance Settings</h4>
                            
                            {/* Font Controls */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                              <div className="flex gap-2">
                                <select
                                  value={config.appearance.fontSize}
                                  onChange={(e) => updateChartConfig(config.id, {
                                    appearance: { ...config.appearance, fontSize: e.target.value }
                                  })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="small">Small</option>
                                  <option value="medium">Medium</option>
                                  <option value="large">Large</option>
                                  <option value="custom">Custom</option>
                                </select>
                                {config.appearance.fontSize === 'custom' && (
                                  <input
                                    type="number"
                                    value={config.appearance.customFontSize}
                                    onChange={(e) => updateChartConfig(config.id, {
                                      appearance: { ...config.appearance, customFontSize: parseInt(e.target.value) || 14 }
                                    })}
                                    placeholder="px"
                                    className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Font Color</label>
                              <input
                                type="color"
                                value={config.appearance.fontColor}
                                onChange={(e) => updateChartConfig(config.id, {
                                  appearance: { ...config.appearance, fontColor: e.target.value }
                                })}
                                className="w-full h-10 border border-gray-300 rounded-lg"
                              />
                            </div>

                            {/* Color Controls */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                              <div className="flex gap-2 mb-2">
                                <button
                                  onClick={() => updateChartConfig(config.id, {
                                    appearance: { ...config.appearance, useMultiColor: true }
                                  })}
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                                    config.appearance.useMultiColor
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  Multi-Color
                                </button>
                                <button
                                  onClick={() => updateChartConfig(config.id, {
                                    appearance: { ...config.appearance, useMultiColor: false }
                                  })}
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                                    !config.appearance.useMultiColor
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  Single Color
                                </button>
                              </div>
                              {!config.appearance.useMultiColor && (
                                <input
                                  type="color"
                                  value={config.appearance.colors?.[0] || COLORS[0]}
                                  onChange={(e) => updateChartConfig(config.id, {
                                    appearance: { ...config.appearance, colors: [e.target.value] }
                                  })}
                                  className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                              )}
                            </div>

                            {/* Legend Controls */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Show Legend</label>
                                <button
                                  onClick={() => updateChartConfig(config.id, {
                                    appearance: { ...config.appearance, showLegend: !config.appearance.showLegend }
                                  })}
                                  className="text-xs text-gray-600 hover:text-gray-800"
                                >
                                  {config.appearance.showLegend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {config.appearance.showLegend && (
                                <>
                                  <select
                                    value={config.appearance.legendPosition}
                                    onChange={(e) => updateChartConfig(config.id, {
                                      appearance: { ...config.appearance, legendPosition: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                                  >
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                  </select>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Legend Font Size</label>
                                      <input
                                        type="number"
                                        value={config.appearance.legendFontSize}
                                        onChange={(e) => updateChartConfig(config.id, {
                                          appearance: { ...config.appearance, legendFontSize: parseInt(e.target.value) || 12 }
                                        })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Legend Color</label>
                                      <input
                                        type="color"
                                        value={config.appearance.legendFontColor}
                                        onChange={(e) => updateChartConfig(config.id, {
                                          appearance: { ...config.appearance, legendFontColor: e.target.value }
                                        })}
                                        className="w-full h-8 border border-gray-300 rounded"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Visual Controls */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Show Data Labels</label>
                                <button
                                  onClick={() => updateChartConfig(config.id, {
                                    appearance: { ...config.appearance, showDataLabels: !config.appearance.showDataLabels }
                                  })}
                                  className="text-xs text-gray-600 hover:text-gray-800"
                                >
                                  {config.appearance.showDataLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            {(config.chartType === 'bar' || config.chartType === 'line' || config.chartType === 'area') && (
                              <>
                                {config.chartType === 'bar' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bar Thickness</label>
                                    <input
                                      type="number"
                                      value={config.appearance.barThickness}
                                      onChange={(e) => updateChartConfig(config.id, {
                                        appearance: { ...config.appearance, barThickness: parseInt(e.target.value) || 20 }
                                      })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      min="5"
                                      max="50"
                                    />
                                  </div>
                                )}
                                {(config.chartType === 'line' || config.chartType === 'area') && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Line Thickness</label>
                                    <input
                                      type="number"
                                      value={config.appearance.lineThickness}
                                      onChange={(e) => updateChartConfig(config.id, {
                                        appearance: { ...config.appearance, lineThickness: parseInt(e.target.value) || 2 }
                                      })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      min="1"
                                      max="10"
                                    />
                                  </div>
                                )}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Opacity (0-1)</label>
                                  <input
                                    type="number"
                                    value={config.appearance.opacity}
                                    onChange={(e) => updateChartConfig(config.id, {
                                      appearance: { ...config.appearance, opacity: Math.max(0, Math.min(1, parseFloat(e.target.value) || 1)) }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
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
                  );
                })()}
              </div>
            )}
          </div>

          {/* Dashboard Canvas */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Dashboard Canvas</h2>
              </div>
              <button
                onClick={() => setDashboardCharts([])}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear Canvas
              </button>
            </div>
            
            {/* Add Charts Dropdown */}
            {getActiveCharts().length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Charts</label>
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'all') {
                      // Add all active charts
                      const activeCharts = getActiveCharts();
                      setDashboardCharts(activeCharts.map((chart, idx) => ({
                        ...chart,
                        x: (idx % 2) * 420,
                        y: Math.floor(idx / 2) * 320,
                        width: 400,
                        height: 300,
                      })));
                    } else if (value && value !== '') {
                      const chart = chartConfigs.find(c => c.id === value && c.enabled);
                      if (chart && !dashboardCharts.find(c => c.id === chart.id)) {
                        setDashboardCharts([...dashboardCharts, {
                          ...chart,
                          x: (dashboardCharts.length % 2) * 420,
                          y: Math.floor(dashboardCharts.length / 2) * 320,
                          width: 400,
                          height: 300,
                        }]);
                      }
                    }
                    e.target.value = '';
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select chart to add...</option>
                  {getActiveCharts().map((chart) => {
                    const index = chartConfigs.findIndex(c => c.id === chart.id);
                    return (
                      <option key={chart.id} value={chart.id}>
                        Add Chart {index + 1}
                      </option>
                    );
                  })}
                  {getActiveCharts().length > 1 && (
                    <option value="all">Add All {getActiveCharts().length} Charts</option>
                  )}
                </select>
              </div>
            )}

            <div className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              {dashboardCharts.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Use the dropdown above to add active charts to the dashboard</p>
                  </div>
                </div>
              ) : (
                <div className="relative" style={{ minHeight: '400px' }}>
                  {dashboardCharts.map((chart, idx) => {
                    const chartIndex = chartConfigs.findIndex(c => c.id === chart.id);
                    return (
                      <div
                        key={chart.id}
                        className="absolute bg-white border-2 border-blue-500 rounded-lg p-2 shadow-lg"
                        style={{
                          left: `${chart.x}px`,
                          top: `${chart.y}px`,
                          width: `${chart.width}px`,
                          height: `${chart.height}px`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700">Chart {chartIndex + 1}</span>
                          <button
                            onClick={() => setDashboardCharts(dashboardCharts.filter(c => c.id !== chart.id))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="overflow-hidden" style={{ height: `${chart.height - 40}px` }}>
                          {renderChart(chart)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* PPT Builder */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">PPT Builder</h2>
              </div>
              <button
                onClick={() => setShowPptBuilder(!showPptBuilder)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showPptBuilder ? 'Hide Builder' : 'Show Builder'}
              </button>
            </div>

            {showPptBuilder && (
              <div className="space-y-6">
                {/* PPT Controls */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      if (dashboardCharts.length === 0) {
                        alert('Please add charts to the Dashboard Canvas first. The PPT will be generated based on charts in the dashboard.');
                        return;
                      }
                      
                      // Generate PPT structure based on dashboard charts
                      const coverSlide = { 
                        id: 'cover', 
                        type: 'cover', 
                        title: 'Presentation Title', 
                        subtitle: '', 
                        author: '', 
                        images: [],
                        backgroundColor: '#FFFFFF',
                        titleColor: '#1F2937',
                        subtitleColor: '#6B7280',
                      };
                      
                      // Generate agenda from dashboard charts
                      const agendaItems = dashboardCharts.map((chart) => {
                        const chartIndex = chartConfigs.findIndex(c => c.id === chart.id);
                        return chart.title || `Chart ${chartIndex + 1}`;
                      });
                      
                      const agendaSlide = { 
                        id: 'agenda', 
                        type: 'agenda', 
                        items: agendaItems
                      };
                      
                      // Generate content slides from dashboard charts (one per chart)
                      const contentSlides = dashboardCharts.map((chart) => {
                        const chartIndex = chartConfigs.findIndex(c => c.id === chart.id);
                        return {
                          id: `content-${chart.id}`,
                          type: 'content',
                          title: chart.title || `Chart ${chartIndex + 1}`,
                          subtitle: '',
                          content: '',
                          chartId: chart.id,
                          commentary: '',
                          images: [],
                          icons: [],
                          backgroundColor: '#FFFFFF',
                          titleColor: '#1F2937',
                          textColor: '#374151',
                        };
                      });
                      
                      const thankYouSlide = {
                        id: 'thankyou',
                        type: 'thankyou',
                        message: 'Thank You',
                        contact: 'Email: info@tabalt.co.uk\nPhone: +44 7448614160\n3 Herron Court, Bromley, London, United Kingdom',
                        backgroundColor: '#FFFFFF',
                      };
                      
                      const newSlides = [coverSlide, agendaSlide, ...contentSlides, thankYouSlide];
                      setPptSlides(newSlides);
                      setPptPreviewMode(true); // Automatically enter preview mode
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate PPT from Dashboard ({dashboardCharts.length} charts)
                  </button>
                  {pptSlides.length > 0 && (
                    <button
                      onClick={() => setPptPreviewMode(!pptPreviewMode)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {pptPreviewMode ? 'Exit Preview' : 'Preview PPT Deck'}
                    </button>
                  )}
                </div>

                    {/* PPT Slides Editor (Simplified - full editing in preview mode) */}
                {pptSlides.length > 0 && !pptPreviewMode && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Click "Preview PPT Deck" to see and edit all slides in full preview mode.
                        Current slides: {pptSlides.length} (Cover + Agenda + {dashboardCharts.length} Chart Slide{dashboardCharts.length !== 1 ? 's' : ''} + Thank You)
                      </p>
                    </div>
                    {pptSlides.map((slide, idx) => (
                      <div key={slide.id} className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">
                            {slide.type === 'cover' ? 'Slide 1: Cover Page' : 
                             slide.type === 'agenda' ? 'Slide 2: Agenda' : 
                             slide.type === 'summary' ? `Slide ${idx + 1}: Executive Summary` : 
                             slide.type === 'content' ? `Slide ${idx + 1}: ${slide.title || 'Content'}` : 
                             `Slide ${pptSlides.length}: Thank You`}
                          </h3>
                          <button
                            onClick={() => setPptSlides(pptSlides.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {slide.type === 'cover' && (
                          <div className="space-y-4">
                            
                            {/* Cover Page Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deck Title</label>
                                <input
                                  type="text"
                                  value={slide.title}
                                  onChange={(e) => {
                                    const newSlides = [...pptSlides];
                                    newSlides[idx].title = e.target.value;
                                    setPptSlides(newSlides);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle (Optional)</label>
                                <input
                                  type="text"
                                  value={slide.subtitle || ''}
                                  onChange={(e) => {
                                    const newSlides = [...pptSlides];
                                    newSlides[idx].subtitle = e.target.value;
                                    setPptSlides(newSlides);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                                <input
                                  type="text"
                                  value={slide.author}
                                  onChange={(e) => {
                                    const newSlides = [...pptSlides];
                                    newSlides[idx].author = e.target.value;
                                    setPptSlides(newSlides);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                                <input
                                  type="color"
                                  value={slide.backgroundColor || '#FFFFFF'}
                                  onChange={(e) => {
                                    const newSlides = [...pptSlides];
                                    newSlides[idx].backgroundColor = e.target.value;
                                    setPptSlides(newSlides);
                                  }}
                                  className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Add Image</label>
                              <button
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const newSlides = [...pptSlides];
                                        if (!newSlides[idx].images) newSlides[idx].images = [];
                                        const existingImgs = newSlides[idx].images.length;
                                        newSlides[idx].images.push({
                                          id: `img-${Date.now()}`,
                                          url: event.target.result,
                                          x: (existingImgs % 3) * 170,
                                          y: Math.floor(existingImgs / 3) * 170,
                                          width: 150,
                                          height: 150
                                        });
                                        setPptSlides(newSlides);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                Add Image
                              </button>
                            </div>
                          </div>
                        )}

                        {slide.type === 'agenda' && (
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                              <p className="text-sm text-blue-800">
                                <strong>Tip:</strong> The agenda will automatically include titles from charts added to the Dashboard Canvas. 
                                You can also manually edit the agenda items below.
                              </p>
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Agenda Items (one per line, or auto-generated from dashboard)</label>
                            <textarea
                              value={slide.items?.join('\n') || (dashboardCharts.length > 0 ? dashboardCharts.map(chart => {
                                const chartIndex = chartConfigs.findIndex(c => c.id === chart.id);
                                return chart.title || `Chart ${chartIndex + 1}`;
                              }).join('\n') : '')}
                              onChange={(e) => {
                                const items = e.target.value.split('\n').filter(item => item.trim());
                                const newSlides = [...pptSlides];
                                newSlides[idx].items = items;
                                // Remove existing content slides and regenerate
                                const contentSlideIds = new Set(newSlides.filter(s => s.type === 'content').map(s => s.id));
                                const filteredSlides = newSlides.filter(s => s.type !== 'content');
                                // Insert new content slides after agenda, before thank you
                                const thankYouIdx = filteredSlides.findIndex(s => s.type === 'thankyou');
                                const agendaIdx = filteredSlides.findIndex(s => s.type === 'agenda');
                                if (items.length > 0 && dashboardCharts.length > 0) {
                                  const newContentSlides = items.map((item, itemIdx) => {
                                    const chart = dashboardCharts[itemIdx] || dashboardCharts[0];
                                    return {
                                      id: `content-${chart.id}-${itemIdx}`,
                                      type: 'content',
                                      title: item,
                                      subtitle: '',
                                      chartId: chart.id,
                                      commentary: '',
                                      images: [],
                                      icons: [],
                                    };
                                  });
                                  if (thankYouIdx > -1) {
                                    filteredSlides.splice(thankYouIdx, 0, ...newContentSlides);
                                  } else {
                                    filteredSlides.push(...newContentSlides);
                                  }
                                }
                                setPptSlides(filteredSlides);
                              }}
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Introduction&#10;Sector Growth by Region&#10;Market Trends&#10;Key Insights&#10;Recommendations"
                            />
                            <p className="text-xs text-gray-500">
                              Each line represents an agenda item. Content slides are generated based on charts in the Dashboard Canvas.
                            </p>
                          </div>
                        )}

                        {slide.type === 'content' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Slide Title (Header)</label>
                              <input
                                type="text"
                                value={slide.title}
                                onChange={(e) => {
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].title = e.target.value;
                                  setPptSlides(newSlides);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Sub-header/Description</label>
                              <input
                                type="text"
                                value={slide.subtitle || ''}
                                onChange={(e) => {
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].subtitle = e.target.value;
                                  setPptSlides(newSlides);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Brief description or subtitle"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Chart</label>
                              <select
                                value={slide.chartId || ''}
                                onChange={(e) => {
                                  const chartId = e.target.value;
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].chartId = chartId;
                                  setPptSlides(newSlides);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              >
                                <option value="">Select a chart...</option>
                                {dashboardCharts.map((chart) => {
                                  const chartIndex = chartConfigs.findIndex(c => c.id === chart.id);
                                  return (
                                    <option key={chart.id} value={chart.id}>
                                      Chart {chartIndex + 1}: {chart.title || `Chart ${chartIndex + 1}`}
                                    </option>
                                  );
                                })}
                              </select>
                              {slide.chartId && (
                                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                  <span className="text-sm text-gray-600">
                                    Chart will appear on the left side of the slide
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Commentary/Insights (Right Side Text)</label>
                              <textarea
                                value={slide.commentary || ''}
                                onChange={(e) => {
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].commentary = e.target.value;
                                  setPptSlides(newSlides);
                                }}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Add your insights, analysis, or commentary here. This will appear on the right side of the slide."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Add Image</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const newSlides = [...pptSlides];
                                        if (!newSlides[idx].images) newSlides[idx].images = [];
                                        newSlides[idx].images.push({
                                          id: `img-${Date.now()}`,
                                          url: event.target.result,
                                          x: 0,
                                          y: 0,
                                          width: 100,
                                          height: 100,
                                        });
                                        setPptSlides(newSlides);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Add Icon from Library</label>
                                <button
                                  onClick={() => setSelectedSlideForEdit(slide.id)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                                >
                                  Open Icon Library
                                </button>
                              </div>
                            </div>
                            {slide.images && slide.images.length > 0 && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Images on Slide</label>
                                {slide.images.map((img, imgIdx) => (
                                  <div key={img.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <img src={img.url} alt={`Image ${imgIdx + 1}`} className="h-12 w-auto" />
                                    <button
                                      onClick={() => {
                                        const newSlides = [...pptSlides];
                                        newSlides[idx].images = newSlides[idx].images.filter((_, i) => i !== imgIdx);
                                        setPptSlides(newSlides);
                                      }}
                                      className="text-red-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {slide.icons && slide.icons.length > 0 && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Icons on Slide</label>
                                <div className="flex gap-2 flex-wrap">
                                  {slide.icons.map((icon, iconIdx) => (
                                    <div key={iconIdx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                      <span className="text-2xl">{iconLibrary.find(i => i.id === icon.id)?.symbol || icon.symbol}</span>
                                      <button
                                        onClick={() => {
                                          const newSlides = [...pptSlides];
                                          newSlides[idx].icons = newSlides[idx].icons.filter((_, i) => i !== iconIdx);
                                          setPptSlides(newSlides);
                                        }}
                                        className="text-red-500"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {slide.type === 'thankyou' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Thank You Message</label>
                              <input
                                type="text"
                                value={slide.message || 'Thank You'}
                                onChange={(e) => {
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].message = e.target.value;
                                  setPptSlides(newSlides);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Details</label>
                              <textarea
                                value={slide.contact || ''}
                                onChange={(e) => {
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].contact = e.target.value;
                                  setPptSlides(newSlides);
                                }}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Email: info@tabalt.co.uk&#10;Phone: +44 7448614160"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Slide Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (pptSlides.length < 50) {
                            const newSlides = [...pptSlides];
                            const summaryIdx = newSlides.findIndex(s => s.type === 'summary');
                            if (summaryIdx === -1) {
                              // Add executive summary option
                              const insertIdx = newSlides.findIndex(s => s.type === 'agenda') + 1;
                              newSlides.splice(insertIdx, 0, {
                                id: `summary-${Date.now()}`,
                                type: 'summary',
                                content: '',
                              });
                            }
                            setPptSlides(newSlides);
                          }
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Add Executive Summary
                      </button>
                      <button
                        onClick={() => {
                          if (pptSlides.length < 50) {
                            setPptSlides([...pptSlides, {
                              id: `thankyou-${Date.now()}`,
                              type: 'thankyou',
                              message: 'Thank You',
                              contact: '',
                            }]);
                          }
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Add Thank You Slide
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PPT Preview Mode */}
          {pptPreviewMode && pptSlides.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">PPT Preview & Edit Mode</h2>
                <button
                  onClick={() => setPptPreviewMode(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Exit Preview
                </button>
              </div>
              
              <div className="space-y-6">
                {pptSlides.map((slide, idx) => (
                  <div key={slide.id} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        {slide.type === 'cover' ? 'Slide 1: Cover Page' : 
                         slide.type === 'agenda' ? 'Slide 2: Agenda' : 
                         slide.type === 'summary' ? `Slide ${idx + 1}: Executive Summary` : 
                         slide.type === 'content' ? `Slide ${idx + 1}: ${slide.title || 'Content'}` : 
                         `Slide ${pptSlides.length}: Thank You`}
                      </span>
                      <button
                        onClick={() => setPptSlides(pptSlides.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Slide Preview */}
                    <div id={`preview-slide-${slide.id}`} className="bg-white p-8" style={{ aspectRatio: '16/9', minHeight: '400px', paddingBottom: '120px' }}>
                      {slide.type === 'cover' && (
                        <div className="h-full flex flex-col justify-center relative" style={{ backgroundColor: slide.backgroundColor || '#FFFFFF' }}>
                          {/* Images on Cover Page */}
                          {slide.images && slide.images.length > 0 && (
                            <div className="absolute inset-0 pointer-events-none">
                              {slide.images.map((img, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="absolute group pointer-events-auto"
                                  style={{
                                    left: `${img.x || 0}px`,
                                    top: `${img.y || 0}px`,
                                    width: `${img.width || 150}px`,
                                    height: `${img.height || 150}px`,
                                    cursor: draggingElement?.elementId === `image-${imgIdx}` ? 'grabbing' : 'grab',
                                  }}
                                  onMouseDown={(e) => {
                                    if (e.target.closest('.resize-handle')) return;
                                    const slideElement = document.getElementById(`preview-slide-${slide.id}`);
                                    if (slideElement) {
                                      const slideRect = slideElement.getBoundingClientRect();
                                      setDraggingElement({
                                        slideId: slide.id,
                                        elementId: `image-${imgIdx}`,
                                        type: 'image',
                                        offsetX: e.clientX - slideRect.left - (img.x || 0),
                                        offsetY: e.clientY - slideRect.top - (img.y || 0),
                                      });
                                    }
                                  }}
                                >
                                  <img
                                    src={typeof img === 'string' ? img : img.url}
                                    alt={`Image ${imgIdx + 1}`}
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newSlides = [...pptSlides];
                                      newSlides[idx].images = newSlides[idx].images.filter((_, i) => i !== imgIdx);
                                      setPptSlides(newSlides);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  <div
                                    className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setResizingElement({
                                        slideId: slide.id,
                                        elementId: `image-${imgIdx}`,
                                        type: 'image',
                                        startWidth: img.width || 150,
                                        startHeight: img.height || 150,
                                        startX: e.clientX,
                                        startY: e.clientY,
                                      });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Title - Centered */}
                          <div className="text-center space-y-6 px-8 py-12 relative z-10">
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => {
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].title = e.target.value;
                                  setPptSlides(newSlides);
                                }}
                                className="text-5xl font-bold bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-3 w-full max-w-4xl mx-auto"
                                placeholder="Presentation Title"
                                style={{ color: slide.titleColor || '#1F2937', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                              />
                              <input
                                type="text"
                                value={slide.subtitle || ''}
                                onChange={(e) => {
                                  const newSlides = [...pptSlides];
                                  newSlides[idx].subtitle = e.target.value;
                                  setPptSlides(newSlides);
                                }}
                                className="text-2xl text-gray-600 bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-2 w-full max-w-3xl mx-auto"
                                placeholder="Subtitle (Optional)"
                                style={{ color: slide.subtitleColor || '#6B7280' }}
                              />
                            </div>
                          </div>
                          
                          {/* Author - Bottom Right */}
                          <div className="absolute bottom-8 right-8">
                            <input
                              type="text"
                              value={slide.author || ''}
                              onChange={(e) => {
                                const newSlides = [...pptSlides];
                                newSlides[idx].author = e.target.value;
                                setPptSlides(newSlides);
                              }}
                              className="text-lg text-gray-600 bg-transparent border-none text-right focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-2"
                              placeholder="Author Name"
                            />
                          </div>
                        </div>
                      )}
                      
                      {slide.type === 'content' && (
                        <div className="h-full grid grid-cols-2 gap-6">
                          {/* Left: Chart */}
                          <div className="p-4 flex items-center justify-center">
                            {slide.chartId ? (
                              <div className="w-full h-full">
                                {renderChart(chartConfigs.find(c => c.id === slide.chartId) || chartConfigs[currentChartIndex])}
                              </div>
                            ) : (
                              <div className="text-center text-gray-400">
                                <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No chart selected</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Right: Text/Commentary */}
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={slide.title || ''}
                              onChange={(e) => {
                                const newSlides = [...pptSlides];
                                newSlides[idx].title = e.target.value;
                                setPptSlides(newSlides);
                              }}
                              className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                              placeholder="Slide Title"
                            />
                            <input
                              type="text"
                              value={slide.subtitle || ''}
                              onChange={(e) => {
                                const newSlides = [...pptSlides];
                                newSlides[idx].subtitle = e.target.value;
                                setPptSlides(newSlides);
                              }}
                              className="text-lg text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                              placeholder="Sub-header/Description"
                            />
                            <textarea
                              value={slide.commentary || ''}
                              onChange={(e) => {
                                const newSlides = [...pptSlides];
                                newSlides[idx].commentary = e.target.value;
                                setPptSlides(newSlides);
                              }}
                              className="w-full h-48 px-3 py-2 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              placeholder="Add your insights, analysis, or commentary here..."
                            />
                            {/* Icons and Images on Slide */}
                            <div className="relative" style={{ minHeight: '200px' }}>
                              {slide.icons && slide.icons.map((icon, iconIdx) => {
                                const iconData = iconLibrary.find(i => i.id === icon.id) || icon;
                                return (
                                  <div
                                    key={iconIdx}
                                    className="absolute group cursor-grab active:cursor-grabbing"
                                    style={{
                                      left: `${icon.x || 0}px`,
                                      top: `${icon.y || 0}px`,
                                      width: `${icon.width || 80}px`,
                                      height: `${icon.height || 80}px`,
                                      fontSize: `${icon.width || 80}px`,
                                      cursor: draggingElement?.elementId === `icon-${iconIdx}` ? 'grabbing' : 'grab',
                                    }}
                                    onMouseDown={(e) => {
                                      if (e.target.closest('.resize-handle')) return;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const slideElement = document.getElementById(`preview-slide-${slide.id}`);
                                      if (slideElement) {
                                        const slideRect = slideElement.getBoundingClientRect();
                                        setDraggingElement({
                                          slideId: slide.id,
                                          elementId: `icon-${iconIdx}`,
                                          type: 'icon',
                                          offsetX: e.clientX - slideRect.left - (icon.x || 0),
                                          offsetY: e.clientY - slideRect.top - (icon.y || 0),
                                        });
                                      }
                                    }}
                                  >
                                    <div className="text-center leading-none">{iconData.symbol}</div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newSlides = [...pptSlides];
                                        newSlides[idx].icons = newSlides[idx].icons.filter((_, i) => i !== iconIdx);
                                        setPptSlides(newSlides);
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                    <div
                                      className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        setResizingElement({
                                          slideId: slide.id,
                                          elementId: `icon-${iconIdx}`,
                                          type: 'icon',
                                          startWidth: icon.width || 80,
                                          startHeight: icon.height || 80,
                                          startX: e.clientX,
                                          startY: e.clientY,
                                        });
                                      }}
                                    />
                                  </div>
                                );
                              })}
                              {slide.images && slide.images.map((img, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="absolute group cursor-grab active:cursor-grabbing"
                                  style={{
                                    left: `${img.x || 0}px`,
                                    top: `${img.y || 0}px`,
                                    width: `${img.width || 150}px`,
                                    height: `${img.height || 150}px`,
                                    cursor: draggingElement?.elementId === `image-${imgIdx}` ? 'grabbing' : 'grab',
                                  }}
                                  onMouseDown={(e) => {
                                    if (e.target.closest('.resize-handle')) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const slideElement = document.getElementById(`preview-slide-${slide.id}`);
                                    if (slideElement) {
                                      const slideRect = slideElement.getBoundingClientRect();
                                      setDraggingElement({
                                        slideId: slide.id,
                                        elementId: `image-${imgIdx}`,
                                        type: 'image',
                                        offsetX: e.clientX - slideRect.left - (img.x || 0),
                                        offsetY: e.clientY - slideRect.top - (img.y || 0),
                                      });
                                    }
                                  }}
                                >
                                  <img
                                    src={typeof img === 'string' ? img : img.url}
                                    alt={`Image ${imgIdx + 1}`}
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newSlides = [...pptSlides];
                                      newSlides[idx].images = newSlides[idx].images.filter((_, i) => i !== imgIdx);
                                      setPptSlides(newSlides);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <div
                                    className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setResizingElement({
                                        slideId: slide.id,
                                        elementId: `image-${imgIdx}`,
                                        type: 'image',
                                        startWidth: img.width || 150,
                                        startHeight: img.height || 150,
                                        startX: e.clientX,
                                        startY: e.clientY,
                                      });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {slide.type === 'agenda' && (
                        <div className="h-full flex flex-col justify-center p-8">
                          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Agenda</h2>
                          <ul className="space-y-4">
                            {(slide.items || (dashboardCharts.length > 0 ? dashboardCharts.map(chart => {
                              const chartIndex = chartConfigs.findIndex(c => c.id === chart.id);
                              return chart.title || `Chart ${chartIndex + 1}`;
                            }) : [])).map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-center gap-4 text-xl text-gray-700">
                                <span className="text-blue-600 font-bold">{itemIdx + 1}.</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newSlides = [...pptSlides];
                                    const newItems = [...(newSlides[idx].items || [])];
                                    newItems[itemIdx] = e.target.value;
                                    newSlides[idx].items = newItems;
                                    setPptSlides(newSlides);
                                  }}
                                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {slide.type === 'summary' && (
                        <div className="h-full flex flex-col justify-center p-8">
                          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Executive Summary</h2>
                          <textarea
                            value={slide.content || ''}
                            onChange={(e) => {
                              const newSlides = [...pptSlides];
                              newSlides[idx].content = e.target.value;
                              setPptSlides(newSlides);
                            }}
                            className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Enter executive summary content here..."
                          />
                        </div>
                      )}
                      
                      {slide.type === 'thankyou' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 px-8 py-8">
                          <input
                            type="text"
                            value={slide.message || 'Thank You'}
                            onChange={(e) => {
                              const newSlides = [...pptSlides];
                              newSlides[idx].message = e.target.value;
                              setPptSlides(newSlides);
                            }}
                            className="text-5xl font-bold text-gray-900 bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-3 w-full max-w-2xl mx-auto"
                            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                          />
                          <textarea
                            value={slide.contact || ''}
                            onChange={(e) => {
                              const newSlides = [...pptSlides];
                              newSlides[idx].contact = e.target.value;
                              setPptSlides(newSlides);
                            }}
                            className="text-lg text-gray-600 bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-2 resize-none w-full max-w-xl mx-auto"
                            rows={4}
                            placeholder="Contact details"
                            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                          />
                        </div>
                      )}
                      
                      {/* Slide Edit Controls */}
                      <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 flex-wrap items-center">
                        <button
                          onClick={() => {
                            const newSlides = [...pptSlides];
                            if (!newSlides[idx].images) newSlides[idx].images = [];
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const slideElement = document.getElementById(`preview-slide-${slide.id}`);
                                  const existingImgs = newSlides[idx].images.length;
                                  newSlides[idx].images.push({
                                    id: `img-${Date.now()}`,
                                    url: event.target.result,
                                    x: (existingImgs % 3) * 170,
                                    y: Math.floor(existingImgs / 3) * 170,
                                    width: 150,
                                    height: 150
                                  });
                                  setPptSlides([...newSlides]);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add Image
                        </button>
                        <button
                          onClick={() => setSelectedSlideForEdit(slide.id)}
                          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Add Icon
                        </button>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700">Title Color:</label>
                          <input
                            type="color"
                            value={slide.titleColor || '#1F2937'}
                            onChange={(e) => {
                              const newSlides = [...pptSlides];
                              newSlides[idx].titleColor = e.target.value;
                              setPptSlides(newSlides);
                            }}
                            className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Download & Share Buttons */}
                <div className="flex gap-3 p-4 bg-gray-100 rounded-lg">
                  <button
                    onClick={async () => {
                      const pdf = new jsPDF('p', 'mm', 'a4');
                      // Only export actual slides, no blank slides
                      const validSlides = pptSlides.filter(s => s.type);
                      for (let i = 0; i < validSlides.length; i++) {
                        if (i > 0) pdf.addPage();
                        const slideElement = document.getElementById(`preview-slide-${validSlides[i].id}`);
                        if (slideElement) {
                          // Hide the controls before capturing
                          const controls = slideElement.querySelector('.border-t.border-gray-200');
                          if (controls) controls.style.display = 'none';
                          
                          const canvas = await html2canvas(slideElement, {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            backgroundColor: '#ffffff',
                            windowWidth: slideElement.scrollWidth,
                            windowHeight: slideElement.scrollHeight,
                          });
                          
                          // Restore controls
                          if (controls) controls.style.display = '';
                          
                          const imgData = canvas.toDataURL('image/png');
                          const imgWidth = 210;
                          const imgHeight = (canvas.height * imgWidth) / canvas.width;
                          pdf.addImage(imgData, 'PNG', 5, 5, imgWidth - 10, imgHeight - 10);
                        }
                      }
                      pdf.save('presentation.pdf');
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Download PPT as PDF
                  </button>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/ppt/${Date.now()}`;
                      navigator.clipboard.writeText(link);
                      alert('Shareable link copied to clipboard: ' + link);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Generate & Copy Share Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Icon Library Modal */}
          {selectedSlideForEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Icon Library</h3>
                  <button
                    onClick={() => setSelectedSlideForEdit(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {iconLibrary.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => {
                        const slideIdx = pptSlides.findIndex(s => s.id === selectedSlideForEdit);
                        if (slideIdx !== -1) {
                          const newSlides = [...pptSlides];
                          if (!newSlides[slideIdx].icons) newSlides[slideIdx].icons = [];
                          const existingIcons = newSlides[slideIdx].icons.length;
                          newSlides[slideIdx].icons.push({
                            id: icon.id,
                            symbol: icon.symbol,
                            x: (existingIcons % 3) * 100,
                            y: Math.floor(existingIcons / 3) * 100,
                            width: 80,
                            height: 80
                          });
                          setPptSlides(newSlides);
                        }
                        setSelectedSlideForEdit(null);
                      }}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-center"
                      title={icon.name}
                    >
                      <div className="text-4xl mb-2">{icon.symbol}</div>
                      <div className="text-xs text-gray-600">{icon.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Copy Instructions */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Copy className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">How to Copy Charts:</p>
                <p>Click the "Copy" button on any chart, or right-click the chart and select "Copy Image" to paste it into Word, Excel, or email.</p>
                <p className="mt-2"><strong>Tip:</strong> Right-click on chart labels to sort data (Ascending, Descending, or Clear Sorting).</p>
                <p className="mt-1"><strong>Edit Labels:</strong> Click on any label (chart title, axis labels, category names) to edit them directly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu for Sorting */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={() => handleContextMenuAction('sort-ascending', contextMenu.chartId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Sort Ascending
          </button>
          <button
            onClick={() => handleContextMenuAction('sort-descending', contextMenu.chartId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Sort Descending
          </button>
          <button
            onClick={() => handleContextMenuAction('clear-sorting', contextMenu.chartId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Clear Sorting
          </button>
        </div>
      )}


      <Footer />
    </div>
  );
};

export default SolutionPro;
