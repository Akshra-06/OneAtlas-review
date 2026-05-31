interface KpiCardProps {
  title: string;
  value: string;
}

export default function KpiCard({
  title,
  value,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-gray-900 mt-2">
        {value}
      </h3>
    </div>
  );
}