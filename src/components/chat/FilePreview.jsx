import React, { useState } from 'react';
import { FileText, Download, X, File, FileSpreadsheet, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilePreview = ({ file, isOwn, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return <FileText className="w-8 h-8" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="w-8 h-8" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FileImage className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const getFileType = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'PDF Document';
    if (['xls', 'xlsx'].includes(ext)) return 'Excel Spreadsheet';
    if (['csv'].includes(ext)) return 'CSV File';
    if (['doc', 'docx'].includes(ext)) return 'Word Document';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = async () => {
    if (!file.url) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(file.url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`rounded-lg p-3 border ${
        isOwn 
          ? 'bg-white/10 border-white/20' 
          : 'bg-gray-100 border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* File Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
          isOwn ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
        }`}>
          {getFileIcon(file.fileName)}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isOwn ? 'text-white' : 'text-gray-900'
          }`}>
            {file.fileName || 'File'}
          </p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-white/70' : 'text-gray-500'
          }`}>
            {getFileType(file.fileName)} • {formatFileSize(file.size)}
          </p>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            isOwn
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Download file"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default FilePreview;
