/**
 * Extract name, company, email, and phone from chat messages
 */

// Extract name from text (simple patterns)
export const extractName = (text) => {
  if (!text || typeof text !== 'string') return null;
  
  // Common name patterns: "My name is...", "I'm...", "Call me...", etc.
  const namePatterns = [
    /(?:my name is|i'm|i am|call me|this is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/, // Standalone name
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Validate it's not too long (likely not a name if > 50 chars)
      if (name.length <= 50 && name.split(' ').length <= 5) {
        return name;
      }
    }
  }

  return null;
};

// Extract company from text
export const extractCompany = (text) => {
  if (!text || typeof text !== 'string') return null;
  
  // Common company patterns
  const companyPatterns = [
    /(?:company|firm|organization|organisation|i work for|i work at|from)\s+([A-Z][a-zA-Z0-9\s&]+)/i,
    /(?:at|with)\s+([A-Z][a-zA-Z0-9\s&]+)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const company = match[1].trim();
      // Validate it's reasonable (not too long, not just "the" or common words)
      const commonWords = ['the', 'a', 'an', 'and', 'or', 'for', 'with', 'at'];
      if (company.length <= 100 && !commonWords.includes(company.toLowerCase())) {
        return company;
      }
    }
  }

  return null;
};

// Extract email from text
export const extractEmail = (text) => {
  if (!text || typeof text !== 'string') return null;
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : null;
};

// Extract phone from text
export const extractPhone = (text) => {
  if (!text || typeof text !== 'string') return null;
  const phoneRegex = /(?:\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/gi;
  const matches = text.match(phoneRegex);
  if (matches && matches.length > 0) {
    let phone = matches[0].trim();
    phone = phone.replace(/[\s-()]/g, '');
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      return phone;
    }
  }
  return null;
};
