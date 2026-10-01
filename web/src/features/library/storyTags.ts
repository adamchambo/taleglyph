export const genres = [
  "Fantasy",
  "Science fiction",
  "Action",
  "Adventure",
  "Horror",
  "Mystery",
  "Thriller",
  "Romance",
  "Drama",
  "Comedy",
  "Historical",
  "Slice of life",
];
export const tones = [
  "Hopeful",
  "Dark",
  "Gritty",
  "Eerie",
  "Suspenseful",
  "Tragic",
  "Cozy",
  "Whimsical",
  "Humorous",
  "Romantic",
];
export function sameTag(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}
function listed(names: string[], tag: string) {
  return names.some((name) => sameTag(name, tag));
}
export function overviewTags(tags: string[]) {
  const genre = tags.filter((tag) => listed(genres, tag));
  const tone = tags.filter((tag) => listed(tones, tag));
  const other = tags.filter(
    (tag) => !listed(genres, tag) && !listed(tones, tag),
  );
  return [...genre.slice(0, 3), ...tone.slice(0, 2), ...other.slice(0, 2)];
}
