import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'info@tabalt.co.uk',
      link: 'mailto:info@tabalt.co.uk',
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+44 7448614160',
      link: 'tel:+447448614160',
    },
    {
      icon: MapPin,
      title: 'Office',
      content: '3 Herron Court, Bromley, London, United Kingdom',
      link: '#',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {contactInfo.map((info, index) => {
          const Icon = info.icon;
          return (
            <motion.a
              key={index}
              href={info.link}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-gray-600">{info.content}</p>
            </motion.a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 font-semibold mb-2">Thank you!</div>
              <p className="text-green-700">Your message has been sent. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+44 7448614160"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your project or inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          )}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Contact Us?</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">✓</span>
                <span>Get a free consultation on your business needs</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">✓</span>
                <span>Learn about our customized solutions</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">✓</span>
                <span>Discuss pricing and implementation timelines</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">✓</span>
                <span>Schedule a demo of our services</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span className="font-semibold">Monday - Friday</span>
                <span>9:00 AM - 6:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Saturday</span>
                <span>10:00 AM - 4:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Sunday</span>
                <span>Closed</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              For urgent matters, please call our 24/7 support line.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;

