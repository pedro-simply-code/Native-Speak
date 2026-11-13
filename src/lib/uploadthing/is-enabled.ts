export function isUploadthingEnabled() {
  return Boolean(process.env.UPLOADTHING_TOKEN?.trim());
}
