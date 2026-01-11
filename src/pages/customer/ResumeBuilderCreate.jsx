import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, ArrowRight, ArrowLeft, CheckCircle2, 
  Download, Edit2, X, AlertCircle, Loader, Image as ImageIcon 
} from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResumeBuilderCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [usageRemaining, setUsageRemaining] = useState(10);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [generatedResume, setGeneratedResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const resumePreviewRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await api.get('/customer/profile');
      setUsageRemaining(response.data.user?.resumeBuilderUsageRemaining || 10);
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, or JPEG image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      setError('Job description and resume text are required');
      return;
    }

    if (usageRemaining <= 0) {
      setError('You have reached your usage limit. Please contact support.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      formData.append('resumeText', resumeText);
      formData.append('instructions', instructions || '');
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await api.post('/resume-builder/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setGeneratedResume(response.data.resume);
      setCurrentStep(6); // Preview step
      setUsageRemaining(usageRemaining - 1);
      
      // Delete uploaded image from backend
      if (profileImage) {
        try {
          await api.delete('/resume-builder/image');
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      setError(error.response?.data?.message || 'Failed to generate resume. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumePreviewRef.current) return;

    try {
      setLoading(true);
      const element = resumePreviewRef.current;
      
      // Use html2canvas to capture the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      
      // Calculate how many pages needed
      const totalPages = Math.ceil(imgScaledHeight / pdfHeight);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, -(i * pdfHeight), imgScaledWidth, imgScaledHeight);
      }
      
      pdf.save('resume.pdf');
      setLoading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Job Description' },
    { number: 2, title: 'Your Resume' },
    { number: 3, title: 'Profile Picture' },
    { number: 4, title: 'Instructions' },
    { number: 5, title: 'Generate' }
  ];

  return (
    <Layout title="Resume Builder">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <div className="text-sm text-gray-600">
              Uses remaining: <span className="font-semibold text-blue-600">{usageRemaining}</span>
            </div>
          </div>
          
          {/* Progress Steps */}
          {currentStep < 6 && (
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className="mt-2 text-xs text-gray-600 text-center">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Job Description</h2>
              <p className="text-gray-600 mb-6">Paste the job description you're applying for</p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleNext}
                  disabled={!jobDescription.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Input Your Resume</h2>
              <p className="text-gray-600 mb-6">Paste your existing resume text</p>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!resumeText.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Profile Picture</h2>
              <p className="text-gray-600 mb-6">Upload your professional profile picture (PNG, JPG, JPEG)</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {profileImageUrl ? (
                  <div className="space-y-4">
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-600"
                    />
                    <button
                      onClick={() => {
                        setProfileImage(null);
                        setProfileImageUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Choose Image
                    </button>
                    <p className="text-sm text-gray-500 mt-4">Max size: 5MB</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions (Optional)</h2>
              <p className="text-gray-600 mb-6">
                Provide specific instructions for resume formatting. If left blank, a default 2-page format will be used.
              </p>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., 'Use 3 pages', 'Emphasize sales achievements', 'Include specific projects'..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Resume</h2>
              <p className="text-gray-600 mb-6">Review your inputs and generate your resume</p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Job Description</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{jobDescription.substring(0, 100)}...</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Resume Text</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{resumeText.substring(0, 100)}...</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Profile Picture</p>
                  <p className="text-sm text-gray-600">{profileImage ? 'Uploaded' : 'Not provided'}</p>
                </div>
                {instructions && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Instructions</p>
                    <p className="text-sm text-gray-600">{instructions}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating || usageRemaining <= 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Resume
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && generatedResume && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'Done Editing' : 'Edit'}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                </div>
              </div>

              <div
                ref={resumePreviewRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className="resume-preview bg-white border border-gray-200 rounded-lg p-8"
                dangerouslySetInnerHTML={{ __html: generatedResume }}
                style={{
                  minHeight: '800px',
                  ...(isEditing ? { outline: '2px solid #3b82f6', outlineOffset: '4px' } : {})
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ResumeBuilderCreate;
