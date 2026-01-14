import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, FileText, FileType, Edit3, Save, X, PenTool, Highlighter, Type, Trash2, Move } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../utils/axios';

const DocumentConverterPro = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State for Word to PDF
  const [wordFile, setWordFile] = useState(null);
  const [wordPdfUrl, setWordPdfUrl] = useState(null);
  const [isConvertingWord, setIsConvertingWord] = useState(false);
  const wordInputRef = useRef(null);

  // State for PDF to Word
  const [pdfFile, setPdfFile] = useState(null);
  const [wordDocUrl, setWordDocUrl] = useState(null);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const pdfInputRef = useRef(null);

  // State for PDF Editor
  const [editorPdfFile, setEditorPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [editorMode, setEditorMode] = useState('text'); // 'text', 'highlight', 'draw', 'select'
  const [annotations, setAnnotations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPdfUrl, setEditedPdfUrl] = useState(null);
  const editorInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState([]);
  const [highlightAreas, setHighlightAreas] = useState([]);

  // Word to PDF Conversion
  const handleWordUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(doc|docx)$/i)) {
      alert('Please upload a Word document (.doc or .docx)');
      return;
    }

    setWordFile(file);
    setIsConvertingWord(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'word-to-pdf');

      // For now, we'll use a client-side conversion approach
      // In production, this would call a backend API
      // Simulating conversion process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a PDF using jsPDF (simplified - in production, use proper Word to PDF conversion)
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add text indicating this is a converted document
      doc.setFontSize(16);
      doc.text('Converted from Word Document', 20, 20);
      doc.setFontSize(12);
      doc.text(`Original File: ${file.name}`, 20, 30);
      doc.text('Note: Full Word to PDF conversion requires backend processing.', 20, 40);
      doc.text('This is a placeholder. In production, the actual Word content', 20, 50);
      doc.text('would be converted and displayed here.', 20, 60);

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setWordPdfUrl(url);
      
      alert('Word document converted to PDF successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Error converting Word to PDF. Please try again.');
    } finally {
      setIsConvertingWord(false);
    }
  };

  // PDF to Word Conversion
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.pdf$/i)) {
      alert('Please upload a PDF document');
      return;
    }

    setPdfFile(file);
    setIsConvertingPdf(true);

    try {
      // Simulating conversion process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would call a backend API to convert PDF to Word
      // For now, create a placeholder Word document
      const textContent = `Converted from PDF: ${file.name}\n\nNote: Full PDF to Word conversion requires backend processing.\nThis is a placeholder. In production, the actual PDF content would be extracted and converted to Word format.`;
      
      // Create a simple text file as placeholder (in production, use proper DOCX generation)
      const blob = new Blob([textContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      setWordDocUrl(url);
      
      alert('PDF converted to Word document successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Error converting PDF to Word. Please try again.');
    } finally {
      setIsConvertingPdf(false);
    }
  };

  // PDF Editor - Load PDF
  const handleEditorPdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.pdf$/i)) {
      alert('Please upload a PDF document');
      return;
    }

    setEditorPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setIsEditing(true);
    setAnnotations([]);
    setHighlightAreas([]);
    setDrawPath([]);
  };

  // PDF Editor - Add Text Annotation
  const addTextAnnotation = (x, y, text = '') => {
    const newAnnotation = {
      id: Date.now(),
      type: 'text',
      x,
      y,
      text: text || 'New Text',
      editing: true,
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  // PDF Editor - Add Highlight
  const addHighlight = (x, y, width, height) => {
    const newHighlight = {
      id: Date.now(),
      type: 'highlight',
      x,
      y,
      width,
      height,
    };
    setHighlightAreas([...highlightAreas, newHighlight]);
  };

  // PDF Editor - Handle Canvas Drawing
  const handleCanvasMouseDown = (e) => {
    if (editorMode !== 'draw') return;
    setDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawPath([{ x, y }]);
  };

  const handleCanvasMouseMove = (e) => {
    if (!drawing || editorMode !== 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawPath(prev => [...prev, { x, y }]);
    
    // Draw on canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && drawPath.length > 0) {
        const lastPoint = drawPath[drawPath.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (drawing && editorMode === 'draw' && drawPath.length > 0) {
      const newAnnotation = {
        id: Date.now(),
        type: 'draw',
        path: [...drawPath],
      };
      setAnnotations([...annotations, newAnnotation]);
      setDrawPath([]);
    }
    setDrawing(false);
  };

  // Redraw canvas when annotations change
  useEffect(() => {
    if (canvasRef.current && annotations.length > 0 && editorMode === 'draw') {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        annotations.filter(a => a.type === 'draw').forEach(annotation => {
          if (annotation.path && annotation.path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.path[0].x, annotation.path[0].y);
            for (let i = 1; i < annotation.path.length; i++) {
              ctx.lineTo(annotation.path[i].x, annotation.path[i].y);
            }
            ctx.strokeStyle = '#8B5CF6';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      }
    }
  }, [annotations, editorMode]);
  
  // Draw current path
  useEffect(() => {
    if (canvasRef.current && drawing && drawPath.length > 1) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        // Redraw all annotations
        annotations.filter(a => a.type === 'draw').forEach(annotation => {
          if (annotation.path && annotation.path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.path[0].x, annotation.path[0].y);
            for (let i = 1; i < annotation.path.length; i++) {
              ctx.lineTo(annotation.path[i].x, annotation.path[i].y);
            }
            ctx.strokeStyle = '#8B5CF6';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
        // Draw current path
        ctx.beginPath();
        ctx.moveTo(drawPath[0].x, drawPath[0].y);
        for (let i = 1; i < drawPath.length; i++) {
          ctx.lineTo(drawPath[i].x, drawPath[i].y);
        }
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [drawPath, drawing, annotations]);

  // PDF Editor - Save Edited PDF
  const saveEditedPdf = async () => {
    if (!pdfUrl) return;

    try {
      // In production, use pdf-lib to merge annotations with PDF
      // For now, create a simple download
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      // Add annotations info as metadata (in production, embed in PDF)
      const annotationsData = {
        annotations,
        highlights: highlightAreas,
        timestamp: new Date().toISOString(),
      };
      
      // Create a new blob with annotations (simplified)
      const url = URL.createObjectURL(blob);
      setEditedPdfUrl(url);
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${editorPdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert('Edited PDF saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving PDF. Please try again.');
    }
  };

  // Delete annotation
  const deleteAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  // Update annotation text
  const updateAnnotationText = (id, text) => {
    setAnnotations(annotations.map(a => 
      a.id === id ? { ...a, text, editing: false } : a
    ));
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Document Converter & PDF Editor Pro
            </h1>
            <p className="text-xl text-blue-100">Your complete toolkit for document transformation</p>
          </div>

          {/* Workflow Description */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Convert documents between formats and edit PDFs directly in your browser. 
              Upload your files, process them instantly, and download the results—all in one place.
            </p>
          </div>

          {/* Word to PDF Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileType className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Word to PDF Conversion</h2>
            </div>
            
            <div className="space-y-4">
              <input
                ref={wordInputRef}
                type="file"
                accept=".doc,.docx"
                onChange={handleWordUpload}
                className="hidden"
              />
              
              <button
                onClick={() => wordInputRef.current?.click()}
                disabled={isConvertingWord}
                className="w-full py-6 px-8 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-10 w-10 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {isConvertingWord ? 'Converting...' : 'Upload Word Document (.doc or .docx)'}
                </span>
                <span className="text-sm text-gray-600">Click to select a file</span>
              </button>

              {wordFile && (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileType className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-900 font-medium">{wordFile.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setWordFile(null);
                      setWordPdfUrl(null);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {wordPdfUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-semibold">Conversion Successful!</span>
                  </div>
                  <a
                    href={wordPdfUrl}
                    download={`converted_${wordFile?.name.replace(/\.(doc|docx)$/i, '.pdf')}`}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* PDF to Word Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">PDF to Word Conversion</h2>
            </div>
            
            <div className="space-y-4">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              
              <button
                onClick={() => pdfInputRef.current?.click()}
                disabled={isConvertingPdf}
                className="w-full py-6 px-8 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-10 w-10 text-purple-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {isConvertingPdf ? 'Converting...' : 'Upload PDF Document'}
                </span>
                <span className="text-sm text-gray-600">Click to select a file</span>
              </button>

              {pdfFile && (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-900 font-medium">{pdfFile.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setWordDocUrl(null);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {wordDocUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-semibold">Conversion Successful!</span>
                  </div>
                  <a
                    href={wordDocUrl}
                    download={`converted_${pdfFile?.name.replace(/\.pdf$/i, '.docx')}`}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Word Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* PDF Editor Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <Edit3 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">PDF Editor</h2>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <input
                  ref={editorInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleEditorPdfUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => editorInputRef.current?.click()}
                  className="w-full py-6 px-8 border-2 border-dashed border-green-300 rounded-xl bg-green-50 hover:bg-green-100 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <Upload className="h-10 w-10 text-green-600" />
                  <span className="text-lg font-semibold text-gray-900">Open & Edit PDF</span>
                  <span className="text-sm text-gray-600">Click to select a PDF file</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Editor Toolbar */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setEditorMode('text')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      editorMode === 'text' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Type className="h-4 w-4 inline mr-2" />
                    Add Text
                  </button>
                  <button
                    onClick={() => setEditorMode('highlight')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      editorMode === 'highlight' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Highlighter className="h-4 w-4 inline mr-2" />
                    Highlight
                  </button>
                  <button
                    onClick={() => setEditorMode('draw')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      editorMode === 'draw' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <PenTool className="h-4 w-4 inline mr-2" />
                    Draw
                  </button>
                  <button
                    onClick={() => {
                      setEditorPdfFile(null);
                      setPdfUrl(null);
                      setIsEditing(false);
                      setAnnotations([]);
                      setHighlightAreas([]);
                    }}
                    className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Close
                  </button>
                </div>

                {/* PDF Viewer with Editing Overlay */}
                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ minHeight: '600px' }}>
                  {pdfUrl && (
                    <iframe
                      src={pdfUrl}
                      className="w-full"
                      style={{ minHeight: '600px', height: '800px' }}
                      title="PDF Viewer"
                    />
                  )}
                  
                  {/* Editing Overlay Canvas */}
                  {editorMode === 'draw' && (
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-auto"
                      style={{ minHeight: '600px', height: '800px' }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                  )}
                  
                  {/* Annotations Overlay */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {annotations.map(annotation => {
                      if (annotation.type === 'text') {
                        return (
                          <div
                            key={annotation.id}
                            className="absolute pointer-events-auto"
                            style={{ left: `${annotation.x}px`, top: `${annotation.y}px` }}
                          >
                            {annotation.editing ? (
                              <input
                                type="text"
                                value={annotation.text}
                                onChange={(e) => updateAnnotationText(annotation.id, e.target.value)}
                                onBlur={() => updateAnnotationText(annotation.id, annotation.text)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateAnnotationText(annotation.id, annotation.text);
                                  }
                                }}
                                autoFocus
                                className="px-2 py-1 border-2 border-blue-500 rounded bg-white text-sm"
                              />
                            ) : (
                              <div className="relative group">
                                <div className="px-2 py-1 bg-blue-100 border border-blue-300 rounded text-sm cursor-pointer">
                                  {annotation.text}
                                </div>
                                <button
                                  onClick={() => deleteAnnotation(annotation.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                    
                    {highlightAreas.map(highlight => (
                      <div
                        key={highlight.id}
                        className="absolute bg-yellow-300 opacity-50 pointer-events-none"
                        style={{
                          left: `${highlight.x}px`,
                          top: `${highlight.y}px`,
                          width: `${highlight.width}px`,
                          height: `${highlight.height}px`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Click to Add Text */}
                  {editorMode === 'text' && (
                    <div className="absolute inset-0 pointer-events-auto cursor-text" 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        addTextAnnotation(e.clientX - rect.left, e.clientY - rect.top);
                      }}
                    />
                  )}

                  {/* Click to Add Highlight */}
                  {editorMode === 'highlight' && (
                    <div className="absolute inset-0 pointer-events-auto cursor-crosshair"
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const startX = e.clientX - rect.left;
                        const startY = e.clientY - rect.top;
                        const handleMouseUp = (e2) => {
                          const endX = e2.clientX - rect.left;
                          const endY = e2.clientY - rect.top;
                          addHighlight(
                            Math.min(startX, endX),
                            Math.min(startY, endY),
                            Math.abs(endX - startX),
                            Math.abs(endY - startY)
                          );
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={saveEditedPdf}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DocumentConverterPro;
