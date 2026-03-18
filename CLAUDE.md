# TRecs Advisory Council

AI-powered advisory board simulator for TRecs by Avisoma. Simulates a panel of aviation industry leaders who provide strategic advice, vote on proposals, and generate implementation plans.

## Architecture

- **Single-file React 18 component**: `src/TRecsCouncil.jsx` (~2100 lines). All UI, state, logic, and inline styles live here.
- **Entry point**: `src/main.jsx` renders `<TRecsCouncil />`.
- **No component library** — all styles are inline JS objects. Design system uses warm neutrals (`#F8F6F1`, `#FFFEFA`, `#E8E5DE`), gold accent (`#A68A2A`), and `DM Sans` + `Space Mono` fonts.
- **No router, no state management library** — plain React `useState`/`useEffect`/`useRef`.

## Stack

- React 18, Vite 6, Lucide React icons
- No backend — API calls go through Vite dev proxy to Anthropic
- `window.storage` async key-value API for persistence (provided by host environment)

## API Proxy

Anthropic API is proxied via Vite dev server to avoid CORS. Configured in `vite.config.js`:

- Browser calls `/api/anthropic/v1/messages`
- Proxy rewrites to `https://api.anthropic.com/v1/messages`
- API key loaded from `.env` (`ANTHROPIC_API_KEY`)
- Model: `claude-sonnet-4-20250514`
- Required header: `anthropic-dangerous-direct-browser-access: true`

## Running

```bash
npm run dev          # starts on http://127.0.0.1:5173
npm run build        # production build to dist/
```

Or via Claude Preview launch config (`.claude/launch.json`):
```bash
cd /Users/philippmintchin/trecs-development/trecs-advisory-council && npx vite --port 5173
```

## Modes (5 tabs)

| Mode | Purpose | Key function |
|------|---------|-------------|
| **Full Council** | All selected advisors discuss a topic sequentially, then synthesis + action extraction + veto extraction | `runCouncil()` |
| **Vote** | Each advisor votes for/against/abstain on a proposal with rationale | `runVote()` |
| **Quick Brief** | Fast tactical advice (1-3 sentences per advisor) with situational doc upload, produces structured briefing card | `runBrief()` |
| **Individual** | Multi-turn conversation with a single advisor | `askMember()` |
| **To-Do** | View extracted action items by timeframe, vetoes/warnings, copy prompt or generate full plan via API | N/A (display mode) |

## Key Patterns

### Advisor data structure
```js
{
  id, initials, name, title, company, color, abbr,
  expertise, verified, // verified via API check on add
  systemPrompt         // contains {{PRODUCT_CONTEXT}} placeholder
}
```

### Context injection
- `getActiveContext()` returns custom uploaded `.md` content or default `TRECS_CONTEXT`
- `resolvePrompt(template)` replaces `{{PRODUCT_CONTEXT}}` in system prompts
- Product context is global and persistent; Quick Brief situational docs are ephemeral

### API call pattern
```js
const callAPI = async (sys, msgs, maxTokens = 1000) => { ... }
```
All modes follow the same sequential pattern: loop through active advisors, call API for each, update state progressively, then run a synthesis/extraction step.

### Advisor verification
When adding a new advisor, `addAdvisor()` fires a verification API call asking the model if it can accurately roleplay the person. Unknown/obscure people are rejected. Verified advisors get `verified: true` and show a checkmark badge.

## Prompt Templates (constants at top of file)

| Constant | Purpose | Max tokens |
|----------|---------|-----------|
| `SYNTH_PROMPT_TEMPLATE` | Synthesize council positions | 1000 |
| `ACTION_EXTRACTION_PROMPT` | Extract to-do items as JSON array | 2000 |
| `VETO_EXTRACTION_PROMPT` | Extract vetoes/warnings as JSON array | 1500 |
| `VOTE_PROMPT_TEMPLATE` | Cast vote as JSON `{vote, rationale}` | 500 |
| `BRIEF_SUFFIX` | Appended to advisor prompts in Quick Brief mode | N/A |
| `BRIEF_SYNTH_PROMPT` | Produce structured briefing card | 1000 |

Plan generation (`generateFullPlan()`) builds its own system prompt inline with max tokens 8000.

## Storage Keys

| Key | Contents | Persistent? |
|-----|----------|------------|
| `trecs-council-v3` | Meeting history (last 20 entries) | Yes |
| `trecs-council-context` | Custom product context file | Yes |
| `trecs-council-members` | Custom advisor list | Yes |

Quick Brief situational docs (`briefDocs`) are **not** persisted.

## UI Structure (render order)

1. Header (title, history button, download button)
2. Context badges (loaded file, meeting count)
3. Product context upload (drag & drop `.md`)
4. History panel (collapsible)
5. Mode tabs
6. Active mode content
7. Advisor cards (council + individual modes only)
8. Synthesis panel (council mode)
9. Footer

## Conventions

- All styles are inline JS objects — no CSS files, no className
- Colors: use existing palette constants, not arbitrary hex values
- State: flat `useState` hooks, no reducers or context
- Prompt responses: JSON-structured outputs use `text.match(/\[[\s\S]*\]/)` or `/\{[\s\S]*\}/` for parsing
- History entries always include: `{ id, topic, date, mode, participants, ...mode-specific data }`
- `isRunning` is a global lock — only one operation runs at a time
- `selectedMembers` is shared across all modes (Set of member IDs)
- Max 9 advisors, min 1

## GitHub

Repo: `philipp-av-source/trecs-advisory-council`
