import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, AreaChart as RechartsAreaChart, Area, LabelList, Text } from 'recharts';
import { parse, isValid } from 'date-fns';
import { Filter, Search, ChevronRight } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import api from '../../utils/axios';
import { FileSpreadsheet, BarChart3 } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Filter Multi-Select Component (same as in SolutionPro)
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

const SharedChartView = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [fieldRoles, setFieldRoles] = useState({});
  const [fieldModes, setFieldModes] = useState({});
  const [dateHierarchies, setDateHierarchies] = useState({});
  const [availableColumns, setAvailableColumns] = useState([]);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);

  useEffect(() => {
    const loadSharedChart = async () => {
      try {
        const response = await api.get(`/public/shared-chart/${shareId}`);
        if (response.data.success) {
          setChartData(response.data.chartData);
          setChartConfigs(response.data.chartConfigs);
          setGridData(response.data.gridData);
          setFieldRoles(response.data.fieldRoles || {});
          setFieldModes(response.data.fieldModes || {});
          setDateHierarchies(response.data.dateHierarchies || {});
          setAvailableColumns(response.data.availableColumns || []);
          
          // Find first enabled chart
          const firstEnabled = response.data.chartConfigs.findIndex(c => c.enabled);
          if (firstEnabled !== -1) {
            setCurrentChartIndex(firstEnabled);
          }
        } else {
          setError('Shared chart not found');
        }
      } catch (err) {
        console.error('Error loading shared chart:', err);
        setError('Failed to load shared chart. It may have expired or been deleted.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      loadSharedChart();
    }
  }, [shareId]);

  // Copy all the necessary functions from SolutionPro.jsx
  // These functions are needed for rendering charts and filters
  
  const getColumnInfo = (columnName) => {
    if (!chartData.length || !columnName) return { type: 'text', isDate: false, isNumeric: false, parsedDates: [] };
    
    const values = chartData.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length === 0) return { type: 'text', isDate: false, isNumeric: false, parsedDates: [] };

    // Check if numeric first
    const numericValues = values.filter(v => {
      if (typeof v === 'number') return true;
      const str = String(v).trim();
      const num = parseFloat(str);
      return !isNaN(num) && isFinite(num) && !/[-/\s]/.test(str);
    });
    const numericRatio = numericValues.length / values.length;
    const isNumeric = numericRatio > 0.8;

    // Check if date
    let dateCount = 0;
    const sampleSize = Math.min(values.length, 30);
    const samples = values.slice(0, sampleSize);
    
    samples.forEach(val => {
      const str = String(val).trim();
      if (/^[\d.]+$/.test(str) && str.length < 8) return;
      
      if (isValid(new Date(str)) || /[-/\s]/.test(str)) {
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
          const year = parsed.getFullYear();
          if (year >= 1900 && year <= 2100) {
            dateCount++;
          }
        }
      }
    });

    const dateRatio = dateCount / sampleSize;
    const isDate = dateRatio > 0.8 && dateCount >= 3 && !isNumeric;

    return {
      type: isDate ? 'date' : (isNumeric ? 'numeric' : 'text'),
      isDate: !!isDate,
      isNumeric: !!isNumeric,
      parsedDates: [],
    };
  };

  const parseDate = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    if (!str) return null;

    if (/^[\d.]+$/.test(str) && str.length < 8) return null;
    
    const numValue = parseFloat(str);
    if (!isNaN(numValue) && isFinite(numValue)) {
      const hasDateSeparators = /[-/]/.test(str) || /\s/.test(str);
      if (!hasDateSeparators && str.length <= 10) return null;
    }

    const dateFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd', 'MM-dd-yyyy', 'dd-MM-yyyy'];
    for (const format of dateFormats) {
      try {
        const parsed = parse(str, format, new Date());
        if (isValid(parsed)) {
          const year = parsed.getFullYear();
          if (year >= 1900 && year <= 2100) return parsed;
        }
      } catch (e) {}
    }

    if (/[-/\s]/.test(str)) {
      const standardDate = new Date(str);
      if (!isNaN(standardDate.getTime())) {
        const year = standardDate.getFullYear();
        if (year >= 1900 && year <= 2100) return standardDate;
      }
    }

    return null;
  };

  const getDateHierarchy = (date, hierarchy) => {
    if (!date) return '';
    const d = new Date(date);
    switch (hierarchy) {
      case 'year': return String(d.getFullYear());
      case 'quarter': return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
      case 'month': return d.toLocaleString('default', { month: 'short', year: 'numeric' });
      case 'week': return `Week ${Math.ceil((d.getDate()) / 7)}, ${d.getFullYear()}`;
      case 'day': return d.toLocaleDateString();
      default: return d.toLocaleDateString();
    }
  };

  const getUniqueValues = (columnName) => {
    const values = chartData.map(row => String(row[columnName] || '')).filter(v => v.trim() !== '');
    return [...new Set(values)].sort();
  };

  const getMinMaxValues = (columnName) => {
    const values = chartData.map(row => {
      const val = row[columnName];
      return typeof val === 'number' ? val : parseFloat(val);
    }).filter(v => !isNaN(v) && isFinite(v));
    
    if (values.length === 0) return { min: 0, max: 100 };
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const applyFilters = (data, filters) => {
    if (!filters || filters.length === 0) return data;
    
    let filtered = [...data];
    
    filters.forEach(filter => {
      if (filter.filterType === 'range') {
        const min = filter.minValue !== null && filter.minValue !== undefined ? parseFloat(filter.minValue) : null;
        const max = filter.maxValue !== null && filter.maxValue !== undefined ? parseFloat(filter.maxValue) : null;
        
        filtered = filtered.filter(row => {
          const value = parseFloat(row[filter.column]);
          if (isNaN(value)) return false;
          if (min !== null && value < min) return false;
          if (max !== null && value > max) return false;
          return true;
        });
      } else {
        const uniqueValues = getUniqueValues(filter.column);
        const selectedValues = filter.values || [];
        if (selectedValues.length === 0 || selectedValues.length === uniqueValues.length) return;
        
        filtered = filtered.filter(row => {
          const value = String(row[filter.column] || '').trim();
          return selectedValues.includes(value);
        });
      }
    });
    
    return filtered;
  };

  // Generate chart data function (simplified version)
  const generateChartData = (config) => {
    const workingData = applyFilters(chartData, config.filters || []);
    if (workingData.length === 0) return [];

    const xCols = Array.isArray(config.xAxis.columns) ? config.xAxis.columns : (config.xAxis.column ? [config.xAxis.column] : []);
    const yCols = Array.isArray(config.yAxis.columns) ? config.yAxis.columns : (config.yAxis.column ? [config.yAxis.column] : []);

    if (xCols.length === 0 && yCols.length === 0) return [];

    if (xCols.length > 0 && yCols.length > 0) {
      const grouped = {};
      
      workingData.forEach(row => {
        const xKey = xCols.map(col => {
          const colInfo = getColumnInfo(col);
          if (colInfo.isDate) {
            const parsed = parseDate(row[col]);
            if (parsed) {
              const hierarchy = dateHierarchies[col] || 'month';
              return getDateHierarchy(parsed, hierarchy);
            }
          }
          return String(row[col] || '');
        }).join(' | ');

        if (!grouped[xKey]) {
          grouped[xKey] = {};
        }

        yCols.forEach(yCol => {
          const val = parseFloat(row[yCol]) || 0;
          grouped[xKey][yCol] = (grouped[xKey][yCol] || 0) + val;
        });
      });

      return Object.entries(grouped).map(([name, values]) => ({
        name,
        ...values,
        value: Object.values(values)[0] || 0
      }));
    }

    return [];
  };

  // Render chart function (simplified - only show enabled charts with data)
  const renderChart = (config) => {
    if (!config.enabled) return null;
    
    const data = generateChartData(config);
    if (data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available for this chart</p>
          </div>
        </div>
      );
    }

    const appearance = config.appearance || {};
    const fontSize = appearance.fontSize === 'small' ? 12 : appearance.fontSize === 'large' ? 16 : appearance.customFontSize || 14;
    const colors = appearance.useMultiColor ? (appearance.colors || COLORS) : [appearance.colors?.[0] || COLORS[0]];

    if (config.chartType === 'table') {
      const xCols = Array.isArray(config.xAxis.columns) ? config.xAxis.columns : (config.xAxis.column ? [config.xAxis.column] : []);
      const yCols = Array.isArray(config.yAxis.columns) ? config.yAxis.columns : (config.yAxis.column ? [config.yAxis.column] : []);
      const allColumns = [...xCols, ...yCols];
      const uniqueColumns = Array.from(new Set(allColumns));
      const filteredData = applyFilters(chartData, config.filters || []);

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
        <div className="w-full h-full overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px' }}>
          <table className="min-w-full border-collapse bg-white">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                {uniqueColumns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 whitespace-nowrap min-w-[120px]">
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
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                    {uniqueColumns.map((col, colIdx) => {
                      const cellValue = getCellValue(row, col);
                      return (
                        <td key={colIdx} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap">
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
      );
    }

    // For other chart types, render simplified versions
    const chartHeight = 300;

    return (
      <div className="w-full">
        <ResponsiveContainer width="100%" height={chartHeight}>
          {config.chartType === 'bar' && (
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: fontSize }} />
              <YAxis tick={{ fontSize: fontSize }} />
              <Tooltip contentStyle={{ fontSize: `${fontSize}px` }} />
              {appearance.showLegend && <Legend wrapperStyle={{ fontSize: `${fontSize}px` }} />}
              <Bar dataKey="value" fill={colors[0]}>
                {appearance.showDataLabels && (
                  <LabelList dataKey="value" position="top" style={{ fontSize: `${fontSize}px` }} />
                )}
              </Bar>
            </BarChart>
          )}
          {config.chartType === 'pie' && (
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={appearance.showDataLabels ? ({ percent }) => `${(percent * 100).toFixed(0)}%` : false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          )}
          {config.chartType === 'line' && (
            <RechartsLineChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: fontSize }} />
              <YAxis tick={{ fontSize: fontSize }} />
              <Tooltip contentStyle={{ fontSize: `${fontSize}px` }} />
              {appearance.showLegend && <Legend wrapperStyle={{ fontSize: `${fontSize}px` }} />}
              <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={appearance.lineThickness || 2}>
                {appearance.showDataLabels && (
                  <LabelList dataKey="value" position="top" style={{ fontSize: `${fontSize}px` }} />
                )}
              </Line>
            </RechartsLineChart>
          )}
          {config.chartType === 'area' && (
            <RechartsAreaChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: fontSize }} />
              <YAxis tick={{ fontSize: fontSize }} />
              <Tooltip contentStyle={{ fontSize: `${fontSize}px` }} />
              {appearance.showLegend && <Legend wrapperStyle={{ fontSize: `${fontSize}px` }} />}
              <Area type="monotone" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.6}>
                {appearance.showDataLabels && (
                  <LabelList dataKey="value" position="top" style={{ fontSize: `${fontSize}px` }} />
                )}
              </Area>
            </RechartsAreaChart>
          )}
        </ResponsiveContainer>
        {config.showTitle && config.title && (
          <div className="mt-4 text-center">
            <h4 className="text-sm font-semibold" style={{ color: appearance.fontColor || '#000000', fontSize: `${fontSize}px` }}>
              {config.title}
            </h4>
          </div>
        )}
      </div>
    );
  };

  const updateChartConfig = (chartId, updates) => {
    setChartConfigs(prev => prev.map(config => {
      if (config.id === chartId) {
        return { ...config, ...updates };
      }
      return config;
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chart Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const enabledCharts = chartConfigs.filter(c => c.enabled);
  
  if (enabledCharts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Charts Available</h2>
          <p className="text-gray-600">This shared chart view has no enabled charts.</p>
        </div>
      </div>
    );
  }

  const currentConfig = enabledCharts[currentChartIndex] || enabledCharts[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Chart View</h1>
          <p className="text-gray-600">Viewing shared dashboard with {enabledCharts.length} chart(s)</p>
        </div>

        {/* Chart Navigation */}
        {enabledCharts.length > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chart {currentChartIndex + 1} of {enabledCharts.length}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentChartIndex(Math.max(0, currentChartIndex - 1))}
                  disabled={currentChartIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentChartIndex(Math.min(enabledCharts.length - 1, currentChartIndex + 1))}
                  disabled={currentChartIndex >= enabledCharts.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Display */}
        {currentConfig.filters && currentConfig.filters.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="space-y-3">
              {currentConfig.filters.map((filter, idx) => {
                const colInfo = getColumnInfo(filter.column);
                return (
                  <div key={idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{filter.column}</span>
                    </div>
                    
                    {filter.filterType === 'range' ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type={colInfo.isDate ? 'date' : 'number'}
                          value={filter.minValue || ''}
                          onChange={(e) => {
                            const updatedFilters = [...(currentConfig.filters || [])];
                            updatedFilters[idx] = { ...filter, minValue: e.target.value };
                            updateChartConfig(currentConfig.id, { filters: updatedFilters });
                          }}
                          placeholder="Min"
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-500">to</span>
                        <input
                          type={colInfo.isDate ? 'date' : 'number'}
                          value={filter.maxValue || ''}
                          onChange={(e) => {
                            const updatedFilters = [...(currentConfig.filters || [])];
                            updatedFilters[idx] = { ...filter, maxValue: e.target.value };
                            updateChartConfig(currentConfig.id, { filters: updatedFilters });
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
                          const updatedFilters = [...(currentConfig.filters || [])];
                          updatedFilters[idx] = updatedFilter;
                          updateChartConfig(currentConfig.id, { filters: updatedFilters });
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            {currentConfig.showTitle && currentConfig.title && (
              <h2 className="text-2xl font-bold text-gray-900">{currentConfig.title}</h2>
            )}
          </div>
          <div className="w-full">
            {renderChart(currentConfig)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SharedChartView;
