"use client";
import { Tabs } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Folder, Video } from "lucide-react";
import { useLanguage } from "@/hooks/useTranslation";
export default function CreatorLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const vi = language === "vi";
  const tabs = [
    {
      key: "courses",
      label: vi ? "Khóa học" : "Courses",
      icon: <BookOpen size={16} />,
    },
    {
      key: "documents",
      label: vi ? "Tài liệu" : "Documents",
      icon: <Folder size={16} />,
    },
    {
      key: "capcut-templates",
      label: vi ? "Mẫu CapCut" : "CapCut templates",
      icon: <Video size={16} />,
    },
  ];
  const active =
    tabs.find((tab) => pathname?.includes(`/creator-lab/${tab.key}`))?.key ||
    "courses";
  return (
    <div>
      <Tabs
        className="admin-section-tabs"
        activeKey={active}
        items={tabs}
        onChange={(key) => router.push(`/${language}/admin/creator-lab/${key}`)}
      />
      {children}
    </div>
  );
}
