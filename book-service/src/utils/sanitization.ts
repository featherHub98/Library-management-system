/**
 * Security Sanitization Utility
 * Provides functions to sanitize and validate input data
 * to prevent injection attacks and XSS vulnerabilities
 */

/**
 * HTML entity escape map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * SQL Injection patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|UNION|EXEC)\b)/gi,
  /(--\s*$)/gm,
  /(\/\*[\s\S]*?\*\/)/g,
  /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
  /(\bAND\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
  /(['"];?\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)\b)/gi,
  /(\bSLEEP\s*\(\s*\d+\s*\))/gi,
  /(\bBENCHMARK\s*\()/gi,
  /(\bWAITFOR\s+DELAY\b)/gi,
  /(CONCAT\s*\()/gi,
  /(CHAR\s*\(\s*\d+\s*\))/gi,
  /(LOAD_FILE\s*\()/gi,
  /(INTO\s+OUTFILE\b)/gi,
  /(INTO\s+DUMPFILE\b)/gi
];

/**
 * NoSQL Injection patterns to detect
 */
const NOSQL_INJECTION_PATTERNS = [
  /\$gt/gi,
  /\$gte/gi,
  /\$lt/gi,
  /\$lte/gi,
  /\$ne/gi,
  /\$eq/gi,
  /\$in/gi,
  /\$nin/gi,
  /\$or/gi,
  /\$and/gi,
  /\$not/gi,
  /\$nor/gi,
  /\$exists/gi,
  /\$type/gi,
  /\$regex/gi,
  /\$where/gi,
  /\$expr/gi,
  /\$jsonSchema/gi,
  /\$mod/gi,
  /\$text/gi,
  /\$search/gi,
  /\$elemMatch/gi,
  /\$size/gi,
  /\$all/gi,
  /\$slice/gi
];

/**
 * Sanitize a string by escaping HTML entities and trimming whitespace
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Escape HTML entities
  sanitized = sanitized.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Validate and normalize an email address
 * @param email - The email to validate and sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  
  // Trim and convert to lowercase
  let sanitized = email.trim().toLowerCase();
  
  // Basic email validation pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailPattern.test(sanitized)) {
    return '';
  }
  
  // Remove any potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"`]/g, '');
  
  return sanitized;
}

/**
 * Sanitize a filename by removing dangerous characters
 * @param name - The filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFileName(name: string): string {
  if (typeof name !== 'string') {
    return '';
  }
  
  // Get the base name (remove path components)
  let sanitized = name.replace(/^.*[\\/]/, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove path traversal patterns
  sanitized = sanitized.replace(/\.\./g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');
  
  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Limit filename length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const baseName = sanitized.substring(0, sanitized.length - ext.length - 1);
    sanitized = baseName.substring(0, 250 - ext.length) + '.' + ext;
  }
  
  return sanitized;
}

/**
 * Deep sanitize an object by sanitizing all string values
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Buffer.isBuffer(obj)) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitize the key as well
        const sanitizedKey = sanitizeString(key);
        if (sanitizedKey) {
          sanitized[sanitizedKey] = sanitizeObject(obj[key]);
        }
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Check if a string contains SQL injection patterns
 * @param input - The string to check
 * @returns True if SQL injection patterns are detected
 */
export function containsSQLInjection(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a value contains NoSQL injection patterns
 * @param input - The value to check (can be object, string, etc.)
 * @returns True if NoSQL injection patterns are detected
 */
export function containsNoSQLInjection(input: any): boolean {
  if (input === null || input === undefined) {
    return false;
  }
  
  // Check if input is a string
  if (typeof input === 'string') {
    // Check for NoSQL injection patterns in string
    for (const pattern of NOSQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        return true;
      }
    }
    return false;
  }
  
  // Check if input is an object with MongoDB operators
  if (typeof input === 'object') {
    // Check keys for MongoDB operators
    for (const key of Object.keys(input)) {
      if (key.startsWith('$')) {
        return true;
      }
      
      // Recursively check values
      if (containsNoSQLInjection(input[key])) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Validate that a string is a safe search term
 * @param input - The search term to validate
 * @returns True if the search term is safe
 */
export function isSafeSearchTerm(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  // Check for injection patterns
  if (containsSQLInjection(input) || containsNoSQLInjection(input)) {
    return false;
  }
  
  // Limit length
  if (input.length > 500) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize a phone number
 * @param phone - The phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-numeric characters except + and spaces
  let sanitized = phone.trim();
  
  // Keep only digits, plus sign, spaces, hyphens, and parentheses
  sanitized = sanitized.replace(/[^0-9+\-\s()]/g, '');
  
  // Limit length
  if (sanitized.length > 20) {
    sanitized = sanitized.substring(0, 20);
  }
  
  return sanitized;
}

/**
 * Sanitize a URL
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }
  
  let sanitized = url.trim();
  
  // Check for javascript: protocol (XSS)
  if (/^javascript:/i.test(sanitized)) {
    return '';
  }
  
  // Check for data: protocol (potential XSS)
  if (/^data:/i.test(sanitized)) {
    return '';
  }
  
  // Check for vbscript: protocol (IE specific)
  if (/^vbscript:/i.test(sanitized)) {
    return '';
  }
  
  // Only allow http, https, ftp, and mailto protocols
  const allowedProtocols = ['http://', 'https://', 'ftp://', 'mailto:', '/'];
  const hasValidProtocol = allowedProtocols.some(protocol => 
    sanitized.toLowerCase().startsWith(protocol)
  );
  
  if (!hasValidProtocol && !sanitized.startsWith('www.')) {
    // Default to https if no protocol
    sanitized = 'https://' + sanitized;
  }
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>"']/g, '');
  
  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }
  
  return sanitized;
}

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizeFileName,
  sanitizeObject,
  containsSQLInjection,
  containsNoSQLInjection,
  isSafeSearchTerm,
  sanitizePhone,
  sanitizeURL
};
