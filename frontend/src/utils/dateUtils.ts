
// Formats a date into a long, human-readable string with weekday. e.g, "Monday, August 19, 2024, 10:00 AM"
export const formatFullDateTime = (date: Date | string): string => {
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

export const formatDateLabel = (date: string): string => {
  const parsedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
};

export const rebaseItineraryDates = <
  T extends { start_time: string; end_time: string },
>(
  items: T[],
  selectedDates: Record<string, string>,
): T[] => {
  const parseDate = (dateTime: string): number => {
    const datePart = dateTime.slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);
    const timestamp = Date.UTC(year, month - 1, day);
    const parsedDate = new Date(timestamp);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(datePart) ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new Error(`Invalid itinerary date: ${datePart}`);
    }
    return timestamp;
  };
  const getTime = (dateTime: string): string => {
    const time = dateTime.split("T")[1]?.slice(0, 5);
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      throw new Error(`Invalid itinerary time: ${dateTime}`);
    }
    return time;
  };

  if (items.length === 0) return [];

  return items.map((item) => {
    const sourceDate = item.start_time.slice(0, 10);
    const targetDate = selectedDates[sourceDate];
    if (!targetDate) {
      throw new Error(`No itinerary date selected for ${sourceDate}`);
    }

    const dateShift =
      parseDate(`${targetDate}T00:00`) - parseDate(item.start_time);
    const shiftedStart = parseDate(item.start_time) + dateShift;
    const shiftedEnd = parseDate(item.end_time) + dateShift;
    return {
      ...item,
      start_time: `${new Date(shiftedStart).toISOString().slice(0, 10)}T${getTime(item.start_time)}`,
      end_time: `${new Date(shiftedEnd).toISOString().slice(0, 10)}T${getTime(item.end_time)}`,
    };
  });
};
