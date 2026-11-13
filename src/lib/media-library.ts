export type MediaLibraryItem = {
  url: string;
  alt?: string | null;
};

export function contentMediaFileError(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Only image files are allowed.";
  if (file.size > 12 * 1024 * 1024) return "Image must be under 12MB.";
  return null;
}
