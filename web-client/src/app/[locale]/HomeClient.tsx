"use client";

import { apiClient } from "@/lib/api-client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useTranslation";
import { useSettings } from "@/components/SettingsProvider";
import HomePartners from "@/components/HomePartners";
import HomeCreatorLab from "@/components/HomeCreatorLab";
import HomeNews from "@/components/HomeNews";
import SportsShowcase from "@/components/SportsShowcase";
import HomeOpening from "@/components/HomeOpening";
import styles from "./home.module.css";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}

export default function HomeClient({
  initialData,
}: {
  initialData?: {
    partners: Partner[];
    statistics: any[];
    sportsShowcase: any[];
  };
}) {
  const { language } = useLanguage();
  const { settings } = useSettings();

  const [partners, setPartners] = useState<Partner[]>(
    initialData?.partners || [],
  );
  const [loadingPartners, setLoadingPartners] = useState(!initialData);

  const [statistics, setStatistics] = useState<any[]>(
    initialData?.statistics || [],
  );
  const [sportsShowcase, setSportsShowcase] = useState<any[]>(
    initialData?.sportsShowcase || [],
  );

  // Fetch for secondary widgets (one time)
  useEffect(() => {
    apiClient
      .request("/partners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setPartners(data);
        setLoadingPartners(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingPartners(false);
      });

    apiClient
      .request("/statistics/summary")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setStatistics(data))
      .catch(console.error);

    apiClient
      .request("/sports")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSportsShowcase(data))
      .catch(console.error);
  }, [language]);

  return (
    <main className={styles.page}>
      <HomeOpening
        language={language}
        statistics={statistics}
        sports={sportsShowcase}
      />
      <SportsShowcase
        sports={sportsShowcase.filter((sport) => sport.slug !== "rowing")}
        language={language}
      />
      {settings?.SHOW_PARTNERS !== false && (
        <HomePartners
          partners={partners}
          language={language}
          loading={loadingPartners}
        />
      )}
      <HomeCreatorLab language={language} />

      <HomeNews language={language} />
    </main>
  );
}
