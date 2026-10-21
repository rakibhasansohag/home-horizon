# HomeHorizon UI audit

Phase 2 primitives are restyled: buttons, fields, cards, badges, tables, dialogs, and one `PropertyCard` for home, all properties, wishlist, my properties, advertise, and dashboard lists. Checkbox, tabs, and pagination components are not in the app.

Phase 1 tokens are in `src/index.css` and `index.html`. Ink, paper, line, and one green accent drive the shadcn variables. Instrument Sans is the UI face. Fraunces is loaded for later display titles (`font-display`). Palette utilities (`blue`, `gray`, `green`, `red`, `yellow`) in components now point at those tokens. Layout, type size misuse, and table overflow are still open.

Phase 0 notes follow.

Reviewed in the browser on 21 Oct 2026 against the running Vite app (`http://localhost:5173`). Viewports checked: 390, 768, 1280, and 1440. The local Express process could not resolve its MongoDB host, but the client is pointed at a working API, so listings, admin data, and auth all loaded.

A buyer account was created for the user-only pages: `ui.audit.buyer.20261021@gmail.com` / `Audit123!`.

The agent account (`agent@email.com`) signs in, then the secure client redirects to `/forbidden` as soon as a request returns 403 (role lookup). Agent pages and the fraud-agent account were therefore reviewed from source, not from a live session. Admin and the new buyer were reviewed live.

Dark mode already exists (`ThemeContext`, `.dark` in `src/index.css`). Keep it. Do not add a second theme.

## Page table

