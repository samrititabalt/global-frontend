import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, FileSpreadsheet, TrendingUp, Zap, CheckCircle, ArrowRight, Play } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import { useAuth } from '../../context/AuthContext';
import OwnerAutoLoginButton from '../../components/solutions/OwnerAutoLoginButton';
import OwnerAutoLoginButton from '../../components/solutions/OwnerAutoLoginButton';

const SamsSmartReports = () => {
  const { isAuthenticated, user, autoLoginOwnerAsCustomer, loading } = useAuth();
  const ownerEmail = 'spbajaj25@gmail.com';
  
  // Auto-login owner as customer when they access solution pages
  useEffect(() => {
    const checkAndAutoLogin = async () => {
      if (!loading && isAuthenticated && user?.email?.toLowerCase() === ownerEmail && user?.role !== 'customer') {
        // Owner is logged in but not as customer - auto-login as customer
        try {
          await autoLoginOwnerAsCustomer();
        } catch (error) {
          console.error('Auto-login error:', error);
        }
      }
    };
    
    checkAndAutoLogin();
  }, [isAuthenticated, user, loading, ownerEmail, autoLoginOwnerAsCustomer]);
  
  // Check if user is customer OR owner email (which should have customer access)
  const isCustomer = isAuthenticated && (
    user?.role === 'customer' || 
    user?.email?.toLowerCase() === ownerEmail
  );

  const features = [
    { icon: FileSpreadsheet, title: 'Paste Excel Data', description: 'Simply paste your Excel-style data (rows and columns) directly into the tool' },
    { icon: Zap, title: 'Instant Conversion', description: 'Watch as your data transforms into beautiful, interactive dashboards automatically' },
    { icon: BarChart3, title: 'Smart Charts', description: 'Get bar charts, pie charts, and more - automatically generated from your data' },
    { icon: TrendingUp, title: 'Real-time Updates', description: 'Charts update instantly as you modify your data' },
    { icon: CheckCircle, title: 'Export & Share', description: 'Download as PDF or copy charts directly to Word, Excel, or email' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-blue-600">Sam's Smart Reports</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Transform your Excel data into professional dashboards and charts in seconds. No complex setup, no learning curve—just paste and visualize.
              </p>
              <p className="text-lg text-gray-500 mb-8">
                Convert pasted Excel-style data (rows + columns) into interactive dashboards with beautiful charts automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isCustomer ? (
                  <Link
                    to="/customer/solution-pro"
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Access Pro Version
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <OwnerAutoLoginButton 
                    ownerEmail={ownerEmail}
                    autoLoginOwnerAsCustomer={autoLoginOwnerAsCustomer}
                    onSuccess={() => window.location.href = '/customer/solution-pro'}
                    text="Try Free"
                  />
                )}
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  {/* High-Quality Dashboard Preview */}
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200">
                    <div className="h-full p-4 flex flex-col">
                      {/* Dashboard Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Analytics Dashboard</h3>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Charts Grid */}
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        {/* Bar Chart */}
                        <div className="bg-white rounded border border-gray-200 p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Sales by Region</p>
                          <div className="flex items-end justify-between h-20 gap-1">
                            {[65, 45, 80, 55, 70, 40].map((height, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div 
                                  className="w-full bg-blue-500 rounded-t"
                                  style={{ height: `${height}%` }}
                                ></div>
                                <span className="text-[8px] text-gray-500 mt-1">{['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'][i]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Pie Chart */}
                        <div className="bg-white rounded border border-gray-200 p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Revenue Split</p>
                          <div className="flex items-center justify-center h-20">
                            <div className="relative w-16 h-16">
                              <div className="absolute inset-0 rounded-full border-4 border-blue-500"></div>
                              <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-0 border-r-0" style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 50%)' }}></div>
                              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-0" style={{ clipPath: 'polygon(50% 50%, 0% 0%, 0% 50%)' }}></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-gray-700">$2.4M</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Line Chart */}
                        <div className="bg-white rounded border border-gray-200 p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Growth Trend</p>
                          <div className="relative h-20">
                            <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                              <polyline
                                points="5,50 20,45 35,30 50,25 65,20 80,15 95,10"
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="2"
                              />
                              <circle cx="95" cy="10" r="2" fill="#3B82F6" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Stats Card */}
                        <div className="bg-white rounded border border-gray-200 p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Key Metrics</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-gray-600">Total Sales</span>
                              <span className="text-xs font-bold text-gray-900">$1.2M</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-gray-600">Growth</span>
                              <span className="text-xs font-bold text-green-600">+24%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-gray-600">Customers</span>
                              <span className="text-xs font-bold text-gray-900">1,234</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Chart Indicators */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-16 bg-gradient-to-br from-blue-200 to-indigo-200 rounded border border-blue-300"></div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your data into professional reports
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how Sam's Smart Reports converts your Excel data into beautiful dashboards
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            {/* 
              ============================================
              VIDEO DEMO STORYBOARD - FOR FUTURE PRODUCTION
              ============================================
              
              VIDEO DURATION: 2-3 minutes
              VOICEOVER: Friendly female voice, clear and professional
              STYLE: Screen recording with voiceover narration
              
              SCENE BREAKDOWN:
              
              SCENE 1 (0:00 - 0:15) - Introduction
              - Show the Solution Pro page loading
              - Voiceover: "Welcome to Sam's Smart Reports. Let me show you how easy it is to transform your Excel data into professional dashboards."
              - Zoom in on the empty spreadsheet grid
              
              SCENE 2 (0:15 - 0:30) - Pasting Data
              - User pastes Excel data (rows and columns) into the grid
              - Show data appearing row by row
              - Voiceover: "Simply paste your Excel data directly into the grid. The system automatically detects your columns and data types."
              - Highlight the data being pasted
              
              SCENE 3 (0:30 - 0:50) - Selecting Fields
              - Show the drag-and-drop interface
              - Drag a field (e.g., "Country") to X-axis drop zone
              - Drag a field (e.g., "Sales") to Y-axis drop zone
              - Voiceover: "Now, select your fields. Drag any column to the X or Y axis. You can choose whether it's a dimension or a measure."
              - Show the field role toggle (Dimension/Measure)
              
              SCENE 4 (0:50 - 1:10) - Choosing Aggregation
              - Click on aggregation dropdown
              - Select "Sum" from the options (sum, avg, count, mean, median, CAGR)
              - Voiceover: "Choose how to aggregate your data - sum, average, count, or other statistical measures."
              - Show the dropdown options clearly
              
              SCENE 5 (1:10 - 1:25) - Chart Updates Live
              - Chart appears and updates in real-time
              - Show the bar chart rendering with data
              - Voiceover: "Watch as your chart updates instantly. The system automatically generates the best visualization for your data."
              - Highlight the chart appearing
              
              SCENE 6 (1:25 - 1:45) - Editing Labels
              - Click on a category label (e.g., "USA")
              - Label becomes editable input field
              - Type new label (e.g., "United States")
              - Press Enter to save
              - Voiceover: "You can edit any label directly in the chart. Just click on it and type your custom text."
              - Show multiple labels being edited
              
              SCENE 7 (1:45 - 2:00) - Sorting
              - Right-click on chart labels
              - Context menu appears with "Sort Ascending", "Sort Descending", "Clear Sorting"
              - Select "Sort Descending"
              - Chart reorders immediately
              - Voiceover: "Right-click on any label to sort your data. Choose ascending, descending, or clear the sorting."
              - Show the sorting animation
              
              SCENE 8 (2:00 - 2:20) - Customizing Appearance
              - Open customization panel
              - Change colors (select multi-color palette)
              - Adjust font size to "Large"
              - Change legend position to "Right"
              - Voiceover: "Customize your chart's appearance. Change colors, fonts, legend position, and more to match your brand."
              - Show the chart updating with new colors
              
              SCENE 9 (2:20 - 2:35) - Downloading PDF
              - Click "Download PDF" button
              - Show PDF being generated (loading state)
              - PDF opens/downloads
              - Voiceover: "Export your entire dashboard as a PDF with one click. Perfect for reports and presentations."
              - Show the PDF preview briefly
              
              SCENE 10 (2:35 - 2:50) - Copying Charts
              - Click "Copy" button on a chart
              - Show success message "Chart copied to clipboard!"
              - Open Word/Excel document
              - Paste the chart (Ctrl+V)
              - Chart appears in document
              - Voiceover: "Or copy individual charts directly to your clipboard. Paste them into Word, Excel, or email - they work everywhere."
              - Show the chart in the document
              
              SCENE 11 (2:50 - 3:00) - Closing
              - Show the final dashboard with multiple charts
              - Pan across all 6 charts
              - Voiceover: "That's it! In just minutes, you've transformed raw data into a professional dashboard. Try Sam's Smart Reports today."
              - Fade to CTA button
              
              TECHNICAL REQUIREMENTS:
              - Screen resolution: 1920x1080 minimum
              - Frame rate: 30fps
              - Format: MP4 (H.264)
              - Audio: Clear, professional voiceover (female voice recommended)
              - Subtitles: Optional but recommended
              - Background music: Soft, professional (optional, keep volume low)
              
              EDITING NOTES:
              - Use smooth transitions between scenes
              - Add subtle zoom effects on important actions
              - Highlight clickable elements with subtle glow or highlight
              - Use cursor highlighting for better visibility
              - Add text overlays for key steps (optional)
              - Ensure all text in the UI is readable
              - Use consistent color scheme matching the brand
            */}
            
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Video Player Component */}
              <div className="aspect-video relative group cursor-pointer">
                {/* Video Thumbnail - Professional Dashboard Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
                  {/* Thumbnail Content - Dashboard Preview */}
                  <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-4xl">
                      {/* Browser Window Mockup */}
                      <div className="bg-gray-800 rounded-t-lg p-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300 text-center">
                          solution-pro
                        </div>
                      </div>
                      
                      {/* Dashboard Preview in Thumbnail */}
                      <div className="bg-white rounded-b-lg p-4">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {/* Chart 1 - Bar Chart */}
                          <div className="bg-gray-50 rounded border border-gray-200 p-2">
                            <div className="text-xs font-semibold text-gray-700 mb-1">Sales by Region</div>
                            <div className="flex items-end gap-1 h-12">
                              {[70, 50, 85, 60].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${h}%` }}></div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Chart 2 - Pie Chart */}
                          <div className="bg-gray-50 rounded border border-gray-200 p-2">
                            <div className="text-xs font-semibold text-gray-700 mb-1">Distribution</div>
                            <div className="flex items-center justify-center h-12">
                              <div className="w-10 h-10 rounded-full border-4 border-blue-500"></div>
                            </div>
                          </div>
                          
                          {/* Chart 3 - Line Chart */}
                          <div className="bg-gray-50 rounded border border-gray-200 p-2">
                            <div className="text-xs font-semibold text-gray-700 mb-1">Trend</div>
                            <div className="h-12 flex items-end">
                              <svg className="w-full h-full" viewBox="0 0 40 20">
                                <polyline points="0,15 10,12 20,8 30,5 40,2" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Spreadsheet Preview */}
                        <div className="bg-gray-50 rounded border border-gray-200 p-2">
                          <div className="text-xs font-semibold text-gray-700 mb-1">Data Input</div>
                          <div className="grid grid-cols-4 gap-1 text-[8px]">
                            {['Country', 'Sales', 'Qty', 'Date'].map((h, i) => (
                              <div key={i} className="font-semibold text-gray-600">{h}</div>
                            ))}
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="text-gray-500">{['USA', '1000', '50', '2024'][i % 4]}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="bg-white/90 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="h-10 w-10 text-blue-600 ml-1" />
                    </div>
                  </div>
                  
                  {/* Video Label */}
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white text-lg font-semibold mb-1">Interactive Demo Video</p>
                    <p className="text-blue-100 text-sm">Coming Soon</p>
                  </div>
                </div>
                
                {/* HTML5 Video Element (Placeholder - will be replaced with actual video) */}
                <video
                  className="hidden w-full h-full object-cover"
                  controls
                  poster=""
                  preload="none"
                >
                  <source src="" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            <p className="text-center text-gray-500 mt-4 text-sm">
              This video will demonstrate the complete workflow: pasting Excel data → selecting fields → customizing charts → exporting and sharing
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create professional reports from your data
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow border border-gray-200"
              >
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Visualize Your Data</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional dashboards, charts, and analytics at your fingertips
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Dashboard View', description: 'Comprehensive data visualization' },
              { title: 'Bar Charts', description: 'Compare values across categories' },
              { title: 'Pie Charts', description: 'Visualize proportions and distributions' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-20 w-20 text-blue-600 opacity-50" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Data?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start creating professional reports and dashboards in minutes. No technical skills required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isCustomer ? (
                <Link
                  to="/customer/solution-pro"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Access Pro Version
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <OwnerAutoLoginButton 
                  ownerEmail={ownerEmail}
                  autoLoginOwnerAsCustomer={autoLoginOwnerAsCustomer}
                  onSuccess={() => window.location.href = '/customer/solution-pro'}
                  text="Get Started Free"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                />
              )}
              <Link
                to="/contact-us"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SamsSmartReports;

