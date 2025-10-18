import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendValue?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendValue, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trendValue && trendValue.value !== 0 && (
          <p className={`text-xs ${trendValue.isPositive ? "text-success" : "text-destructive"}`}>
            {trendValue.isPositive ? "+" : ""}{trendValue.value}% em relação ao mês anterior
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
