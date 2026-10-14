import { StatCard } from "./stat-card";
import {
  Users as UsersIcon,
  Rocket,
  Video,
  TrendingUp,
  Billing,
  BarChart3,
  CheckCircle,
  User,
} from "@/components/ui/icons";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  paidOrders: number;
  totalVideos: number;
  firstVideoConversionRate: number;
  paymentConversionRate: number;
  videoSuccessRate: number;
  usersWithoutVideos: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="用户总数"
        value={stats.totalUsers.toLocaleString()}
        description="注册用户"
        icon={UsersIcon}
      />

      <StatCard
        title="订单总数"
        value={stats.totalOrders.toLocaleString()}
        description="所有订单记录"
        icon={Rocket}
      />

      <StatCard
        title="付费订单"
        value={stats.paidOrders.toLocaleString()}
        description="去重后的付费订单"
        icon={Billing}
      />

      <StatCard
        title="视频总数"
        value={stats.totalVideos.toLocaleString()}
        description="生成的视频数量"
        icon={Video}
      />

      <StatCard
        title="首视频转化率"
        value={`${stats.firstVideoConversionRate}%`}
        description="生成首个视频的用户占比"
        icon={TrendingUp}
        valueClassName="text-purple-600"
      />

      <StatCard
        title="支付转化率"
        value={`${stats.paymentConversionRate}%`}
        description="有付费记录的用户占比"
        icon={Billing}
        valueClassName="text-green-600"
      />

      <StatCard
        title="视频成功率"
        value={`${stats.videoSuccessRate}%`}
        description="成功完成的视频占比"
        icon={CheckCircle}
        iconClassName="text-green-600"
        valueClassName="text-green-600"
      />

      <StatCard
        title="未生成视频用户"
        value={stats.usersWithoutVideos.toLocaleString()}
        description="从未生成视频的用户数"
        icon={User}
      />
    </div>
  );
}
