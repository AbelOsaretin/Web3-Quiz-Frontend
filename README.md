# Web3 Quiz — Frontend

A Next.js (App Router) frontend for the Web3 Quiz project. This app provides a quiz UI, Supabase-backed authentication and user data, and wallet-gated quiz flows.

Key features

- Supabase Auth (email/password + Google OAuth)
- User profile, quiz history and rewards sourced from Supabase tables
- Wallet integration (AppKit / wagmi) to gate quiz play
- Quiz generation and submission to a webhook with robust response parsing
- Tailwind CSS and modern React + Next.js app router structure

Live deployment

The project may be deployed to Vercel. Example deployment (if enabled) was previously hosted under a Vercel project.

Getting started (local)

Prerequisites

- Node.js 18+ (or the version supported by this repo)
- pnpm (recommended) or npm/yarn
- A Supabase project with the following environment variables set in a .env.local file or your hosting platform:

- NEXT_PUBLIC_SUPABASE_URL - your Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY - your Supabase anon/public key

Optional (for OAuth and wallet flows)

- Configure OAuth redirect URLs in the Supabase dashboard to include your local dev origin (e.g. http://localhost:3000) and any production origins.

Install and run

```bash
pnpm install
pnpm dev
```

Build for production

```bash
pnpm build
pnpm start
```

Environment variables

Create a `.env.local` at the project root and add at minimum:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If you use OAuth (Google), add the appropriate redirect/redirect URLs in Supabase and ensure your host (local or production) matches those values.

Project structure (high level)

- `app/` — Next.js App Router pages and route components
- `components/` — UI components and auth toggles
- `lib/` — shared utilities, including `lib/supabaseClient.ts` for a central Supabase client
- `hooks/` — small React hooks (wallet, toasts)
- `public/` — static assets
- `styles/` — global and project styles

Contributing

- Open an issue or submit a PR if you'd like to improve the frontend. For larger changes (auth flow, DB schema), coordinate so the Supabase schema and client code stay in sync.

Troubleshooting

- If auth fails, confirm your SUPABASE env vars are correct and check the browser console/network logs for returned error messages from Supabase.

License

- MIT (or update to your preferred license)

Contact

- Project owner: Abel Osaretin
