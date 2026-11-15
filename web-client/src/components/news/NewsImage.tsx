"use client";

import { useState } from "react";
import Image from "next/image";

export default function NewsImage({
  src,
  className,
  sizes,
  priority = false,
}: {
  src?: string | null;
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={
        !failed && src?.trim() ? src : "/assets/homepage/creator-lab-launch.jpg"
      }
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
