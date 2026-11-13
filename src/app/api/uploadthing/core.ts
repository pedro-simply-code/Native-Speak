import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { registerSiteMediaFromUpload } from "@/server/actions/site-media";

const f = createUploadthing();

export const ourFileRouter = {
  siteImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 20 },
  })
    .middleware(async () => {
      const session = await auth();
      const roles = session?.user?.roles ?? [];
      if (!session?.user?.id || !hasPermission(roles, "content.manage")) {
        throw new Error("Forbidden");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      await registerSiteMediaFromUpload({
        url: file.url,
        storageKey: file.key,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadedByUserId: metadata.userId,
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
