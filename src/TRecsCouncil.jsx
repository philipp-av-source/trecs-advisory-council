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

// ─── Member data with {{PRODUCT_CONTEXT}} placeholder for runtime replacement ───
const MEMBERS = [
  {
    id: "suh", initials: "SU", name: "Steven F. Udvar-Házy", title: "Executive Chairman",
    company: "Air Lease Corporation", color: "#A68A2A", abbr: "ALC",
    expertise: "Aircraft Leasing Pioneer",
    systemPrompt: `You are Steven F. Udvar-Házy, Executive Chairman of Air Lease Corporation and legendary founder of ILFC. 50+ years in aviation finance. You think in fleet strategy, market cycles, asset residual values, and long-term industry evolution. You are direct and visionary.\n\nAll details about TRecs are provided below — base your analysis ONLY on this product context.\n\n{{PRODUCT_CONTEXT}}\n\nGround your advice in what lessors actually need. Be specific about TRecs features. Keep responses to 3-5 sentences unless asked for more detail.`,
  },
  {
    id: "ft", initials: "FT", name: "Firoz Tarapore", title: "CEO",
    company: "Dubai Aerospace Enterprise", color: "#1A8A80", abbr: "DAE",
    expertise: "Aerospace Services & Leasing",
    systemPrompt: `You are Firoz Tarapore, CEO of Dubai Aerospace Enterprise (DAE), top-5 global aircraft lessor with ~500 aircraft and MRO division (Joramco). Wharton MBA. You focus on acquisitions, MRO integration, leasing ops, and emerging markets.\n\n{{PRODUCT_CONTEXT}}\n\nThink as a large lessor with both leasing and MRO. Consider how TRecs' dual modes serve DAE-scale operations. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "lw", initials: "LW", name: "Lars Wagner", title: "CEO, Commercial Aircraft",
    company: "Airbus", color: "#3B6FD4", abbr: "Airbus",
    expertise: "OEM Manufacturing & Engineering",
    systemPrompt: `You are Lars Wagner, CEO of Airbus Commercial Aircraft, previously CEO of MTU Aero Engines. Deep expertise in OEM manufacturing, engine technology, production scaling, sustainability.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on how TRecs' MTU CORTEX/ETM integration creates value. How does engine lifecycle data flow between OEMs, lessors, MROs? Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "af", initials: "AF", name: "André Fischer", title: "CEO",
    company: "Flydocs", color: "#C94040", abbr: "Flydocs",
    expertise: "Digital Records & Transitions",
    systemPrompt: `You are André Fischer, CEO of Flydocs, leading aviation data and records management platform. Expert in digital transformation of aircraft trading, lease transitions, blockchain in MRO, digital records compliance.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on records/document management — OIL linking, Records Dataroom, Bible Templates, transitions. Be honest about competitive dynamics with Flydocs. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "aw", initials: "AW", name: "Austin C. Willis", title: "CEO",
    company: "Willis Lease Finance", color: "#7C5AC7", abbr: "WLFC",
    expertise: "Engine Leasing & Lifecycle",
    systemPrompt: `You are Austin C. Willis, CEO of Willis Lease Finance (WLFC), world's leading independent engine lessor. Former Green Beret. LSE graduate. Focus on engine asset management, lifecycle extension, vertical integration, ConstantThrust®.\n\n{{PRODUCT_CONTEXT}}\n\nThink as an engine lessor — TRecs is built for companies like WLFC. Evaluate Pipeline Kanban, engine detail tabs (ToW, LLP, Valuation), MTU CORTEX integration. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "pj", initials: "PJ", name: "Peter Juhas", title: "CFO",
    company: "AerCap Holdings", color: "#D08A15", abbr: "AerCap",
    expertise: "Aviation Finance & Capital",
    systemPrompt: `You are Peter Juhas, CFO of AerCap, world's largest aircraft lessor. Harvard College & Law. Previously AIG and Morgan Stanley. Focus on capital allocation, portfolio valuation, risk management, M&A.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on IBA integration for valuations, portfolio analytics in Assets mode, risk scoring in Pipeline, investment committee decision support. Keep responses to 3-5 sentences unless asked for more.`,
  },
  {
    id: "vk", initials: "VK", name: "Vinay Kumar", title: "CTO",
    company: "Veryon", color: "#0E8A63", abbr: "Veryon",
    expertise: "Aviation Tech & AI/ML",
    systemPrompt: `You are Vinay Kumar, CTO of Veryon, leading software development, data science, AI/ML for aviation maintenance. 20+ years in technology.\n\n{{PRODUCT_CONTEXT}}\n\nFocus on Veryon integration (AD/SB, LDND, maintenance reliability), AI assistant, architecture scalability, data pipeline strategy for Cirium/Veryon/MTU/IBA integrations. Keep responses to 3-5 sentences unless asked for more.`,
  },
];

