import { useState, useEffect } from "react";
import { ActivityLogItem } from "./ActivityLogItem";
import { getUserActivity } from "@/api/userActivity";

interface ActivityLog {
  id: number;
  date: string;
  time: string;
  description: string;
  email: string;
  role: string;
  organization?: string;
}

export function LogActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getUserActivity();

        if (!response.ok) {
          throw new Error("Failed to fetch activity logs");
        }

        const data = await response.json();

        const formattedLogs = data
          .map((log: {
            id: number;
            timestamp: string;
            activity: string;
            email: string;
            role: string;
            organization?: string;
          }) => {
            const timestamp = new Date(log.timestamp);
            return {
              id: log.id,
              date: timestamp.toISOString().split("T")[0],
              time: timestamp.toTimeString().split(" ")[0].slice(0, 5),
              description: log.activity,
              email: log.email,
              role: log.role,
              organization: log.organization,
            };
          })
          .sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setLogs(formattedLogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="h-full w-full flex flex-col font-jakarta gap-y-4">
      <div className="text-2xl font-semibold">Log Aktivitas</div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log) => (
            <ActivityLogItem
              key={log.id}
              date={log.date}
              time={log.time}
              description={log.description}
              email={log.email}
              role={log.role}
            />
          ))}
        </div>
      ) : (
        <div>No activities found.</div>
      )}
    </div>
  );
}