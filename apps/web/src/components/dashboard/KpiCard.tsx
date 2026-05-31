interface KpiCardProps {
  title: string;
  value: string;
}

export default function KpiCard({
  title,
  value,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E3E8EE] p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-[#697386] font-medium">
        {title}
      </p>

      <h3 className="text-3xl font-bold text-[#0A2540] mt-2">
        {value}
      </h3>

      <p className="text-xs text-[#00A37A] mt-3">
        ↑ 12% from last month
      </p>
    </div>
  );
}