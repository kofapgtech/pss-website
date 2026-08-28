import { Field, TextAreaField, SelectField, CheckboxField } from "@/components/admin/fields";
import { buttonVariants } from "@/components/ui/button";
import type { Story } from "@/lib/types";

export function StoryForm({
  action,
  story,
  submitLabel = "Save Story",
}: {
  action: (formData: FormData) => void;
  story?: Story;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <Field label="Title" name="title" defaultValue={story?.title} required />
      <TextAreaField label="Excerpt (shown on cards)" name="excerpt" defaultValue={story?.excerpt} rows={2} required />
      <TextAreaField label="Full story / description" name="body" defaultValue={story?.body} rows={6} required />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SelectField
          label="Type"
          name="type"
          defaultValue={story?.type ?? "article"}
          options={[
            { value: "article", label: "Article" },
            { value: "video", label: "Video" },
            { value: "audio", label: "Audio" },
          ]}
        />
        <Field label="Category" name="category" defaultValue={story?.category} placeholder="Storytelling, Music, Culture…" required />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Author / credit" name="author" defaultValue={story?.author} placeholder="PSS Media Team" />
        <Field
          label="Published date"
          name="publishedAt"
          type="date"
          defaultValue={story?.publishedAt?.slice(0, 10)}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <CheckboxField label="Published" name="published" defaultChecked={story?.published ?? true} hint="Visible on The Front Porch." />
        <CheckboxField label="Feature at top of page" name="featured" defaultChecked={story?.featured} />
      </div>
      <div>
        <button type="submit" className={buttonVariants("primary", "lg")}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
