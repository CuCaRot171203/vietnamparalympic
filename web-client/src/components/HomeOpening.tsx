import Image from "next/image";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import styles from "./home-opening.module.css";

export default function HomeOpening({ language }: { language: string }) {
  const vi = language === "vi";
  return (
    <>
      <section className={styles.hero} aria-labelledby="opening-heading">
        <Image
          src="/KV/COVER FACEBOOK.jpg"
          alt="Di sản vinh quang – Khơi lửa đam mê, Vietnam ParaSports"
          fill
          priority
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.shade} />
        <div className={styles.content}>
          <div>
            <p>
              Vietnam ParaSports ·{" "}
              {vi ? "Di sản & khát vọng" : "Heritage & ambition"}
            </p>
            <h1 id="opening-heading">
              {vi ? (
                <>
                  Tiếp nối di sản.
                  <br />
                  Thắp sáng tương lai.
                </>
              ) : (
                <>
                  Honour the legacy.
                  <br />
                  Inspire what comes next.
                </>
              )}
            </h1>
          </div>
          <a href="#sports-without-barriers">
            {vi ? "Cùng viết tiếp hành trình" : "Discover the journey"}
            <ArrowDownRight size={20} />
          </a>
        </div>
      </section>
      <section
        className={styles.bridge}
        aria-labelledby="opening-bridge-heading"
      >
        <p className={styles.eyebrow}>
          {vi
            ? "Từ di sản đến những cơ hội mới"
            : "From heritage to new possibilities"}
        </p>
        <div className={styles.bridgeContent}>
          <h2 id="opening-bridge-heading">
            {vi ? (
              <>
                Đam mê được tiếp nối
                <br />
                khi cơ hội được mở ra.
              </>
            ) : (
              <>
                Passion carries on
                <br />
                when opportunity opens up.
              </>
            )}
          </h2>
          <div>
            <p>
              {vi
                ? "Từ những thành tựu đáng tự hào đến từng buổi tập hôm nay, thể thao luôn bắt đầu bằng niềm tin vào khả năng của mỗi người. Vietnam ParaSports kết nối vận động viên, câu lạc bộ và những người đồng hành để cùng xây dựng một cộng đồng thể thao không rào cản."
                : "From proud achievements to today’s training sessions, sport begins with belief in every person’s potential. Vietnam ParaSports brings athletes, clubs and supporters together to build a sporting community without barriers."}
            </p>
            <a href="#sports-without-barriers">
              {vi
                ? "Khám phá Vietnam ParaSports"
                : "Explore Vietnam ParaSports"}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
