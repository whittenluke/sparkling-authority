# SparklingAuthority.com

The leading online authority for sparkling water enthusiasts, offering expert content, user-generated reviews, and structured comparisons.

## Tech Stack

- **Frontend:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **CMS:** Notion API
- **Authentication:** Supabase Auth
- **Hosting:** Netlify

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template:
   ```bash
   cp .env.local.example .env.local
   ```
4. Update the environment variables in `.env.local` with your:

   - Supabase project URL and anon key
   - Notion API key and database ID

5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/app/` - Next.js app router pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and API clients
- `src/types/` - TypeScript type definitions

## Development

- **Code Style:** The project uses ESLint and TypeScript for code quality
- **Styling:** Tailwind CSS for utility-first styling
- **State Management:** React hooks and context for local state
- **Data Fetching:** Server Components and Supabase client

## Deployment

The site is deployed on Netlify. Push to the main branch to trigger a deployment.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

All rights reserved. This is a proprietary project.
