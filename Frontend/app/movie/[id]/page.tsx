import { notFound } from "next/navigation";

import { getMovieDetails } from "@/lib/tmdb";
import { getTitle } from "@/lib/utils";
import { MediaDetail } from "@/components/media-detail";
import type { Metadata } from "next";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await getMovieDetails(id, "movie");
    return {
      title: getTitle(details),
      description: details.overview?.slice(0, 160) || undefined,
      openGraph: {
        title: getTitle(details),
        description: details.overview?.slice(0, 200) || undefined,
        images: details.backdrop_path
          ? [{ url: `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` }]
          : undefined,
      },
    };
  } catch {
    return { title: `Movie #${id}` };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  let details;
  try {
    details = await getMovieDetails(id, "movie");
  } catch (error) {
    // TMDB 404 → our 404 page; anything else → nearest error boundary.
    if ((error as { status?: number }).status === 404) notFound();
    throw error;
  }

  return <MediaDetail details={details} mediaType="movie" />;
}