| Route | Role | File | Issues found |
| --- | --- | --- | --- |
| `/` | Public | `src/pages/Home/index.jsx` plus `Banner.jsx`, `Recommendations.jsx`, `ServiceSection.jsx`, `AdvertisedProperties.jsx`, `LatestUserReviews.jsx` | Photo hero is usable, but type is oversized and the search placeholder clips at 390px. Recommendations are floating cards that collide with the next section. Services is a 4-up icon-in-circle grid with scroll-fade motion and links to `/buy`, `/sell`, `/rent`, `/invest` (those routes do not exist). Advertised cards duplicate the property card, use a blue link, a green/yellow pill, and `text-xs`. Reviews are a marquee. Prices mix `৳` and missing grouping. |
| `/all-properties` | Public | `src/pages/AllProperties/index.jsx`, `MapView.jsx` | Split list + map works at 1280–1440. Map is `hidden lg:block`, so under 1024 there is no map. Cards are a third implementation (not the shared `PropertyCard`): `rounded-xl`, drop shadow, blue "View Details", green verified badge. Default Leaflet blue pins. Search and sort exist; no real filter set. Empty state tells the user to reload. |
| `/all-properties/:id` | Logged in | `src/pages/PropertyDetails/index.jsx`, `ImageGallery.jsx`, `StickySidebar.jsx`, `ReviewCard.jsx` | Gallery is an uneven mosaic, not a 16:9 hero. Price is ungrouped (`95902 - 241389 BDT`). Overview uses an emoji and a cyan review card with yellow stars. Offer CTA is a disabled grey "Sold" bar. No map on the detail page. |
| `/auth/login` | Guest | `src/pages/Authentication/Login/index.jsx`, `layouts/AuthLayout.jsx` | Split photo layout is fine. Form is one column. Legal line is `text-xs`. Primary button is the current blue, not ink. Terms link target does not match the legal routes. |
| `/auth/register` | Guest | `src/pages/Authentication/Register/index.jsx` | Same shell. Heading is "create an account" (sentence case missing). Native file input. Password rule text only appears as an error. `text-xs` legal line. |
| `/dashboard` | Admin | `src/pages/Dashboard/DashboardsHomePages/AdminDashboard.jsx` | Six stat cards, earnings chart drawn flat at 0, transaction list, user list, property mosaic. Stat subtitles are `text-xs`. "Properties" label was nearly invisible on a white card at 390px. Chart has no empty/error treatment. Sidebar is not grouped. Page has no title/actions header. |
| `/dashboard` | User | `src/pages/Dashboard/DashboardsHomePages/UserDashboard.jsx` | Welcome card, four stat tiles with hover gradient, empty sections that describe a next step but do not link to it. Broken avatar when no photo (alt text "avatar" inside the circle). |
| `/dashboard` | Agent | `src/pages/Dashboard/DashboardsHomePages/AgentDashboard.jsx` | Live view blocked by the 403 redirect. Source: earnings chart, pending/sold cards, `rounded-2xl`, hover lift, mixed icons, `console.log` of dashboard data (logic; leave it). |
| `/dashboard/profile` | All | `src/pages/Dashboard/Profile/index.jsx` | Works for admin and buyer. Dense "Not set" rows. Icon set is Font Awesome plus Material. No page header pattern. |
| `/dashboard/wishlist` | User | `src/pages/Dashboard/MyWishList/index.jsx` | Empty state is one line plus an emoji, no action. Loading skeleton exists. No error state. Uses shared `PropertyCard` only after items exist. |
| `/dashboard/offer/:propertyId` | User | `src/pages/Dashboard/MakeOffer/index.jsx` | Sold listing shows "already been sold" and a redirect. Form itself not exercised. Source has labels, inline errors, and a skeleton. |
| `/dashboard/property-bought` | User | `src/pages/Dashboard/PropertyBought/index.jsx` | Heading only ("Your Property Offers") when empty. No empty-state action. |
| `/dashboard/my-reviews` | User, admin | `src/pages/Dashboard/MyReviews/index.jsx` | Buyer with zero reviews sees "My Reviews (0)" and nothing else. Skeleton and error line exist. |
| `/dashboard/add-property` | Agent | `src/pages/Dashboard/AddProperties/index.jsx` | Not opened live. Long form, map picker, image sort. Leaflet CSS is imported. Default blue marker. No sticky submit. |
| `/dashboard/my-property` | Agent | `src/pages/Dashboard/MyProperties/index.jsx` | Not opened live. `text-xs` meta, card grid. |
| `/dashboard/agent-offer-properties` | Agent | `src/pages/Dashboard/AgentOffers/index.jsx` | Not opened live. Wrapped in `overflow-x-auto`. |
| `/dashboard/sold-properties` | Agent | `src/pages/Dashboard/AgentSoldeProperties/index.jsx` | Not opened live. `overflow-x-auto` plus `text-xs`. |
| `/dashboard/manage-properties` | Admin | `src/pages/Dashboard/AdminManageProperties/index.jsx` | Wide table. At 1440 the document itself overflows (about 1681px). Status and actions sit off-screen. At 390 the table scrolls inside `overflow-x-auto` (about 1361px in a 327px box). Images are tiny and not 4:3. |
| `/dashboard/manage-users` | Admin | `src/pages/Dashboard/AdminManageUsers/index.jsx` | Three action buttons per row (blue/red). At 390 the table scrolls (814px in 342px). Role badge is easy to miss. Skeleton exists. No stacked-card layout. |
| `/dashboard/manage-reviews` | Admin | `src/pages/Dashboard/AdminManageReviews/index.jsx` | Card grid. Emails truncate. Delete is a red button with no quiet confirmation in the card itself (modal may exist). Several cards show a raw quote and a broken avatar. |
| `/dashboard/advertise-property` | Admin | `src/pages/Dashboard/AdminAdvertiseProperty/index.jsx` | Another property table. Price uses `৳` and drops grouping (`৳1110000`). Same horizontal-scroll pattern. |
| `/dashboard/payment-success` | Logged in | `src/pages/Dashboard/Payment/Payment-success.jsx` | No Stripe Elements in the client. Success UI is a spring-animated green check, then a redirect. Hosted Checkout cannot take an appearance theme. |
| `/dashboard/payments` | Admin | `src/components/Shared/NotFound/ComingSoonPayment.jsx` | Decorative gradient, blur blob, fake card, `rounded-2xl`, `text-xs`. |
| `/forbidden`, `/unauthorized` | Any | `src/components/Shared/NotFound/Forbidden.jsx` | Hard-coded `bg-gray-100`, `text-red-600`, `bg-blue-600`. Outside the token system. Seen live when the agent session was rejected. |
| `/*` | Any | `src/components/Shared/NotFound/NotFoundPage.jsx` | Centered red "404", one sentence, one button. No header or footer. Readable. |
| `/about-us`, `/contact`, `/legal/*` | Public | `src/components/Shared/NotFound/ComingSoon.jsx` | `rounded-2xl` and heavy shadow. Not part of the required route list, but linked from the footer. |

