// This file is kept for backward compatibility but redirects to ContactUs
// The Contact page with tabs has been split into separate pages
import { Navigate } from 'react-router-dom';

const Contact = () => {
  return <Navigate to="/contact-us" replace />;
};

export default Contact;