const SYNTH_PROMPT_TEMPLATE = `You are a senior strategic advisor synthesizing the TRecs Advisory Council positions. You know the product deeply:\n\n{{PRODUCT_CONTEXT}}\n\nProvide a concise synthesis (5-8 sentences): 1) Key consensus, 2) Tensions or trade-offs, 3) 2-3 concrete next steps for TRecs/Avisoma referencing actual features/integrations. Be direct and actionable.`;

const ACTION_EXTRACTION_PROMPT = `You are a product management analyst extracting concrete, actionable to-do items from an advisory council meeting about a software product.

Analyze the council positions and synthesis provided. Extract specific, implementable action items.

Rules:
- Each action item must be a concrete task, not a vague suggestion
- Group items into categories (e.g., "Data Integrations", "UX/UI", "Architecture", "Business Strategy", "Records & Compliance", "Analytics & Reporting")
- For each item, note which advisor(s) suggested or supported it (use their company abbreviation)
- Prioritize items that multiple advisors agree on
- Aim for 5-15 total items
- Each item should be actionable by a development team

Return ONLY a JSON array (no markdown fencing, no preamble) in this exact format:
[
  {
    "text": "Implement real-time EGT margin tracking in Engine Detail Technical tab using MTU CORTEX API",
    "category": "Data Integrations",
    "advisors": ["Airbus", "WLFC"]
  }
]`;

// ─── helpers ───
const ts = () => new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const mid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const formatSize = (bytes) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

