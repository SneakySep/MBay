import { notFound } from "next/navigation";

import { getMovieDetails } from "@/lib/tmdb";
import { getTitle } from "@/lib/utils";
import { MediaDetail } from "@/components/media-detail";
import type { Metadata } from "next";

interface TvPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await getMovieDetails(id, "tv");
    return {
      title: `${getTitle(details)} (TV)`,
      description: details.overview?.slice(0, 160) || undefined,
    };
  } catch {
    return { title: `TV Series #${id}` };
  }
}

export default async function TvPage({ params }: TvPageProps) {
  const { id } = await params;

  let details;
  try {
    details = await getMovieDetails(id, "tv");
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound();
    throw error;
  }

  return <MediaDetail details={details} mediaType="tv" />;
}
