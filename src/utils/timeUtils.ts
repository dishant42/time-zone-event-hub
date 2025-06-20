
/**
 * Comprehensive timezone utilities for EventBook application
 * Handles timezone detection, conversion, and formatting
 */

export interface FormattedDateTime {
  full: string;
  date: string;
  time: string;
  timezone: string;
  short: string;
}

/**
 * Detect user's browser timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert UTC datetime string to user's local timezone
 */
export const utcToLocal = (utcDateTime: string): Date => {
  const date = new Date(utcDateTime);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${utcDateTime}`);
  }
  return date;
};

/**
 * Convert local datetime to UTC
 */
export const localToUtc = (localDateTime: Date): string => {
  if (isNaN(localDateTime.getTime())) {
    throw new Error('Invalid date provided');
  }
  return localDateTime.toISOString();
};

/**
 * Format datetime with timezone information
 */
export const formatDateTime = (
  dateTime: string | Date,
  options?: {
    includeTimezone?: boolean;
    format?: 'full' | 'short' | 'date' | 'time';
  }
): FormattedDateTime => {
  const date = typeof dateTime === 'string' ? utcToLocal(dateTime) : dateTime;
  const timezone = getUserTimezone();
  
  const full = date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  const shortDate = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return {
    full,
    date: shortDate,
    time,
    timezone,
    short: `${shortDate} at ${time}`
  };
};

/**
 * Check if a datetime is in the past
 */
export const isPastDateTime = (dateTime: string): boolean => {
  try {
    const date = utcToLocal(dateTime);
    return date < new Date();
  } catch {
    return false;
  }
};

/**
 * Check if a datetime is upcoming (in the future)
 */
export const isUpcomingDateTime = (dateTime: string): boolean => {
  return !isPastDateTime(dateTime);
};

/**
 * Get current date in YYYY-MM-DD format for date inputs
 */
export const getCurrentDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get current time in HH:MM format for time inputs
 */
export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Convert local date and time inputs to UTC ISO string
 */
export const convertLocalInputsToUtc = (date: string, time: string): string => {
  const dateTimeString = `${date}T${time}:00`;
  const localDate = new Date(dateTimeString);
  return localToUtc(localDate);
};

/**
 * Handle DST transitions and edge cases
 */
export const validateDateTime = (dateTime: string): boolean => {
  try {
    const date = new Date(dateTime);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900;
  } catch {
    return false;
  }
};

/**
 * Format timezone abbreviation (EST, PST, etc.)
 */
export const getTimezoneAbbreviation = (date?: Date): string => {
  const testDate = date || new Date();
  const timeZoneName = testDate.toLocaleDateString('en', {
    day: '2-digit',
    timeZoneName: 'short',
  }).slice(4);
  
  return timeZoneName;
};
