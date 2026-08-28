import Link from "next/link";
import { getAllStories } from "@/lib/data/stories";
import { deleteStoryAction } from "@/lib/actions/stories";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default function AdminFrontPorchPage() {
  const stories = getAllStories();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-background">The Front Porch</h1>
          <p className="mt-1 text-on-surface-variant">{stories.length} stories</p>
        </div>
        <Link href="/admin/front-porch/new" className={buttonVariants("primary", "md")}>
          <span className="material-symbols-outlined text-lg">add</span>
          New Story
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {stories.map((story) => (
              <tr key={story.id}>
                <td className="px-5 py-4 font-semibold text-on-background">
                  {story.title}
                  {story.featured && <Badge tone="tertiary" className="ml-2">Featured</Badge>}
                </td>
                <td className="px-5 py-4 capitalize text-on-surface-variant">{story.type}</td>
                <td className="px-5 py-4 text-on-surface-variant">{story.category}</td>
                <td className="px-5 py-4">
                  <Badge tone={story.published ? "confirmed" : "pending"}>
                    {story.published ? "Published" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/front-porch/${story.id}`} className="text-xs font-semibold text-primary hover:text-secondary">
                      Edit
                    </Link>
                    <form action={deleteStoryAction}>
                      <input type="hidden" name="id" value={story.id} />
                      <ConfirmSubmitButton
                        message={`Delete "${story.title}"? This can't be undone.`}
                        className="text-xs font-semibold text-error hover:opacity-80"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
