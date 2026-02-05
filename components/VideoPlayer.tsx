"use client";

import { useState } from "react";
import Image from "next/image";
import { getYoutubeThumbnail } from "@/lib/utils";

/**
 * VideoPlayer: Shows a YouTube thumbnail that expands into an embedded iframe
 * when clicked. Uses youtube-nocookie.com for privacy.
 */
export function VideoPlayer({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-ink">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-warm-gray group cursor-pointer"
      aria-label={`Play video: ${title}`}
    >
      <Image
        src={getYoutubeThumbnail(videoId, "hqdefault")}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 640px"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div className="w-16 h-16 rounded-full bg-crimson/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
            className="ms-1"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      </div>
    </button>
  );
}
