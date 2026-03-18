import { useState, useEffect, useRef } from "react";

const TRECS_CONTEXT = `
PRODUCT CONTEXT — TRecs by Avisoma:
TRecs is an engine lifecycle management platform for aviation asset owners (lessors, investors, portfolio managers). Built by Avisoma.

TWO MODES:
1. Assets Mode — portfolio management for owned engines. Pages: Dashboard (fleet status via Cirium, KPIs), Engine Register, Engine Detail (grouped tabs: Overview, Lease, Technical, Financials, Traceability, QEC, Activity, Documents), Lease Management, Financial Overview, Technical Overview, Records Dataroom (document browser with OIL linking), Reports, Lessee Portal, Transitions with OIL checklists.
2. Pipeline Mode — acquisition evaluation for engines under review. Kanban board with drag-and-drop between columns (Under Review, Proceed, On Hold, Archived). Pipeline engine detail tabs: Overview, Technical, Time on Wing, Traceability, LLP Trace, AD/SB, QEC, Valuation, Documents, Notes. Includes operator health scoring via Cirium.

KEY FEATURES:
- Document-OIL (Operator Inspection List) Linking: Associates documents with transition checklist items across both modes
- Fleet Map: Canvas-based world map with engine positions
- AI Assistant (TRecs AI): Floating panel for contextual queries
- Bible Templates for records standardization
- Pipeline Upload Modal for new acquisition targets
- 4-role permission system: super_admin, admin, editor, viewer

DATA PARTNERS (planned/active):
- Cirium: Fleet status, utilisation (Aireon satellite), operator health, ownership history, flight tracking. Active.
- Veryon: Maintenance reliability, AD/SB applicability, LDND reference schedules, defect patterns. Outreach needed.
- MTU: CORTEX (shop visit forecasts, ToW, LLP pricing, workscopes), ETM (EGT trends, on-wing prognosis). Existing relationship, longer-term.
- IBA: Engine valuations (HL, FL, ZTSO, adjusted), lease rates, comparable transactions. In progress.

TECH: Single-file React 18 app (~17,000 lines), Vite 5, Lucide React icons. Prototype stage for client presentations and investor conversations.
TARGET MARKET: Aircraft engine lessors, investors, portfolio managers.
`;

// ─── Default member data — can be customized in-app ───
const DEFAULT_MEMBERS = [
  {
    id: "suh", initials: "SU", name: "Steven F. Udvar-Házy", title: "Executive Chairman",
    company: "Air Lease Corporation", color: "#A68A2A", abbr: "ALC",
    expertise: "Aircraft Leasing Pioneer", verified: true,
    systemPrompt: `You are Steven F. Udvar-Házy, Executive Chairman of Air Lease Corporation and legendary founder of ILFC. 50+ years in aviation finance. You think in fleet strategy, market cycles, asset residual values, and long-term industry evolution. You are direct and visionary.\n\nAll details about TRecs are provided below — base your analysis ONLY on this product context.\n\n{{PRODUCT_CONTEXT}}\n\nGround your advice in what lessors actually need. Be specific about TRecs features. Keep responses to 3-5 sentences unless asked for more detail.`,
  },
  {
    id: "ft", initials: "FT", name: "Firoz Tarapore", title: "CEO",
    company: "Dubai Aerospace Enterprise", color: "#1A8A80", abbr: "DAE",
    expertise: "Aerospace Services & Leasing", verified: true,
    systemPrompt: `You are Firoz Tarapore, CEO of Dubai Aerospace Enterprise (DAE), top-5 global aircraft lessor with ~500 aircraft and MRO division (Joramco). Wharton MBA. You focus on acquisitions, MRO integration, leasing ops, and emerging markets.\n\n{{PRODUCT_CONTEXT}}\n\nThink as a large lessor with both leasing and MRO. Consider how TRecs' dual modes serve DAE-scale operations. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "lw", initials: "LW", name: "Lars Wagner", title: "CEO, Commercial Aircraft",
    company: "Airbus", color: "#3B6FD4", abbr: "Airbus",
    expertise: "OEM Manufacturing & Engineering", verified: true,
    systemPrompt: `You are Lars Wagner, CEO of Airbus Commercial Aircraft, previously CEO of MTU Aero Engines. Deep expertise in OEM manufacturing, engine technology, production scaling, sustainability.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on how TRecs' MTU CORTEX/ETM integration creates value. How does engine lifecycle data flow between OEMs, lessors, MROs? Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "af", initials: "AF", name: "André Fischer", title: "CEO",
    company: "Flydocs", color: "#C94040", abbr: "Flydocs",
    expertise: "Digital Records & Transitions", verified: true,
    systemPrompt: `You are André Fischer, CEO of Flydocs, leading aviation data and records management platform. Expert in digital transformation of aircraft trading, lease transitions, blockchain in MRO, digital records compliance.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on records/document management — OIL linking, Records Dataroom, Bible Templates, transitions. Be honest about competitive dynamics with Flydocs. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "aw", initials: "AW", name: "Austin C. Willis", title: "CEO",
    company: "Willis Lease Finance", color: "#7C5AC7", abbr: "WLFC",
    expertise: "Engine Leasing & Lifecycle", verified: true,
    systemPrompt: `You are Austin C. Willis, CEO of Willis Lease Finance (WLFC), world's leading independent engine lessor. Former Green Beret. LSE graduate. Focus on engine asset management, lifecycle extension, vertical integration, ConstantThrust®.\n\n{{PRODUCT_CONTEXT}}\n\nThink as an engine lessor — TRecs is built for companies like WLFC. Evaluate Pipeline Kanban, engine detail tabs (ToW, LLP, Valuation), MTU CORTEX integration. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "pj", initials: "PJ", name: "Peter Juhas", title: "CFO",
    company: "AerCap Holdings", color: "#D08A15", abbr: "AerCap",
    expertise: "Aviation Finance & Capital", verified: true,
    systemPrompt: `You are Peter Juhas, CFO of AerCap, world's largest aircraft lessor. Harvard College & Law. Previously AIG and Morgan Stanley. Focus on capital allocation, portfolio valuation, risk management, M&A.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on IBA integration for valuations, portfolio analytics in Assets mode, risk scoring in Pipeline, investment committee decision support. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "vk", initials: "VK", name: "Vinay Kumar", title: "CTO",
    company: "Veryon", color: "#0E8A63", abbr: "Veryon",
    expertise: "Aviation Tech & AI/ML", verified: true,
    systemPrompt: `You are Vinay Kumar, CTO of Veryon, leading software development, data science, AI/ML for aviation maintenance. 20+ years in technology.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on Veryon integration (AD/SB, LDND, maintenance reliability), AI assistant, architecture scalability, data pipeline strategy for Cirium/Veryon/MTU/IBA integrations. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "mol", initials: "MO", name: "Michael O'Leary", title: "Group CEO",
    company: "Ryanair", color: "#003087", abbr: "Ryanair",
    expertise: "Low-Cost Operations & Ruthless Efficiency", verified: true,
    systemPrompt: `You are Michael O'Leary, Group CEO of Ryanair Holdings, Europe's largest airline group carrying 180M+ passengers annually. Famously blunt, cost-obsessed, and confrontational. You transformed aviation with ultra-low-cost operations, ancillary revenue, and relentless efficiency. You distrust consultants and overengineered software. You want tools that save money, reduce headcount, and pay for themselves in months, not years.\n\n{{PRODUCT_CONTEXT}}\n\nEvaluate TRecs as an airline operator and engine lessee would. Challenge bloat, question pricing, demand ROI proof. Be brutally honest — if a feature is useless fluff, say so. If it saves money, say how much. Keep responses to 3-5 sentences and be characteristically direct and provocative.`,
  },
  {
    id: "tl", initials: "TL", name: "Tobi Lütke", title: "CEO",
    company: "Shopify", color: "#96BF48", abbr: "Shopify",
    expertise: "Platform Design & Developer Experience", verified: true,
    systemPrompt: `You are Tobi Lütke, CEO and co-founder of Shopify. Software engineer turned CEO. You think deeply about platform architecture, developer experience, composability, and building tools that make complex things simple. You believe great software removes friction and empowers users to do things they couldn't before. You value craft, long-term thinking, and building on primitives rather than monoliths.\n\n{{PRODUCT_CONTEXT}}\n\nEvaluate TRecs as a platform-builder would. Focus on architecture, extensibility, API design, user experience patterns, and how to build a product that compounds in value over time. Consider what Shopify learned about making complex workflows accessible. Keep responses to 3-5 sentences and focus on product/platform craft.`,
  },
];

const SYNTH_PROMPT_TEMPLATE = `You are a senior strategic advisor synthesizing the TRecs Advisory Council positions. You know the product deeply:\n\n{{PRODUCT_CONTEXT}}\n\nProvide a concise synthesis (5-8 sentences): 1) Key consensus, 2) Tensions or trade-offs, 3) 2-3 concrete next steps for TRecs/Avisoma referencing actual features/integrations. Be direct and actionable.`;

const ACTION_EXTRACTION_PROMPT = `You are a product management analyst extracting concrete, actionable to-do items from an advisory council meeting about a software product.

Analyze the council positions and synthesis provided. Extract specific, implementable action items grouped by implementation timeframe.

Rules:
- Each action item must be a concrete task, not a vague suggestion
- Classify each item into exactly one timeframe:
  - "Short-term" — quick wins, can be built in days to 1-2 weeks (UI tweaks, config changes, small integrations, low-hanging fruit)
  - "Mid-term" — meaningful features requiring 2-8 weeks of work (new modules, API integrations, workflow changes)
  - "Long-term" — strategic initiatives requiring months of effort (platform architecture, new product lines, major partnerships, data infrastructure)
- For each item, also note a category tag (e.g., "Data Integrations", "UX/UI", "Architecture", "Business Strategy", "Records & Compliance", "Analytics & Reporting")
- For each item, note which advisor(s) suggested or supported it (use their company abbreviation)
- Prioritize items that multiple advisors agree on
- Aim for 5-15 total items, spread across all three timeframes
- Each item should be actionable by a development team

Return ONLY a JSON array (no markdown fencing, no preamble) in this exact format:
[
  {
    "text": "Implement real-time EGT margin tracking in Engine Detail Technical tab using MTU CORTEX API",
    "timeframe": "Mid-term",
    "category": "Data Integrations",
    "advisors": ["Airbus", "WLFC"]
  }
]`;

const VETO_EXTRACTION_PROMPT = `You are a product management analyst identifying risks, warnings, and "definite not-to-dos" from an advisory council meeting about a software product.

Analyze the council positions and synthesis. Identify things advisors explicitly warned against, cautioned about, or would veto. These are NOT low-priority items — they are things the team should actively AVOID doing.

Rules:
- Only include genuine warnings, vetoes, or strong cautions — not just deprioritized items
- Each veto must reference something an advisor felt strongly about
- Include the specific reason/risk behind each veto
- For each item, note which advisor(s) raised the concern (use their company abbreviation)
- Aim for 2-5 items. If advisors had no strong objections, return fewer or an empty array
- Group by category (e.g., "Architecture", "Business Strategy", "UX/UI", "Data & Privacy", "Competitive Risk")

Return ONLY a JSON array (no markdown fencing, no preamble) in this exact format:
[
  {
    "text": "Do not build a custom CRM module — it dilutes the core engine lifecycle value proposition",
    "category": "Business Strategy",
    "advisors": ["Ryanair", "Shopify"],
    "reason": "Feature creep risk; lessors already have CRM tools and won't pay for a second one"
  }
]`;

