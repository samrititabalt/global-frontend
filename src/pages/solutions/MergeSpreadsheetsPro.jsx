import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Link as LinkIcon, 
  Table, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Filter,
  ArrowUpDown,
  X,
  Eye,
  Trash2,
  Play,
  HelpCircle
} from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const MergeSpreadsheetsPro = () => {
  const [activeTab, setActiveTab] = useState('sheetA');
  const [sheets, setSheets] = useState({
    sheetA: { data: [], columns: [], identifierColumn: '', name: 'Sheet A' },
    sheetB: { data: [], columns: [], identifierColumn: '', name: 'Sheet B' },
    sheetC: { data: [], columns: [], identifierColumn: '', name: 'Sheet C' }
  });
  const [settings, setSettings] = useState({
    trimWhitespace: true,
    caseInsensitive: true
  });
  const [mergedData, setMergedData] = useState([]);
  const [mergeType, setMergeType] = useState('inner');
  const [validationResults, setValidationResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const itemsPerPage = 50;
  const pasteAreaRefs = {
    sheetA: useRef(null),
    sheetB: useRef(null),
    sheetC: useRef(null)
  };

  // Parse pasted data
  const parsePastedData = (text) => {
    if (!text || !text.trim()) return { columns: [], data: [] };
    
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return { columns: [], data: [] };
    
    // Detect delimiter (tab, comma, or pipe)
    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes(',')) delimiter = ',';
    else if (firstLine.includes('|')) delimiter = '|';
    
    // Parse header row
    const headerRow = firstLine.split(delimiter).map(h => h.trim());
    const columns = headerRow.filter(col => col !== '');
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
      const row = {};
      columns.forEach((col, idx) => {
        let value = values[idx] || '';
        if (settings.trimWhitespace) value = value.trim();
        row[col] = value;
      });
      data.push(row);
    }
    
    return { columns, data };
  };

  // Handle paste
  const handlePaste = (sheetKey, e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const { columns, data } = parsePastedData(text);
    
    setSheets(prev => ({
      ...prev,
      [sheetKey]: {
        ...prev[sheetKey],
        columns,
        data,
        identifierColumn: prev[sheetKey].identifierColumn || columns[0] || ''
      }
    }));
    
    // Show success toast
    showToast('Data pasted successfully!', 'success');
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Clear sheet
  const clearSheet = (sheetKey) => {
    setSheets(prev => ({
      ...prev,
      [sheetKey]: {
        data: [],
        columns: [],
        identifierColumn: '',
        name: prev[sheetKey].name
      }
    }));
    showToast(`${sheets[sheetKey].name} cleared`, 'info');
  };

  // Preview first 10 rows
  const previewSheet = (sheetKey) => {
    const sheet = sheets[sheetKey];
    if (sheet.data.length === 0) {
      showToast('No data to preview', 'error');
      return;
    }
    const preview = sheet.data.slice(0, 10);
    console.log('Preview:', preview);
    alert(`Preview of first 10 rows:\n\n${JSON.stringify(preview, null, 2)}`);
  };

  // Validate matches
  const validateMatches = () => {
    const sheetsToValidate = Object.keys(sheets).filter(key => 
      sheets[key].data.length > 0 && sheets[key].identifierColumn
    );
    
    if (sheetsToValidate.length < 2) {
      showToast('Please add data to at least 2 sheets and select identifier columns', 'error');
      return;
    }

    const results = {
      matchedRows: 0,
      unmatchedRows: {},
      duplicates: {},
      warnings: []
    };

    // Collect all identifiers
    const allIdentifiers = new Map();
    sheetsToValidate.forEach(sheetKey => {
      const sheet = sheets[sheetKey];
      const identifiers = new Map();
      const duplicates = [];
      
      sheet.data.forEach((row, idx) => {
        let id = row[sheet.identifierColumn] || '';
        if (settings.trimWhitespace) id = id.trim();
        if (settings.caseInsensitive) id = id.toLowerCase();
        
        if (!id) {
          results.warnings.push(`${sheet.name}: Row ${idx + 1} has empty identifier`);
        } else if (identifiers.has(id)) {
          duplicates.push(id);
        } else {
          identifiers.set(id, idx);
        }
      });

      if (duplicates.length > 0) {
        results.duplicates[sheetKey] = duplicates.slice(0, 5); // Show first 5
      }

      allIdentifiers.set(sheetKey, identifiers);
    });

    // Find matches
    const firstSheet = sheetsToValidate[0];
    const firstIdentifiers = allIdentifiers.get(firstSheet);
    
    firstIdentifiers.forEach((rowIdx, id) => {
      let allMatch = true;
      for (let i = 1; i < sheetsToValidate.length; i++) {
        if (!allIdentifiers.get(sheetsToValidate[i]).has(id)) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        results.matchedRows++;
      }
    });

    // Find unmatched rows
    sheetsToValidate.forEach(sheetKey => {
      const sheet = sheets[sheetKey];
      const identifiers = allIdentifiers.get(sheetKey);
      const unmatched = [];
      
      identifiers.forEach((rowIdx, id) => {
        let foundInOthers = true;
        sheetsToValidate.forEach(otherKey => {
          if (otherKey !== sheetKey && !allIdentifiers.get(otherKey).has(id)) {
            foundInOthers = false;
          }
        });
        if (!foundInOthers) {
          unmatched.push({ id, row: sheet.data[rowIdx] });
        }
      });
      
      if (unmatched.length > 0) {
        results.unmatchedRows[sheetKey] = unmatched.slice(0, 10); // Show first 10
      }
    });

    setValidationResults(results);
    showToast(`Validation complete: ${results.matchedRows} matched rows found`, 'success');
  };

  // Perform merge
  const performMerge = () => {
    const sheetsToMerge = Object.keys(sheets).filter(key => 
      sheets[key].data.length > 0 && sheets[key].identifierColumn
    );
    
    if (sheetsToMerge.length < 2) {
      showToast('Please add data to at least 2 sheets and select identifier columns', 'error');
      return;
    }

    // Normalize identifiers
    const normalizeId = (id) => {
      let normalized = String(id || '');
      if (settings.trimWhitespace) normalized = normalized.trim();
      if (settings.caseInsensitive) normalized = normalized.toLowerCase();
      return normalized;
    };

    // Build identifier maps
    const identifierMaps = {};
    sheetsToMerge.forEach(sheetKey => {
      const sheet = sheets[sheetKey];
      const map = new Map();
      sheet.data.forEach((row, idx) => {
        const id = normalizeId(row[sheet.identifierColumn]);
        if (id) {
          if (!map.has(id)) {
            map.set(id, []);
          }
          map.get(id).push({ ...row, _sheetSource: sheetKey, _rowIndex: idx });
        }
      });
      identifierMaps[sheetKey] = map;
    });

    const merged = [];
    const allIdentifiers = new Set();
    
    // Collect all identifiers
    sheetsToMerge.forEach(sheetKey => {
      identifierMaps[sheetKey].forEach((rows, id) => {
        allIdentifiers.add(id);
      });
    });

    // Merge based on type
    allIdentifiers.forEach(id => {
      const rowsBySheet = {};
      sheetsToMerge.forEach(sheetKey => {
        rowsBySheet[sheetKey] = identifierMaps[sheetKey].get(id) || [];
      });

      if (mergeType === 'inner') {
        // Only include if present in all sheets
        if (sheetsToMerge.every(sheetKey => rowsBySheet[sheetKey].length > 0)) {
          mergeRows(rowsBySheet, merged, sheetsToMerge);
        }
      } else if (mergeType === 'left') {
        // All rows from first sheet
        if (rowsBySheet[sheetsToMerge[0]].length > 0) {
          mergeRows(rowsBySheet, merged, sheetsToMerge);
        }
      } else if (mergeType === 'full') {
        // All rows from all sheets
        mergeRows(rowsBySheet, merged, sheetsToMerge);
      }
    });

    setMergedData(merged);
    setActiveTab('combined');
    showToast(`Merge complete: ${merged.length} rows created`, 'success');
  };

  // Helper to merge rows
  const mergeRows = (rowsBySheet, merged, sheetsToMerge) => {
    const firstSheet = sheetsToMerge[0];
    const firstRows = rowsBySheet[firstSheet] || [{ _sheetSource: firstSheet }];
    
    firstRows.forEach(firstRow => {
      const mergedRow = { ...firstRow };
      
      // Add columns from other sheets
      sheetsToMerge.slice(1).forEach(sheetKey => {
        const otherRows = rowsBySheet[sheetKey] || [];
        if (otherRows.length > 0) {
          const otherRow = otherRows[0]; // Take first match
          Object.keys(otherRow).forEach(key => {
            if (key !== '_sheetSource' && key !== '_rowIndex') {
              // Handle column name conflicts
              if (mergedRow.hasOwnProperty(key) && mergedRow[key] !== otherRow[key]) {
                mergedRow[`${key}_${sheets[sheetKey].name}`] = otherRow[key];
              } else {
                mergedRow[key] = otherRow[key];
              }
            }
          });
        }
      });
      
      // Remove internal fields
      delete mergedRow._sheetSource;
      delete mergedRow._rowIndex;
      merged.push(mergedRow);
    });
  };

  // Download CSV
  const downloadCSV = () => {
    if (mergedData.length === 0) {
      showToast('No data to download', 'error');
      return;
    }

    // Get all unique columns
    const allColumns = new Set();
    mergedData.forEach(row => {
      Object.keys(row).forEach(col => allColumns.add(col));
    });
    const columns = Array.from(allColumns);

    // Build CSV
    const header = columns.join(',');
    const rows = mergedData.map(row => {
      return columns.map(col => {
        const value = row[col] || '';
        // Escape commas and quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-spreadsheet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV downloaded successfully!', 'success');
  };

  // Filter and sort merged data
  const getFilteredAndSortedData = () => {
    let filtered = [...mergedData];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(term)
        );
      });
    }
    
    // Apply sort
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn] || '';
        const bVal = b[sortColumn] || '';
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return filtered;
  };

  const filteredData = getFilteredAndSortedData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get all columns from merged data
  const mergedColumns = mergedData.length > 0 
    ? Array.from(new Set(mergedData.flatMap(row => Object.keys(row))))
    : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Merge Spreadsheets Pro
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
              Unified Data from Multiple Sheets
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Unify fields from multiple spreadsheets using a common unique identifier (e.g., Project ID).
            </p>
            
            {/* Help Button */}
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <HelpCircle className="w-5 h-5" />
              How it works
            </button>
          </motion.div>

          {/* Help Modal */}
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6 mb-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">How Merge Spreadsheets Pro Works</h3>
                <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Paste your spreadsheet data into Sheet A, B, or C tabs</li>
                <li>Select the identifier column (e.g., Project ID) for each sheet</li>
                <li>Click "Validate Matches" to check for duplicates and unmatched rows</li>
                <li>Choose merge type (Inner Join, Left Join, or Full Outer Join)</li>
                <li>Click "Merge" to combine the data</li>
                <li>View results in Combined View tab and download as CSV</li>
              </ol>
            </motion.div>
          )}

          {/* Icon Row */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Paste Data</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <LinkIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Select ID</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <Table className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Merge</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <Download className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'sheetA', label: 'Sheet A' },
                  { id: 'sheetB', label: 'Sheet B' },
                  { id: 'sheetC', label: 'Sheet C' },
                  { id: 'combined', label: 'Combined View' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab !== 'combined' ? (
                <SheetTab
                  sheetKey={activeTab}
                  sheet={sheets[activeTab]}
                  settings={settings}
                  onPaste={(e) => handlePaste(activeTab, e)}
                  onIdentifierChange={(col) => {
                    setSheets(prev => ({
                      ...prev,
                      [activeTab]: { ...prev[activeTab], identifierColumn: col }
                    }));
                  }}
                  onClear={() => clearSheet(activeTab)}
                  onPreview={() => previewSheet(activeTab)}
                  onSettingsChange={(key, value) => {
                    setSettings(prev => ({ ...prev, [key]: value }));
                  }}
                  pasteAreaRef={pasteAreaRefs[activeTab]}
                />
              ) : (
                <CombinedViewTab
                  data={paginatedData}
                  allData={filteredData}
                  columns={mergedColumns}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={(col) => {
                    if (sortColumn === col) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortColumn(col);
                      setSortDirection('asc');
                    }
                  }}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onDownload={downloadCSV}
                  validationResults={validationResults}
                  mergeType={mergeType}
                  onMergeTypeChange={setMergeType}
                  onValidate={validateMatches}
                  onMerge={performMerge}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Sheet Tab Component
const SheetTab = ({ 
  sheetKey, 
  sheet, 
  settings, 
  onPaste, 
  onIdentifierChange, 
  onClear, 
  onPreview,
  onSettingsChange,
  pasteAreaRef
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-6">
      {/* Paste Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Copy from Excel and paste here — columns will populate automatically
        </label>
        <textarea
          ref={pasteAreaRef}
          onPaste={onPaste}
          placeholder="Paste your spreadsheet data here (Ctrl+V or Cmd+V)"
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Select Identifier Column:</label>
          <select
            value={sheet.identifierColumn}
            onChange={(e) => onIdentifierChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select --</option>
            {sheet.columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.trimWhitespace}
            onChange={(e) => onSettingsChange('trimWhitespace', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Trim whitespace
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.caseInsensitive}
            onChange={(e) => onSettingsChange('caseInsensitive', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Case-insensitive matching
        </label>

        <button
          onClick={onPreview}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview first 10 rows
        </button>

        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear table
        </button>
      </div>

      {/* Data Table */}
      {sheet.data.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {sheet.columns.map(col => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                        col === sheet.identifierColumn ? 'bg-blue-100' : ''
                      }`}
                    >
                      {col}
                      {col === sheet.identifierColumn && (
                        <span className="ml-1 text-blue-600">(ID)</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sheet.data.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {sheet.columns.map(col => (
                      <td key={col} className="px-4 py-2 text-sm text-gray-900">
                        {row[col] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sheet.data.length > 100 && (
            <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
              Showing first 100 of {sheet.data.length} rows
            </div>
          )}
        </div>
      )}

      {sheet.data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No data yet. Paste your spreadsheet data above.</p>
        </div>
      )}
    </div>
  );
};

// Combined View Tab Component
const CombinedViewTab = ({
  data,
  allData,
  columns,
  searchTerm,
  onSearchChange,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  onDownload,
  validationResults,
  mergeType,
  onMergeTypeChange,
  onValidate,
  onMerge
}) => {
  return (
    <div className="space-y-6">
      {/* Merge Controls */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Merge Type:</label>
            <select
              value={mergeType}
              onChange={(e) => onMergeTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="inner">Inner Join (matching rows only)</option>
              <option value="left">Left Join (Sheet A primary)</option>
              <option value="full">Full Outer Join (all rows)</option>
            </select>
          </div>
          <button
            onClick={onValidate}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Validate Matches
          </button>
          <button
            onClick={onMerge}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Merge
          </button>
        </div>

        {/* Validation Results */}
        {validationResults && (
          <div className="mt-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium">Matched Rows:</span> {validationResults.matchedRows}
            </div>
            {Object.keys(validationResults.duplicates).length > 0 && (
              <div className="text-sm text-yellow-700">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Duplicates found in: {Object.keys(validationResults.duplicates).join(', ')}
              </div>
            )}
            {Object.keys(validationResults.unmatchedRows).length > 0 && (
              <div className="text-sm text-orange-700">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Unmatched rows in: {Object.keys(validationResults.unmatchedRows).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {allData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Rows:</span> {allData.length}
            </div>
            <div>
              <span className="font-medium">Columns:</span> {columns.length}
            </div>
            <div>
              <span className="font-medium">Merge Type:</span> {
                mergeType === 'inner' ? 'Inner Join' :
                mergeType === 'left' ? 'Left Join' :
                'Full Outer Join'
              }
            </div>
            <div>
              <span className="font-medium">Page:</span> {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search merged data..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onDownload}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* Data Table */}
      {data.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => onSort(col)}
                    >
                      <div className="flex items-center gap-2">
                        {col}
                        {sortColumn === col && (
                          <ArrowUpDown className={`w-4 h-4 ${sortDirection === 'asc' ? '' : 'rotate-180'}`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map(col => (
                      <td key={col} className="px-4 py-2 text-sm text-gray-900">
                        {row[col] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Table className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No merged data yet. Use the merge controls above to combine your sheets.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MergeSpreadsheetsPro;
