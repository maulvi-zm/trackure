interface ActivityLogItemProps {
  date: string;
  time: string;
  description: string;
  email: string;
  role: string;
  organization?: string;
}

export function ActivityLogItem({
  date,
  time,
  description,
  email,
  role,
  organization,
}: ActivityLogItemProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{description}</p>
          <p className="text-sm text-gray-600">
            By: {email} ({role})
            {organization && ` - ${organization}`}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {date} {time}
        </div>
      </div>
    </div>
  );
}