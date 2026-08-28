import { StoryForm } from "@/components/admin/story-form";
import { createStoryAction } from "@/lib/actions/stories";

export default function NewStoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold text-on-background">New Story</h1>
      <StoryForm action={createStoryAction} submitLabel="Publish Story" />
    </div>
  );
}
