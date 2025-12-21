import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../../components/Layout';

const FirstCallDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const contentRef = useRef(null);

  const slides = [
    {
      id: 1,
      title: 'Agenda',
      tagline: 'What We\'ll Cover Today',
      content: (
        <div className="space-y-4">
          <div className="text-2xl font-semibold text-gray-800 mb-8">Presentation Agenda</div>
          <ul className="space-y-4 text-lg text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">1.</span>
              <span>Company Profile - Tabalt Ltd</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">2.</span>
              <span>Portfolio of Services</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">3.</span>
              <span>Ask Sam Overview</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">4.</span>
              <span>How Ask Sam Works</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">5.</span>
              <span>Case Studies</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">6.</span>
              <span>Service Options for Ask Sam</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">7.</span>
              <span>Why Choose Us</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Company Profile',
      tagline: 'Tabalt Ltd - Your Trusted Professional Services Partner',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">About Tabalt Ltd</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Founded in 2021, Tabalt Ltd is a professional services company with a diverse capability centre 
              capable of providing resources and end-to-end delivery of multi-domain services.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Our Services Include:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Software & Tech Support</li>
                  <li>• Accounting & Reporting</li>
                  <li>• Back Office & Contact Centre Support</li>
                  <li>• Financial Services</li>
                  <li>• General Admin Support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Our Mission</h4>
                <p className="text-gray-700 mb-4">
                  To empower businesses by providing exceptional professional services that drive growth and efficiency.
                </p>
                <h4 className="font-bold text-gray-900 mb-2">Our Vision</h4>
                <p className="text-gray-700">
                  To be the leading professional services partner, recognized for innovation, reliability, and client success.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Portfolio of Services',
      tagline: 'Comprehensive Solutions Across Multiple Domains',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💻</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Software & Tech Support</h4>
              <p className="text-gray-600">Technical assistance and software support services</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Accounting & Reporting</h4>
              <p className="text-gray-600">Financial management and reporting solutions</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Back Office & Contact Centre</h4>
              <p className="text-gray-600">Customer support and back-office operations</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Financial Services</h4>
              <p className="text-gray-600">Comprehensive financial service solutions</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Healthcare</h4>
              <p className="text-gray-600">Healthcare support and administrative services</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">General Admin Support</h4>
              <p className="text-gray-600">Administrative and operational support services</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Ask Sam Overview',
      tagline: 'One Assistant. Every Task. Any Industry',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What is Ask Sam?</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Ask Sam is our flagship executive assistant service that provides comprehensive support across 
              business functions and personal tasks. From spreadsheets to suitcases, invoices to itineraries 
              — Ask Sam handles it all.
            </p>
            <div className="bg-white rounded-lg p-6 mb-4">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Key Differentiators</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">✓</span>
                  <div>
                    <strong>Multi-Domain Expertise:</strong> Business, finance, sales, personal, and lifestyle support
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">✓</span>
                  <div>
                    <strong>24/7 Availability:</strong> Round-the-clock support when you need it
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">✓</span>
                  <div>
                    <strong>Scalable Solutions:</strong> From individual tasks to enterprise operations
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">✓</span>
                  <div>
                    <strong>Personalized Service:</strong> Tailored to your specific needs and preferences
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'How Ask Sam Works',
      tagline: 'Simple, Streamlined, Effective',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Sign Up</h4>
              <p className="text-sm text-gray-600">Choose your plan and create your account</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Submit Request</h4>
              <p className="text-sm text-gray-600">Tell us what you need via chat or request form</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Task Assignment</h4>
              <p className="text-sm text-gray-600">Our team assigns the right specialist to your task</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                4
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Get Results</h4>
              <p className="text-sm text-gray-600">Receive completed work and track progress</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <h4 className="font-bold text-gray-900 mb-3">Workflow Process</h4>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Request →</span>
              <span>Review →</span>
              <span>Assign →</span>
              <span>Execute →</span>
              <span>Deliver →</span>
              <span>Feedback</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Case Studies',
      tagline: 'Real Results from Real Clients',
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Case Study 1: Small Business Owner</h4>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-900">Challenge:</strong>
                <p className="text-gray-600 ml-2">A busy entrepreneur needed help managing invoices, travel bookings, and customer inquiries while focusing on business growth.</p>
              </div>
              <div>
                <strong className="text-gray-900">Solution:</strong>
                <p className="text-gray-600 ml-2">Ask Sam handled all administrative tasks, travel planning, and customer support, freeing up 15+ hours per week.</p>
              </div>
              <div>
                <strong className="text-gray-900">Outcome:</strong>
                <p className="text-gray-600 ml-2">Business owner increased revenue by 40% by focusing on core business activities while Ask Sam managed operations.</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Case Study 2: Busy Executive</h4>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-900">Challenge:</strong>
                <p className="text-gray-600 ml-2">A C-level executive struggled to balance work responsibilities with personal tasks like holiday planning and shopping.</p>
              </div>
              <div>
                <strong className="text-gray-900">Solution:</strong>
                <p className="text-gray-600 ml-2">Ask Sam managed calendar, travel arrangements, personal shopping, and holiday planning seamlessly.</p>
              </div>
              <div>
                <strong className="text-gray-900">Outcome:</strong>
                <p className="text-gray-600 ml-2">Executive achieved better work-life balance and improved productivity by 35%.</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Case Study 3: Family Travel Planning</h4>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-900">Challenge:</strong>
                <p className="text-gray-600 ml-2">A family needed comprehensive travel planning for a multi-destination vacation including flights, hotels, and activities.</p>
              </div>
              <div>
                <strong className="text-gray-900">Solution:</strong>
                <p className="text-gray-600 ml-2">Ask Sam researched destinations, booked flights and accommodations, created detailed itineraries, and managed all travel logistics.</p>
              </div>
              <div>
                <strong className="text-gray-900">Outcome:</strong>
                <p className="text-gray-600 ml-2">Family enjoyed a stress-free vacation with perfectly planned itinerary, saving 20+ hours of planning time.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Service Options for Ask Sam',
      tagline: 'Comprehensive Support Across All Categories',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Business Services</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Sales support & lead management</li>
                <li>• Customer support</li>
                <li>• Presales assistance</li>
                <li>• Back office operations</li>
                <li>• Collections management</li>
                <li>• General administration</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Finance Services</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Invoice management</li>
                <li>• Financial reporting</li>
                <li>• Accounting support</li>
                <li>• Expense tracking</li>
                <li>• Budget planning</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Personal Services</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Personal shopping</li>
                <li>• Appointment scheduling</li>
                <li>• Personal admin tasks</li>
                <li>• Event planning</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Lifestyle Services</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Travel planning & booking</li>
                <li>• Holiday planning</li>
                <li>• Restaurant reservations</li>
                <li>• Gift shopping</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: 'Why Choose Us',
      tagline: 'The Tabalt Advantage',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white rounded-xl p-8">
            <h3 className="text-3xl font-bold mb-6">Why Choose Tabalt & Ask Sam?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <span className="text-yellow-400 mr-3 mt-1 text-xl">★</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">Proven Track Record</h4>
                  <p className="text-gray-300">Trusted by 100+ clients since 2021 with consistent delivery excellence</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-3 mt-1 text-xl">★</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">Multi-Domain Expertise</h4>
                  <p className="text-gray-300">Comprehensive capabilities across business, finance, tech, and personal services</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-3 mt-1 text-xl">★</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">Customer-Centric Approach</h4>
                  <p className="text-gray-300">Personalized service tailored to your unique needs and preferences</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-3 mt-1 text-xl">★</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">Reliable & Scalable</h4>
                  <p className="text-gray-300">From individual tasks to enterprise operations, we scale with your needs</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-3 mt-1 text-xl">★</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
                  <p className="text-gray-300">Round-the-clock availability ensuring your needs are met anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [showAllSlides, setShowAllSlides] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      // Show all slides for PDF generation
      const wasShowingAll = showAllSlides;
      if (!showAllSlides) {
        setShowAllSlides(true);
        // Wait for DOM update
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Dynamically load html2pdf.js from CDN
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          generatePDF(wasShowingAll);
        };
        document.body.appendChild(script);
      } else {
        generatePDF(wasShowingAll);
      }
    } catch (error) {
      console.error('Error loading PDF library:', error);
      alert('Failed to generate PDF. Please try using the browser print function (Ctrl+P / Cmd+P)');
      setShowAllSlides(false);
    }
  };

  const generatePDF = (wasShowingAll) => {
    const element = contentRef.current;
    const opt = {
      margin: 0.5,
      filename: 'Tabalt-First-Call-Deck.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(element).save().then(() => {
      if (!wasShowingAll) {
        setShowAllSlides(false);
      }
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Layout title="First Call Deck">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">First Call Deck</h2>
            <p className="text-gray-600 mt-1">Presentation for Tabalt Ltd & Ask Sam</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAllSlides(!showAllSlides)}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
            >
              {showAllSlides ? 'View Single Slide' : 'View All Slides'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <div className="text-gray-600 font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </div>
          <button
            onClick={nextSlide}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Content */}
        <div ref={contentRef} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {showAllSlides ? (
            // PDF View - All Slides
            <div className="space-y-0">
              {slides.map((slide, index) => (
                <div key={slide.id} className={index > 0 ? 'border-t-4 border-gray-300' : ''} style={{ pageBreakAfter: 'always' }}>
                  <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src="/assets/tabalt-logo.png.jpg"
                        alt="Tabalt Logo"
                        className="h-10 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="h-8 w-px bg-white/30"></div>
                      <div className="text-sm text-gray-300">UK Outsourcing Partners</div>
                    </div>
                    <div className="text-sm text-gray-300">Slide {slide.id}</div>
                  </div>
                  <div className="p-12 min-h-[600px]">
                    <div className="mb-6">
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h1>
                      <p className="text-xl text-gray-600">{slide.tagline}</p>
                    </div>
                    <div className="mt-8">
                      {slide.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Normal View - Current Slide
            <>
              <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src="/assets/tabalt-logo.png.jpg"
                    alt="Tabalt Logo"
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="h-8 w-px bg-white/30"></div>
                  <div className="text-sm text-gray-300">UK Outsourcing Partners</div>
                </div>
                <div className="text-sm text-gray-300">Slide {slides[currentSlide].id}</div>
              </div>
              <div className="p-12 min-h-[600px]">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{slides[currentSlide].title}</h1>
                  <p className="text-xl text-gray-600">{slides[currentSlide].tagline}</p>
                </div>
                <div className="mt-8">
                  {slides[currentSlide].content}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default FirstCallDeck;

