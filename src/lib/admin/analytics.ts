import { db } from "@/db";
import { users, videos, creditTransactions, VideoStatus, CreditTransType } from "@/db/schema";
import { count, eq, and, sql, desc, gte } from "drizzle-orm";

export type TimeRange = "today" | "7d" | "30d" | "90d" | "all";

export interface Stats {
  totalUsers: number;
  totalOrders: number;
  paidOrders: number;
  totalVideos: number;
  firstVideoConversionRate: number;
  paymentConversionRate: number;
  videoSuccessRate: number;
  usersWithoutVideos: number;
}

export interface FunnelData {
  registeredUsers: number;
  firstVideoUsers: number;
  successfulFirstVideoUsers: number;
}

export interface TrendDataPoint {
  date: string;
  registeredUsers: number;
  firstVideoUsers: number;
  successfulFirstVideoUsers: number;
  firstVideoConversionRate: number;
  firstVideoSuccessRate: number;
}

export interface AnalyticsData {
  stats: Stats;
  funnel: FunnelData;
  trend: TrendDataPoint[];
}

class AnalyticsService {
  private getTimeFilter(range: TimeRange): Date | null {
    if (range === "all") return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case "today":
        return today;
      case "7d":
        return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "90d":
        return new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  private buildTimeCondition(timeFilter: Date | null) {
    if (!timeFilter) return sql``;
    return sql`${users.createdAt} >= ${timeFilter.toISOString()}::timestamp`;
  }

  private buildVideoTimeCondition(timeFilter: Date | null) {
    if (!timeFilter) return sql``;
    return sql`${videos.createdAt} >= ${timeFilter.toISOString()}::timestamp`;
  }

  private buildTransactionTimeCondition(timeFilter: Date | null) {
    if (!timeFilter) return sql``;
    return sql`${creditTransactions.createdAt} >= ${timeFilter.toISOString()}::timestamp`;
  }

  async getStats(range: TimeRange): Promise<Stats> {
    const timeFilter = this.getTimeFilter(range);
    const timeCondition = this.buildTimeCondition(timeFilter);
    const videoTimeCondition = this.buildVideoTimeCondition(timeFilter);
    const transactionTimeCondition = this.buildTransactionTimeCondition(timeFilter);

    // Parallel queries for better performance
    const [
      totalUsersResult,
      totalOrdersResult,
      paidOrdersResult,
      totalVideosResult,
      completedVideosResult,
      failedVideosResult,
      usersWithVideosResult,
      payingUsersResult,
    ] = await Promise.all([
      // 1. Total users
      db.select({ count: count() }).from(users).where(timeCondition),

      // 2. Total orders (ORDER_PAY + SUBSCRIPTION)
      db
        .select({ count: count() })
        .from(creditTransactions)
        .where(
          and(
            transactionTimeCondition,
            sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`
          )
        ),

      // 3. Paid orders (unique orderNo)
      db
        .select({ count: count() })
        .from(creditTransactions)
        .where(
          and(
            transactionTimeCondition,
            sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`
          )
        )
        .then((result) => {
          // Get unique order numbers
          return db
            .selectDistinct({ orderNo: creditTransactions.orderNo })
            .from(creditTransactions)
            .where(
              and(
                transactionTimeCondition,
                sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`,
                sql`${creditTransactions.orderNo} IS NOT NULL`
              )
            )
            .then((orders) => ({ count: orders.length }));
        }),

      // 4. Total videos (not deleted)
      db
        .select({ count: count() })
        .from(videos)
        .where(and(videoTimeCondition, eq(videos.isDeleted, false))),

      // 5. Completed videos
      db
        .select({ count: count() })
        .from(videos)
        .where(and(videoTimeCondition, eq(videos.status, VideoStatus.COMPLETED), eq(videos.isDeleted, false))),

      // 6. Failed videos
      db
        .select({ count: count() })
        .from(videos)
        .where(and(videoTimeCondition, eq(videos.status, VideoStatus.FAILED), eq(videos.isDeleted, false))),

      // 7. Users who generated at least one video
      db
        .selectDistinct({ userId: videos.userId })
        .from(videos)
        .where(and(videoTimeCondition, eq(videos.isDeleted, false)))
        .then((result) => ({ count: result.length })),

      // 8. Users who made at least one payment
      db
        .selectDistinct({ userId: creditTransactions.userId })
        .from(creditTransactions)
        .where(
          and(
            transactionTimeCondition,
            sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`
          )
        )
        .then((result) => ({ count: result.length })),
    ]);

    const totalUsers = totalUsersResult[0]?.count || 0;
    const totalOrders = totalOrdersResult[0]?.count || 0;
    const paidOrders = paidOrdersResult.count || 0;
    const totalVideos = totalVideosResult[0]?.count || 0;
    const completedVideos = completedVideosResult[0]?.count || 0;
    const failedVideos = failedVideosResult[0]?.count || 0;
    const usersWithVideos = usersWithVideosResult.count || 0;
    const payingUsers = payingUsersResult.count || 0;

    // Calculate rates
    const firstVideoConversionRate = totalUsers > 0 ? (usersWithVideos / totalUsers) * 100 : 0;
    const paymentConversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0;

    const totalFinishedVideos = completedVideos + failedVideos;
    const videoSuccessRate = totalFinishedVideos > 0 ? (completedVideos / totalFinishedVideos) * 100 : 0;

    // Users who haven't generated any video
    const usersWithoutVideos = totalUsers - usersWithVideos;

    return {
      totalUsers,
      totalOrders,
      paidOrders,
      totalVideos,
      firstVideoConversionRate: Math.round(firstVideoConversionRate * 10) / 10,
      paymentConversionRate: Math.round(paymentConversionRate * 10) / 10,
      videoSuccessRate: Math.round(videoSuccessRate * 10) / 10,
      usersWithoutVideos,
    };
  }

  async getFunnelData(range: TimeRange): Promise<FunnelData> {
    const timeFilter = this.getTimeFilter(range);
    const timeCondition = this.buildTimeCondition(timeFilter);
    const videoTimeCondition = this.buildVideoTimeCondition(timeFilter);

    // Get total registered users
    const [totalUsersResult] = await Promise.all([
      db.select({ count: count() }).from(users).where(timeCondition),
    ]);

    const registeredUsers = totalUsersResult[0]?.count || 0;

    // Get users with their first video
    // Using a subquery to find the first video for each user
    const firstVideosQuery = db
      .select({
        userId: videos.userId,
        status: videos.status,
        createdAt: videos.createdAt,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${videos.userId} ORDER BY ${videos.createdAt} ASC)`.as("rn"),
      })
      .from(videos)
      .where(and(videoTimeCondition, eq(videos.isDeleted, false)))
      .as("first_videos");

    const firstVideosResult = await db
      .select({
        userId: firstVideosQuery.userId,
        status: firstVideosQuery.status,
      })
      .from(firstVideosQuery)
      .where(sql`${firstVideosQuery.rn} = 1`);

    const firstVideoUsers = firstVideosResult.length;
    const successfulFirstVideoUsers = firstVideosResult.filter((v) => v.status === VideoStatus.COMPLETED).length;

    return {
      registeredUsers,
      firstVideoUsers,
      successfulFirstVideoUsers,
    };
  }

  async getTrendData(range: TimeRange): Promise<TrendDataPoint[]> {
    const timeFilter = this.getTimeFilter(range);
    const startDate = timeFilter || new Date(0); // Epoch if no filter

    // Determine the number of days based on range
    const daysMap = { today: 1, "7d": 7, "30d": 30, "90d": 90, all: 365 };
    const days = daysMap[range] || 30;

    // Generate date series
    const dates: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date.toISOString().split("T")[0]);
    }

    // Get daily registrations
    const dailyRegistrations: Record<string, number> = {};
    const registrationData = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`.as("date"),
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    registrationData.forEach((row) => {
      dailyRegistrations[row.date] = row.count;
    });

    // Get users with their first video by date
    const firstVideoData = await db
      .select({
        userId: videos.userId,
        createdAt: videos.createdAt,
        status: videos.status,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${videos.userId} ORDER BY ${videos.createdAt} ASC)`.as("rn"),
      })
      .from(videos)
      .where(and(gte(videos.createdAt, startDate), eq(videos.isDeleted, false)));

    // Group first videos by date
    const dailyFirstVideos: Record<string, { total: number; successful: number }> = {};

    firstVideoData.forEach((row) => {
      if (row.rn === 1) {
        const date = new Date(row.createdAt).toISOString().split("T")[0];
        if (!dailyFirstVideos[date]) {
          dailyFirstVideos[date] = { total: 0, successful: 0 };
        }
        dailyFirstVideos[date].total++;
        if (row.status === VideoStatus.COMPLETED) {
          dailyFirstVideos[date].successful++;
        }
      }
    });

    // Build trend data
    const trend: TrendDataPoint[] = dates.map((date) => {
      const registeredUsers = dailyRegistrations[date] || 0;
      const firstVideoData = dailyFirstVideos[date] || { total: 0, successful: 0 };
      const firstVideoUsers = firstVideoData.total;
      const successfulFirstVideoUsers = firstVideoData.successful;

      const firstVideoConversionRate = registeredUsers > 0 ? (firstVideoUsers / registeredUsers) * 100 : 0;
      const firstVideoSuccessRate = firstVideoUsers > 0 ? (successfulFirstVideoUsers / firstVideoUsers) * 100 : 0;

      return {
        date,
        registeredUsers,
        firstVideoUsers,
        successfulFirstVideoUsers,
        firstVideoConversionRate: Math.round(firstVideoConversionRate * 10) / 10,
        firstVideoSuccessRate: Math.round(firstVideoSuccessRate * 10) / 10,
      };
    });

    return trend;
  }

  async getAnalyticsData(range: TimeRange): Promise<AnalyticsData> {
    const [stats, funnel, trend] = await Promise.all([
      this.getStats(range),
      this.getFunnelData(range),
      this.getTrendData(range),
    ]);

    return {
      stats,
      funnel,
      trend,
    };
  }
}

export const analyticsService = new AnalyticsService();
