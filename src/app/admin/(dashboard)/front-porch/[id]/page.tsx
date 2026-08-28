import { notFound } from "next/navigation";
import { getStory } from "@/lib/data/stories";
import { updateStoryAction, deleteStoryAction } from "@/lib/actions/stories";
import { StoryForm } from "@/components/admin/story-form";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = getStory(id);
  if (!story) notFound();

  const updateWithId = updateStoryAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-on-background">Edit Story</h1>
        <form action={deleteStoryAction}>
          <input type="hidden" name="id" value={story.id} />
          <ConfirmSubmitButton
            message={`Delete "${story.title}"? This can't be undone.`}
            className="text-sm font-semibold text-error hover:opacity-80"
          >
            Delete Story
          </ConfirmSubmitButton>
        </form>
      </div>
      <StoryForm action={updateWithId} story={story} submitLabel="Save Changes" />
    </div>
  );
}
