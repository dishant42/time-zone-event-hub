
// Utility functions for handling time zones and date formatting

/**
 * Get the user's current timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert UTC date string to user's local timezone
 */
export const formatDateTimeInUserTimezone = (utcDateString: string) => {
  const date = new Date(utcDateString);
  const timezone = getUserTimezone();
  
  return {
    date: date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      timeZone: timezone
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    }),
    timezone: timezone,
    full: date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    })
  };
};

/**
 * Convert local date/time input to UTC
 */
export const convertLocalToUTC = (dateString: string, timeString: string): string => {
  const localDateTime = new Date(`${dateString}T${timeString}`);
  return localDateTime.toISOString();
};

/**
 * Check if a date/time is in the future
 */
export const isFutureDateTime = (dateString: string, timeString?: string): boolean => {
  const now = new Date();
  const checkDate = timeString 
    ? new Date(`${dateString}T${timeString}`)
    : new Date(dateString);
  
  return checkDate > now;
};

/**
 * Get relative time description (e.g., "in 2 hours", "tomorrow")
 */
export const getRelativeTime = (utcDateString: string): string => {
  const date = new Date(utcDateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "Starting soon";
  } else if (diffHours < 24) {
    return `In ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (diffDays < 7) {
    return `In ${diffDays} days`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  }
};

/**
 * Format duration between two dates
 */
export const formatDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else {
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }
};