Shells used by the pages above:

- `src/layouts/HomeLayout.jsx`, `src/components/Shared/Header.jsx`, `src/components/Shared/Footer.jsx`
- `src/layouts/AuthLayout.jsx`
- `src/layouts/DashboardLayout.jsx`, `src/components/app-sidebar.jsx`, `src/components/ui/sidebar.jsx`

## Issues by type

### Broken layout

- Dashboard content has no page header (title + actions). A lone sidebar trigger sits at the top of the canvas.
- Admin manage-properties table is wider than a 1440px viewport, so Status and Actions are clipped.
- Home recommendations float over the following section and are cut off at 390px.
- Property detail gallery is an irregular collage, not a fixed-ratio hero.
- Earnings chart on the admin home renders a flat zero line with "0k" ticks.
- Two property-card implementations (`components/Shared/PropertyCard.jsx` and `pages/Dashboard/Components/PropertyCard.jsx`) plus a third inline card on All Properties and a fourth on Advertised Properties.
- Service buttons point at routes that are not registered.

### Overflow and horizontal scroll

- Home, all-properties, property detail, auth, user dashboard, and 404 do not scroll the document sideways at 390, 768, 1280, or 1440.
- Admin tables do. `overflow-x-auto` wraps manage properties, manage users, agent offers, and sold properties. At 390, manage users scrolls 814px inside 342px. At 1440, manage properties overflows the document (scroll width about 1681px).
- Thumbnail images report a scroll width larger than their box (`w-16 h-12`), so they are not reliably clipped.

### Text too small

- No computed size under 12px on the home page.
- `text-xs` (12px) is used for body-adjacent copy, badges, table meta, review dates, auth legal lines, and stat subtitles. Body copy should be 16px. Table text should be at least 14px. 12px only for captions.
- Button default height is 36px (`h-9`). Icon buttons are 36px. Touch target should be at least 44px.

### Contrast

- Brand blue (`--primary` around oklch hue 250) is the main action color. Links also use raw `text-blue-600` and `text-blue-500`.
- `--muted` is a bright cyan (`oklch(0.78 0.2 200)`). The footer rule and some fills pick it up.
- Review cards on the property page are solid cyan with yellow stars.
- Admin stat label "Properties" was washed out on white at 390px.
- Forbidden page uses default Tailwind red, blue, and gray, not the theme.
- White hero type sits on a photo with a 40% black veil. It holds on the house; it is weaker where the sky is light.

### Inconsistent components

- Icons: Lucide in the header and some buttons; Font Awesome, Heroicons, Material, and Go icons in the sidebar, cards, and footer. Sidebar mixes four sets.
- Radius: `rounded-md` on inputs, `rounded-xl` / `rounded-2xl` on cards, `rounded-full` on the services buttons and status pills.
- Prices: `$1,563,762` on the admin home, `11,000 - 11,110,000 BDT` on cards, `95902 - 241389 BDT` on the detail page, `৳1110000` on advertise. No tabular numerals.
- Status color is the only signal on several badges (green verified, yellow pending, red delete) with small type.
- Active nav uses `a.active` (primary + extra bold) from global CSS, and a separate underline hover. Dashboard sidebar active state is the default shadcn item, easy to miss.
- Loading: some pages use `Skeleton`, some use `GlobalLoading` (looping house SVG), advertised properties use the word "Loading…", all-properties has no error branch (`isError` is unused).

### Gradients and slop to remove

