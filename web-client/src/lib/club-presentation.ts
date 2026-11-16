import {
  safeMediaUrl,
  splitClubSports,
  type Organization,
} from "./organizations";

const sportPhotos: Record<string, string> = {
  "Cử tạ": "/back_subjects/cu_ta.jpg",
  "Điền kinh": "/back_subjects/dien_kinh.jpg",
  "Bắn cung": "/wp169/wp1.jpg",
  "Cầu lông": "/back_subjects/cau_long.jpg",
  "Bóng bàn": "/back_subjects/bong_ban.jpg",
  "Bơi lội": "/back_subjects/boi_loi.jpg",
  Boccia: "/back_subjects/boccia.jpg",
};
export function clubCover(
  club: Pick<Organization, "imageUrl" | "details" | "sport">,
) {
  return (
    safeMediaUrl(club.details?.coverImage) ||
    safeMediaUrl(club.imageUrl) ||
    sportPhotos[splitClubSports(club.sport)[0]] ||
    "/CLUB/CLUB_02.jpg"
  );
}

// Only split days and times explicitly present in the saved schedule.
export function trainingSessions(schedule: string | null, vi: boolean) {
  if (!schedule?.trim()) return [];
  const englishDays: Record<string, string> = {
    T2: "Mon",
    T3: "Tue",
    T4: "Wed",
    T5: "Thu",
    T6: "Fri",
    T7: "Sat",
    CN: "Sun",
  };
  return schedule
    .split(/[\n;]/)
    .filter((line) => line.trim())
    .flatMap((line) => {
      const time = line.match(
        /\b\d{1,2}[:h]\d{2}\s*[-–—]\s*\d{1,2}[:h]\d{2}\b/i,
      )?.[0];
      let daysText = line.split(/\btừ\b|\bfrom\b|\d{1,2}[:h]\d{2}/i)[0];
      const names = ["hai", "ba", "tư", "năm", "sáu", "bảy"];
      names.forEach((name, index) => {
        daysText = daysText.replace(
          new RegExp(`thứ\\s+${name}`, "gi"),
          `T${index + 2}`,
        );
      });
      daysText = daysText
        .replace(/thứ\s*([2-7])/gi, "T$1")
        .replace(/chủ\s*nhật/gi, "CN")
        .replace(/([,&]\s*)([2-7])(?=\s*[, &]|\s*$)/g, "$1T$2");
      const days = [
        ...new Set(daysText.toUpperCase().match(/\bT[2-7]\b|\bCN\b/g) || []),
      ];
      if (!days.length)
        return [
          { day: vi ? "Lịch tập" : "Training", time: "", note: line.trim() },
        ];
      return days.map((day) => ({
        day: vi ? day : englishDays[day],
        time: time || "",
        note: time
          ? vi
            ? "Theo lịch sinh hoạt của CLB"
            : "Club training schedule"
          : line.trim(),
      }));
    });
}

export function clubDistance(
  a: Pick<Organization, "lat" | "lng">,
  b: Pick<Organization, "lat" | "lng">,
) {
  if (
    typeof a.lat !== "number" ||
    typeof a.lng !== "number" ||
    typeof b.lat !== "number" ||
    typeof b.lng !== "number"
  )
    return Infinity;
  const rad = (value: number) => (value * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function relatedClubs(club: Organization, candidates: Organization[]) {
  const province = (location?: string | null) =>
    location?.split("(")[0].trim().toLocaleLowerCase("vi") || "";
  const region = (location?: string | null) =>
    location?.match(/miền\s+(bắc|trung|nam)/i)?.[0].toLocaleLowerCase("vi") ||
    "";
  const score = (other: Organization) =>
    (province(club.location) &&
    province(club.location) === province(other.location)
      ? 100
      : 0) +
    (region(club.location) && region(club.location) === region(other.location)
      ? 20
      : 0) +
    (splitClubSports(other.sport).some((sport) =>
      splitClubSports(club.sport).includes(sport),
    )
      ? 5
      : 0);
  return candidates
    .filter((other) => other.id !== club.id)
    .sort((a, b) => {
      const ad = clubDistance(club, a),
        bd = clubDistance(club, b);
      if (Number.isFinite(ad) || Number.isFinite(bd)) return ad - bd;
      return score(b) - score(a);
    })
    .slice(0, 3);
}
