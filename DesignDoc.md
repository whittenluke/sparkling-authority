# SparklingAuthority.com - Design Document

## Overview

**SparklingAuthority.com** will be the leading online authority for sparkling water enthusiasts, offering expert content, user-generated reviews, comparisons, and a structured sparkling water database. The site will be designed to be a world-class product, focusing on performance, usability, and SEO.

## Tech Stack

- [ ] **Hosting:** Netlify _(not configured yet)_
- [x] **Database & Backend:** Supabase (PostgreSQL-based) _(schema implemented)_
- [x] **Frontend Framework:** Next.js (for performance & SEO) _(implemented)_
- [ ] **CMS:** Notion API (for expert articles & content management)
- [ ] **Authentication:** Supabase Auth (Email, Google, Social OAuth)
- [ ] **Social & SEO Tools:** Next.js optimizations, auto-posting to social media

## Features

### 1. User-Generated Reviews & Ratings

- [ ] Users can submit reviews with:
  - [ ] **Overall rating** (stars)
  - [ ] **Taste, Carbonation, Aftertaste ratings** (separate structured scores)
  - [ ] **Text review**
- [x] **No image uploads** at launch _(requirement confirmed)_
- [ ] **Moderation:** Reviews require **manual approval** initially
- [ ] **Future AI moderation** (spam/inappropriate filtering) may be considered

### 2. Commenting & Engagement

- [ ] Users can **comment and like** articles and reviews
- [x] No forum planned at launch _(requirement confirmed)_
- [ ] Reputation system & voting on reviews TBD

### 3. Expert Articles & Guides

- [ ] Authored by site owner and contributors
- [ ] Managed via **Notion API CMS**
- [ ] Includes industry news, buying guides, health benefits, etc.
- [ ] **Auto-posting to social media** upon publishing

### 4. Sparkling Water Database

- [ ] A curated database of brands, flavors, and product details
- [ ] Includes brand comparisons, flavor profiles, and ratings
- [ ] **Updating Mechanism:**
  - [ ] Users' ratings contribute to database updates
  - [ ] Brands can submit missing products via email
  - [ ] Discontinued products remain for historical reference

### 5. Monetization Strategy (Future)

- [ ] **Affiliate Marketing** (Amazon, sparkling water brands)
- [ ] **Sponsored Content** (Paid placements, advertorials)
- [ ] **Community Donations** (Patreon, one-time donations)
- [ ] **Merchandise** (Potential long-term idea)

### 6. SEO & Content Strategy

- [ ] High-ranking **organic keywords** targeting _(meta tags implemented)_
- [ ] Structured data for search engines _(basic implementation)_
- [ ] Content optimized for sharing & social engagement

### 7. Social Media Integration

- [ ] Auto-posting new content to **Instagram, X, TikTok**
- [ ] Social sharing for articles (reviews TBD)
- [ ] Content scheduling possible in the future

### 8. User Authentication & Accounts

- [ ] Email + OAuth (Google, Social logins)
- [ ] Required for posting reviews and comments

### 9. Moderation & Maintenance

- [ ] **Manual review approval** at launch
- [ ] **Reporting system** for spam/inappropriate content
- [ ] **Alerts for moderation needs**
- [ ] Minimal manual maintenance preferred

### 10. Analytics & Performance

- [x] User engagement tracking (popular content, traffic, etc.) _(Next.js Analytics ready)_
- [x] Site speed and performance optimizations _(Next.js defaults implemented)_

## Current Progress

✅ **Completed:**

- Basic Next.js setup with TypeScript
- Initial responsive layout and navigation
- Homepage with hero section and featured content
- Placeholder pages for main sections
- Database schema design and implementation

🔄 **In Progress:**

- Setting up GitHub repository
- Setting up Netlify hosting
- Setting up Supabase Auth

⏳ **Next Steps:**

- Authentication flow
- Review system implementation

## Future Roadmap Considerations

- [ ] AI moderation for reviews/comments
- [ ] Expanding to sparkling water subscription boxes, taste tests, or community voting
- [ ] International content & translations (long-term vision)

## Summary

SparklingAuthority.com will be the definitive online resource for sparkling water lovers, providing expert content, structured product comparisons, and user-driven reviews. The platform is designed for **scalability, ease of maintenance, and SEO-driven growth**, with a clear long-term roadmap for monetization and community engagement.

---

This document will serve as the foundation for developing the website. Let me know if you'd like to refine anything!
