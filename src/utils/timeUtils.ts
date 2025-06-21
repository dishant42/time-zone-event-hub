/**
 * Comprehensive timezone utilities for EventBook application
 * 
 *Convert UTC times from your API to user's local time for display
 *Convert user's local time inputs to UTC before sending to backend
 *Format times in user's timezone
 *Handle timezone detection
 *  
 */


 /**
 * Clean timezone utilities for EventBook application
 * 
 * Core functionality:
 * - Convert UTC times from API to user's local time for display
 * - Convert user's local time inputs to UTC before sending to backend
 * - Format times in user's timezone
 * - Handle timezone detection
 */

import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { format, parseISO, isValid, isBefore } from 'date-fns';

export interface FormattedDateTime {
  full: string;
  date: string;
  time: string;
  timezone: string;
  short: string;
  iso: string;
}

/**
 * Detect user's browser timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};



/**
  Purpose: Convert UTC datetime from API to user-friendly local time formats
  Input: UTC datetime string from your database
  Returns: Object with multiple formatted versions
  const formatted = formatUtcInLocalTimezone(utcTime);

  Returns:
  {
    full: "Friday, March 15, 2024",     // Event details page
    date: "Fri, Mar 15",                // Event cards
    time: "2:30 PM",                    // Time display
    timezone: "America/New_York",       // User's timezone
    short: "Mar 15 at 2:30 PM",        // Compact format
    iso: "2024-03-15T18:30:00Z"        // Original UTC
  }

  Use Cases:
      Event listing pages
      Event detail pages
      Email notifications
      Calendar displays

*/


export const formatUtcInLocalTimezone = (
  utcDateTime: string,
  userTimezone?: string
): FormattedDateTime => {
  const timezone = userTimezone || getUserTimezone();
  
  if (!validateDateTime(utcDateTime)) {
    throw new Error(`Invalid UTC date: ${utcDateTime}`);
  }

  const full = formatInTimeZone(utcDateTime, timezone, 'EEEE, MMMM dd, yyyy');
  const date = formatInTimeZone(utcDateTime, timezone, 'EEE, MMM dd');
  const time = formatInTimeZone(utcDateTime, timezone, 'h:mm a');
  const short = formatInTimeZone(utcDateTime, timezone, 'MMM dd \'at\' h:mm a');

  return {
    full,
    date,
    time,
    timezone,
    short,
    iso: utcDateTime
  };
};



/**
 * Convert local datetime to UTC (for saving to database)
 */
export const convertLocalToUtc = (
  localDateTime: Date | string,
  fromTimezone?: string
): string => {
  const timezone = fromTimezone || getUserTimezone();
  
  let date: Date;
  if (typeof localDateTime === 'string') {
    date = new Date(localDateTime);
  } else {
    date = localDateTime;
  }
  
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  const utcDate = toZonedTime(date, timezone);
  return utcDate.toISOString();
};



/**
 * Check if a UTC datetime is in the past (compared to current time)
 */
export const isPastDateTime = (utcDateTime: string): boolean => {
  try {
    if (!validateDateTime(utcDateTime)) return false;
    
    const utcDate = parseISO(utcDateTime);
    const now = new Date();
    
    return isBefore(utcDate, now);
  } catch {
    return false;
  }
};


/**
 * Check if a UTC datetime is upcoming (in the future)
 */
export const isUpcomingDateTime = (utcDateTime: string): boolean => {
  return !isPastDateTime(utcDateTime);
};




/**
 * Get current date in YYYY-MM-DD format for date inputs (in user's timezone)
 */
export const getCurrentDateString = (): string => {
  const timezone = getUserTimezone();
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
};

/**
 * Get current time in HH:MM format for time inputs (in user's timezone)
 */
export const getCurrentTimeString = (): string => {
  const timezone = getUserTimezone();
  return formatInTimeZone(new Date(), timezone, 'HH:mm');
};

/**
 * Convert local date and time inputs to UTC ISO string
 * Use this when creating events from form inputs
 */
export const convertLocalInputsToUtc = (
  date: string, 
  time: string,
  fromTimezone?: string
): string => {
  const timezone = fromTimezone || getUserTimezone();
  
  const dateTimeString = `${date} ${time}`;
  const localDate = new Date(dateTimeString);
  
  if (!isValid(localDate)) {
    throw new Error(`Invalid date/time combination: ${dateTimeString}`);
  }
  
  return convertLocalToUtc(localDate, timezone);
};

/**
 * Purpose: Validate datetime strings before processing
 * Returns: Boolean indicating if datetime is valid
 */
export const validateDateTime = (dateTime: string): boolean => {
  try {
    const date = parseISO(dateTime);
    return isValid(date) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
  } catch {
    return false;
  }
};

/**
 * Get timezone abbreviation (EST, PST, etc.) for a specific date
 */
export const getTimezoneAbbreviation = (date?: Date, timezone?: string): string => {
  const testDate = date || new Date();
  const tz = timezone || getUserTimezone();
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(testDate);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    
    return timeZonePart?.value || tz;
  } catch {
    return tz;
  }
};

/**
 * Get a user-friendly timezone display name
 */
export const getTimezoneDisplayName = (timezone?: string): string => {
  const tz = timezone || getUserTimezone();
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'long'
    });
    
    const parts = formatter.formatToParts(new Date());
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    
    return timeZonePart?.value || tz;
  } catch {
    return tz;
  }
};