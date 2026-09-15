"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  LayoutDashboard,
  Files,
  GitCompareArrows,
  ListChecks,
  LifeBuoy,
  ArrowUpRight,
  ArrowRight,
  Plus,
  FileText,
  ShieldCheck,
  Upload,
  ChevronRight,
  Volume2,
  Download,
  MessageSquare,
  Send,
  TriangleAlert,
  Info,
  BookOpen,
  LockKeyhole,
  Trash2,
  Search,
  CheckCircle2,
  Loader2,
  Clipboard,
  ExternalLink,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import { sample, alternative, review, paragraphs, search } from "@/lib/review";
import { getDirection, isLocale, languageLabel, translate, type Locale } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
const nav = [
  ["Workspace", LayoutDashboard],
  ["My document", Files],
  ["Compare documents", GitCompareArrows],
  ["Action plan", ListChecks],
  ["Find legal help", LifeBuoy],
] as const;
const evidence = [
  "Original agreement and all attachments",
  "Payment receipts and transaction references",
  "Relevant emails and messages",
  "Dated photographs and handover records",
  "A timeline of events in your own words",
];
const evidenceKeys = ["evidenceAgreement", "evidenceReceipts", "evidenceMessages", "evidencePhotos", "evidenceTimeline"];
export default function Home() {
  const [view, setView] = useState("Workspace"),
    [text, setText] = useState(sample),
    [name, setName] = useState("Rental agreement"),
    [demo, setDemo] = useState(true),
    [tab, setTab] = useState("overview"),
    [upload, setUpload] = useState(false),
    [draft, setDraft] = useState(""),
    [draftName, setDraftName] = useState("My agreement"),
    [other, setOther] = useState(alternative),
    [checked, setChecked] = useState<string[]>([]),
    [question, setQuestion] = useState(""),
    [messages, setMessages] = useState<{ role: string; text: string }[]>([]),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<number | null>(null),
    [large, setLarge] = useState(false),
    [language, setLanguage] = useState("English"),
    [locale, setLocale] = useState<Locale>("en"),
    [notes, setNotes] = useState(""),
    [aiReady, setAiReady] = useState(false),
    [consent, setConsent] = useState(false),
    [customItem, setCustomItem] = useState(""),
    [customItems, setCustomItems] = useState<string[]>([]),
    [compareSearch, setCompareSearch] = useState(""),
    [changesOnly, setChangesOnly] = useState(false),
    [uploadStatus, setUploadStatus] = useState("idle");
  const findings = review(text),
    attention = findings.filter((f) => f.level === "attention").length,
    clarify = findings.filter((f) => f.level === "clarify").length,
    source = selected === null ? null : findings[selected];
  const t = (key: string, fallback?: string) => translate(locale, key, fallback);
  const selectedLanguage = languageLabel(locale);
  const navKey: Record<string, string> = { Workspace: "workspace", "My document": "myDocument", "Compare documents": "compareDocuments", "Action plan": "actionPlan", "Find legal help": "findLegalHelp" };
  const findingKey = (id: string, part: "Title" | "Explanation" | "Question") => `finding${id.charAt(0).toUpperCase()}${id.slice(1)}${part}`;
  useEffect(() => {
    const saved = window.localStorage.getItem("nyayapath-language");
    if (isLocale(saved)) setLocale(saved);
    const handleLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<string>).detail;
      if (isLocale(next)) setLocale(next);
    };
    window.addEventListener("nyayapath-language-change", handleLanguageChange);
    return () => window.removeEventListener("nyayapath-language-change", handleLanguageChange);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    window.localStorage.setItem("nyayapath-language", locale);
  }, [locale]);
  useEffect(() => {
    fetch("/api/assist")
      .then((r) => r.json() as Promise<{ available: boolean }>)
      .then((d) => setAiReady(d.available === true))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const ctx = (
      document as unknown as {
        modelContext?: { registerTool?: (...args: unknown[]) => unknown };
      }
    ).modelContext;
    if (!ctx?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      ctx.registerTool(
        {
          name: "read_document_review",
          description:
            "Read the current document rule-based topic flags, not legal advice.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute(input: unknown) {
            if (
              !input ||
              typeof input !== "object" ||
              Object.keys(input).length
            )
              throw Error("Expected empty object");
            return {
              document: name,
              demo,
              mode: "rule-based",
              findings: review(text),
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [name, text, demo]);
  function loadDemo() {
    setText(sample);
    setName("Rental agreement");
    setDemo(true);
    setView("My document");
    setTab("overview");
    setMessages([]);
    setChecked([]);
    setNotes("");
  }
  function addChecklistItem() {
    const item = customItem.trim();
    if (!item) return;
    setCustomItems((items) => [...items, item]);
    setCustomItem("");
    toast.success("Checklist item added");
  }
  function exportComparison() {
    const rows = paragraphs(text)
      .map((a, i) => ({ a, b: paragraphs(other)[i] || "" }))
      .filter((r) => r.a !== r.b);
    const report = `NYAYAPATH — TEXT COMPARISON\nText comparison is not a legal judgment.\n\n${rows.map((r, i) => `Paragraph ${i + 1}\nDocument A: ${r.a || "[removed]"}\nDocument B: ${r.b || "[added]"}`).join("\n\n")}`;
    const url = URL.createObjectURL(
      new Blob([report], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "NyayaPath-comparison.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("exportComparison", "Comparison exported"));
  }
  function download() {
    const report = `NYAYAPATH — ${t("consultationPreparation", "CONSULTATION PREPARATION")}\n${name}\n${demo ? t("fictionalSample", "FICTIONAL SAMPLE") : t("userProvided", "USER-PROVIDED DOCUMENT")}\n${t("ruleBasedDisclaimer", "Rule-based topic checks. Not legal advice. No enforceability assessment.")}\n\n${findings.map((f) => `${t(findingKey(f.id, "Title"), f.title)}\n${f.source}: ${f.quote}\n${t("questionLabel", "Question")}: ${t(findingKey(f.id, "Question"), f.question)}`).join("\n\n")}\n\n${t("evidenceChecklist", "EVIDENCE CHECKLIST")}\n${evidence.map((e, i) => `[${checked.includes(e) ? "x" : " "}] ${t(evidenceKeys[i], e)}`).join("\n")}\n\n${t("yourNotes", "YOUR NOTES (not verified)")}\n${notes}\n\n${t("originalDocument", "ORIGINAL TEXT")}\n${text}`;
    const url = URL.createObjectURL(
      new Blob([report], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "NyayaPath-consultation-pack.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("downloadPack", "Consultation pack downloaded"));
  }
  async function readFile(f?: File) {
    if (!f) return;
    setUploadStatus("loading");
    if (f.size > 5 * 1024 * 1024) {
      setUploadStatus("error");
      toast.error("This file is too large. Use a file smaller than 5 MB.");
      return;
    }
    if (!/\.(txt|md)$/i.test(f.name)) {
      setUploadStatus("error");
      toast.error(t("fileUnsupported", "This file type is not supported. Try TXT or MD, or paste text instead."));
      return;
    }
    try {
      setDraft((await f.text()).slice(0, 50000));
      setDraftName(f.name.replace(/\.[^.]+$/, ""));
      setUploadStatus("success");
    } catch {
      setUploadStatus("error");
      toast.error("We could not read this document. Paste the text instead.");
    }
  }
  function save() {
    if (draft.trim().length < 50) {
      toast.error(t("readFailure", "Please add at least 50 characters."));
      return;
    }
    setText(draft.trim());
    setName(draftName.trim() || "My agreement");
    setDemo(false);
    setUpload(false);
    setView("My document");
    setTab("overview");
    setMessages([]);
    setChecked([]);
    setNotes("");
    toast.success(t("reviewDocument", "Local topic checks are ready."));
  }
  async function ask(q = question) {
    if (!q.trim() || busy) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "You", text: q }]);
    setBusy(true);
    try {
      let answer = search(text, q);
      if (aiReady && consent) {
        const r = await fetch("/api/assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, question: q, language: selectedLanguage.english }),
        });
        const d = (await r.json()) as { error?: string; answer: string };
        if (!r.ok) throw Error(d.error || "Assistant unavailable");
        answer = d.answer;
      }
      setMessages((m) => [
        ...m,
        {
          role: aiReady && consent ? "AI assistant" : "Document search",
          text: answer,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "Notice",
          text: e instanceof Error ? e.message : "Request failed",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  function speak() {
    if (!("speechSynthesis" in window)) {
      toast.error("Your browser does not support read aloud.");
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      findings.map((f) => f.title + ". " + f.explanation).join(" "),
    );
    u.lang = "en-IN";
    speechSynthesis.speak(u);
    toast("Reading in English. Use Stop to end.");
  }
  return (
    <SidebarProvider>
      <Toaster richColors />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar className="brand-sidebar">
        <SidebarHeader>
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Scale size={25} />
            </span>
            <span>
              nyaya<span className="brand-light">path</span>
              <small>CLARITY. BEFORE YOU COMMIT.</small>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <div className="nav-heading">{t("workspace", "YOUR WORKSPACE")}</div>
          <SidebarMenu>
            {nav.map(([n, Icon]) => (
              <SidebarMenuItem key={n}>
                <SidebarMenuButton
                  className="nav-button"
                  isActive={view === n}
                  onClick={() => setView(n)}
                >
                  <Icon />
                  <span>{t(navKey[n], n)}</span>
                  {n === "My document" && text && (
                    <span className="nav-count">1</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="sidebar-note">
            <BookOpen size={22} />
            <h3>{t("clearPath", "A little clarity goes a long way.")}</h3>
            <p>{t("whatDoesText")}</p>
            <button onClick={loadDemo}>
              {t("exploreSample", "Explore a sample")} <ArrowRight size={15} />
            </button>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="privacy-note">
            <ShieldCheck size={19} />
            <span>
              {t("privateByDefault")}<small>{t("sessionOnly")}*</small>
            </span>
          </div>
          <div className="profile">
            <span className="avatar">G</span>
            <span>
              {t("workspace")}<small>{t("noAccount")}</small>
            </span>
            <LockKeyhole size={15} />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className={large ? "app large-text" : "app"}>
          <header className="topbar">
            <div className="breadcrumb">
              <SidebarTrigger />
              <span>{t("workspace", "Your workspace")}</span>
              <ChevronRight size={14} />
              <strong>{t(navKey[view] ?? "workspace", view)}</strong>
            </div>
            <div className="top-actions">
              <LanguageSelector />
              <button
                className="text-size"
                aria-pressed={large}
                onClick={() => setLarge(!large)}
              >
                Aa <span>{large ? t("standard") : t("largerText")}</span>
              </button>
              <span className="session-badge">{t("privateSession")}</span>
            </div>
          </header>
          <main id="main">
            <div className="page-heading">
              <div>
                <div className="eyebrow">{t("workspaceEyebrow", "YOUR LEGAL CLARITY WORKSPACE")}</div>
                <h1>{t(view === "Workspace" ? "makeSense" : view === "My document" ? "documentSubtitle" : view === "Compare documents" ? "compareSubtitle" : view === "Action plan" ? "actionSubtitle" : "helpSubtitle", view === "Workspace" ? "Make sense of what you sign." : view === "My document" ? "Original wording. Plain-language context. Everything in one place." : view === "Compare documents" ? "Compare wording side by side. A text change is not a legal judgment." : view === "Action plan" ? "Gather your records and prepare for a useful conversation." : "Official starting points for information and professional support in India.")}</h1>
                <p>{t(view === "Workspace" ? "workspaceSubtitle" : view === "My document" ? "documentSubtitle" : view === "Compare documents" ? "compareSubtitle" : view === "Action plan" ? "actionSubtitle" : "helpSubtitle", view === "Workspace" ? "Understand your documents, spot questions worth asking, and move forward informed." : view === "My document" ? "Original wording. Plain-language context. Everything in one place." : view === "Compare documents" ? "Compare wording side by side. A text change is not a legal judgment." : view === "Action plan" ? "Gather your records and prepare for a useful conversation." : "Official starting points for information and professional support in India.")}</p>
              </div>
              <button className="primary" onClick={() => setUpload(true)}>
                <Plus size={18} />
                {t("newDocument", "New document")}
              </button>
            </div>
            {view === "Workspace" && (
              <>
                <section className="onboarding" aria-labelledby="onboarding-title">
                  <div className="onboarding-copy">
                    <span className="small-caps">{t("pathTitle", "A SIMPLE PATH TO CLARITY")}</span>
                    <h2 id="onboarding-title">{t("startWithWords", "Start with the words in front of you.")}</h2>
                    <p>{t("onboarding", "Upload a rental agreement, employment contract, loan document, or other agreement to understand important clauses and prepare better questions for a qualified professional.")}</p>
                  </div>
                  <ol className="progress-flow">
                      {[["01", "addDocument"], ["02", "review"], ["03", "prepareQuestions"], ["04", "findHelp"]].map(([n, key]) => <li key={n}><span>{n}</span><strong>{t(key)}</strong></li>)}
                  </ol>
                </section>
                <div className="start-grid">
                  <section
                    className="upload-card"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setUpload(true);
                      void readFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <div className="upload-symbol">
                      <Upload size={27} />
                    </div>
                    <div>
                      <h2>{t("startDocument")}</h2>
                      <p>{t("bringAgreement")}</p>
                      <button
                        className="primary"
                        onClick={() => setUpload(true)}
                      >
                        {t("addDocument")} <ArrowRight size={17} />
                      </button>
                      <span className="upload-format">
                        {t("pasteOrUpload")}
                      </span>
                    </div>
                    <div className="upload-foot">
                      <LockKeyhole size={14} />
                      {t("howHandledText")}
                    </div>
                  </section>
                  <section className="sample-card">
                    <span className="small-caps">{t("trySample")}</span>
                    <h2>
                      {t("trySample")}
                    </h2>
                    <p>{t("sampleDescription")}</p>
                    <button onClick={loadDemo}>
                      {t("openSample")} <ArrowUpRight size={18} />
                    </button>
                    <span className="sample-label">
                      {t("fictional")}
                    </span>
                  </section>
                </div>
                <section className="onboarding-details" aria-label="About NyayaPath">
                  <div><CheckCircle2 size={18} /><strong>{t("whatDoes", "What NyayaPath does")}</strong><p>{t("whatDoesText", "Organises document wording, highlights topics to check, and helps you prepare focused questions.")}</p></div>
                  <div><Info size={18} /><strong>{t("whatNot", "What it does not do")}</strong><p>{t("whatNotText", "It does not act as a lawyer, decide whether a term is enforceable, or replace professional advice.")}</p></div>
                  <div><LockKeyhole size={18} /><strong>{t("howHandled", "How your documents are handled")}</strong><p>{t("howHandledText", "Your document stays in this browser session. Connected AI receives text only after you give consent.")}</p></div>
                </section>
                <div className="section-title">
                  <h2>{t("documentAtGlance", "Your document at a glance")}</h2>
                  <span className="badge neutral">
                    {demo ? t("sampleWorkspace", "Sample workspace") : t("currentSession", "Current session")}
                  </span>
                </div>
                <button
                  className="document-row"
                  onClick={() => setView("My document")}
                >
                  <span className="file-icon">
                    <FileText size={25} />
                  </span>
                  <span className="doc-name">
                    <strong>{name}</strong>
                    <small>
                      {demo ? t("fictionalRentalAgreement", "Fictional rental agreement") : t("yourDocument", "Your document")} ·{" "}
                      {paragraphs(text).length} {t("passages", "passages")}
                    </small>
                  </span>
                  <span className="badge amber">
                    {attention + clarify} {t("topicsToDiscuss", "topics to discuss")}
                  </span>
                  <span className="row-link">
                    {t("viewReview", "View review")} <ArrowRight size={18} />
                  </span>
                </button>
                <div className="lower-grid">
                  <section>
                    <div className="section-title">
                      <h2>{t("clearPathForward", "A clear path forward")}</h2>
                      <span className="muted">{t("threeSimpleSteps", "Three simple steps")}</span>
                    </div>
                    <div className="journey">
                      {[
                        ["01", t("journeyUnderstand", "Understand"), t("journeyUnderstandDesc", "Read your agreement in context.")],
                        [
                          "02",
                          t("journeyQuestions", "Ask the right questions"),
                          t("journeyQuestionsDesc", "Look closer at costs and obligations."),
                        ],
                        [
                          "03",
                          t("journeyPrepare", "Prepare your next step"),
                          t("journeyPrepareDesc", "Build a checklist for a professional."),
                        ],
                      ].map(([n, title, d]) => (
                        <div key={n}>
                          <span>{n}</span>
                          <h3>{title}</h3>
                          <p>{d}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="trust-card">
                    <ShieldCheck size={24} />
                    <h3>{t("clarityWithCare", "Clarity, with care.")}</h3>
                    <p>
                      {t("clarityWithCareDesc", "See the source. Recognise uncertainty. Leave legal decisions to qualified professionals.")}
                    </p>
                    <button onClick={() => setView("Find legal help")}>
                      {t("findHumanSupport", "Find human support")} <ArrowUpRight size={16} />
                    </button>
                  </section>
                </div>
              </>
            )}
            {view === "My document" && (
              <>
                <div className="review-toolbar">
                  <span className="file-icon">
                    <FileText size={22} />
                  </span>
                  <div>
                    <h2>{name}</h2>
                    <small>
                      {demo ? t("fictionalSample", "Fictional sample") : t("sessionOnly", "Session only")} · {t("ruleBasedChecks", "Rule-based checks, not AI legal analysis")}
                    </small>
                  </div>
                  <div className="toolbar-buttons">
                    <button className="secondary" onClick={speak} aria-label={t("listen")}>
                      <Volume2 size={16} />
                      {t("listen")}
                    </button>
                    <button
                      className="quiet"
                      onClick={() => window.speechSynthesis?.cancel()}
                    >
                      {t("stop")}
                    </button>
                    <button className="secondary" onClick={download}>
                      <Download size={16} />
                      {t("exportPack")}
                    </button>
                  </div>
                </div>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="review-tabs" variant="line">
                    <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
                    <TabsTrigger value="original">
                      {t("originalDocument")}
                    </TabsTrigger>
                    <TabsTrigger value="ask">{t("askQuestion")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <div className="review-grid">
                      <section>
                        <div className="summary-strip">
                          <div>
                            <strong>{findings.length}</strong>
                            <span>{t("topicsIdentified", "Topics identified")}</span>
                          </div>
                          <div>
                            <strong className="red-text">{attention}</strong>
                            <span>{t("costFlags", "Cost / discretion flags")}</span>
                          </div>
                          <div>
                            <strong className="amber-text">{clarify}</strong>
                            <span>{t("needClarification", "Need clarification")}</span>
                          </div>
                        </div>
                        <div className="section-title">
                          <h2>{t("worthCloserLook", "Worth a closer look")}</h2>
                          <span className="muted">
                            {t("selectCardSource", "Select a card to see its source")}
                          </span>
                        </div>
                        {!findings.length && (
                          <div className="empty-state">
                            <Info />
                            <h3>{t("noTopicMatches", "No topic matches found")}</h3>
                            <p>
                              {t("noTopicMatchesDesc", "This does not establish that the document is safe or complete. Review the original with a professional.")}
                            </p>
                          </div>
                        )}
                        {findings.map((f, i) => (
                          <button
                            className={"finding " + f.level}
                            key={i}
                            onClick={() => setSelected(i)}
                          >
                            <span className="finding-icon">
                              {f.level === "attention" ? (
                                <TriangleAlert size={20} />
                              ) : (
                                <Info size={20} />
                              )}
                            </span>
                            <div>
                              <span
                                className={
                                  "badge " +
                                  (f.level === "attention"
                                    ? "red"
                                    : f.level === "clarify"
                                      ? "amber"
                                      : "blue")
                                }
                              >
                                {f.level === "attention"
                                  ? t("discussBeforeSigning", "Discuss before signing")
                                  : f.level === "clarify"
                                    ? t("clarifyWording", "Clarify the wording")
                                    : t("paymentTopic", "Payment topic")}
                              </span>
                              <h3>{t(findingKey(f.id, "Title"), f.title)}</h3>
                              <p>{t(findingKey(f.id, "Explanation"), f.explanation)}</p>
                              <small>
                                {f.source}
                                <ArrowUpRight size={13} />
                              </small>
                            </div>
                            <ChevronRight size={18} />
                          </button>
                        ))}
                      </section>
                      <aside>
                        <section className="next-card">
                          <span className="small-caps">{t("yourNextStep", "YOUR NEXT STEP")}</span>
                          <h2>
                            {t("turnQuestions", "Turn questions")}
                            <br />
                            {t("intoConversation", "into a conversation.")}
                          </h2>
                          <p>
                            {t("takeQuestionsDesc", "Take a focused set of questions and your supporting records to a legal professional.")}
                          </p>
                          <button
                            className="primary"
                            onClick={() => setView("Action plan")}
                          >
                            {t("buildActionPlan", "Build my action plan")} <ArrowRight size={17} />
                          </button>
                        </section>
                        <div className="inline-note">
                          <Info size={19} />
                          <p>
                            {t("limitedTopicFlags", "Limited keyword-based topic flags. No risk score, safety certification or enforceability assessment.")}
                          </p>
                        </div>
                        <button
                          className="wide-link"
                          onClick={() => setTab("ask")}
                        >
                          <MessageSquare size={20} />
                          {t("haveQuestion", "Have a question?")}
                          <ArrowRight size={17} />
                        </button>
                      </aside>
                    </div>
                  </TabsContent>
                  <TabsContent value="original">
                    <article className="original">
                      <div className="inline-note"><Info size={19} /><p>{t("originalNotice")}</p></div>
                      <div className="small-caps">
                        {t("originalDocumentLabel", "ORIGINAL DOCUMENT")} ·{" "}
                        {demo ? t("fictionalSampleLabel", "FICTIONAL SAMPLE") : t("userProvidedLabel", "USER PROVIDED")}
                      </div>
                      {paragraphs(text).map((p, i) => (
                        <section key={i}>
                          <small>PASSAGE {i + 1}</small>
                          <p>{p}</p>
                        </section>
                      ))}
                    </article>
                  </TabsContent>
                  <TabsContent value="ask">
                    <section className="chat-panel">
                      <div className="section-title">
                        <h2>{t("askAboutDocument", "Ask about your document")}</h2>
                        <span className="badge blue">
                          {aiReady ? t("aiConnected", "AI connected") : t("localDocumentSearch", "Local document search")}
                        </span>
                      </div>
                      <p className="muted">
                        {aiReady
                          ? t("aiAnswersWarning", "AI answers may contain errors. Check every citation.")
                          : t("aiNotConnected", "Live AI is not connected. Search returns original matching passages, not generated advice.")}
                      </p>
                      {aiReady && (
                        <>
                          <label className="check-row">
                            <Checkbox
                              checked={consent}
                              onCheckedChange={(v) => setConsent(v === true)}
                            />
                            {t("sendDocumentConsent", "Send my document and question to the configured AI provider.")}
                          </label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger aria-label="Answer language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["English", "Hindi", "Punjabi"].map((l) => (
                                <SelectItem key={l} value={l}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                      <div className="suggestions">
                        {[["questionNotice", "What does the notice clause say?"], ["questionDeposit", "What are the deposit conditions?"], ["questionEarlyExit", "What happens if I leave early?"]].map(([key, fallback]) => {
                          const q = t(key, fallback);
                          return <button key={q} onClick={() => ask(q)}>
                            {q}
                            <ArrowUpRight size={14} />
                          </button>
                        })}
                      </div>
                      <div className="messages" aria-live="polite">
                        {messages.map((m, i) => (
                          <div
                            className={
                              "message " +
                              (m.role === "You" ? "user-message" : "")
                            }
                            key={i}
                          >
                            <strong>{m.role}</strong>
                            <p>{m.text}</p>
                          </div>
                        ))}
                        {busy && <p role="status">{t("readingQuestion", "Reading your question…")}</p>}
                      </div>
                      <form
                        className="chat-input"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void ask();
                        }}
                      >
                        <input
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder={t("askQuestionPlaceholder", "Ask about a clause, cost, or responsibility…")}
                          aria-label={t("documentQuestion", "Document question")}
                          maxLength={1500}
                        />
                        <button
                          className="primary"
                          disabled={busy || !question.trim()}
                          aria-label={t("sendQuestion", "Send question")}
                        >
                          <Send size={18} />
                        </button>
                      </form>
                    </section>
                  </TabsContent>
                </Tabs>
              </>
            )}
            {view === "Compare documents" && (
              <section className="compare-panel">
                <div className="compare-summary">
                  <div><strong>{paragraphs(text).filter((p, i) => p !== (paragraphs(other)[i] || "")).length} {t("changesFound", "changes found")}</strong><span>{t("comparisonNotLegalJudgment", "Text comparison is not a legal judgment.")}</span></div>
                  <button className="secondary" onClick={exportComparison}><Download size={16} />{t("exportComparison")}</button>
                </div>
                <div className="compare-toolbar">
                  <label className="search-field"><Search size={17} /><input value={compareSearch} onChange={(e) => setCompareSearch(e.target.value)} placeholder={t("searchDocuments")} aria-label={t("searchDocuments")} /></label>
                  <label className="toggle-control"><input type="checkbox" checked={changesOnly} onChange={(e) => setChangesOnly(e.target.checked)} /> {t("showChanges")}</label>
                </div>
                <div className="compare-inputs">
                  <label>
                    <strong>{t("documentA", "Document A")} · {name}</strong>
                    <textarea
                      readOnly
                      value={text}
                      aria-label={t("currentDocument", "Current document")}
                    />
                  </label>
                  <label>
                    <strong>{t("documentB", "Document B")}</strong>
                    <textarea
                      value={other}
                      onChange={(e) => setOther(e.target.value.slice(0, 50000))}
                      aria-label={t("comparisonDocument", "Comparison document")}
                    />
                  </label>
                </div>
                <div className="inline-note">
                  <Info size={19} />
                  <p>
                    {t("compareHelpText", "Paragraph-by-paragraph text comparison. Insertions can shift alignment; inspect both originals. No legal ranking is applied.")}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("passage", "Passage")}</TableHead>
                      <TableHead>{t("documentA", "Document A")}</TableHead>
                      <TableHead>{t("documentB", "Document B")}</TableHead>
                      <TableHead>{t("textStatus", "Text status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      {
                        length: Math.max(
                          paragraphs(text).length,
                          paragraphs(other).length,
                        ),
                      },
                      (_, i) => {
                        const a = paragraphs(text)[i] || "",
                          b = paragraphs(other)[i] || "";
                        const isChange = a !== b;
                        if (changesOnly && !isChange) return null;
                        if (compareSearch && !`${a} ${b}`.toLowerCase().includes(compareSearch.toLowerCase())) return null;
                        return (
                          <TableRow key={i}>
                            <TableCell><span className="paragraph-number">¶ {i + 1}</span></TableCell>
                            <TableCell className={"compare-cell " + (isChange ? "removed-text" : "") }>
                              {a || "—"}
                            </TableCell>
                            <TableCell className={"compare-cell " + (isChange ? "added-text" : "") }>
                              {b || "—"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  "badge " + (a === b ? "neutral" : !a ? "green" : !b ? "red" : "amber")
                                }
                              >
                                {a === b
                                  ? t("unchanged", "Unchanged")
                                  : !a ? t("added", "Added") : !b ? t("removed", "Removed") : t("changed", "Changed")}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table>
              </section>
            )}
            {view === "Action plan" && (
              <div className="action-grid">
                <section className="panel">
                  <div className="section-title">
                    <h2>{t("evidenceChecklist")}</h2>
                    <span className="badge blue">{checked.length} / 5</span>
                  </div>
                  <p className="muted">
                    {t("actionPlanIntro", "General preparation prompts, not specific legal evidence requirements. Keep originals unchanged.")}
                  </p>
                  {evidence.map((e, i) => (
                    <label className="check-row" key={e}>
                      <Checkbox
                        checked={checked.includes(e)}
                        onCheckedChange={(v) =>
                          setChecked((c) =>
                            v === true ? [...c, e] : c.filter((x) => x !== e),
                          )
                        }
                      />
                      <span>{t(evidenceKeys[i], e)}</span>
                    </label>
                  ))}
                  {customItems.map((item) => (
                    <label className="check-row" key={item}>
                      <Checkbox checked={checked.includes(item)} onCheckedChange={(v) => setChecked((c) => v === true ? [...c, item] : c.filter((x) => x !== item))} />
                      <span>{item}</span>
                      <button type="button" className="remove-item" aria-label={`Remove ${item}`} onClick={() => { setCustomItems((items) => items.filter((x) => x !== item)); setChecked((items) => items.filter((x) => x !== item)); }}>×</button>
                    </label>
                  ))}
                  <form className="add-item" onSubmit={(e) => { e.preventDefault(); addChecklistItem(); }}>
                    <div><input id="custom-item" value={customItem} onChange={(e) => setCustomItem(e.target.value)} placeholder={t("checklistExample", "For example, note the handover date")} /><button className="secondary" type="submit"><Plus size={16} />{t("add", "Add")}</button></div>
                  </form>
                  <label className="notes-label" htmlFor="notes">
                    {t("yourSituation", "Your situation, in your words")}
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("notesPlaceholder", "What happened? On which dates? What would you like clarified?")}
                  />
                  <p className="small-muted">
                    {t("sessionOnlyExport", "Session only. Export before refreshing or leaving.")}
                  </p>
                </section>
                <section className="panel">
                    <h2>{t("questionsProfessional")}</h2>
                  <div className="question-list">
                    {findings.map((f, i) => (
                      <div key={i}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <p>{t(findingKey(f.id, "Question"), f.question)}</p>
                        <button type="button" className="icon-text" onClick={() => { void navigator.clipboard?.writeText(t(findingKey(f.id, "Question"), f.question)); toast.success(t("questionCopied", "Question copied")); }}><Clipboard size={14} />{t("copy", "Copy")}</button>
                      </div>
                    ))}
                  </div>
                  <button className="primary" onClick={download}>
                    <Download size={17} />
                    {t("downloadPack")}
                  </button>
                  <p className="small-muted">
                    {t("sourceTextNote", "Source text, questions, checklist and notes. Plain-text format.")}
                  </p>
                </section>
              </div>
            )}
            {view === "Find legal help" && (
              <>
                <div className="help-intro">
                  <Scale size={32} />
                  <div>
                    <h2>{t("helpIntroTitle", "Information here. Professional judgment there.")}</h2>
                    <p>
                      {t("officialWarning")}
                    </p>
                  </div>
                </div>
                <div className="help-grid">
                  {[
                    [
                      t("legalAidSupport", "Legal aid & support"),
                      "NALSA",
                      t("legalAidDesc", "Learn about legal aid and check eligibility with your legal services authority."),
                      "https://nalsa.gov.in/legal-aid/",
                    ],
                    [
                      t("readTheLaw", "Read the law"),
                      "India Code",
                      t("indiaCodeDesc", "Find official legislation. Check jurisdiction, amendments and effective dates."),
                      "https://indiacode.gov.in/",
                    ],
                    [
                      t("courtInformation", "Court information"),
                      "eCourts Services",
                      t("courtInfoDesc", "Find case status and available court information using your case details."),
                      "https://services.ecourts.gov.in/",
                    ],
                  ].map(([label, title, desc, url]) => (
                    <a
                      className="help-card"
                      key={title}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="small-caps">{label}</span>
                      <h2>
                        {title}
                        <ArrowUpRight size={22} />
                      </h2>
                      <p>{desc}</p>
                      <span className="resource-audience">{t("resourceAudience", "For people checking official information or support options.")}</span>
                      <span className="official-label">
                        {t("officialWebsite", "Official website · verify current details · opens a new tab")} <ExternalLink size={13} />
                      </span>
                    </a>
                  ))}
                </div>
              </>
            )}
            <footer className="footer">
              <ShieldCheck size={16} />
              <p>
                {t("legalInfo")}
                <br />
                <span>
                  {t("localChecksNotice", "*Local checks stay in this tab. Connected AI sends text only with consent. No cloud document storage.")}
                </span>
              </p>
              <button
                onClick={() => {
                  setText("");
                  setName("No document");
                  setDemo(false);
                  setOther("");
                  setChecked([]);
                  setMessages([]);
                  setNotes("");
                  setDraft("");
                  setSelected(null);
                  setView("Workspace");
                  window.speechSynthesis?.cancel();
                  toast.success(t("sessionCleared", "Session document and notes cleared."));
                }}
              >
                <Trash2 size={14} />
                {t("clearSession")}
              </button>
            </footer>
          </main>
        </div>
      </SidebarInset>
      <Dialog open={upload} onOpenChange={setUpload}>
        <DialogContent className="upload-dialog">
          <DialogHeader>
            <DialogTitle>{t("uploadTitle")}</DialogTitle>
            <DialogDescription>
              {t("uploadDialogText", "Paste text or choose TXT / Markdown. Remove sensitive identifiers first. PDF and scanned-image OCR are not yet available.")}
            </DialogDescription>
          </DialogHeader>
          <label className="file-picker">
            <Upload size={23} />
            <strong>{t("chooseText")}</strong>
            <span>{t("fileLimit")}</span>
            <input
              type="file"
              accept=".txt,.md"
              onChange={(e) => void readFile(e.target.files?.[0])}
            />
          </label>
          {uploadStatus === "loading" && <div className="upload-status" role="status"><Loader2 size={17} className="spin" /> {t("loadingDocument")}</div>}
          {uploadStatus === "success" && <div className="upload-status success" role="status"><CheckCircle2 size={17} /> {t("fileReady")}</div>}
          {uploadStatus === "error" && <div className="upload-status error" role="alert">{t("readFailure")}</div>}
          <label>
            {t("documentName")}
            <input
              className="field"
              value={draftName}
              maxLength={100}
              onChange={(e) => setDraftName(e.target.value)}
            />
          </label>
          <label>
            {t("documentText")}
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 50000))}
              placeholder={t("pasteOriginal")}
            />
          </label>
          <p className="small-muted">
            {draft.length.toLocaleString()} / 50,000 characters. Replaces the
            current document; export your existing notes first.
          </p>
          <button className="primary" onClick={save}>
            {t("reviewDocument")} <ArrowRight size={17} />
          </button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <DialogContent className="source-dialog">
          <DialogHeader>
            <DialogTitle>{source?.title}</DialogTitle>
            <DialogDescription>
              {t("checkOriginalWording", "Check the original wording before acting.")}
            </DialogDescription>
          </DialogHeader>
          {source && (
            <>
              <span className="small-caps">
                {source.source} · {t("originalWording", "ORIGINAL WORDING")}
              </span>
              <blockquote>{source.quote}</blockquote>
              <h3>{t("whyLookCloser", "Why look closer?")}</h3>
              <p>{source.explanation}</p>
              <div className="clause-breakdown">
                <div><strong>{t("whatDocumentSays", "What the document says")}</strong><p>{source.quote}</p></div>
                <div><strong>{t("plainLanguageMeaning", "Plain-language meaning")}</strong><p>{source.explanation}</p></div>
                <div><strong>{t("whatToCheck", "What to check")}</strong><p>{t("whatToCheckText", "Look for supporting records, dates, definitions, exceptions, and any related attachments before relying on this wording.")}</p></div>
              </div>
              <div className="source-question">
                <strong>{t("questionWorthAsking", "A question worth asking")}</strong>
                <p>{source.question}</p>
              </div>
              <p className="small-muted">
                {t("sourceDisclaimer", "This explanation is for information only and is not legal advice. Verify important decisions with a qualified professional. Keyword-based topic flag; not a finding of illegality.")}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
