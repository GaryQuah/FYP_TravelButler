import { apiFetch } from "./apiFetch";

export const createTracker = async (trackerData: {
  name: string;
  userId: string;
}) => {
  const response = await apiFetch("/api/availability-trackers/", {
    method: "POST",
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