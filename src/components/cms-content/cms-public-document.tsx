import { ContentRenderer } from "@/components/cms-content/content-renderer";
import {
  BLOG_SECTION_NODE_TYPE,
  TEAM_SECTION_NODE_TYPE,
  WORK_SECTION_NODE_TYPE,
  contentDocumentUsesBlockType,
  parseContentDocument,
  type ContentDocument,
} from "@/lib/cms/content";
import { listPublishedEntriesSafe } from "@/server/content/queries";
import { getPublicProjectsSafe } from "@/server/studio/queries";

export async function CmsPublicDocument({
  bodyLexical,
}: {
  bodyLexical: unknown;
}) {
  const document = parseContentDocument(bodyLexical);
  if (!document) return null;

  const needsTeam = contentDocumentUsesBlockType(document, TEAM_SECTION_NODE_TYPE);
  const needsWork = contentDocumentUsesBlockType(document, WORK_SECTION_NODE_TYPE);
  const needsBlog = contentDocumentUsesBlockType(document, BLOG_SECTION_NODE_TYPE);

  const [projectsFromDb, blogPosts] = await Promise.all([
    needsWork ? getPublicProjectsSafe() : Promise.resolve([]),
    needsBlog ? listPublishedEntriesSafe("post") : Promise.resolve([]),
  ]);

  return (
    <div className="cms-blocks-document text-[var(--theme-ink)]">
      <ContentRenderer
        document={document as ContentDocument}
        teamMembers={[]}
        teamFromStudio={needsTeam}
        workProjects={projectsFromDb}
        blogPosts={blogPosts}
      />
    </div>
  );
}
