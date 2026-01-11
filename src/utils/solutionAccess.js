/**
 * Utility function to check if user should have access to solutions
 * This ensures owner email (spbajaj25@gmail.com) always has customer access
 */
export const checkSolutionAccess = (user) => {
  const ownerEmail = 'spbajaj25@gmail.com';
  
  // If user is not logged in, return false
  if (!user) {
    return false;
  }
  
  // If user is customer, return true
  if (user.role === 'customer') {
    return true;
  }
  
  // If user is owner email, always allow access
  if (user.email && user.email.toLowerCase() === ownerEmail) {
    return true;
  }
  
  return false;
};

/**
 * Utility function to check if user should auto-login for solutions
 */
export const shouldAutoLoginForSolutions = (user, isAuthenticated) => {
  const ownerEmail = 'spbajaj25@gmail.com';
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  // If user is owner email and not already logged in as customer, auto-login
  if (user.email && user.email.toLowerCase() === ownerEmail && user.role !== 'customer') {
    return true;
  }
  
  return false;
};