export default function TRecsCouncil() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("council"); // council | individual | todo
  const [selectedMembers, setSelectedMembers] = useState(new Set(MEMBERS.map(m => m.id)));
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

  // ── Feature 2: Context File Upload ──
  const [customContext, setCustomContext] = useState(null); // {filename, size, content} | null
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const positionsRef = useRef({});
  const synthRef = useRef(null);
  const STORAGE_KEY = "trecs-council-v3";
  const CONTEXT_STORAGE_KEY = "trecs-council-context";

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
    })();
  }, []);

  const persist = async (h) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(h)); } catch (e) {}
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

  // ─── ACTION ITEM EXTRACTION ───
  const extractActionItems = async (positionsObj, synthesisText) => {
    setIsExtractingActions(true);
    try {
      let content = "COUNCIL POSITIONS:\n\n";
      for (const [id, pos] of Object.entries(positionsObj)) {
        const m = MEMBERS.find(x => x.id === id);
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
        category: item.category,
        advisors: item.advisors || [],
        checked: false,
      }));
    } catch (e) {
      return [];
    }
  };

  const toggleActionItem = (id) => {
    setActionItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const toggleAllActions = (checked) => {
    setActionItems(prev => prev.map(item => ({ ...item, checked })));
  };

  const generateImplementationPrompt = () => {
    const selected = actionItems.filter(item => item.checked);
    if (selected.length === 0) return "";

    const grouped = {};
    selected.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    let prompt = `## TRecs Implementation Tasks\n\n`;
    prompt += `The following improvements to TRecs were identified by an advisory council of aviation industry leaders. Implement each item in the existing React codebase.\n\n`;
    prompt += `### Context\n`;
    prompt += `- TRecs is a single-file React 18 application (~17,000 lines)\n`;
    prompt += `- Uses Vite 5, Lucide React icons, inline styles\n`;
    prompt += `- Two modes: Assets (portfolio management) and Pipeline (acquisition evaluation)\n\n`;
    prompt += `### Tasks\n\n`;

    for (const [category, items] of Object.entries(grouped)) {
      prompt += `#### ${category}\n\n`;
      items.forEach((item, i) => {
        prompt += `${i + 1}. ${item.text}\n`;
        prompt += `   _Recommended by: ${item.advisors.join(", ")}_\n\n`;
      });
    }

    prompt += `### Implementation Notes\n`;
    prompt += `- Maintain backward compatibility with existing data structures\n`;
    prompt += `- Follow existing inline style patterns and design system\n`;
    prompt += `- Test each change against existing functionality\n`;

    return prompt;
  };

  const copyPromptToClipboard = async () => {
    const prompt = generateImplementationPrompt();
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

  // ─── FULL COUNCIL MEETING ───
  const runCouncil = async () => {
    if (!topic.trim() || isRunning) return;
    setIsRunning(true); setError(null); setPositions({}); setSynthesis("");
    setExpandedMember(null); setConversations({}); setActionItems([]);
    positionsRef.current = {};
    const active = MEMBERS.filter(m => selectedMembers.has(m.id));
    const total = active.length + 2; // +1 synthesis, +1 action extraction
    setTotalSteps(total); setProgress(0);

    const init = {}; MEMBERS.forEach(m => { init[m.id] = selectedMembers.has(m.id) ? "waiting" : "skipped"; });
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
            const mm = MEMBERS.find(x => x.id === id);
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
        const m = MEMBERS.find(x => x.id === id);
        if (m) sm += `${m.name} (${m.title}, ${m.company}):\n${pos}\n\n`;
      }
      const sr = await callAPI(resolvePrompt(SYNTH_PROMPT_TEMPLATE), [{ role: "user", content: sm }]);
      setSynthesis(sr); setProgress(active.length + 1);
      setTimeout(() => synthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);

      // Action item extraction
      setRunningId("actions");
      const items = await extractActionItems(positionsRef.current, sr);
      setProgress(total); setRunningId(null);

      const entry = {
        id: mid(), topic: topic.trim(), date: ts(), mode: "council",
        participants: active.map(m => m.id),
        positions: { ...positionsRef.current }, synthesis: sr,
        conversations: Object.fromEntries(active.map(m => [m.id, [{ role: "user", content: topic }, { role: "assistant", content: positionsRef.current[m.id] || "" }]])),
        actionItems: items,
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

    const m = MEMBERS.find(x => x.id === memberId);
    const prev = conversations[memberId] || [];
    const messages = [...prev, { role: "user", content: input }];

    let ctxNote = "";
    if (Object.keys(positions).length > 0) {
      ctxNote = "\n\n[Council context — other members have shared these positions on the current topic:\n";
      for (const [id, pos] of Object.entries(positions)) {
        if (id !== memberId) {
          const mm = MEMBERS.find(x => x.id === id);
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
    md += `**Mode:** ${mode === "council" ? "Full Council Meeting" : mode === "todo" ? "To-Do Items" : "Individual Conversations"}\n`;
    if (topic) md += `**Topic:** ${topic}\n`;
    md += `\n---\n\n`;

    md += `## Advisor Positions\n\n`;
    MEMBERS.forEach(m => {
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

    if (synthesis) {
      md += `## Council Synthesis\n\n${synthesis}\n\n`;
    }

    if (actionItems.length > 0) {
      md += `## Action Items\n\n`;
      const cats = {};
      actionItems.forEach(item => {
        if (!cats[item.category]) cats[item.category] = [];
        cats[item.category].push(item);
      });
      for (const [cat, items] of Object.entries(cats)) {
        md += `### ${cat}\n\n`;
        items.forEach(item => {
          md += `- [${item.checked ? "x" : " "}] ${item.text} _(${item.advisors.join(", ")})_\n`;
        });
        md += `\n`;
      }
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
    const st = {};
    MEMBERS.forEach(m => { st[m.id] = entry.positions?.[m.id] ? "done" : "waiting"; });
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

  const selectAll = () => setSelectedMembers(new Set(MEMBERS.map(m => m.id)));
  const selectNone = () => setSelectedMembers(new Set());

  const hasAnyContent = Object.keys(positions).length > 0 || synthesis;
  const statusColor = (s, c) => s === "done" ? "#0E8A63" : s === "thinking" ? c : s === "skipped" ? "#E8E5DE" : "#C8C5BC";

  // ─── To-Do grouping ───
  const groupedActions = {};
  actionItems.forEach(item => {
    if (!groupedActions[item.category]) groupedActions[item.category] = [];
    groupedActions[item.category].push(item);
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
              7 independent AI advisors · sequential discussion · synthesis
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
                      {h.mode === "individual" ? `Individual → ${h.member}` : `Full council · ${h.participants?.length || 7} advisors`}
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
          {[{ k: "council", l: "Full Council" }, { k: "individual", l: "Individual" }, { k: "todo", l: actionItems.length > 0 ? `To-Do (${actionItems.length})` : "To-Do" }].map(m => (
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
                <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF" }}>SELECT ADVISORS</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={selectAll} style={{ fontSize: "11px", color: "#3B6FD4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>All</button>
                  <button onClick={selectNone} style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>None</button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {MEMBERS.map(m => {
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
              {isRunning ? `Meeting in progress... (${progress}/${totalSteps})` : `Start Meeting · ${selectedMembers.size} advisor${selectedMembers.size !== 1 ? "s" : ""}`}
            </button>

            {isRunning && (
              <div style={{ height: "3px", borderRadius: "2px", background: "#E8E5DE", marginBottom: "20px", marginTop: "-12px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#A68A2A,#C9A84C)", width: `${(progress / totalSteps) * 100}%`, transition: "width 0.6s ease" }} />
              </div>
            )}
          </>
        )}

        {error && <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", background: "#C9404010", border: "1px solid #C9404030", fontSize: "13px", color: "#C94040" }}>{error}</div>}

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

                {/* Grouped items */}
                {Object.entries(groupedActions).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1px", textTransform: "uppercase", color: "#A68A2A", fontWeight: 700, marginBottom: "8px", padding: "0 4px" }}>
                      {category}
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
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                              {item.advisors.map(adv => {
                                const member = MEMBERS.find(m => m.abbr === adv);
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
                ))}

                {/* Footer: count + generate button */}
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
                      padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "none",
                      cursor: selectedCount === 0 ? "default" : "pointer",
                      background: selectedCount > 0 ? "linear-gradient(135deg,#1A1A1A,#2A2A2A)" : "#E8E5DE",
                      color: selectedCount > 0 ? "#F8F6F1" : "#9CA3AF",
                      transition: "all 0.2s",
                    }}>
                      📋 Generate Prompt
                    </button>
                  </div>
                </div>

                {/* Re-extract button */}
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <button onClick={() => extractActionItems(positions, synthesis)} style={{
                    fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 500,
                  }}>↻ Re-extract action items</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ADVISOR CARDS (council + individual modes) ── */}
        {mode !== "todo" && (
          <>
            <div style={{ fontSize: "10px", fontFamily: "'Space Mono',monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "10px" }}>
              {mode === "council" ? "ADVISOR POSITIONS" : "ASK AN ADVISOR"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mode === "individual" ? "1fr" : "repeat(2, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {MEMBERS.map(m => {
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
                            <span style={{ fontSize: "12px", fontWeight: 500, color: "#4B5563" }}>{m.company}</span>
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
        {synthesis && mode !== "todo" && (
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
