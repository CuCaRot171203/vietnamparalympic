"use client";
import { Empty, Skeleton } from "antd";
import { useLanguage } from "@/hooks/useTranslation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
interface Props {
  growthData: { name: string; users?: number; posts?: number }[];
  interactionData: { name: string; likes?: number; comments?: number }[];
  userLabel: string;
  postLabel: string;
  likeLabel: string;
  commentLabel: string;
  loading?: boolean;
}
export default function AdminCharts({
  growthData,
  interactionData,
  userLabel,
  postLabel,
  likeLabel,
  commentLabel,
  loading,
}: Props) {
  const { language } = useLanguage();
  const vi = language === "vi";
  const tooltip = {
    background: "var(--admin-raised)",
    border: "1px solid var(--admin-line)",
    color: "var(--admin-ink)",
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "0 8px 24px #0001",
  };
  const axis = { fontSize: 10, fill: "var(--admin-muted)" };
  return (
    <>
      <section className="admin-chart-card">
        <h2>{vi ? "Sự phát triển của nền tảng" : "Platform growth"}</h2>
        <p>
          {vi
            ? "Người dùng và bài viết theo dữ liệu thống kê."
            : "Users and posts across the reporting period."}
        </p>
        <div className="admin-chart-canvas">
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : !growthData.length ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                vi ? "Chưa có dữ liệu thống kê" : "No statistics yet"
              }
            />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 480, height: 280 }}
            >
              <LineChart
                data={growthData}
                margin={{ top: 8, right: 12, bottom: 0, left: -18 }}
              >
                <CartesianGrid
                  stroke="var(--admin-line)"
                  strokeDasharray="3 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={axis}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltip}
                  labelStyle={{ color: "var(--admin-ink)" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10, paddingTop: 18 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--admin-accent)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name={userLabel}
                />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke="#8a9871"
                  strokeWidth={2.5}
                  dot={false}
                  name={postLabel}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
      <section className="admin-chart-card">
        <h2>{vi ? "Tương tác cộng đồng" : "Community interactions"}</h2>
        <p>
          {vi
            ? "Lượt thích và bình luận trên nền tảng."
            : "Likes and comments across the platform."}
        </p>
        <div className="admin-chart-canvas">
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : !interactionData.length ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                vi ? "Chưa có dữ liệu tương tác" : "No interactions yet"
              }
            />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 480, height: 280 }}
            >
              <BarChart
                data={interactionData}
                margin={{ top: 8, right: 12, bottom: 0, left: -18 }}
                barGap={5}
              >
                <CartesianGrid
                  stroke="var(--admin-line)"
                  strokeDasharray="3 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={axis}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltip}
                  labelStyle={{ color: "var(--admin-ink)" }}
                  cursor={{ fill: "var(--admin-line)", opacity: 0.4 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10, paddingTop: 18 }}
                />
                <Bar
                  dataKey="likes"
                  fill="var(--admin-accent)"
                  radius={[4, 4, 0, 0]}
                  name={likeLabel}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="comments"
                  fill="#b6a27a"
                  radius={[4, 4, 0, 0]}
                  name={commentLabel}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </>
  );
}
