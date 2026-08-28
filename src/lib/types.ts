export type Tier = "starter" | "featured";

export type Organization = {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  website: string;
  contactEmail: string;
  tags: string[];
  tier: Tier;
  published: boolean;
  seed: string;
  createdAt: string;
};

export type EventStatus = "published" | "pending";

export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date, e.g. 2026-07-05
  time: string; // e.g. "2:00 PM – 9:00 PM"
  location: string;
  isVirtual: boolean;
  category: string;
  status: EventStatus;
  featured: boolean;
  rsvpUrl: string;
  seed: string;
  createdAt: string;
};

export type Vendor = {
  id: string;
  name: string;
  description: string;
  category: string;
  seed: string;
  published: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  category: string;
  seed: string;
  published: boolean;
  createdAt: string;
};

export type StoryType = "article" | "video" | "audio";

export type Story = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  type: StoryType;
  category: string;
  author: string;
  seed: string;
  featured: boolean;
  published: boolean;
  publishedAt: string;
  createdAt: string;
};

export type LeadType =
  | "newsletter"
  | "partner-inquiry"
  | "directory-upgrade"
  | "vendor-application"
  | "lovewell-join"
  | "contact";

export type Lead = {
  id: string;
  type: LeadType;
  name: string;
  organization: string;
  email: string;
  phone: string;
  message: string;
  meta: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};
