import { TrendingUp } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
}

export default function KpiCard({
  title,
  value,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E3E8EE] p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#697386] font-medium">
          {title}
        </p>

        <div className="h-8 w-8 rounded-lg bg-[#F6F9FC] flex items-center justify-center">
          <TrendingUp size={16} className="text-[#635BFF]" />
        </div>
      </div>

      <h3 className="text-3xl font-bold text-[#0A2540] mt-4">
        {value}
      </h3>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs font-medium text-[#00A37A]">
          ↑ 12%
        </span>

        <span className="text-xs text-[#697386]">
          from last month
        </span>
      </div>
    </div>
  );
}