const VOTE_PROMPT_TEMPLATE = `You are casting a vote on a proposal. After considering the topic carefully from your perspective, you MUST respond with ONLY this JSON format (no other text):
{"vote": "for" or "against" or "abstain", "rationale": "2-3 sentence explanation of your position"}`;

const BRIEF_SUFFIX = `\n\nIMPORTANT — QUICK BRIEF MODE: You are providing tactical, meeting-prep advice. Be CONCISE: 1-3 sentences maximum. Focus on actionable insight — what to say, what to ask, what to watch for. No preamble, no hedging. Think like a coach in the hallway 5 minutes before the meeting.`;

const BRIEF_SYNTH_PROMPT = `You are a senior executive coach synthesizing tactical briefing notes from multiple advisors. Produce a structured briefing that is scannable in 30 seconds.

Format your response EXACTLY as follows (use these exact headers):

## Key Talking Points
- (3-5 bullets. Each should be a concrete thing to say or bring up. Start with an action verb.)

## Watch Out For
- (2-4 bullets. Risks, traps, sensitive topics to avoid, body-language cues to watch.)

## Questions to Ask
- (3-5 bullets. Specific questions that will surface useful information or build rapport.)

## Leverage Points
- (2-3 bullets. Opportunities, shared interests, timing advantages to exploit.)

Be direct. No filler. Every bullet must be actionable.`;

// ─── helpers ───
const ts = () => new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const mid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const formatSize = (bytes) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

const PRESET_COLORS = ["#A68A2A", "#1A8A80", "#3B6FD4", "#C94040", "#7C5AC7", "#D08A15", "#0E8A63", "#003087", "#96BF48", "#8B5CF6", "#EC4899", "#F59E0B"];

const generateSystemPrompt = (name, title, company, expertise) =>
  `You are ${name}, ${title} of ${company}. Your expertise: ${expertise}. You bring deep domain knowledge from your role.\n\n{{PRODUCT_CONTEXT}}\n\nShare your perspective grounded in your professional experience. Be specific about TRecs features where relevant. Keep responses to 3-5 sentences unless asked for more detail.`;

const generateMemberFields = (name, company) => ({
  id: name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6) + Date.now().toString(36).slice(-3),
  initials: name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase(),
  abbr: company.split(" ")[0].slice(0, 8),
});

