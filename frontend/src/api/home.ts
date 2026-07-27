export const createTracker = async (trackerData: {
  name: string;
  userId: string;
}) => {
  const response = await fetch("/api/availability-trackers/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": trackerData.userId,
    },
    body: JSON.stringify({
      name: trackerData.name,
      user_ids: [trackerData.userId],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create availability tracker");
  }

  return response.json();
};