- `UserDashboard` stat tiles: `bg-gradient-to-br from-primary via-accent to-secondary` on hover, plus `hover:scale-105`.
- `ComingSoonPayment.jsx`: gradient panel and a blurred color blob.
- Services section: four icon circles, `rounded-2xl`, `shadow-xl`, `whileInView` fade-up. Same pattern as the banned feature grid.
- Latest reviews: infinite marquee and scroll-triggered fade.
- Recommendations: stacked floating cards.
- Card hover lift / scale on agent pending and sold cards.
- Emoji in the UI: wishlist empty state, property overview heading.
- Footer "crafted with" heart.
- Auth and marketing copy is fine to keep where it is real. Service blurbs and the fake payment card are filler.

### Missing loading, empty, and error states

- Wishlist empty: text plus emoji, no link.
- Bought and my-reviews empty: heading only.
- User dashboard empty sections: sentence, no button.
- All-properties: loading skeletons, a weak empty state, no error state.
- Advertised properties: returns null when empty, plain text while loading.
- Admin chart: no empty state when the series is all zeros.
- My-reviews has an error line. Many other lists do not.

### Mobile

- Public header collapses correctly under `md`. The menu is a bare list over the hero, not a solid panel, so links sit on the photograph.
- At 768 the desktop nav is already shown (`md:flex`) and still fits.
- Dashboard sidebar does collapse to a trigger at 390px on the admin home. It does not read as a grouped drawer, and the trigger has no accessible name in the snapshot.
- Tables do not become cards. They scroll sideways.
- Map on all-properties disappears below `lg` instead of stacking.
- Hero search field truncates its placeholder at 390px.
- Auth image column is `hidden` below `md` (`md:grid-cols-[550px_1fr]`). The 550px column will be tight at 768.

### Console and UI-adjacent errors

- Agent (and, by the same interceptor, likely the fraud agent) cannot stay on `/dashboard`. `useAxiosSecure` sends every HTTP 403 to `/forbidden`, including the role request.
- No separate UI console sweep beyond that. Pages that rendered did not show a visible error overlay.
- `GlobalLoading` strokes `hsl(var(--primary))` while `--primary` is already `oklch(...)`, so the loader stroke can be invalid.
- Home layout still uses the DaisyUI class `loading loading-spinner`, which does nothing under Tailwind.

## What is already in good shape

- Public pages do not scroll sideways.
- Home hero is a real photograph with a search field, not a centered two-button marketing hero.
- Auth is a single column of fields with labels above the inputs.
- Buyer dashboard empty sections exist, even though they lack an action.
- Property images that did load use `object-cover`.
- Dark mode tokens already exist and should be remapped, not removed.

## Priority

1. Tokens. Put ink, paper, line, and the single accent into the Tailwind 4 `@theme`, and point shadcn `--primary`, `--ring`, `--border`, `--muted` at them. Fix the cyan `--muted` and the invalid loader color. Keep dark mode on the same accent.
2. Type. One UI family plus an optional display serif. Body 16px, tables 14px, 12px only for captions. One price format with tabular numerals.
3. Primitives and a single `PropertyCard`. Button heights, inputs, badges, tables, dialogs. Delete the duplicate cards by switching call sites only (markup), not data flow.
4. Shells. Header active state and a solid mobile menu. Quiet footer. Dashboard sidebar grouped by role, drawer under 768px, page title row.
5. Home. Rebuild the hero so the search is fully readable, remove the floating recommendation stack and the services icon grid, replace the review marquee.
6. All properties and property detail. One card, fixed image ratios, accent map pins, price block, review contrast.
7. Auth screens, then dashboard home for each role.
8. Tables. Stack into cards under 768px, starting with manage properties, manage users, and advertise.
9. Empty, loading, and error states on every list. Strip gradients, blur, emoji, and extra icon sets as each file is touched.
10. Forbidden, 404, and the coming-soon payment panel. Stripe appearance only if an Elements form exists. It does not today.

Agent routes stay blocked until the 403 redirect is understood. That interceptor is logic. Do not change it in the visual pass. Ask before touching it.