// ─── Simple markdown renderer ───
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  const inlineFormat = (str) => {
    // Bold + italic, bold, italic, inline code
    const parts = [];
    const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let last = 0;
    let match;
    while ((match = re.exec(str)) !== null) {
      if (match.index > last) parts.push(str.slice(last, match.index));
      if (match[2]) parts.push(<strong key={match.index}><em>{match[2]}</em></strong>);
      else if (match[3]) parts.push(<strong key={match.index}>{match[3]}</strong>);
      else if (match[4]) parts.push(<em key={match.index}>{match[4]}</em>);
      else if (match[5]) parts.push(<code key={match.index} style={{ background: "#F3F1EC", padding: "1px 5px", borderRadius: "4px", fontSize: "12px", fontFamily: "'Space Mono',monospace" }}>{match[5]}</code>);
      last = match.index + match[0].length;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts.length > 0 ? parts : str;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", margin: "24px 0 8px", letterSpacing: "-0.5px", borderBottom: "2px solid #A68A2A30", paddingBottom: "8px" }}>{inlineFormat(line.slice(2))}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", margin: "20px 0 6px", letterSpacing: "-0.3px" }}>{inlineFormat(line.slice(3))}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{ fontSize: "14px", fontWeight: 700, color: "#4B5563", margin: "16px 0 4px" }}>{inlineFormat(line.slice(4))}</h3>);
    } else if (line.startsWith("#### ")) {
      elements.push(<h4 key={i} style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", margin: "12px 0 4px" }}>{inlineFormat(line.slice(5))}</h4>);
    }
    // Horizontal rule
    else if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #E8E5DE", margin: "16px 0" }} />);
    }
    // Bullet list items (-, *, or numbered)
    else if (/^(\s*)([-*]|\d+\.)\s/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^(\s*)([-*]|\d+\.)\s/.test(lines[i])) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s(.*)/);
        const indent = m[1].length;
        const content = m[3];
        listItems.push(
          <li key={i} style={{ marginLeft: `${Math.min(indent, 12)}px`, marginBottom: "3px", fontSize: "13px", lineHeight: 1.65, color: "#374151" }}>
            {inlineFormat(content)}
          </li>
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={{ margin: "4px 0", paddingLeft: "20px", listStyleType: "disc" }}>{listItems}</ul>);
      continue; // skip i++ at bottom
    }
    // Table detection
    else if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (r) => r.split("|").filter((c, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
        const headers = parseRow(tableLines[0]);
        const isSep = (r) => /^[\s|:-]+$/.test(r);
        const bodyStart = isSep(tableLines[1]) ? 2 : 1;
        const rows = tableLines.slice(bodyStart).map(parseRow);
        elements.push(
          <div key={`tbl-${i}`} style={{ overflowX: "auto", margin: "8px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>{headers.map((h, ci) => <th key={ci} style={{ padding: "6px 10px", borderBottom: "2px solid #E8E5DE", textAlign: "left", fontWeight: 700, color: "#1A1A1A", fontSize: "11px", fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>{inlineFormat(h)}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "#F8F6F108" }}>
                    {row.map((cell, ci) => <td key={ci} style={{ padding: "6px 10px", borderBottom: "1px solid #F3F1EC", color: "#374151", lineHeight: 1.5 }}>{inlineFormat(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "6px" }} />);
    }
    // Regular paragraph
    else {
      elements.push(<p key={i} style={{ fontSize: "13px", lineHeight: 1.75, color: "#374151", margin: "4px 0" }}>{inlineFormat(line)}</p>);
    }
    i++;
  }
  return elements;
};

export default function TRecsCouncil() {
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [editingAdvisors, setEditingAdvisors] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", title: "", company: "", expertise: "", color: PRESET_COLORS[0] });

  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("council"); // council | individual | todo | vote
  const [selectedMembers, setSelectedMembers] = useState(new Set(DEFAULT_MEMBERS.map(m => m.id)));
  const [isRunning, setIsRunning] = useState(false);
  const [runningId, setRunningId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [positions, setPositions] = useState({});
  const [synthesis, setSynthesis] = useState("");
  const [memberStatus, setMemberStatus] = useState({});
  const [conversations, setConversations] = useState({});
  const [individualInput, setIndividualInput] = useState({});
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);

  // ── Feature 1: To-Do Tab ──
  const [actionItems, setActionItems] = useState([]);
  const [isExtractingActions, setIsExtractingActions] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // ── Vetoes ──
  const [vetoItems, setVetoItems] = useState([]);

  // ── Voting ──
  const [votes, setVotes] = useState({});

  // ── Plan generation ──
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // ── Advisor verification ──
  const [verifyingAdvisor, setVerifyingAdvisor] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  // ── Quick Brief ──
  const [briefSituation, setBriefSituation] = useState("");
  const [briefDocs, setBriefDocs] = useState([]);
  const [briefResponses, setBriefResponses] = useState({});
  const [briefSynthesis, setBriefSynthesis] = useState("");
  const [isBriefDragging, setIsBriefDragging] = useState(false);
  const briefFileInputRef = useRef(null);
  const briefSynthRef = useRef(null);

  // ── Feature 2: Context File Upload ──
  const [customContext, setCustomContext] = useState(null); // {filename, size, content} | null
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const positionsRef = useRef({});
  const synthRef = useRef(null);
  const STORAGE_KEY = "trecs-council-v3";
  const CONTEXT_STORAGE_KEY = "trecs-council-context";
  const MEMBERS_STORAGE_KEY = "trecs-council-members";

  // ─── Context helpers ───
  const getActiveContext = () => customContext?.content || TRECS_CONTEXT;
  const resolvePrompt = (template) => template.replace("{{PRODUCT_CONTEXT}}", getActiveContext());

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) setHistory(JSON.parse(r.value));
      } catch (e) {}
      try {
        const c = await window.storage.get(CONTEXT_STORAGE_KEY);
        if (c?.value) setCustomContext(JSON.parse(c.value));
      } catch (e) {}
      try {
        const m = await window.storage.get(MEMBERS_STORAGE_KEY);
        if (m?.value) {
          const loaded = JSON.parse(m.value);
          if (Array.isArray(loaded) && loaded.length > 0) {
            setMembers(loaded);
            setSelectedMembers(new Set(loaded.map(x => x.id)));
          }
        }
      } catch (e) {}
    })();
  }, []);

  const persist = async (h) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(h)); } catch (e) {}
  };

  const persistMembers = async (m) => {
    try { await window.storage.set(MEMBERS_STORAGE_KEY, JSON.stringify(m)); } catch (e) {}
  };

  const addAdvisor = async () => {
    const { name, title, company, expertise, color } = editForm;
    if (!name.trim() || !title.trim() || !company.trim()) return;
    if (members.length >= 9 || verifyingAdvisor) return;

    setVerifyingAdvisor(true); setVerifyError(null);
    try {
      const verifyResult = await callAPI(
        "You verify whether a person is real and well-known enough for you to accurately roleplay them as an advisor. Respond with ONLY valid JSON, no other text.",
        [{ role: "user", content: `Can you accurately roleplay ${name.trim()}, ${title.trim()} of ${company.trim()}? You need to know their professional background, views, and communication style well enough to give advice in their voice.\n\nRespond ONLY with this JSON:\n{"known": true/false, "confidence": "high"/"medium"/"low", "reason": "1 sentence"}` }],
        200
      );
      let verification = { known: false, confidence: "low", reason: "Could not verify" };
      try {
        const jsonMatch = verifyResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) verification = JSON.parse(jsonMatch[0]);
      } catch (e) {}

      if (!verification.known || verification.confidence === "low") {
        setVerifyError(`"${name.trim()}" could not be verified — ${verification.reason || "not enough public information to roleplay accurately"}`);
        setVerifyingAdvisor(false);
        return;
      }

      const fields = generateMemberFields(name, company);
      const newMember = {
        ...fields, name: name.trim(), title: title.trim(), company: company.trim(),
        expertise: expertise.trim() || `${title} at ${company}`, color, verified: true,
        systemPrompt: generateSystemPrompt(name.trim(), title.trim(), company.trim(), expertise.trim() || `${title} at ${company}`),
      };
      const updated = [...members, newMember];
      setMembers(updated);
      setSelectedMembers(prev => new Set([...prev, newMember.id]));
      setEditForm({ name: "", title: "", company: "", expertise: "", color: PRESET_COLORS[updated.length % PRESET_COLORS.length] });
      persistMembers(updated);
    } catch (e) {
      setVerifyError("Verification failed — " + e.message);
    }
    setVerifyingAdvisor(false);
  };

  const removeAdvisor = (id) => {
    if (members.length <= 1) return;
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    setSelectedMembers(prev => { const n = new Set(prev); n.delete(id); return n; });
    persistMembers(updated);
  };

  const resetAdvisors = () => {
    setMembers(DEFAULT_MEMBERS);
    setSelectedMembers(new Set(DEFAULT_MEMBERS.map(m => m.id)));
    setEditingAdvisors(false);
    persistMembers(DEFAULT_MEMBERS);
  };

  const callAPI = async (sys, msgs, maxTokens = 1000) => {
    const resp = await fetch("/api/anthropic/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system: sys, messages: msgs }),
    });
    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json();
    return data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
  };

  // ─── CONTEXT FILE UPLOAD ───
  const handleFileUpload = (event) => {
    const file = event.target?.files?.[0] || event.dataTransfer?.files?.[0];
    if (!file || !file.name.endsWith(".md")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const ctx = { filename: file.name, size: file.size, content: e.target.result };
      setCustomContext(ctx);
      try { await window.storage.set(CONTEXT_STORAGE_KEY, JSON.stringify(ctx)); } catch (err) {}
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearCustomContext = async () => {
    setCustomContext(null);
    try { await window.storage.delete(CONTEXT_STORAGE_KEY); } catch (e) {}
  };

  // ─── QUICK BRIEF ───
  const handleBriefFileUpload = (event) => {
    const files = event.target?.files || event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const ALLOWED = [".md", ".txt", ".pdf", ".eml"];
    Array.from(files).forEach(file => {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED.includes(ext)) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setBriefDocs(prev => [...prev, { id: mid(), filename: file.name, size: file.size, content: e.target.result }]);
      };
      reader.readAsText(file);
    });
    if (briefFileInputRef.current) briefFileInputRef.current.value = "";
  };

  const removeBriefDoc = (docId) => setBriefDocs(prev => prev.filter(d => d.id !== docId));

  const clearBrief = () => {
    setBriefSituation(""); setBriefDocs([]); setBriefResponses({}); setBriefSynthesis("");
  };

  const runBrief = async () => {
    if (!briefSituation.trim() || isRunning || selectedMembers.size < 2) return;
    setIsRunning(true); setError(null);
    setBriefResponses({}); setBriefSynthesis("");

    const active = members.filter(m => selectedMembers.has(m.id));
    const total = active.length + 1;
    setTotalSteps(total); setProgress(0);

    const init = {};
    members.forEach(m => { init[m.id] = selectedMembers.has(m.id) ? "waiting" : "skipped"; });
    setMemberStatus(init);

    let userContent = `SITUATION: ${briefSituation}`;
    if (briefDocs.length > 0) {
      userContent += "\n\n--- ATTACHED DOCUMENTS ---\n";
      briefDocs.forEach(doc => {
        const truncated = doc.content.length > 8000 ? doc.content.substring(0, 8000) + "\n[...truncated]" : doc.content;
        userContent += `\n[${doc.filename}]\n${truncated}\n`;
      });
      userContent += "\n--- END DOCUMENTS ---\n";
    }
    userContent += "\n\nGive your tactical advice for this situation. Be brief (1-3 sentences).";

    const accumulated = {};
    try {
      for (let i = 0; i < active.length; i++) {
        const m = active[i];
        setMemberStatus(p => ({ ...p, [m.id]: "thinking" }));
        setRunningId(m.id);

        const sys = resolvePrompt(m.systemPrompt) + BRIEF_SUFFIX;
        const result = await callAPI(sys, [{ role: "user", content: userContent }], 300);
        accumulated[m.id] = result;
        setBriefResponses(p => ({ ...p, [m.id]: result }));
        setMemberStatus(p => ({ ...p, [m.id]: "done" }));
        setProgress(i + 1);
      }

      setRunningId("brief-synth");
      let synthInput = `SITUATION: ${briefSituation}\n\nADVISOR PERSPECTIVES:\n\n`;
      for (const [id, resp] of Object.entries(accumulated)) {
        const m = members.find(x => x.id === id);
        if (m) synthInput += `${m.name} (${m.title}, ${m.company}):\n${resp}\n\n`;
      }
      const synthResult = await callAPI(BRIEF_SYNTH_PROMPT, [{ role: "user", content: synthInput }], 1000);
      setBriefSynthesis(synthResult);
      setProgress(total);
      setTimeout(() => briefSynthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);

      const entry = {
        id: mid(), topic: briefSituation.trim(), date: ts(), mode: "brief",
        participants: active.map(m => m.id),
        briefResponses: { ...accumulated }, briefSynthesis: synthResult,
      };
      const nh = [...history, entry].slice(-20);
      setHistory(nh); await persist(nh);
    } catch (e) { setError(e.message); }
    setIsRunning(false); setRunningId(null);
  };

  // ─── ACTION ITEM EXTRACTION ───
  const extractActionItems = async (positionsObj, synthesisText) => {
    setIsExtractingActions(true);
    try {
      let content = "COUNCIL POSITIONS:\n\n";
      for (const [id, pos] of Object.entries(positionsObj)) {
        const m = members.find(x => x.id === id);
        if (m) content += `${m.name} (${m.title}, ${m.company}):\n${pos}\n\n`;
      }
      content += `\nSYNTHESIS:\n${synthesisText}`;

      const result = await callAPI(ACTION_EXTRACTION_PROMPT, [{ role: "user", content }], 2000);
      const items = parseActionItems(result);
      setActionItems(items);
      return items;
    } catch (e) {
      setError(e.message);
      return [];
    } finally {
      setIsExtractingActions(false);
    }
  };

  const parseActionItems = (text) => {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((item, i) => ({
        id: `action-${Date.now()}-${i}`,
        text: item.text,
        timeframe: item.timeframe || "Mid-term",
        category: item.category,
        advisors: item.advisors || [],
        checked: false,
      }));
    } catch (e) {
      return [];
    }
  };

  // ─── VETO EXTRACTION ───
  const extractVetoItems = async (positionsObj, synthesisText) => {
    try {
      let content = "COUNCIL POSITIONS:\n\n";
      for (const [id, pos] of Object.entries(positionsObj)) {
        const m = members.find(x => x.id === id);
        if (m) content += `${m.name} (${m.title}, ${m.company}):\n${pos}\n\n`;
      }
      content += `\nSYNTHESIS:\n${synthesisText}`;
      const result = await callAPI(VETO_EXTRACTION_PROMPT, [{ role: "user", content }], 1500);
      const items = parseVetoItems(result);
      setVetoItems(items);
      return items;
    } catch (e) {
      return [];
    }
  };

  const parseVetoItems = (text) => {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((item, i) => ({
        id: `veto-${Date.now()}-${i}`,
        text: item.text,
        category: item.category || "",
        advisors: item.advisors || [],
        reason: item.reason || "",
      }));
    } catch (e) {
      return [];
    }
  };

  // ─── VOTING ───
  const runVote = async () => {
    if (!topic.trim() || isRunning) return;
    setIsRunning(true); setError(null); setVotes({});
    const active = members.filter(m => selectedMembers.has(m.id));
    const total = active.length;
    setTotalSteps(total); setProgress(0);

    const init = {}; members.forEach(m => { init[m.id] = selectedMembers.has(m.id) ? "waiting" : "skipped"; });
    setMemberStatus(init);

    const accumulated = {};
    try {
      for (let i = 0; i < active.length; i++) {
        const m = active[i];
        setMemberStatus(p => ({ ...p, [m.id]: "thinking" }));
        setRunningId(m.id);

        const voteMsg = `PROPOSAL TO VOTE ON: ${topic}\n\nCast your vote as ${m.name}, ${m.title} of ${m.company}. Consider this from your professional perspective and expertise in ${m.expertise}.`;
        const result = await callAPI(
          resolvePrompt(m.systemPrompt) + "\n\n" + VOTE_PROMPT_TEMPLATE,
          [{ role: "user", content: voteMsg }],
          500
        );

        let vote = { vote: "abstain", rationale: result };
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) vote = JSON.parse(jsonMatch[0]);
        } catch (e) {}

        accumulated[m.id] = vote;
        setVotes(p => ({ ...p, [m.id]: vote }));
        setMemberStatus(p => ({ ...p, [m.id]: "done" }));
        setProgress(i + 1);
      }

      const entry = {
        id: mid(), topic: topic.trim(), date: ts(), mode: "vote",
        participants: active.map(m => m.id), votes: accumulated,
      };
      const nh = [...history, entry].slice(-20);
      setHistory(nh); await persist(nh);
    } catch (e) { setError(e.message); }
    setIsRunning(false); setRunningId(null);
  };

  const toggleActionItem = (id) => {
    setActionItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const toggleAllActions = (checked) => {
    setActionItems(prev => prev.map(item => ({ ...item, checked })));
  };

  const generatePrompt = () => {
    const selected = actionItems.filter(item => item.checked);
    if (selected.length === 0) return "";

    const tfOrder = ["Short-term", "Mid-term", "Long-term"];
    const effortMap = { "Short-term": "Low", "Mid-term": "Medium", "Long-term": "High" };
    const grouped = {};
    tfOrder.forEach(tf => { grouped[tf] = []; });
    selected.forEach(item => {
      const tf = tfOrder.includes(item.timeframe) ? item.timeframe : "Mid-term";
      grouped[tf].push(item);
    });

    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    let doc = `# TRecs Implementation Plan\n`;
    doc += `**Date:** ${date}\n`;
    doc += `**Source:** Advisory Council Meeting — "${topic}"\n\n`;

    // Executive summary
    const counts = tfOrder.map(tf => grouped[tf].length).filter(c => c > 0);
    doc += `## Executive Summary\n\n`;
    doc += `This plan contains **${selected.length} prioritized tasks** selected from advisory council recommendations`;
    const parts = [];
    if (grouped["Short-term"].length) parts.push(`${grouped["Short-term"].length} short-term quick wins`);
    if (grouped["Mid-term"].length) parts.push(`${grouped["Mid-term"].length} mid-term features`);
    if (grouped["Long-term"].length) parts.push(`${grouped["Long-term"].length} long-term strategic initiatives`);
    doc += `: ${parts.join(", ")}.\n\n`;

    // Tasks by timeframe
    doc += `## Tasks\n\n`;
    for (const tf of tfOrder) {
      const items = grouped[tf];
      if (items.length === 0) continue;
      doc += `### ${tf}\n\n`;
      items.forEach((item, i) => {
        doc += `**${i + 1}. ${item.text}**\n`;
        doc += `- Category: ${item.category || "General"}\n`;
        doc += `- Complexity: ${effortMap[tf]}\n`;
        doc += `- Recommended by: ${item.advisors.join(", ")}\n`;
        doc += `\n`;
      });
    }

    // Vetoes section
    if (vetoItems.length > 0) {
      doc += `## Avoid / Do Not Do\n\n`;
      doc += `The following items were flagged as risks or vetoes by council members:\n\n`;
      vetoItems.forEach((item, i) => {
        doc += `${i + 1}. **${item.text}**\n`;
        if (item.reason) doc += `   - Risk: ${item.reason}\n`;
        doc += `   - Flagged by: ${item.advisors.join(", ")}\n\n`;
      });
    }

    // Implementation notes
    doc += `## Implementation Notes\n\n`;
    doc += `- TRecs is a single-file React 18 application (~17,000 lines), Vite 5, inline styles\n`;
    doc += `- Two modes: Assets (portfolio management) and Pipeline (acquisition evaluation)\n`;
    doc += `- Maintain backward compatibility with existing data structures\n`;
    doc += `- Follow existing design patterns and component conventions\n`;
    doc += `- Test each change against existing functionality\n\n`;

    doc += `---\n*Generated by TRecs Advisory Council · ${date}*\n`;

    return doc;
  };

  const copyPromptToClipboard = async () => {
    const prompt = generatePrompt();
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // ─── GENERATE FULL PLAN VIA API ───
  const generateFullPlan = async () => {
    const selected = actionItems.filter(item => item.checked);
    if (selected.length === 0 || isGeneratingPlan) return;
    setIsGeneratingPlan(true); setError(null); setGeneratedPlan(null);

    const tfOrder = ["Short-term", "Mid-term", "Long-term"];
    let taskSummary = "";
    for (const tf of tfOrder) {
      const items = selected.filter(i => (tfOrder.includes(i.timeframe) ? i.timeframe : "Mid-term") === tf);
      if (items.length === 0) continue;
      taskSummary += `\n### ${tf}\n`;
      items.forEach((item, i) => {
        taskSummary += `${i + 1}. ${item.text} [${item.category || "General"}] (recommended by: ${item.advisors.join(", ")})\n`;
      });
    }

    let vetoSummary = "";
    if (vetoItems.length > 0) {
      vetoSummary = "\n### Vetoes & Warnings (things to AVOID):\n";
      vetoItems.forEach((item, i) => {
        vetoSummary += `${i + 1}. ${item.text} — ${item.reason} (flagged by: ${item.advisors.join(", ")})\n`;
      });
    }

    const systemPrompt = `You are a senior product strategist and COO-level planning advisor. You produce implementation plans that serve two audiences simultaneously:

1. **Business & Strategy audience** (CEO, COO, investors): strategic rationale, business impact, competitive positioning, resource implications, go-to-market considerations, success metrics, risk assessment
2. **Development & Engineering audience**: technical approach, architecture decisions, acceptance criteria, dependencies, effort estimates, implementation sequence

Write in clean Markdown. Structure the plan as follows:

# [Plan Title]

## Strategic Context
Why this matters for the business. 2-3 sentences connecting these tasks to company goals, market position, competitive advantage. Write for someone who doesn't read code.

## Executive Summary
A crisp overview table or bullet list: total tasks, timeframe, estimated effort, key outcomes. Think "slide deck summary" — a COO should be able to read this in 30 seconds and know what's happening.

## Phase 1: [Phase Name] (Week X–Y)
### Strategic Intent
Why this phase comes first. Business logic, not just technical logic.

### Deliverables
For each task in this phase:
- **Task name**
  - *What:* Clear description anyone can understand
  - *Why it matters:* Business value / user impact
  - *Technical approach:* How the dev team will build it (architecture, key decisions)
  - *Acceptance criteria:* What "done" looks like — testable, specific
  - *Effort:* Estimate in days
  - *Dependencies:* What must come before this
  - *Owner suggestion:* Frontend / Backend / Full-stack / Design

(Repeat Phase structure for Phase 2, 3, etc.)

## Risk Register
Table or structured list. For each risk (including vetoes from advisors):
- Risk description
- Likelihood (High/Med/Low)
- Impact (High/Med/Low)
- Mitigation strategy

## Success Metrics
Concrete, measurable KPIs. Mix of:
- Business metrics (revenue impact, user adoption, time saved)
- Technical metrics (performance, reliability, code quality)
- Timeline metrics (milestones, delivery confidence)

## Resource & Budget Implications
High-level: team size needed, any external dependencies, tooling/infrastructure costs.

## Recommended Next Steps
3-5 immediate actions to kick off execution. Numbered, actionable, assigned.

---

Write like you're presenting to a board that has both technical co-founders and business operators. Be direct, no filler. Use bold and structure aggressively — every section should be scannable. Reference specific product features by name.`;

    const userMsg = `Create a comprehensive implementation plan for the following priorities selected from a TRecs Advisory Council meeting.

**Meeting Topic:** "${topic}"

**Advisory Council Synthesis:**
${synthesis}

**Selected Priorities (by timeframe):**
${taskSummary}
${vetoSummary}

**Product Context:**
${getActiveContext().substring(0, 3000)}

Generate a plan that a COO could present to the board AND a tech lead could hand to their team. Be specific about TRecs features and architecture.`;

    try {
      const result = await callAPI(systemPrompt, [{ role: "user", content: userMsg }], 8000);
      setGeneratedPlan(result);
    } catch (e) {
      setError("Plan generation failed: " + e.message);
    }
    setIsGeneratingPlan(false);
  };

  const downloadPlan = () => {
    if (!generatedPlan) return;
    const blob = new Blob([generatedPlan], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trecs-plan-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── FULL COUNCIL MEETING ───
  const runCouncil = async () => {
    if (!topic.trim() || isRunning) return;
    setIsRunning(true); setError(null); setPositions({}); setSynthesis("");
    setExpandedMember(null); setConversations({}); setActionItems([]); setVetoItems([]);
    positionsRef.current = {};
    const active = members.filter(m => selectedMembers.has(m.id));
    const total = active.length + 3; // +1 synthesis, +1 action extraction, +1 veto extraction
    setTotalSteps(total); setProgress(0);

    const init = {}; members.forEach(m => { init[m.id] = selectedMembers.has(m.id) ? "waiting" : "skipped"; });
    setMemberStatus(init);

    let mem = "";
    if (history.length > 0) {
      const last = history[history.length - 1];
      mem = `\n\nPREVIOUS MEETING (topic: "${last.topic}"):\n${last.synthesis?.substring(0, 400) || "N/A"}\n`;
    }

    try {
      for (let i = 0; i < active.length; i++) {
        const m = active[i];
        setMemberStatus(p => ({ ...p, [m.id]: "thinking" }));
        setRunningId(m.id);

        let msg = `MEETING TOPIC: ${topic}${mem}\n\n`;
        if (Object.keys(positionsRef.current).length > 0) {
          msg += "POSITIONS ALREADY SHARED:\n\n";
          for (const [id, pos] of Object.entries(positionsRef.current)) {
            const mm = members.find(x => x.id === id);
            if (mm) msg += `${mm.name} (${mm.title}, ${mm.company}):\n${pos}\n\n`;
          }
          msg += `Your turn, ${m.name}. Share your unique perspective. Be specific about TRecs.`;
        } else {
          msg += `You speak first. Share your perspective on this topic for TRecs. Be specific.`;
        }

        const result = await callAPI(resolvePrompt(m.systemPrompt), [{ role: "user", content: msg }]);
        positionsRef.current[m.id] = result;
        setPositions(p => ({ ...p, [m.id]: result }));
        setConversations(p => ({ ...p, [m.id]: [{ role: "user", content: topic }, { role: "assistant", content: result }] }));
        setMemberStatus(p => ({ ...p, [m.id]: "done" }));
        setProgress(i + 1);
      }

      // Synthesis
      setRunningId("synth");
      let sm = `MEETING TOPIC: ${topic}\n\nCOUNCIL POSITIONS:\n\n`;
      for (const [id, pos] of Object.entries(positionsRef.current)) {
        const m = members.find(x => x.id === id);
        if (m) sm += `${m.name} (${m.title}, ${m.company}):\n${pos}\n\n`;
      }
      const sr = await callAPI(resolvePrompt(SYNTH_PROMPT_TEMPLATE), [{ role: "user", content: sm }]);
      setSynthesis(sr); setProgress(active.length + 1);
      setTimeout(() => synthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);

      // Action item extraction
      setRunningId("actions");
      const items = await extractActionItems(positionsRef.current, sr);
      setProgress(active.length + 2);

      // Veto extraction
      setRunningId("vetoes");
      const vetoes = await extractVetoItems(positionsRef.current, sr);
      setProgress(total); setRunningId(null);

      const entry = {
        id: mid(), topic: topic.trim(), date: ts(), mode: "council",
        participants: active.map(m => m.id),
        positions: { ...positionsRef.current }, synthesis: sr,
        conversations: Object.fromEntries(active.map(m => [m.id, [{ role: "user", content: topic }, { role: "assistant", content: positionsRef.current[m.id] || "" }]])),
        actionItems: items, vetoItems: vetoes,
      };
      const nh = [...history, entry].slice(-20);
      setHistory(nh); await persist(nh);
    } catch (e) { setError(e.message); }
    setIsRunning(false); setRunningId(null);
  };

  // ─── INDIVIDUAL ASK ───
  const askMember = async (memberId) => {
    const input = (individualInput[memberId] || "").trim();
    if (!input || isRunning) return;
    setIsRunning(true); setRunningId(memberId); setError(null);
    setMemberStatus(p => ({ ...p, [memberId]: "thinking" }));

    const m = members.find(x => x.id === memberId);
    const prev = conversations[memberId] || [];
    const messages = [...prev, { role: "user", content: input }];

    let ctxNote = "";
    if (Object.keys(positions).length > 0) {
      ctxNote = "\n\n[Council context — other members have shared these positions on the current topic:\n";
      for (const [id, pos] of Object.entries(positions)) {
        if (id !== memberId) {
          const mm = members.find(x => x.id === id);
          if (mm) ctxNote += `${mm.name}: ${pos.substring(0, 200)}...\n`;
        }
      }
      ctxNote += "]\n";
    }

    const apiMessages = messages.map((msg, i) => {
      if (i === 0 && msg.role === "user" && ctxNote && !msg.content.includes("[Council context")) {
        return { ...msg, content: msg.content + ctxNote };
      }
      return msg;
    });

    try {
      const result = await callAPI(resolvePrompt(m.systemPrompt), apiMessages);
      const newConv = [...prev, { role: "user", content: input }, { role: "assistant", content: result }];
      setConversations(p => ({ ...p, [memberId]: newConv }));
      setPositions(p => ({ ...p, [memberId]: result }));
      setIndividualInput(p => ({ ...p, [memberId]: "" }));
      setMemberStatus(p => ({ ...p, [memberId]: "done" }));

      const entry = {
        id: mid(), topic: input, date: ts(), mode: "individual",
        participants: [memberId], member: m.name,
        positions: { [memberId]: result },
        conversations: { [memberId]: newConv },
      };
      const nh = [...history, entry].slice(-20);
      setHistory(nh); await persist(nh);
    } catch (e) { setError(e.message); }
    setIsRunning(false); setRunningId(null);
  };

  // ─── DOWNLOAD ───
  const downloadMeeting = () => {
    let md = `# TRecs Advisory Council\n`;
    md += `**Date:** ${ts()}\n`;
    md += `**Mode:** ${mode === "council" ? "Full Council Meeting" : mode === "brief" ? "Quick Brief" : mode === "vote" ? "Vote" : mode === "todo" ? "To-Do Items" : "Individual Conversations"}\n`;
    if (topic) md += `**Topic:** ${topic}\n`;
    if (briefSituation && mode === "brief") md += `**Situation:** ${briefSituation}\n`;
    md += `\n---\n\n`;

    md += `## Advisor Positions\n\n`;
    members.forEach(m => {
      const conv = conversations[m.id];
      if (conv && conv.length > 0) {
        md += `### ${m.name} — ${m.title}, ${m.company}\n\n`;
        conv.forEach(msg => {
          if (msg.role === "user") md += `**Q:** ${msg.content}\n\n`;
          else md += `**A:** ${msg.content}\n\n`;
        });
        md += `---\n\n`;
      }
    });

    if (briefSynthesis) {
      md += `## Briefing\n\n${briefSynthesis}\n\n`;
    }
    if (Object.keys(briefResponses).length > 0) {
      md += `## Advisor Takes\n\n`;
      members.forEach(m => {
        if (briefResponses[m.id]) {
          md += `**${m.name}** (${m.company}): ${briefResponses[m.id]}\n\n`;
        }
      });
    }

    if (synthesis) {
      md += `## Council Synthesis\n\n${synthesis}\n\n`;
    }

    if (actionItems.length > 0) {
      md += `## Action Items\n\n`;
      const tfOrd = ["Short-term", "Mid-term", "Long-term"];
      const byTf = {};
      tfOrd.forEach(tf => { byTf[tf] = []; });
      actionItems.forEach(item => {
        const tf = tfOrd.includes(item.timeframe) ? item.timeframe : "Mid-term";
        byTf[tf].push(item);
      });
      for (const tf of tfOrd) {
        const items = byTf[tf];
        if (items.length === 0) continue;
        md += `### ${tf}\n\n`;
        items.forEach(item => {
          md += `- [${item.checked ? "x" : " "}] ${item.text}`;
          if (item.category) md += ` [${item.category}]`;
          md += ` _(${item.advisors.join(", ")})_\n`;
        });
        md += `\n`;
      }
    }

    if (vetoItems.length > 0) {
      md += `## Vetoes & Warnings\n\n`;
      vetoItems.forEach(item => {
        md += `- 🚫 **${item.text}**`;
        if (item.category) md += ` [${item.category}]`;
        md += ` _(${item.advisors.join(", ")})_\n`;
        if (item.reason) md += `  _Reason: ${item.reason}_\n`;
      });
      md += `\n`;
    }

    md += `---\n*Generated by TRecs Advisory Council · TRecs by Avisoma*\n`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trecs-council-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadEntry = (entry) => {
    setTopic(entry.topic || "");
    setPositions(entry.positions || {});
    setSynthesis(entry.synthesis || "");
    setConversations(entry.conversations || {});
    setActionItems(entry.actionItems || []);
    setVetoItems(entry.vetoItems || []);
    setVotes(entry.votes || {});
    setBriefResponses(entry.briefResponses || {});
    setBriefSynthesis(entry.briefSynthesis || "");
    if (entry.mode === "brief") {
      setBriefSituation(entry.topic || "");
      setBriefDocs([]);
      setMode("brief");
    } else if (entry.mode === "vote") {
      setMode("vote");
    }
    const st = {};
    members.forEach(m => {
      st[m.id] = (entry.positions?.[m.id] || entry.briefResponses?.[m.id]) ? "done" : "waiting";
    });
    setMemberStatus(st);
    setShowHistory(false);
    setExpandedMember(null);
  };

  const clearHistory = async () => {
    setHistory([]);
    try { await window.storage.delete(STORAGE_KEY); } catch (e) {}
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const selectAll = () => setSelectedMembers(new Set(members.map(m => m.id)));
  const selectNone = () => setSelectedMembers(new Set());

  const hasAnyContent = Object.keys(positions).length > 0 || synthesis;
  const statusColor = (s, c) => s === "done" ? "#0E8A63" : s === "thinking" ? c : s === "skipped" ? "#E8E5DE" : "#C8C5BC";

  // ─── To-Do grouping by timeframe ───
  const TIMEFRAME_ORDER = ["Short-term", "Mid-term", "Long-term"];
  const TIMEFRAME_META = {
    "Short-term": { icon: "⚡", label: "Short-term", desc: "Days to 1-2 weeks", color: "#0E8A63" },
    "Mid-term": { icon: "🔧", label: "Mid-term", desc: "2-8 weeks", color: "#A68A2A" },
    "Long-term": { icon: "🏗️", label: "Long-term", desc: "Months", color: "#3B6FD4" },
  };
  const groupedActions = {};
  TIMEFRAME_ORDER.forEach(tf => { groupedActions[tf] = []; });
  actionItems.forEach(item => {
    const tf = TIMEFRAME_ORDER.includes(item.timeframe) ? item.timeframe : "Mid-term";
    groupedActions[tf].push(item);
  });
  const selectedCount = actionItems.filter(i => i.checked).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F1", fontFamily: "'DM Sans', sans-serif", color: "#1A1A1A" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "7px", background: "linear-gradient(135deg,#1A1A1A,#3A3A3A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: 700, color: "#F8F6F1" }}>TR</div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, letterSpacing: "-0.8px" }}>TRecs Advisory Council</h1>
            </div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "4px 0 0 44px", fontFamily: "'Space Mono',monospace" }}>
              {members.length} independent AI advisors · sequential discussion · synthesis
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {hasAnyContent && (
              <button onClick={downloadMeeting} title="Download as Markdown" style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, background: "#FFFEFA", color: "#3B6FD4", border: "1px solid #E8E5DE", cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>
                ↓ Download
              </button>
            )}
            <button onClick={() => setShowHistory(!showHistory)} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, background: showHistory ? "#1A1A1A" : "#FFFEFA", color: showHistory ? "#F8F6F1" : "#6B7280", border: "1px solid #E8E5DE", cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>
              History ({history.length})
            </button>
            {history.length > 0 && (
              <button onClick={clearHistory} title="Clear" style={{ padding: "7px 10px", borderRadius: "8px", fontSize: "14px", background: "#FFFEFA", color: "#C94040", border: "1px solid #E8E5DE", cursor: "pointer", lineHeight: 1 }}>🗑</button>
            )}
          </div>
        </div>

        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#D6D3CC,transparent)", marginBottom: "16px" }} />

        {/* ── Badges ── */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: customContext ? "#0E8A6308" : "#3B6FD408", border: `1px solid ${customContext ? "#0E8A6318" : "#3B6FD418"}`, fontSize: "11px", color: customContext ? "#0E8A63" : "#3B6FD4", fontWeight: 500 }}>
            {customContext ? `📄 ${customContext.filename} (${formatSize(customContext.size)})` : "📎 Default context loaded"}
          </div>
          {history.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "#0E8A6308", border: "1px solid #0E8A6318", fontSize: "11px", color: "#0E8A63", fontWeight: 500 }}>
              🧠 {history.length} meeting{history.length !== 1 ? "s" : ""} in memory
            </div>
          )}
        </div>

        {/* ── CONTEXT FILE UPLOAD ── */}
        <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: customContext ? "0" : "10px" }}>
            <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF" }}>PRODUCT CONTEXT</div>
            {customContext && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ fontSize: "11px", color: "#3B6FD4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Replace</button>
                <button onClick={clearCustomContext} style={{ fontSize: "11px", color: "#C94040", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Clear</button>
              </div>
            )}
          </div>
          {customContext ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: "#0E8A6308", border: "1px solid #0E8A6318" }}>
              <span style={{ fontSize: "18px" }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{customContext.filename}</div>
                <div style={{ fontSize: "11px", color: "#0E8A63" }}>{formatSize(customContext.size)} · Loaded</div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e); }}
              style={{
                border: `2px dashed ${isDragging ? "#A68A2A" : "#D6D3CC"}`,
                borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer",
                background: isDragging ? "#A68A2A08" : "#F8F6F1",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>📁</div>
              <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>Drop a .md context file or click to browse</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Upload your latest TRecs project file to keep advisors up to date</div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".md" onChange={handleFileUpload} style={{ display: "none" }} />
        </div>

        {/* ── HISTORY PANEL ── */}
        {showHistory && history.length > 0 && (
          <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "16px", maxHeight: "300px", overflowY: "auto" }}>
            <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>MEETING HISTORY</div>
            {[...history].reverse().map(h => (
              <div key={h.id} onClick={() => loadEntry(h)} style={{ padding: "10px 12px", borderRadius: "8px", cursor: "pointer", marginBottom: "4px", border: "1px solid transparent", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F3F1EC"; e.currentTarget.style.borderColor = "#E8E5DE"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.topic}</div>
                    <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "2px" }}>
                      {h.mode === "individual" ? `Individual → ${h.member}` : h.mode === "brief" ? `Quick Brief · ${h.participants?.length || 0} advisors` : h.mode === "vote" ? `Vote · ${h.participants?.length || 0} voters` : `Full council · ${h.participants?.length || 0} advisors`}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>{h.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MODE SWITCH ── */}
        <div style={{ display: "flex", gap: "4px", padding: "4px", background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "10px", marginBottom: "16px" }}>
          {[{ k: "council", l: "Full Council" }, { k: "vote", l: "Vote" }, { k: "brief", l: "Quick Brief" }, { k: "individual", l: "Individual" }, { k: "todo", l: actionItems.length > 0 ? `To-Do (${actionItems.length})` : "To-Do" }].map(m => (
            <button key={m.k} onClick={() => setMode(m.k)} style={{
              flex: 1, padding: "9px", borderRadius: "7px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
              background: mode === m.k ? "#1A1A1A" : "transparent",
              color: mode === m.k ? "#F8F6F1" : "#6B7280",
              transition: "all 0.2s",
            }}>{m.l}</button>
          ))}
        </div>

        {/* ── COUNCIL MODE ── */}
        {mode === "council" && (
          <>
            {/* Member selector */}
            <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF" }}>SELECT ADVISORS ({members.length}/9)</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={selectAll} style={{ fontSize: "11px", color: "#3B6FD4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>All</button>
                  <button onClick={selectNone} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>None</button>
                  <span style={{ color: "#E8E5DE" }}>|</span>
                  <button onClick={() => setEditingAdvisors(!editingAdvisors)} style={{ fontSize: "11px", color: editingAdvisors ? "#C94040" : "#A68A2A", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                    {editingAdvisors ? "Done" : "Edit"}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {members.map(m => {
                  const sel = selectedMembers.has(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleMember(m.id)} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                      background: sel ? `${m.color}12` : "#F8F6F1",
                      border: `1px solid ${sel ? m.color + "40" : "#E8E5DE"}`,
                      color: sel ? m.color : "#9CA3AF",
                      transition: "all 0.2s",
                    }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: sel ? m.color : "#D6D3CC" }} />
                      {m.abbr}
                    </button>
                  );
                })}
              </div>

              {/* ── EDIT ADVISORS PANEL ── */}
              {editingAdvisors && (
                <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #E8E5DE", animation: "fadeIn 0.25s ease" }}>
                  {/* Current advisors list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                    {members.map(m => (
                      <div key={m.id} style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px",
                        borderRadius: "8px", background: "#F8F6F1", border: "1px solid #E8E5DE",
                      }}>
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                          background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Space Mono',monospace", fontSize: "9px", fontWeight: 700, color: m.color,
                        }}>{m.initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1A1A1A" }}>{m.name}</span>
                            {m.verified && <span title="Verified — AI has sufficient knowledge to roleplay this person" style={{ fontSize: "12px", cursor: "default" }}>✅</span>}
                          </div>
                          <div style={{ fontSize: "10px", color: "#9CA3AF" }}>{m.title}, {m.company}</div>
                        </div>
                        <button onClick={() => removeAdvisor(m.id)} disabled={members.length <= 1}
                          style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid #E8E5DE",
                            background: "#FFFEFA", color: members.length <= 1 ? "#E8E5DE" : "#C94040", cursor: members.length <= 1 ? "default" : "pointer",
                            fontSize: "14px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>×</button>
                      </div>
                    ))}
                  </div>

                  {/* Add advisor form */}
                  {members.length < 9 && (
                    <div style={{ padding: "12px", borderRadius: "10px", background: "#F8F6F1", border: "1px dashed #D6D3CC" }}>
                      <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>ADD ADVISOR</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                        <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Full name" style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #E8E5DE", background: "#FFFEFA", fontSize: "12px", color: "#1A1A1A", outline: "none", fontFamily: "inherit" }}
                          onFocus={e => e.target.style.borderColor = "#A68A2A"} onBlur={e => e.target.style.borderColor = "#E8E5DE"} />
                        <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="Title (e.g. CEO)" style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #E8E5DE", background: "#FFFEFA", fontSize: "12px", color: "#1A1A1A", outline: "none", fontFamily: "inherit" }}
                          onFocus={e => e.target.style.borderColor = "#A68A2A"} onBlur={e => e.target.style.borderColor = "#E8E5DE"} />
                        <input value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))}
                          placeholder="Company" style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #E8E5DE", background: "#FFFEFA", fontSize: "12px", color: "#1A1A1A", outline: "none", fontFamily: "inherit" }}
                          onFocus={e => e.target.style.borderColor = "#A68A2A"} onBlur={e => e.target.style.borderColor = "#E8E5DE"} />
                        <input value={editForm.expertise} onChange={e => setEditForm(f => ({ ...f, expertise: e.target.value }))}
                          placeholder="Expertise area" style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #E8E5DE", background: "#FFFEFA", fontSize: "12px", color: "#1A1A1A", outline: "none", fontFamily: "inherit" }}
                          onFocus={e => e.target.style.borderColor = "#A68A2A"} onBlur={e => e.target.style.borderColor = "#E8E5DE"} />
                      </div>
                      {/* Color picker */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 500 }}>Color:</span>
                        {PRESET_COLORS.map(c => (
                          <button key={c} onClick={() => setEditForm(f => ({ ...f, color: c }))} style={{
                            width: "18px", height: "18px", borderRadius: "50%", background: c, border: editForm.color === c ? "2px solid #1A1A1A" : "2px solid transparent",
                            cursor: "pointer", transition: "border 0.15s", padding: 0,
                          }} />
                        ))}
                      </div>
                      {verifyError && (
                        <div style={{ padding: "8px 12px", borderRadius: "6px", background: "#C9404010", border: "1px solid #C9404025", fontSize: "11px", color: "#C94040", marginBottom: "8px", lineHeight: 1.5 }}>
                          {verifyError}
                        </div>
                      )}
                      <button onClick={addAdvisor} disabled={!editForm.name.trim() || !editForm.title.trim() || !editForm.company.trim() || verifyingAdvisor} style={{
                        width: "100%", padding: "9px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "none",
                        cursor: !editForm.name.trim() || !editForm.title.trim() || !editForm.company.trim() || verifyingAdvisor ? "default" : "pointer",
                        background: verifyingAdvisor ? "linear-gradient(135deg,#A68A2A,#C9A84C)" : editForm.name.trim() && editForm.title.trim() && editForm.company.trim() ? "linear-gradient(135deg,#1A1A1A,#2A2A2A)" : "#E8E5DE",
                        color: editForm.name.trim() && editForm.title.trim() && editForm.company.trim() || verifyingAdvisor ? "#F8F6F1" : "#9CA3AF",
                      }}>{verifyingAdvisor ? "Verifying identity..." : "+ Add Advisor"}</button>
                    </div>
                  )}
                  {members.length >= 9 && (
                    <div style={{ padding: "10px", borderRadius: "8px", background: "#A68A2A08", border: "1px solid #A68A2A18", fontSize: "11px", color: "#A68A2A", textAlign: "center", fontWeight: 500 }}>
                      Maximum 9 advisors reached. Remove one to add another.
                    </div>
                  )}

                  {/* Reset to defaults */}
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button onClick={resetAdvisors} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                      ↻ Reset to default advisors
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Topic */}
            <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>MEETING TOPIC</div>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} disabled={isRunning}
                placeholder="e.g. How should TRecs position Pipeline mode to win engine acquisition teams at top-5 lessors?"
                style={{ width: "100%", minHeight: "70px", padding: "12px", borderRadius: "10px", border: "1px solid #E8E5DE", background: "#F8F6F1", fontSize: "14px", lineHeight: 1.6, color: "#1A1A1A", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#A68A2A"} onBlur={e => e.target.style.borderColor = "#E8E5DE"} />
            </div>

            <button onClick={runCouncil} disabled={isRunning || !topic.trim() || selectedMembers.size === 0} style={{
              width: "100%", padding: "13px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, border: "none", cursor: isRunning || !topic.trim() || selectedMembers.size === 0 ? "default" : "pointer",
              background: isRunning ? "linear-gradient(135deg,#A68A2A,#C9A84C)" : (!topic.trim() || selectedMembers.size === 0) ? "#E8E5DE" : "linear-gradient(135deg,#1A1A1A,#2A2A2A)",
              color: (!topic.trim() || selectedMembers.size === 0) ? "#9CA3AF" : "#F8F6F1", marginBottom: "20px",
            }}>
              {isRunning ? (() => {
                const runMember = members.find(m => m.id === runningId);
                const activeCount = members.filter(m => selectedMembers.has(m.id)).length;
                if (runMember) return `${runMember.name} thinking... (${progress} of ${activeCount} advisors)`;
                if (runningId === "synth") return "Synthesizing council positions...";
                if (runningId === "actions") return "Extracting action items...";
                if (runningId === "vetoes") return "Identifying vetoes & warnings...";
                return "Meeting in progress...";
              })() : `Start Meeting · ${selectedMembers.size} advisor${selectedMembers.size !== 1 ? "s" : ""}`}
            </button>

            {isRunning && (
              <div style={{ height: "3px", borderRadius: "2px", background: "#E8E5DE", marginBottom: "20px", marginTop: "-12px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#A68A2A,#C9A84C)", width: `${(progress / totalSteps) * 100}%`, transition: "width 0.6s ease" }} />
              </div>
            )}
          </>
        )}

        {error && <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", background: "#C9404010", border: "1px solid #C9404030", fontSize: "13px", color: "#C94040" }}>{error}</div>}

        {/* ── VOTE MODE ── */}
        {mode === "vote" && (
          <div style={{ animation: "fadeIn 0.25s ease" }}>
            {/* Advisor selector */}
            <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF" }}>SELECT VOTERS</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={selectAll} style={{ fontSize: "11px", color: "#3B6FD4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>All</button>
                  <button onClick={selectNone} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>None</button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {members.map(m => {
                  const sel = selectedMembers.has(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleMember(m.id)} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                      background: sel ? `${m.color}12` : "#F8F6F1",
                      border: `1px solid ${sel ? m.color + "40" : "#E8E5DE"}`,
                      color: sel ? m.color : "#9CA3AF", transition: "all 0.2s",
                    }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: sel ? m.color : "#D6D3CC" }} />
                      {m.abbr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic */}
            <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>PROPOSAL TO VOTE ON</div>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} disabled={isRunning}
                placeholder="e.g. Should TRecs prioritize Pipeline mode over Assets mode for the next quarter?"
                style={{ width: "100%", minHeight: "70px", padding: "12px", borderRadius: "10px", border: "1px solid #E8E5DE", background: "#F8F6F1", fontSize: "14px", lineHeight: 1.6, color: "#1A1A1A", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#A68A2A"} onBlur={e => e.target.style.borderColor = "#E8E5DE"} />
            </div>

            <button onClick={runVote} disabled={isRunning || !topic.trim() || selectedMembers.size === 0} style={{
              width: "100%", padding: "13px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, border: "none",
              cursor: isRunning || !topic.trim() || selectedMembers.size === 0 ? "default" : "pointer",
              background: isRunning ? "linear-gradient(135deg,#A68A2A,#C9A84C)" : (!topic.trim() || selectedMembers.size === 0) ? "#E8E5DE" : "linear-gradient(135deg,#1A1A1A,#2A2A2A)",
              color: (!topic.trim() || selectedMembers.size === 0) ? "#9CA3AF" : "#F8F6F1", marginBottom: "20px",
            }}>
              {isRunning ? (() => {
                const runMember = members.find(m => m.id === runningId);
                return runMember ? `${runMember.name} voting... (${progress} of ${members.filter(m => selectedMembers.has(m.id)).length})` : "Voting in progress...";
              })() : `Start Vote · ${selectedMembers.size} advisor${selectedMembers.size !== 1 ? "s" : ""}`}
            </button>

            {isRunning && (
              <div style={{ height: "3px", borderRadius: "2px", background: "#E8E5DE", marginBottom: "20px", marginTop: "-12px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#A68A2A,#C9A84C)", width: `${(progress / totalSteps) * 100}%`, transition: "width 0.6s ease" }} />
              </div>
            )}

            {/* Vote Results */}
            {Object.keys(votes).length > 0 && !isRunning && (() => {
              const voteEntries = Object.entries(votes);
              const forCount = voteEntries.filter(([, v]) => v.vote === "for").length;
              const againstCount = voteEntries.filter(([, v]) => v.vote === "against").length;
              const abstainCount = voteEntries.filter(([, v]) => v.vote === "abstain").length;
              const total = voteEntries.length;
              const forPct = total > 0 ? (forCount / total) * 100 : 0;
              const againstPct = total > 0 ? (againstCount / total) * 100 : 0;

              return (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  {/* Tally bar */}
                  <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>VOTE RESULT</div>
                    <div style={{ display: "flex", height: "32px", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }}>
                      {forCount > 0 && <div style={{ width: `${forPct}%`, background: "#0E8A63", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700, transition: "width 0.5s" }}>{forCount}</div>}
                      {againstCount > 0 && <div style={{ width: `${againstPct}%`, background: "#C94040", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700, transition: "width 0.5s" }}>{againstCount}</div>}
                      {abstainCount > 0 && <div style={{ flex: 1, background: "#D6D3CC", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", fontSize: "11px", fontWeight: 700 }}>{abstainCount}</div>}
                    </div>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "12px", fontWeight: 600 }}>
                      <span style={{ color: "#0E8A63" }}>● {forCount} For</span>
                      <span style={{ color: "#C94040" }}>● {againstCount} Against</span>
                      <span style={{ color: "#9CA3AF" }}>● {abstainCount} Abstain</span>
                    </div>
                  </div>

                  {/* Quick summary — who voted how */}
                  <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>SUMMARY</div>
                    {[
                      { label: "For", color: "#0E8A63", items: voteEntries.filter(([, v]) => v.vote === "for") },
                      { label: "Against", color: "#C94040", items: voteEntries.filter(([, v]) => v.vote === "against") },
                      { label: "Abstain", color: "#9CA3AF", items: voteEntries.filter(([, v]) => v.vote === "abstain") },
                    ].filter(g => g.items.length > 0).map(g => (
                      <div key={g.label} style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                          <span style={{ fontSize: "11px", fontWeight: 700, color: g.color, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>{g.label}</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingLeft: "16px" }}>
                          {g.items.map(([memberId]) => {
                            const m = members.find(x => x.id === memberId);
                            if (!m) return null;
                            return (
                              <span key={memberId} style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500,
                                background: `${g.color}10`, color: g.color,
                              }}>
                                <span style={{
                                  width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                                  background: `${m.color}15`, display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  fontFamily: "'Space Mono',monospace", fontSize: "8px", fontWeight: 700, color: m.color,
                                }}>{m.initials}</span>
                                {m.name.split(" ").slice(-1)[0]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Individual votes — detailed breakdown */}
                  <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>DETAILED BREAKDOWN</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                    {voteEntries.map(([memberId, v]) => {
                      const m = members.find(x => x.id === memberId);
                      if (!m) return null;
                      const voteColor = v.vote === "for" ? "#0E8A63" : v.vote === "against" ? "#C94040" : "#9CA3AF";
                      const voteLabel = v.vote === "for" ? "FOR" : v.vote === "against" ? "AGAINST" : "ABSTAIN";
                      return (
                        <div key={memberId} style={{
                          background: "#FFFEFA", border: `1px solid ${voteColor}25`, borderRadius: "10px", padding: "12px",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <div style={{
                              width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                              background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                              fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: 700, color: m.color,
                            }}>{m.initials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "11px", fontWeight: 600, color: "#4B5563" }}>{m.name}</div>
                              <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "'Space Mono',monospace", color: voteColor, letterSpacing: "0.5px" }}>{voteLabel}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: "12px", lineHeight: 1.5, color: "#6B7280" }}>{v.rationale}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── QUICK BRIEF MODE ── */}
        {mode === "brief" && (
          <div style={{ animation: "fadeIn 0.25s ease" }}>
            {/* Advisor selector */}
            <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF" }}>SELECT ADVISORS</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={selectAll} style={{ fontSize: "11px", color: "#3B6FD4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>All</button>
                  <button onClick={selectNone} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>None</button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {members.map(m => {
                  const sel = selectedMembers.has(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleMember(m.id)} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                      background: sel ? `${m.color}12` : "#F8F6F1",
                      border: `1px solid ${sel ? m.color + "40" : "#E8E5DE"}`,
                      color: sel ? m.color : "#9CA3AF", transition: "all 0.2s",
                    }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: sel ? m.color : "#D6D3CC" }} />
                      {m.abbr}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px" }}>Pick 2-3 advisors most relevant to your situation</div>
            </div>

            {/* Situation textarea */}
            <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>SITUATION</div>
              <textarea value={briefSituation} onChange={e => setBriefSituation(e.target.value)} disabled={isRunning}
                placeholder="e.g. I have a call with the CEO of FTAI Aviation tomorrow about a potential engine leasing partnership..."
                style={{ width: "100%", minHeight: "70px", padding: "12px", borderRadius: "10px", border: "1px solid #E8E5DE", background: "#F8F6F1", fontSize: "14px", lineHeight: 1.6, color: "#1A1A1A", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#A68A2A"} onBlur={e => e.target.style.borderColor = "#E8E5DE"} />
            </div>

            {/* Situational docs */}
            <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF" }}>
                  SITUATIONAL DOCUMENTS <span style={{ fontSize: "9px", fontWeight: 400, color: "#C8C5BC", textTransform: "none", letterSpacing: "0" }}>(optional)</span>
                </div>
                {briefDocs.length > 0 && (
                  <button onClick={() => setBriefDocs([])} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Clear all</button>
                )}
              </div>

              {briefDocs.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                  {briefDocs.map(doc => (
                    <div key={doc.id} style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "5px 10px", borderRadius: "6px",
                      background: "#3B6FD408", border: "1px solid #3B6FD418",
                      fontSize: "11px", color: "#3B6FD4", fontWeight: 500,
                    }}>
                      <span>📄 {doc.filename}</span>
                      <span style={{ fontSize: "10px", color: "#9CA3AF" }}>({formatSize(doc.size)})</span>
                      <button onClick={() => removeBriefDoc(doc.id)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#C94040", fontSize: "14px", lineHeight: 1, padding: "0 2px",
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => briefFileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsBriefDragging(true); }}
                onDragLeave={e => { e.preventDefault(); setIsBriefDragging(false); }}
                onDrop={e => { e.preventDefault(); setIsBriefDragging(false); handleBriefFileUpload(e); }}
                style={{
                  border: `2px dashed ${isBriefDragging ? "#A68A2A" : "#D6D3CC"}`,
                  borderRadius: "10px", padding: "16px", textAlign: "center", cursor: "pointer",
                  background: isBriefDragging ? "#A68A2A08" : "#F8F6F1", transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>Drop files or click to browse</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>.md, .txt, .pdf, .eml — ephemeral, not saved</div>
              </div>
              <input ref={briefFileInputRef} type="file" accept=".md,.txt,.pdf,.eml" multiple onChange={handleBriefFileUpload} style={{ display: "none" }} />
            </div>

            {/* Get Brief button */}
            <button onClick={runBrief} disabled={isRunning || !briefSituation.trim() || selectedMembers.size < 2} style={{
              width: "100%", padding: "13px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, border: "none",
              cursor: isRunning || !briefSituation.trim() || selectedMembers.size < 2 ? "default" : "pointer",
              background: isRunning ? "linear-gradient(135deg,#A68A2A,#C9A84C)" : (!briefSituation.trim() || selectedMembers.size < 2) ? "#E8E5DE" : "linear-gradient(135deg,#1A1A1A,#2A2A2A)",
              color: (!briefSituation.trim() || selectedMembers.size < 2) ? "#9CA3AF" : "#F8F6F1", marginBottom: "20px",
            }}>
              {isRunning ? (() => {
                const runMember = members.find(m => m.id === runningId);
                if (runMember) return `${runMember.name} thinking... (${progress} of ${members.filter(m => selectedMembers.has(m.id)).length})`;
                if (runningId === "brief-synth") return "Compiling briefing...";
                return "Brief in progress...";
              })() : `Get Brief · ${selectedMembers.size} advisor${selectedMembers.size !== 1 ? "s" : ""}`}
            </button>

            {isRunning && (
              <div style={{ height: "3px", borderRadius: "2px", background: "#E8E5DE", marginBottom: "20px", marginTop: "-12px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#A68A2A,#C9A84C)", width: `${(progress / totalSteps) * 100}%`, transition: "width 0.6s ease" }} />
              </div>
            )}

            {/* Briefing Card */}
            {briefSynthesis && (
              <div ref={briefSynthRef} style={{
                background: "linear-gradient(135deg,#FFFEFA,#F8F6F1)",
                border: "1px solid #A68A2A30", borderLeft: "4px solid #A68A2A",
                borderRadius: "12px", padding: "20px 24px",
                marginBottom: "16px", animation: "fadeIn 0.5s ease",
              }}>
                <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#A68A2A", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px" }}>⚡</span> BRIEFING
                </div>
                <div>{renderMarkdown(briefSynthesis)}</div>
              </div>
            )}

            {/* Advisor Perspectives Grid */}
            {Object.keys(briefResponses).length > 0 && !isRunning && (
              <>
                <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>
                  ADVISOR PERSPECTIVES
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "20px" }}>
                  {Object.entries(briefResponses).map(([memberId, resp]) => {
                    const m = members.find(x => x.id === memberId);
                    if (!m) return null;
                    return (
                      <div key={memberId} style={{
                        background: "#FFFEFA", border: `1px solid ${m.color}25`,
                        borderRadius: "10px", padding: "12px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                            background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: 700, color: m.color,
                          }}>{m.initials}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#4B5563" }}>{m.name}</div>
                            <div style={{ fontSize: "10px", color: "#9CA3AF" }}>{m.company}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: "12px", lineHeight: 1.6, color: "#6B7280" }}>{resp}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* New Brief button */}
            {briefSynthesis && (
              <div style={{ textAlign: "center", marginTop: "4px", marginBottom: "16px" }}>
                <button onClick={clearBrief} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>↻ Start New Brief</button>
              </div>
            )}
          </div>
        )}

        {/* ── TO-DO MODE ── */}
        {mode === "todo" && (
          <div style={{ animation: "fadeIn 0.25s ease" }}>
            {/* No synthesis yet */}
            {!synthesis && actionItems.length === 0 && !isExtractingActions && (
              <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "40px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📋</div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A1A", marginBottom: "6px" }}>No action items yet</div>
                <div style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: 400, margin: "0 auto" }}>
                  Run a Full Council meeting first. Action items will be automatically extracted from the advisor positions and synthesis.
                </div>
              </div>
            )}

            {/* Synthesis exists but no items extracted yet */}
            {synthesis && actionItems.length === 0 && !isExtractingActions && (
              <div style={{ background: "#FFFEFA", border: "1px solid #E8E5DE", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A1A", marginBottom: "8px" }}>Ready to extract action items</div>
                <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "16px" }}>
                  Extract concrete to-do items from the council meeting synthesis and advisor positions.
                </div>
                <button onClick={() => extractActionItems(positions, synthesis)} style={{
                  padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#1A1A1A,#2A2A2A)", color: "#F8F6F1",
                }}>Extract Actions</button>
              </div>
            )}

            {/* Loading */}
            {isExtractingActions && (
              <div style={{ background: "#FFFEFA", border: "1px solid #A68A2A30", borderRadius: "12px", padding: "32px 20px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", gap: "3px", marginBottom: "12px" }}>
                  {[0, 0.2, 0.4].map(d => <span key={d} style={{ animation: `dot 1.4s infinite ${d}s`, fontSize: "24px", color: "#A68A2A", lineHeight: 1 }}>•</span>)}
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>Extracting action items from council meeting...</div>
              </div>
            )}

            {/* Action items list */}
            {actionItems.length > 0 && !isExtractingActions && (
              <>
                {/* Header with select all / none */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF" }}>
                    ACTION ITEMS
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => toggleAllActions(true)} style={{ fontSize: "11px", color: "#3B6FD4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Select all</button>
                    <button onClick={() => toggleAllActions(false)} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Clear</button>
                  </div>
                </div>

                {/* Grouped items by timeframe */}
                {TIMEFRAME_ORDER.map(tf => {
                  const items = groupedActions[tf];
                  if (items.length === 0) return null;
                  const meta = TIMEFRAME_META[tf];
                  return (
                  <div key={tf} style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", padding: "0 4px" }}>
                      <span style={{ fontSize: "14px" }}>{meta.icon}</span>
                      <span style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1px", textTransform: "uppercase", color: meta.color, fontWeight: 700 }}>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 400 }}>— {meta.desc}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {items.map(item => (
                        <div key={item.id} onClick={() => toggleActionItem(item.id)} style={{
                          display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", borderRadius: "10px",
                          background: item.checked ? "#0E8A6306" : "#FFFEFA",
                          border: `1px solid ${item.checked ? "#0E8A6325" : "#E8E5DE"}`,
                          cursor: "pointer", transition: "all 0.15s",
                        }}>
                          {/* Checkbox */}
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                            background: item.checked ? "#0E8A63" : "#F8F6F1",
                            border: `2px solid ${item.checked ? "#0E8A63" : "#D6D3CC"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                          }}>
                            {item.checked && <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700, lineHeight: 1 }}>✓</span>}
                          </div>
                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", lineHeight: 1.5, color: item.checked ? "#374151" : "#4B5563" }}>{item.text}</div>
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
                              {item.category && (
                                <span style={{
                                  padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 500,
                                  fontFamily: "'Space Mono',monospace",
                                  background: "#F3F1EC", color: "#6B7280",
                                }}>{item.category}</span>
                              )}
                              {item.advisors.map(adv => {
                                const member = members.find(m => m.abbr === adv);
                                return (
                                  <span key={adv} style={{
                                    padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 600,
                                    fontFamily: "'Space Mono',monospace",
                                    background: member ? `${member.color}12` : "#E8E5DE",
                                    color: member ? member.color : "#6B7280",
                                  }}>{adv}</span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}

                {/* Footer: count + generate buttons */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px", borderRadius: "12px", background: "#FFFEFA", border: "1px solid #E8E5DE",
                  marginTop: "8px",
                }}>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>
                    <span style={{ fontWeight: 600, color: "#1A1A1A" }}>{selectedCount}</span> of {actionItems.length} items selected
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {copiedPrompt && (
                      <span style={{ fontSize: "11px", color: "#0E8A63", fontWeight: 500, animation: "fadeIn 0.2s ease" }}>Copied!</span>
                    )}
                    <button onClick={copyPromptToClipboard} disabled={selectedCount === 0} style={{
                      padding: "10px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, border: "1px solid #E8E5DE",
                      cursor: selectedCount === 0 ? "default" : "pointer",
                      background: selectedCount > 0 ? "#FFFEFA" : "#F8F6F1",
                      color: selectedCount > 0 ? "#1A1A1A" : "#9CA3AF",
                      transition: "all 0.2s",
                    }}>
                      📋 Copy Prompt
                    </button>
                    <button onClick={generateFullPlan} disabled={selectedCount === 0 || isGeneratingPlan} style={{
                      padding: "10px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, border: "none",
                      cursor: selectedCount === 0 || isGeneratingPlan ? "default" : "pointer",
                      background: selectedCount > 0 && !isGeneratingPlan ? "linear-gradient(135deg,#A68A2A,#C9A84C)" : "#E8E5DE",
                      color: selectedCount > 0 && !isGeneratingPlan ? "#FFFEFA" : "#9CA3AF",
                      transition: "all 0.2s",
                    }}>
                      {isGeneratingPlan ? "Generating..." : "📄 Generate Plan"}
                    </button>
                  </div>
                </div>

                {/* ── GENERATED PLAN PANEL ── */}
                {isGeneratingPlan && (
                  <div style={{ background: "#FFFEFA", border: "1px solid #A68A2A30", borderRadius: "12px", padding: "32px 20px", textAlign: "center", marginTop: "12px" }}>
                    <div style={{ display: "inline-flex", gap: "3px", marginBottom: "12px" }}>
                      {[0, 0.2, 0.4].map(d => <span key={d} style={{ animation: `dot 1.4s infinite ${d}s`, fontSize: "24px", color: "#A68A2A", lineHeight: 1 }}>•</span>)}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>Generating implementation plan via AI...</div>
                  </div>
                )}

                {generatedPlan && !isGeneratingPlan && (
                  <div style={{ marginTop: "12px", background: "#FFFEFA", border: "1px solid #A68A2A30", borderRadius: "12px", overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #E8E5DE", background: "linear-gradient(135deg,#A68A2A08,#C9A84C08)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px" }}>📄</span>
                        <span style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#A68A2A", fontWeight: 700 }}>IMPLEMENTATION PLAN</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={downloadPlan} style={{
                          padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                          background: "linear-gradient(135deg,#1A1A1A,#2A2A2A)", color: "#F8F6F1",
                          border: "none", cursor: "pointer",
                        }}>↓ Download</button>
                        <button onClick={() => setGeneratedPlan(null)} style={{
                          padding: "5px 8px", borderRadius: "6px", fontSize: "14px",
                          background: "none", color: "#9CA3AF", border: "1px solid #E8E5DE", cursor: "pointer", lineHeight: 1,
                        }}>×</button>
                      </div>
                    </div>
                    <div style={{ padding: "20px 24px", maxHeight: "600px", overflowY: "auto" }}>
                      {renderMarkdown(generatedPlan)}
                    </div>
                  </div>
                )}

                {/* ── VETOES & WARNINGS ── */}
                {vetoItems.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", padding: "0 4px" }}>
                      <span style={{ fontSize: "14px" }}>🚫</span>
                      <span style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1px", textTransform: "uppercase", color: "#C94040", fontWeight: 700 }}>
                        Vetoes & Warnings
                      </span>
                      <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 400 }}>— things to avoid</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {vetoItems.map(item => (
                        <div key={item.id} style={{
                          display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", borderRadius: "10px",
                          background: "#C9404006", border: "1px solid #C9404020",
                        }}>
                          <div style={{ width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0, marginTop: "1px", background: "#C9404015", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#C94040", fontSize: "11px", fontWeight: 700, lineHeight: 1 }}>✕</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", lineHeight: 1.5, color: "#4B5563", fontWeight: 500 }}>{item.text}</div>
                            {item.reason && (
                              <div style={{ fontSize: "12px", lineHeight: 1.5, color: "#9CA3AF", fontStyle: "italic", marginTop: "4px" }}>{item.reason}</div>
                            )}
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
                              {item.category && (
                                <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 500, fontFamily: "'Space Mono',monospace", background: "#C9404010", color: "#C94040" }}>{item.category}</span>
                              )}
                              {item.advisors.map(adv => {
                                const member = members.find(m => m.abbr === adv);
                                return (
                                  <span key={adv} style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, fontFamily: "'Space Mono',monospace", background: member ? `${member.color}12` : "#E8E5DE", color: member ? member.color : "#6B7280" }}>{adv}</span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Re-extract button */}
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <button onClick={() => { extractActionItems(positions, synthesis); extractVetoItems(positions, synthesis); }} style={{
                    fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500,
                  }}>↻ Re-extract action items & vetoes</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ADVISOR CARDS (council + individual modes) ── */}
        {(mode === "council" || mode === "individual") && (
          <>
            <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>
              {mode === "council" ? "ADVISOR POSITIONS" : "ASK AN ADVISOR"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mode === "individual" ? "1fr" : "repeat(2, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {members.map(m => {
                const status = memberStatus[m.id] || "waiting";
                const has = !!positions[m.id];
                const exp = expandedMember === m.id;
                const conv = conversations[m.id] || [];
                const isThinking = runningId === m.id;

                return (
                  <div key={m.id} style={{
                    background: "#FFFEFA",
                    border: `1px solid ${isThinking ? m.color + "50" : status === "done" ? "#0E8A6325" : "#E8E5DE"}`,
                    borderRadius: "12px", padding: "14px", transition: "all 0.3s",
                    boxShadow: isThinking ? `0 0 20px ${m.color}10` : "0 1px 3px rgba(0,0,0,0.03)",
                    gridColumn: (exp && mode === "council") ? "1 / -1" : "auto",
                  }}>
                    {/* Header row */}
                    <div onClick={() => (has || mode === "individual") && setExpandedMember(exp ? null : m.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(135deg,${m.color}25,${m.color}10)`,
                          border: `2px solid ${statusColor(status, m.color)}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: 700, color: m.color,
                          animation: isThinking ? "pulse 1.5s infinite" : "none",
                        }}>{m.initials}</div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: 700, color: m.color }}>{m.abbr}</span>
                            <span style={{ fontSize: "12px", fontWeight: 500, color: "#4B5563" }}>{m.name}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: statusColor(status, m.color), fontWeight: 500, marginTop: "1px", display: "flex", alignItems: "center", gap: "4px" }}>
                            {isThinking && <span style={{ display: "inline-flex", gap: "1px" }}>
                              {[0, 0.2, 0.4].map(d => <span key={d} style={{ animation: `dot 1.4s infinite ${d}s`, fontSize: "16px", lineHeight: 1 }}>•</span>)}
                            </span>}
                            <span>{isThinking ? "thinking..." : status === "done" ? "ready" : mode === "individual" ? m.expertise : "ready"}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: "14px", color: "#C8C5BC", transform: exp ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                    </div>

                    {/* Expanded: conversation thread */}
                    {exp && (
                      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${m.color}12`, animation: "fadeIn 0.25s ease" }}>
                        {conv.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                            {conv.map((msg, i) => (
                              <div key={i} style={{
                                padding: "10px 12px", borderRadius: "10px",
                                background: msg.role === "user" ? "#F3F1EC" : `${m.color}06`,
                                border: `1px solid ${msg.role === "user" ? "#E8E5DE" : m.color + "12"}`,
                              }}>
                                <div style={{ fontSize: "10px", fontWeight: 600, color: msg.role === "user" ? "#9CA3AF" : m.color, marginBottom: "4px", fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  {msg.role === "user" ? "You" : m.name.split(" ")[0]}
                                </div>
                                <div style={{ fontSize: "13px", lineHeight: 1.65, color: "#4B5563", whiteSpace: "pre-wrap" }}>{msg.content}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            value={individualInput[m.id] || ""}
                            onChange={e => setIndividualInput(p => ({ ...p, [m.id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && askMember(m.id)}
                            placeholder={conv.length > 0 ? "Follow up..." : `Ask ${m.name.split(" ")[0]} a question...`}
                            disabled={isRunning}
                            style={{
                              flex: 1, padding: "10px 12px", borderRadius: "8px",
                              border: "1px solid #E8E5DE", background: "#F8F6F1",
                              fontSize: "13px", color: "#1A1A1A", outline: "none", fontFamily: "inherit",
                            }}
                            onFocus={e => e.target.style.borderColor = m.color}
                            onBlur={e => e.target.style.borderColor = "#E8E5DE"}
                          />
                          <button onClick={() => askMember(m.id)} disabled={isRunning || !(individualInput[m.id] || "").trim()} style={{
                            padding: "10px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "none", cursor: isRunning ? "default" : "pointer",
                            background: (individualInput[m.id] || "").trim() ? m.color : "#E8E5DE",
                            color: (individualInput[m.id] || "").trim() ? "#fff" : "#9CA3AF",
                            transition: "all 0.2s", whiteSpace: "nowrap",
                          }}>Ask</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── SYNTHESIS ── */}
        {synthesis && (mode === "council" || mode === "individual") && (
          <div ref={synthRef} style={{ background: "linear-gradient(135deg,#FFFEFA,#F8F6F1)", border: "1px solid #A68A2A30", borderRadius: "12px", padding: "20px", marginBottom: "20px", animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#A68A2A", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>⚡</span> COUNCIL SYNTHESIS
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.75, color: "#374151", margin: 0, whiteSpace: "pre-wrap" }}>{synthesis}</p>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ textAlign: "center", padding: "16px 0", borderTop: "1px solid #E8E5DE" }}>
          <div style={{ fontSize: "10px", color: "#C8C5BC", fontFamily: "'Space Mono',monospace" }}>
            TRecs by Avisoma · Executive Advisory Council
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes dot { 0%,80%,100% { opacity:0.3; } 40% { opacity:1; } }
        * { box-sizing: border-box; }
        textarea::placeholder, input::placeholder { color: #B8B5AC; }
      `}</style>
    </div>
  );
}
