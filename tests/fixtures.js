/* Fixture rows. Deliberately small and obviously fake — none of this is
   seeded into the real database. */
const ME = {
  id: 'me-1', display_name: 'Ada Test', pronouns: 'they/them',
  neighborhood: 'Bronzeville', bio: '', member_since: '2026-01-05T00:00:00Z',
  role: 'member'
};

const CATEGORIES = [
  { slug: 'prep-prescribers',      label: 'PrEP prescribers',      sort_order: 10, status: 'published' },
  { slug: 'sti-testing',           label: 'STI Testing',           sort_order: 20, status: 'published' },
  { slug: 'gender-affirming-care', label: 'Gender Affirming Care', sort_order: 30, status: 'published' },
  { slug: 'family-therapist',      label: 'Family Therapist',      sort_order: 40, status: 'published' }
];

const PROVIDERS = [
  { id: 'hp-1', name: 'Clinic One', address: '1 S State St', neighborhood: 'Loop',
    phone: '312-555-0101', website: 'https://example.test/one',
    services: ['prep-prescribers', 'sti-testing'],
    latitude: 41.88, longitude: -87.63, status: 'published' },
  { id: 'hp-2', name: 'Clinic Two', address: '2 E 47th St', neighborhood: 'Bronzeville',
    services: ['gender-affirming-care'],
    latitude: 41.81, longitude: -87.61, status: 'published' },
  { id: 'hp-3', name: 'Clinic Three', address: '3 W 63rd St', neighborhood: 'Englewood',
    services: ['prep-prescribers', 'gender-affirming-care', 'family-therapist'],
    latitude: null, longitude: null, status: 'published' }
];

const VENDORS = [
  { id: 'v-1', name: 'Vendor One', address: '10 E 43rd St', neighborhood: 'Bronzeville',
    website: 'https://example.test/v1', latitude: 41.816, longitude: -87.617,
    is_participating: true, status: 'published' },
  { id: 'v-2', name: 'Vendor Two', address: '20 W 79th St', neighborhood: 'Chatham',
    latitude: null, longitude: null, is_participating: false, status: 'published' }
];

const YEAR_OUT = new Date(Date.now() + 365 * 864e5).toISOString();
const YESTERDAY = new Date(Date.now() - 864e5).toISOString();

const COUPONS = [
  { id: 'c-1', title: 'Coupon With Wallet Pass', discount_text: '10% off',
    description: 'A test coupon.', code: 'TESTCODE',
    redeem_url: 'https://example.test/redeem-1',
    wallet_pass_url: 'https://example.test/pass-1.pkpass',
    valid_until: YEAR_OUT, member_only: true, status: 'published',
    vendor: { id: 'v-1', name: 'Vendor One', neighborhood: 'Bronzeville' } },
  { id: 'c-2', title: 'Coupon Without Wallet Pass', discount_text: '$5 off',
    redeem_url: 'https://example.test/redeem-2',
    wallet_pass_url: null, member_only: true, status: 'published',
    vendor: { id: 'v-2', name: 'Vendor Two' } },
  { id: 'c-3', title: 'Expired Coupon', discount_text: '50% off',
    redeem_url: 'https://example.test/redeem-3', wallet_pass_url: null,
    valid_until: YESTERDAY, member_only: true, status: 'published', vendor: null }
];

const FEED = [{
  id: 'p1', body: 'Block party on 47th this Saturday.', status: 'published',
  created_at: new Date(Date.now() - 3600e3).toISOString(), author_id: 'me-1',
  author: { id: 'me-1', display_name: 'Ada Test', pronouns: 'they/them', neighborhood: 'Bronzeville' },
  post_comments: [{ id: 'c1', body: 'See you there!', created_at: new Date().toISOString(),
                    author_id: 'u2', author: { id: 'u2', display_name: 'Bo Neighbor' } }]
}];

const EVENTS = [{
  id: 'e1', title: 'Community Potluck', starts_at: new Date(Date.now() + 5 * 864e5).toISOString(),
  venue_name: 'Community Center', neighborhood: 'Woodlawn', category: 'Meetup',
  summary: 'A shared meal.', status: 'published'
}];

module.exports = { ME, CATEGORIES, PROVIDERS, VENDORS, COUPONS, FEED, EVENTS };
