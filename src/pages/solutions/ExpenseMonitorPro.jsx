import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  Edit,
  Check,
  X,
  Loader,
  AlertCircle,
  Eye,
  Save
} from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { API_CONFIG } from '../../config/api';

const ExpenseMonitorPro = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError('');
    setUploadedImage(file);
    setExtractedData(null);
    setEditableData(null);
    setIsEditing(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Extract expense data from image
  const handleExtract = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);

      const response = await fetch(`${API_CONFIG.API_URL}/expense-monitor/extract`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to extract expense data');
      }

      if (result.success) {
        setExtractedData(result.data);
        setEditableData({ ...result.data });
        setIsEditing(false);
        showToast('Expense data extracted successfully!', 'success');
      } else {
        throw new Error(result.message || 'Extraction failed');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to extract expense data. Please try again.');
      // Set empty data structure for manual entry
      setExtractedData({
        invoiceNumber: null,
        amount: null,
        companyName: null,
        date: null,
        description: null,
        category: null,
        error: 'Could not extract data. Please enter manually.'
      });
      setEditableData({
        invoiceNumber: '',
        amount: '',
        companyName: '',
        date: '',
        description: '',
        category: ''
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle field edit
  const handleFieldEdit = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save edits
  const handleSaveEdits = () => {
    setExtractedData({ ...editableData });
    setIsEditing(false);
    showToast('Changes saved!', 'success');
  };

  // Cancel edits
  const handleCancelEdits = () => {
    setEditableData({ ...extractedData });
    setIsEditing(false);
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const dataToExport = editableData || extractedData;
    if (!dataToExport) {
      setError('No data to download');
      return;
    }

    // Get all fields
    const fields = ['invoiceNumber', 'amount', 'companyName', 'date', 'description', 'category'];
    const headers = ['Invoice Number', 'Amount', 'Company Name', 'Date', 'Description', 'Category'];
    
    // Build CSV
    const csvRows = [
      headers.join(','),
      fields.map(field => {
        const value = dataToExport[field] || '';
        // Escape commas and quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ];

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV downloaded successfully!', 'success');
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
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

  // Reset
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setExtractedData(null);
    setEditableData(null);
    setIsEditing(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              Expense Monitor Pro
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
              Upload Your Expense Images
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Extract and Manage Your Expenses with AI-Powered Data Extraction
            </p>
          </motion.div>

          {/* Icon Row */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Upload className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Upload</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Extract</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Manage</span>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Upload Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-600" />
                Upload Expense Image
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                {!imagePreview ? (
                  <div>
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">
                      Upload an image of your expense (receipt, invoice, or bill)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="expense-image-upload"
                    />
                    <label
                      htmlFor="expense-image-upload"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Image
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                ) : (
                  <div>
                    <div className="relative inline-block mb-4">
                      <img
                        src={imagePreview}
                        alt="Uploaded expense"
                        className="max-h-64 rounded-lg shadow-md"
                      />
                      <button
                        onClick={handleReset}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={handleExtract}
                        disabled={isProcessing}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-5 h-5 mr-2" />
                            Extract Expense Data
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Data Section */}
            {extractedData && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    Extracted Expense Data
                  </h2>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveEdits}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdits}
                          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showPreview ? 'Hide' : 'Show'} CSV Preview
                    </button>
                    <button
                      onClick={handleDownloadCSV}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Field
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { key: 'invoiceNumber', label: 'Invoice Number' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'companyName', label: 'Company Name' },
                        { key: 'date', label: 'Date' },
                        { key: 'description', label: 'Description' },
                        { key: 'category', label: 'Category' }
                      ].map(field => {
                        const dataToShow = isEditing ? editableData : extractedData;
                        const value = dataToShow?.[field.key] || '';
                        const isEmpty = !value || value === 'null' || value === null;

                        return (
                          <tr key={field.key} className={isEmpty ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {field.label}
                              {isEmpty && (
                                <span className="ml-2 text-xs text-yellow-600">(Missing)</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={value || ''}
                                  onChange={(e) => handleFieldEdit(field.key, e.target.value)}
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                <span className={isEmpty ? 'text-gray-400 italic' : ''}>
                                  {value || 'Not found'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {extractedData?.error && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      {extractedData.error}
                    </p>
                  </div>
                )}

                {/* CSV Preview */}
                {showPreview && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Preview</h3>
                    <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto">
                      {(() => {
                        const dataToExport = editableData || extractedData;
                        const fields = ['invoiceNumber', 'amount', 'companyName', 'date', 'description', 'category'];
                        const headers = ['Invoice Number', 'Amount', 'Company Name', 'Date', 'Description', 'Category'];
                        const values = fields.map(field => dataToExport?.[field] || '');
                        return `${headers.join(',')}\n${values.join(',')}`;
                      })()}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExpenseMonitorPro;
