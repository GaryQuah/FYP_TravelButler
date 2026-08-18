
// Formats a date into a long, human-readable string with weekday. e.g, "Monday, August 19, 2024, 10:00 AM"
export const formatFullDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Formats a date into a simple time string (HH:mm) e.g, "10:30"
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Extracts time (HH:mm) from a date-time string without timezone conversion
export const formatTimeFromString = (dateTimeString: string): string => {
  console.log("[formatTimeFromString] Received dateTimeString:", dateTimeString);
  const timePart = dateTimeString.split('T')[1];
  if (timePart) {
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
  }
  return ""; // Fallback
};

// Converts a UTC ISO string to a local time string (HH:mm)
export const convertUtcToLocalTime = (utcString: string): string => {
  const date = new Date(utcString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const parseUtcDateString = (dateString: string): Date => {
  if (!dateString.endsWith("Z")) {
    return new Date(dateString + "Z");
  }
  return new Date(dateString);
};

export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const formatSimpleDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};