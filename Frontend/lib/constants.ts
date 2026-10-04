export const SITE_NAME = "MBay";
export const SITE_DESCRIPTION =
  "Discover trending movies and TV shows, build your watchlist, and never miss a premiere.";

/** Number of rotating slides in the homepage hero banner. */
export const HERO_COUNT = 6;

/** Poster cards rendered per homepage row. */
export const ROW_LIMIT = 18;

/** Minimum characters before the navbar fires an autocomplete request. */
export const SEARCH_MIN_CHARS = 2;

/** Autocomplete debounce in ms. */
export const SEARCH_DEBOUNCE_MS = 350;

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating" },
  { value: "primary_release_date.desc", label: "Release Date" },
];

export const EXPLORE_SORT_LABEL: Record<string, string> = Object.fromEntries(
  SORT_OPTIONS.map((o) => [o.value, o.label]),
);

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
] as const;
