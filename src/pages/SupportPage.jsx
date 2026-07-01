import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { db } from "../lib/db";
import { supabase } from "../lib/supabaseClient";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { DEVELOPER_CONFIG } from "../utils/config";
import {
  LifeBuoy,
  HelpCircle,
  Bug,
  Lightbulb,
  History,
  Info,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Search,
  Trash2,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  MessageSquare,
  Bot,
  RefreshCcw,
  Sparkles,
  Lock,
  Tag,
  Cpu,
  Layers,
  Calendar,
  User
} from "lucide-react";

// FAQ database
const faqs = [
  {
    category: "Planner Questions",
    q: "How does the four-block planner layout work?",
    a: "The daily planner divides your day into four blocks designed around PM skill acquisition: Focus (deep study/work), Build (hands-on project development), Learn (roadmap progression), and Review (reflection)."
  },
  {
    category: "Planner Questions",
    q: "Are my daily tasks deleted at the end of the day?",
    a: "No! Tasks are archived, and you can view past tasks using the Calendar page or by looking back at weekly performance metrics."
  },
  {
    category: "Roadmap Questions",
    q: "Can I customize the learning topics in the Roadmap?",
    a: "Yes! The roadmap supports reordering topics via drag-and-drop, and you can add custom topics or milestones directly within each block."
  },
  {
    category: "Report Questions",
    q: "How is my PM readiness score calculated?",
    a: "Your PM readiness score is dynamically calculated based on completed roadmap topics, project milestones, completed learning hours, and portfolio assets like your resume and portfolio site."
  },
  {
    category: "Report Questions",
    q: "Can I export my performance reports?",
    a: "Yes! The Reports page features a dynamic 'Export PDF' utility which packages your stats, charts, and skills radar chart into a clean PDF printout."
  },
  {
    category: "General Questions",
    q: "How do I sync my data to a new device?",
    a: "Under Settings > Data Controls, you can click 'Export data as JSON' to download your progress data. Simply upload this file on your other device using the 'Import data' control."
  },
  {
    category: "General Questions",
    q: "Is my data secure on Career OS?",
    a: "Absolutely. All tables are protected by PostgreSQL Row Level Security (RLS) policies, meaning your data is visible and editable strictly by your authenticated account."
  }
];

export default function SupportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { currentUserData, showToast } = useAppContext();

  const isAuthWorkspace = location.pathname.startsWith("/app");

  // Local state
  const [activeTab, setActiveTab] = useState("submit"); // 'submit' | 'tickets' | 'faq' | 'about' | 'ai'
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Form states
  const [form, setForm] = useState({
    name: user?.email ? user.email.split("@")[0] : "",
    email: user?.email || "",
    category: "General Question",
    priority: "normal",
    subject: "",
    message: "",
    // Bug-specific
    whatHappened: "",
    expected: "",
    steps: "",
    // Feature-specific
    ideaTitle: "",
    featureBenefit: "",
    // Spam protection honeypot
    website: "",
    consentDiagnostics: true,
  });

  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [spamCooldown, setSpamCooldown] = useState(0);

  // Tickets tracking
  const [ticketsList, setTicketsList] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [signedUrls, setSignedUrls] = useState({});

  // Admin dashboard states
  const [adminTicketsList, setAdminTicketsList] = useState([]);
  const [loadingAdminTickets, setLoadingAdminTickets] = useState(false);
  const [selectedAdminTicket, setSelectedAdminTicket] = useState(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminPriorityFilter, setAdminPriorityFilter] = useState("all");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("all");
  const [adminSignedUrl, setAdminSignedUrl] = useState(null);

  // Admin edit form states
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [isSavingAdminChanges, setIsSavingAdminChanges] = useState(false);

  const isAdmin = !authLoading && profile?.role === "admin";

  // AI Assistant Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  const fileInputRef = useRef(null);

  // Sync profile details if logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: currentUserData?.name || user.email.split("@")[0],
        email: user.email,
      }));
    }
  }, [user, currentUserData]);

  // Load user tickets & setup realtime subscription
  useEffect(() => {
    if (!user) return;

    if (activeTab === "tickets") {
      fetchUserTickets(true);

      const channel = supabase
        .channel(`support_tickets_user_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_tickets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[Support] Realtime user update:", payload);
            fetchUserTickets(false);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else if (activeTab === "admin") {
      fetchAdminTickets(true);

      const channel = supabase
        .channel("support_tickets_admin_all")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_tickets",
          },
          (payload) => {
            console.log("[Support] Realtime admin update:", payload);
            fetchAdminTickets(false);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeTab]);

  // Check URL queries for specific tabs (e.g. /support?tab=faq)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["submit", "tickets", "faq", "about", "ai", "admin"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Sync edit form and attachment when selected admin ticket changes
  useEffect(() => {
    setAdminSignedUrl(null);
    if (selectedAdminTicket && selectedAdminTicket.attachment_url) {
      db.supportTickets.getAttachmentSignedUrl(selectedAdminTicket.attachment_url)
        .then((url) => setAdminSignedUrl(url))
        .catch((err) => console.error("Error getting admin signed URL:", err));
    }
    if (selectedAdminTicket) {
      setEditStatus(selectedAdminTicket.status || "open");
      setEditPriority(selectedAdminTicket.priority || "normal");
      setEditAssignee(selectedAdminTicket.assigned_to || "");
      setEditInternalNotes(selectedAdminTicket.internal_notes || "");
    }
  }, [selectedAdminTicket]);

  // Cooldown countdown timer
  useEffect(() => {
    const lastSubmitTime = localStorage.getItem("pm-last-support-submit");
    if (lastSubmitTime) {
      const elapsed = Date.now() - parseInt(lastSubmitTime, 10);
      const remaining = Math.max(0, 30 - Math.floor(elapsed / 1000));
      if (remaining > 0) {
        setSpamCooldown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (spamCooldown > 0) {
      const timer = setTimeout(() => setSpamCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [spamCooldown]);

  const fetchUserTickets = async (showLoading = true) => {
    if (showLoading) setLoadingTickets(true);
    try {
      const tickets = await db.supportTickets.getTickets();
      setTicketsList(tickets);
      setSelectedTicket((prev) => {
        if (!prev) return null;
        return tickets.find((t) => t.id === prev.id) || prev;
      });
    } catch (err) {
      showToast("Error loading tickets", err.message, "error");
    } finally {
      if (showLoading) setLoadingTickets(false);
    }
  };

  const fetchAdminTickets = async (showLoading = true) => {
    if (showLoading) setLoadingAdminTickets(true);
    try {
      const tickets = await db.supportTickets.getAllTickets();
      setAdminTicketsList(tickets);
      setSelectedAdminTicket((prev) => {
        if (!prev) return null;
        return tickets.find((t) => t.id === prev.id) || prev;
      });
    } catch (err) {
      showToast("Error loading admin tickets", err.message, "error");
    } finally {
      if (showLoading) setLoadingAdminTickets(false);
    }
  };

  const handleSaveAdminChanges = async () => {
    if (!selectedAdminTicket) return;
    setIsSavingAdminChanges(true);
    try {
      const updates = {
        status: editStatus,
        priority: editPriority,
        assigned_to: editAssignee ? editAssignee.trim() : null,
        internal_notes: editInternalNotes,
      };

      if (editStatus === "resolved") {
        updates.resolved_at = selectedAdminTicket.resolved_at || new Date().toISOString();
      } else {
        updates.resolved_at = null;
      }

      if (editStatus === "closed") {
        updates.closed_at = selectedAdminTicket.closed_at || new Date().toISOString();
      } else {
        updates.closed_at = null;
      }

      const updated = await db.supportTickets.updateTicketAdmin(selectedAdminTicket.id, updates);
      showToast("Changes saved successfully", `Ticket ${updated.ticket_code} has been updated.`, "success");
      
      // Update local states
      setSelectedAdminTicket(updated);
      await fetchAdminTickets(false);
    } catch (err) {
      showToast("Error saving changes", err.message, "error");
    } finally {
      setIsSavingAdminChanges(false);
    }
  };

  // Compile system diagnostics
  const getSystemDiagnostics = () => {
    let browser = "Unknown Browser";
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    let os = "Unknown OS";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Macintosh")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return {
      browser,
      os,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      route: location.pathname,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      career: currentUserData?.targetRole || currentUserData?.careerGoal || "Associate Product Manager",
      appVersion: "1.0.0",
      timestamp: new Date().toISOString(),
    };
  };

  // Handle file screenshot attachment
  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File too large", "Screenshots must be under 5MB.", "error");
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Ticket submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Honeypot check
    if (form.website) {
      // Pretend to succeed but silently reject spam bots
      setSubmitSuccess({ ticket_code: "COS-SPAMBLOCK" });
      return;
    }

    // 2. Cooldown check
    if (spamCooldown > 0) {
      showToast("Please wait", `Please wait ${spamCooldown}s before submitting another request.`, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Consolidate messages
      let messageContent = form.message;
      if (form.category === "Bug Report") {
        messageContent = `**WHAT HAPPENED:**\n${form.whatHappened}\n\n**EXPECTED RESULT:**\n${form.expected}\n\n**STEPS TO REPRODUCE:**\n${form.steps}`;
      } else if (form.category === "Feature Request") {
        messageContent = `**IDEA TITLE:**\n${form.ideaTitle}\n\n**DESCRIPTION:**\n${form.message}\n\n**BENEFIT:**\n${form.featureBenefit}`;
      }

      const ticketPayload = {
        name: form.name,
        email: form.email,
        category: form.category,
        priority: form.priority,
        subject: form.category === "Feature Request" ? form.ideaTitle : form.subject,
        message: messageContent,
        metadata: getSystemDiagnostics(),
      };

      // Create initial DB record
      const createdTicket = await db.supportTickets.createTicket(ticketPayload);
      showToast("Ticket created", "Support ticket submitted successfully.", "success");

      // Upload screenshot if present
      if (screenshot && createdTicket.id) {
        try {
          await db.supportTickets.uploadScreenshot(createdTicket.id, screenshot);
        } catch (uploadErr) {
          console.error("Screenshot upload failed:", uploadErr);
          showToast("Upload failed", "Ticket created, but screenshot upload failed.", "error");
        }
      }

      // Invoke Edge Function to send confirmation + admin notification emails
      let emailFailed = false;
      try {
        const { data: emailData, error: emailInvokeErr } = await supabase.functions.invoke("send-support-email", {
          body: { ticketId: createdTicket.id },
        });

        if (emailInvokeErr) {
          console.error("[Support] Email function invocation error:", emailInvokeErr.message);
          emailFailed = true;
        } else {
          console.log("[Support] Email result:", emailData);
          if (emailData && !emailData.userEmailSent && !emailData.skipped) {
            emailFailed = true;
          }
        }
      } catch (emailErr) {
        console.error("[Support] Email send unexpected error:", emailErr);
        emailFailed = true;
      }

      if (emailFailed) {
        showToast(
          "Delivery Warning",
          "Your ticket has been received successfully, but we couldn't deliver the confirmation email.",
          "warning"
        );
      }

      // Success
      setSubmitSuccess(createdTicket);

      // Reset form fields
      setForm((prev) => ({
        ...prev,
        subject: "",
        message: "",
        whatHappened: "",
        expected: "",
        steps: "",
        ideaTitle: "",
        featureBenefit: "",
      }));
      removeScreenshot();

      // Set cooldown
      localStorage.setItem("pm-last-support-submit", String(Date.now()));
      setSpamCooldown(30);

    } catch (err) {
      showToast("Submission Error", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate private signed URLs for attachment view
  const handleViewAttachment = async (path) => {
    if (signedUrls[path]) {
      window.open(signedUrls[path], "_blank");
      return;
    }

    try {
      const url = await db.supportTickets.getAttachmentSignedUrl(path);
      setSignedUrls((prev) => ({ ...prev, [path]: url }));
      window.open(url, "_blank");
    } catch (err) {
      showToast("Access Error", "Could not verify signed permission to open attachment.", "error");
    }
  };

  // Helper to format simple markdown (bold and bullets) in chat
  const formatMessageText = (text) => {
    if (!text) return "";
    // Format line breaks
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      // Bold rendering: parse **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedParts = parts.map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIdx} className="font-semibold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <div key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
          {formattedParts}
        </div>
      );
    });
  };

  // Prefill contact support form from conversation context
  const handleEscalateToTicket = (botMessage) => {
    // Find last user message
    const lastUserMsg = [...chatMessages]
      .reverse()
      .find((m) => m.sender === "user")?.text || "AI Assistant Escalation";

    // Prefill form values
    setForm((prev) => ({
      ...prev,
      category: "Other",
      subject: lastUserMsg.length > 50 ? `${lastUserMsg.slice(0, 47)}...` : lastUserMsg,
      message: `--- ESCALATED FROM AI ASSISTANT ---\n\nUSER QUESTION:\n${lastUserMsg}\n\nCOPOLIT RESPONSE:\n${botMessage}\n\n---\nAdditional notes:\n`,
    }));

    // Redirect to submit ticket tab
    setActiveTab("submit");
    showToast("Form Prefilled", "Support ticket form prefilled with your query details.", "info");
  };

  // AI Assistant Chat Logic (LLM Endpoint + Offline Fallback)
  const handleSendAiMessage = async (forcedMsg = null) => {
    const msgToSend = (forcedMsg || chatInput).trim();
    if (!msgToSend) return;

    // Append user message
    setChatMessages((prev) => [...prev, { sender: "user", text: msgToSend }]);
    if (!forcedMsg) setChatInput("");
    setAiTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke("support-ai", {
        body: {
          message: msgToSend,
          history: chatMessages,
        },
      });

      if (error) throw error;

      if (data) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.text,
            shouldEscalate: data.shouldEscalate,
          },
        ]);
      }
    } catch (err) {
      console.warn("AI Assistant Edge Function call failed/offline. Using offline logic.", err);
      
      // Smart local fallback
      const lower = msgToSend.toLowerCase();
      let text = "I'm here to help with PM Career OS. For detailed troubleshooting or account issues, we recommend submitting a support ticket so our engineering team can check logs directly.";
      let shouldEscalate = true;

      if (lower.includes("sync") || lower.includes("export") || lower.includes("import")) {
        text = "To sync your PM Career OS data, head over to **Settings > Data Controls** to export your profile as a JSON file, and import it into your other device.";
        shouldEscalate = false;
      } else if (lower.includes("offline") || lower.includes("internet")) {
        text = "PM Career OS features a local-first database architecture. All planner and roadmap updates are stored instantly in local storage, and sync to Supabase once you reconnect.";
        shouldEscalate = false;
      } else if (lower.includes("security") || lower.includes("private") || lower.includes("safe")) {
        text = "Yes, security is a priority. All database tables utilize Row Level Security (RLS), meaning each user is strictly isolated and only you can read or edit your own records.";
        shouldEscalate = false;
      } else if (lower.includes("readiness") || lower.includes("score") || lower.includes("report")) {
        text = "Your **PM Readiness Score** updates dynamically on the Reports dashboard based on completed learning log hours, roadmap tasks, portfolio milestones, and finished project deliverables.";
        shouldEscalate = false;
      } else if (lower.includes("portfolio") || lower.includes("goals")) {
        text = "Portfolio goals track your career milestones, mock interviews, and application targets. You can add, edit, or check them off directly on the **Portfolio Goals** tab.";
        shouldEscalate = false;
      } else if (lower.includes("roadmap") || lower.includes("reset")) {
        text = "Roadmap resets or modifications can be managed directly on the **Roadmap** view. If you are experiencing sync anomalies with your branches, please let us know by raising a support ticket.";
        shouldEscalate = true;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text, shouldEscalate },
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Layout selection
  const renderHeader = () => {
    if (isAuthWorkspace) return null; // wrapped in AppLayout/PageShell
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-[18px] h-[18px]" />
            </div>
            <span className="text-base font-black tracking-tight text-slate-800 dark:text-white">Career OS Support</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2 transition-colors">
              Return Home
            </Link>
            <Link to="/login" className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </header>
    );
  };

  const renderTabs = () => {
    return (
      <div className="flex flex-wrap gap-2 rounded-3xl bg-slate-100 dark:bg-slate-900 p-1.5 mb-6">
        <button
          onClick={() => { setActiveTab("submit"); setSubmitSuccess(null); }}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "submit"
              ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-soft"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          Contact Support
        </button>
        {user && (
          <button
            onClick={() => { setActiveTab("tickets"); setSubmitSuccess(null); }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
              activeTab === "tickets"
                ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-soft"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            My Tickets
          </button>
        )}
        <button
          onClick={() => { setActiveTab("ai"); setSubmitSuccess(null); }}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "ai"
              ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-soft"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Bot className="w-4 h-4 text-sky-500" />
          AI Assistant
        </button>
        <button
          onClick={() => { setActiveTab("faq"); setSubmitSuccess(null); }}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "faq"
              ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-soft"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          FAQs
        </button>
        <button
          onClick={() => { setActiveTab("about"); setSubmitSuccess(null); }}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === "about"
              ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-soft"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Info className="w-4 h-4" />
          About Career OS
        </button>
        {isAdmin && (
          <button
            onClick={() => { setActiveTab("admin"); setSubmitSuccess(null); }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
              activeTab === "admin"
                ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-soft"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-500" />
            Admin Dashboard
          </button>
        )}
      </div>
    );
  };

  const renderSuccessScreen = () => {
    if (!submitSuccess) return null;
    return (
      <Card hover={false} className="text-center p-8 max-w-xl mx-auto border border-emerald-500/25 dark:border-emerald-500/10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Request Submitted
        </h2>
        <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 inline-block">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] leading-none mb-1">
            Ticket Reference
          </p>
          <p className="font-mono text-lg font-black text-slate-800 dark:text-white">
            {submitSuccess.ticket_code || "COS-000000"}
          </p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          We have logged your issue. A confirmation email has been dispatched. Our team will review this shortly.
        </p>
        <div className="mt-4 p-3 rounded-xl bg-blue-500/5 text-[11px] font-bold text-accent inline-block">
          Estimated response: 24 to 48 hours
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <Button
              onClick={() => {
                setActiveTab("tickets");
                setSubmitSuccess(null);
              }}
            >
              View Ticket History
            </Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={() => {
              if (isAuthWorkspace) {
                navigate("/app/dashboard");
              } else {
                navigate("/");
              }
            }}
          >
            Return Home
          </Button>
          <button
            onClick={() => setSubmitSuccess(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition px-4 py-2"
          >
            Submit Another Request
          </button>
        </div>
      </Card>
    );
  };

  const renderFormTab = () => {
    if (submitSuccess) return renderSuccessScreen();

    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Main form */}
        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            Submit a Support Request
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">
            Select a request type below to customize your submission inputs.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot field (hidden from screen reader and human sight) */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Sub-form type selector */}
            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-2">
                I want to:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "General Question", label: "Ask Question", icon: HelpCircle },
                  { key: "Bug Report", label: "Report Bug", icon: Bug },
                  { key: "Feature Request", label: "Request Feature", icon: Lightbulb },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const active = form.category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, category: cat.key }))}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all duration-200 ${
                        active
                          ? "border-accent bg-accent/5 text-accent dark:border-accent dark:bg-accent/10"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic category list dropdown */}
            {form.category === "General Question" && (
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="input-shell select-shell rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="General Question">General Question</option>
                  <option value="Login & Account">Login & Account</option>
                  <option value="Data Issue">Data Issue</option>
                  <option value="Planner Issue">Planner Issue</option>
                  <option value="Reports Issue">Reports Issue</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            )}

            {/* Sender Identity (requires inputs if public guest) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Your Name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
                required
                disabled={!!user}
              />
              <InputField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email for reply"
                required
                disabled={!!user}
              />
            </div>

            {/* Priority selection (low, normal, high, critical) */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Priority Level</span>
              <div className="flex gap-2">
                {["low", "normal", "high", "critical"].map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, priority: prio }))}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition ${
                      form.priority === prio
                        ? "border-accent bg-accent text-white"
                        : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400"
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </label>

            {/* Dynamic layout inputs */}
            {form.category === "Bug Report" ? (
              <div className="space-y-4">
                <InputField
                  label="Subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Short summary of the bug (e.g. Planner reorder fails)"
                  required
                />
                <InputField
                  label="What happened?"
                  as="textarea"
                  value={form.whatHappened}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatHappened: e.target.value }))}
                  placeholder="Describe what occurred when you hit the bug..."
                  className="min-h-[100px] py-3.5"
                  required
                />
                <InputField
                  label="Expected result?"
                  as="textarea"
                  value={form.expected}
                  onChange={(e) => setForm((prev) => ({ ...prev, expected: e.target.value }))}
                  placeholder="What was supposed to happen instead..."
                  className="min-h-[80px] py-3.5"
                  required
                />
                <InputField
                  label="Steps to reproduce?"
                  as="textarea"
                  value={form.steps}
                  onChange={(e) => setForm((prev) => ({ ...prev, steps: e.target.value }))}
                  placeholder="1. Open Planner\n2. Drag item top to bottom\n3. Observe error toast..."
                  className="min-h-[100px] py-3.5"
                  required
                />
              </div>
            ) : form.category === "Feature Request" ? (
              <div className="space-y-4">
                <InputField
                  label="Feature Title / Idea Name"
                  type="text"
                  value={form.ideaTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, ideaTitle: e.target.value }))}
                  placeholder="What is your suggestion (e.g. AI-generated daily notes summary)"
                  required
                />
                <InputField
                  label="Description / Suggestion details"
                  as="textarea"
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Provide complete details about how this feature should work..."
                  className="min-h-[140px] py-3.5"
                  required
                />
                <InputField
                  label="How will this benefit your career OS flow?"
                  as="textarea"
                  value={form.featureBenefit}
                  onChange={(e) => setForm((prev) => ({ ...prev, featureBenefit: e.target.value }))}
                  placeholder="Explain why this feature is valuable and what problem it solves for you..."
                  className="min-h-[100px] py-3.5"
                  required
                />
              </div>
            ) : (
              <div className="space-y-4">
                <InputField
                  label="Subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Topic of your request"
                  required
                />
                <InputField
                  label="Detailed Message"
                  as="textarea"
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your request details here..."
                  className="min-h-[160px] py-3.5"
                  required
                />
              </div>
            )}

            {/* Screenshot attachment */}
            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-2">
                Attach Screenshot (Optional)
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="screenshot-file"
                />
                <label
                  htmlFor="screenshot-file"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  <Paperclip className="w-4 h-4" />
                  Select File
                </label>

                {screenshotPreview && (
                  <div className="relative flex items-center gap-2 p-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900">
                    <img
                      src={screenshotPreview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-xl"
                    />
                    <div className="text-[10px] leading-tight max-w-[120px] truncate">
                      {screenshot?.name}
                    </div>
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition"
                      aria-label="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting || spamCooldown > 0}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Request...
                  </span>
                ) : spamCooldown > 0 ? (
                  `Cooldown (${spamCooldown}s)`
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Support Sidebar Overview & Info Cards */}
        <div className="space-y-4">
          {/* Need Help? Card */}
          <Card hover={false} className="p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              SUPPORT OVERVIEW
            </h3>
            <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              Need Help?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Submit your request and our team will get to work. Here is what happens after you click send:
            </p>
            
            {/* Steps Timeline */}
            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Ticket Logged</h5>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                    You will receive an automated confirmation email containing a unique reference code.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Investigation</h5>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                    A developer reviews your submission details, steps to reproduce, and silent diagnostic metadata.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Resolution</h5>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                    We deploy a hotfix or follow up directly with you via your email address.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Support SLAs Card */}
          <Card hover={false} className="p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
              RESPONSE SLA
            </h3>
            <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              Expected Turnaround
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              We monitor submissions daily and prioritize critical software bugs:
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-950/20">
                <div className="flex items-center gap-2">
                  <span className="text-base">🐞</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Bugs</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 uppercase tracking-wider">
                  12–24 Hours
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/20">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Feature Requests</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 uppercase tracking-wider">
                  24–48 Hours
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-base">❓</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">General Questions</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 uppercase tracking-wider">
                  1–2 Biz Days
                </span>
              </div>
            </div>
          </Card>

          {/* Privacy Notice Card */}
          <div className="rounded-3xl border border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white leading-none">Privacy Guarantee</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal mt-1.5">
                  Screenshots and technical diagnostics are only used to investigate your issue and improve Career OS. They are never shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTicketsTab = () => {
    const statuses = {
      open: { label: "Open", color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20" },
      under_review: { label: "Under Review", color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20" },
      developer_response: { label: "Developer Response", color: "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20" },
      resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" },
      closed: { label: "Closed", color: "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20" },
    };

    const progressSteps = ["Opened", "Under Review", "Developer Response", "Resolved", "Closed"];

    const getTimelineIndex = (status) => {
      if (status === "open") return 0;
      if (status === "under_review") return 1;
      if (status === "developer_response") return 2;
      if (status === "resolved") return 3;
      if (status === "closed") return 4;
      return 0;
    };

    return (
      <Card hover={false}>
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              My Support Tickets
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Review progression and timeline details of past support submissions.
            </p>
          </div>
          <button
            onClick={() => fetchUserTickets(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Refresh tickets list"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        {loadingTickets ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : ticketsList.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Tickets Yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-1 leading-normal">
              Any support requests or feature ideas submitted with your account will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ticketsList.map((ticket) => {
              const isOpen = selectedTicket?.id === ticket.id;
              const statusCfg = statuses[ticket.status] || statuses.open;
              const currentStepIdx = getTimelineIndex(ticket.status);

              return (
                <div
                   key={ticket.id}
                  className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden"
                >
                  {/* Summary bar click */}
                  <button
                    onClick={() => setSelectedTicket(isOpen ? null : ticket)}
                    className="w-full flex items-center justify-between p-4 text-left transition hover:bg-slate-100/30 dark:hover:bg-white/5 focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                        {ticket.ticket_code}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {ticket.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Open details drawer */}
                  {isOpen && (
                    <div className="p-4 border-t border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-950/40 space-y-4">
                      {/* Message body */}
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block mb-1">
                          Submission Details
                        </span>
                        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 rounded-xl p-3.5">
                          {ticket.message}
                        </div>
                      </div>

                      {/* Attachment if present */}
                      {ticket.attachment_url && (
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block mb-1">
                            Screenshot Attachment
                          </span>
                          <button
                            onClick={() => handleViewAttachment(ticket.attachment_url)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Attached Screenshot
                          </button>
                        </div>
                      )}

                      {/* Visual progression timeline */}
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block mb-3">
                          Ticket Timeline
                        </span>
                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 px-2">
                          {/* Left boundary line connecting nodes */}
                          <div className="absolute top-4 bottom-4 left-[9px] w-[2px] bg-slate-200 dark:bg-slate-800 md:top-[17px] md:bottom-auto md:left-4 md:right-4 md:w-auto md:h-[2px]" />

                          {progressSteps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            let stepTimestamp = null;
                            if (step === "Opened") stepTimestamp = ticket.created_at;
                            else if (step === "Resolved") stepTimestamp = ticket.resolved_at;
                            else if (step === "Closed") stepTimestamp = ticket.closed_at;

                            return (
                              <div key={step} className="relative z-10 flex flex-col md:items-center items-start gap-1">
                                <div className="flex md:flex-col items-center gap-3 md:gap-2">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition ${
                                      isCompleted
                                        ? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500"
                                        : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                    ) : null}
                                  </div>
                                  <span
                                    className={`text-[10px] font-black uppercase tracking-wider ${
                                      isCurrent
                                        ? "text-blue-600 dark:text-blue-400 font-extrabold"
                                        : isCompleted
                                        ? "text-slate-600 dark:text-slate-300 font-semibold"
                                        : "text-slate-400 dark:text-slate-600 font-medium"
                                    }`}
                                  >
                                    {step}
                                  </span>
                                </div>
                                {isCompleted && stepTimestamp && (
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 md:text-center block ml-8 md:ml-0">
                                    {new Date(stepTimestamp).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  };

  const renderAdminTab = () => {
    const statuses = {
      open: { label: "Open", color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20" },
      under_review: { label: "Under Review", color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20" },
      developer_response: { label: "Developer Response", color: "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20" },
      resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" },
      closed: { label: "Closed", color: "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20" },
    };

    const priorities = {
      low: { label: "Low", color: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300" },
      normal: { label: "Normal", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
      high: { label: "High", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
      critical: { label: "Critical", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" },
    };

    const progressSteps = ["Opened", "Under Review", "Developer Response", "Resolved", "Closed"];

    const getTimelineIndex = (status) => {
      if (status === "open") return 0;
      if (status === "under_review") return 1;
      if (status === "developer_response") return 2;
      if (status === "resolved") return 3;
      if (status === "closed") return 4;
      return 0;
    };

    const filteredTickets = adminTicketsList.filter((ticket) => {
      const q = adminSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (ticket.ticket_code && ticket.ticket_code.toLowerCase().includes(q)) ||
        (ticket.subject && ticket.subject.toLowerCase().includes(q)) ||
        (ticket.name && ticket.name.toLowerCase().includes(q)) ||
        (ticket.email && ticket.email.toLowerCase().includes(q)) ||
        (ticket.message && ticket.message.toLowerCase().includes(q));

      const matchesStatus = adminStatusFilter === "all" || ticket.status === adminStatusFilter;
      const matchesPriority = adminPriorityFilter === "all" || ticket.priority === adminPriorityFilter;
      const matchesCategory = adminCategoryFilter === "all" || ticket.category === adminCategoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    const currentStepIdx = selectedAdminTicket ? getTimelineIndex(selectedAdminTicket.status) : 0;

    return (
      <div className="space-y-6">
        {/* Filters Card */}
        <Card hover={false} className="p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200/50 dark:border-white/5 pb-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-500" />
                Support Ticket Control Room
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Centralized system log and control room for administrative operations.
              </p>
            </div>
            <button
              onClick={() => fetchAdminTickets(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-200 text-xs font-bold transition"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Refresh System
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket code, name, msg..."
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Status Select */}
            <div>
              <select
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="developer_response">Developer Response</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <select
                value={adminPriorityFilter}
                onChange={(e) => setAdminPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Category Select */}
            <div>
              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Categories</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Master-Detail Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
          {/* Left Column: Tickets list */}
          <Card hover={false} className="p-4 flex flex-col max-h-[700px] overflow-hidden">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Tickets ({filteredTickets.length})
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingAdminTickets ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No tickets matched filters.
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedAdminTicket?.id === t.id;
                  const st = statuses[t.status] || statuses.open;
                  const pr = priorities[t.priority] || priorities.normal;

                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedAdminTicket(t)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition duration-150 flex flex-col gap-2 ${
                        isSelected
                          ? "bg-slate-100/80 border-slate-300 dark:bg-white/10 dark:border-white/20"
                          : "bg-slate-50/50 border-slate-200/60 hover:bg-slate-100/40 dark:bg-slate-950/10 dark:border-white/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="font-mono text-[10px] font-black text-slate-400">
                          {t.ticket_code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {t.subject}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {t.name} ({t.email})
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${st.color}`}>
                          {st.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${pr.color}`}>
                          {pr.label}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Right Column: Selected ticket details */}
          <Card hover={false} className="p-5 overflow-y-auto max-h-[700px]">
            {selectedAdminTicket ? (
              <div className="space-y-6">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black text-slate-400">
                        {selectedAdminTicket.ticket_code}
                      </span>
                      <span className="text-xs font-bold text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {selectedAdminTicket.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1.5">
                      {selectedAdminTicket.subject}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statuses[selectedAdminTicket.status]?.color || statuses.open.color}`}>
                      {statuses[selectedAdminTicket.status]?.label || "Open"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${priorities[selectedAdminTicket.priority]?.color || priorities.normal.color}`}>
                      {priorities[selectedAdminTicket.priority]?.label || "Normal"}
                    </span>
                  </div>
                </div>

                {/* Submitter details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
                      User Details
                    </span>
                    <div className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedAdminTicket.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedAdminTicket.email}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
                      Database Records
                    </span>
                    <div className="text-slate-500 dark:text-slate-400">
                      ID: <span className="font-mono select-all text-slate-700 dark:text-slate-300">{selectedAdminTicket.id}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      User ID: <span className="font-mono text-slate-700 dark:text-slate-300">{selectedAdminTicket.user_id || "Guest"}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Message Body */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block mb-1.5">
                    Ticket Message
                  </span>
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 rounded-xl p-4">
                    {selectedAdminTicket.message}
                  </div>
                </div>

                {/* Technical Diagnostics */}
                {selectedAdminTicket.metadata && (
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block mb-1.5">
                      Technical Diagnostics
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-white/5 rounded-xl p-3.5 text-[10px]">
                      {Object.entries(selectedAdminTicket.metadata).map(([key, val]) => (
                        <div key={key} className="truncate">
                          <span className="text-slate-400 block font-medium capitalize">{key}:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate block mt-0.5" title={String(val)}>
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screenshot preview */}
                {selectedAdminTicket.attachment_url && (
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block mb-1.5">
                      Screenshot Attachment
                    </span>
                    {adminSignedUrl ? (
                      <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 p-2 overflow-hidden flex flex-col gap-2">
                        <img
                          src={adminSignedUrl}
                          alt="Support attachment screenshot"
                          className="max-h-[300px] w-auto mx-auto rounded-lg object-contain bg-slate-900/10"
                        />
                        <a
                          href={adminSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mx-auto inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Full Image in New Tab
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        Generating secure signed URL...
                      </div>
                    )}
                  </div>
                )}

                {/* Email Delivery Audit logs */}
                <div className="border border-slate-200 dark:border-white/5 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block border-b border-slate-200/50 dark:border-white/5 pb-1.5">
                    Email Dispatch logs (Resend API)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
                    {/* User confirmation status */}
                    <div className="space-y-1">
                      <span className="text-slate-400 font-semibold block">User Confirmation Email:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          selectedAdminTicket.user_email_status === "success"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : selectedAdminTicket.user_email_status === "failed"
                            ? "bg-rose-500/15 text-rose-600"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                        }`}>
                          {selectedAdminTicket.user_email_status || "PENDING / RETRY"}
                        </span>
                      </div>
                      {selectedAdminTicket.user_email_sent_at && (
                        <div className="text-[9px] text-slate-400 mt-1">
                          Sent: {new Date(selectedAdminTicket.user_email_sent_at).toLocaleString()}
                        </div>
                      )}
                      {selectedAdminTicket.user_resend_id && (
                        <div className="text-[9px] text-slate-400 font-mono">
                          ID: {selectedAdminTicket.user_resend_id}
                        </div>
                      )}
                      {selectedAdminTicket.user_email_error && (
                        <div className="text-[9px] text-rose-500 font-medium leading-relaxed bg-rose-500/5 border border-rose-500/10 rounded p-1.5 mt-1 whitespace-pre-wrap">
                          Error: {selectedAdminTicket.user_email_error}
                        </div>
                      )}
                    </div>

                    {/* Admin notification status */}
                    <div className="space-y-1">
                      <span className="text-slate-400 font-semibold block">Admin Notification Email:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          selectedAdminTicket.admin_email_status === "success"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : selectedAdminTicket.admin_email_status === "failed"
                            ? "bg-rose-500/15 text-rose-600"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                        }`}>
                          {selectedAdminTicket.admin_email_status || "PENDING / RETRY"}
                        </span>
                      </div>
                      {selectedAdminTicket.admin_email_sent_at && (
                        <div className="text-[9px] text-slate-400 mt-1">
                          Sent: {new Date(selectedAdminTicket.admin_email_sent_at).toLocaleString()}
                        </div>
                      )}
                      {selectedAdminTicket.admin_resend_id && (
                        <div className="text-[9px] text-slate-400 font-mono">
                          ID: {selectedAdminTicket.admin_resend_id}
                        </div>
                      )}
                      {selectedAdminTicket.admin_email_error && (
                        <div className="text-[9px] text-rose-500 font-medium leading-relaxed bg-rose-500/5 border border-rose-500/10 rounded p-1.5 mt-1 whitespace-pre-wrap">
                          Error: {selectedAdminTicket.admin_email_error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ticket Timeline Status */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block mb-3.5">
                    Ticket Timeline
                  </span>
                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 px-2">
                    <div className="absolute top-4 bottom-4 left-[9px] w-[2px] bg-slate-200 dark:bg-slate-800 md:top-[17px] md:bottom-auto md:left-4 md:right-4 md:w-auto md:h-[2px]" />

                    {progressSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      let stepTimestamp = null;
                      if (step === "Opened") stepTimestamp = selectedAdminTicket.created_at;
                      else if (step === "Resolved") stepTimestamp = selectedAdminTicket.resolved_at;
                      else if (step === "Closed") stepTimestamp = selectedAdminTicket.closed_at;

                      return (
                        <div key={step} className="relative z-10 flex flex-col md:items-center items-start gap-1">
                          <div className="flex md:flex-col items-center gap-3 md:gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition ${
                                isCompleted
                                  ? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500"
                                  : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                              }`}
                            >
                              {isCompleted ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              ) : null}
                            </div>
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider ${
                                isCurrent
                                  ? "text-blue-600 dark:text-blue-400 font-extrabold"
                                  : isCompleted
                                  ? "text-slate-600 dark:text-slate-300 font-semibold"
                                  : "text-slate-400 dark:text-slate-600 font-medium"
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                          {isCompleted && stepTimestamp && (
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 md:text-center block ml-8 md:ml-0">
                              {new Date(stepTimestamp).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Edit operations control */}
                <div className="border border-slate-200 dark:border-white/5 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.1em] block border-b border-slate-200/50 dark:border-white/5 pb-1.5">
                    Update Administrative Fields
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Select edit status */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="open">Open</option>
                        <option value="under_review">Under Review</option>
                        <option value="developer_response">Developer Response</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {/* Select edit priority */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    {/* Assignee Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Assignee (User UUID)</label>
                      <input
                        type="text"
                        placeholder="UUID"
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">Internal Notes</label>
                    <textarea
                      placeholder="Add administrative notes, links to bug logs, resolution comments..."
                      value={editInternalNotes}
                      onChange={(e) => setEditInternalNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit changes button */}
                  <div className="flex justify-end pt-1">
                    <Button
                      onClick={handleSaveAdminChanges}
                      loading={isSavingAdminChanges}
                      className="text-xs font-bold px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition duration-150 active:scale-95"
                    >
                      Save Ticket Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400 dark:text-slate-600 select-none">
                <Cpu className="w-12 h-12 mb-3.5 opacity-30 animate-pulse text-purple-500" />
                <h4 className="text-sm font-bold">No Ticket Selected</h4>
                <p className="text-xs max-w-xs mt-1 leading-normal">
                  Select a ticket from the left panel list to view details, inspect diagnostics, read email delivery logs, and update status variables.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  const renderFaqTab = () => {
    return (
      <Card hover={false}>
        <div className="border-b border-slate-200/50 dark:border-white/5 pb-4 mb-5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Search our knowledge base to solve general setup and usage problems.
          </p>

          {/* FAQ Search */}
          <div className="relative mt-4">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search FAQs (e.g. planner, sync, secure)..."
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
            />
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10">
            <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No matching questions found.</p>
            <button
              onClick={() => setFaqSearch("")}
              className="text-xs font-semibold text-accent mt-1 hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-slate-700 dark:text-slate-200 focus:outline-none hover:bg-slate-100/30 dark:hover:bg-white/5"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-200/40 dark:border-white/5 pt-3 bg-white dark:bg-slate-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  };

  const renderAiTab = () => {
    return (
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card hover={false} className="flex flex-col h-[520px]">
          <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/5 pb-4 mb-4 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white leading-none">
                AI Copilot Support
              </h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Virtual Assistant • Online</span>
            </div>
          </div>
 
          {/* Messages block */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 scrollbar-thin flex flex-col">
            {chatMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none my-auto">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 mb-4 animate-pulse">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">
                  Welcome to Career OS Copilot!
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[320px] mb-6 leading-relaxed">
                  Ask any question about local syncing, reports, offline usage, and PM readiness scores. Click a suggestion below to start.
                </p>
                <div className="grid gap-2 w-full max-w-md">
                  {[
                    "How do I reset my roadmap?",
                    "Why isn't my planner syncing?",
                    "How can I improve my readiness score?",
                    "How do portfolio goals work?"
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendAiMessage(q)}
                      className="text-left px-4 py-3 rounded-2xl border border-slate-200/60 hover:border-sky-500 bg-white hover:bg-sky-500/5 text-xs font-semibold text-slate-600 dark:border-white/5 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-sky-500/10 dark:hover:text-sky-400 transition-all duration-200 active:scale-[0.98]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black ${
                        msg.sender === "user"
                          ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          : "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
                      }`}
                    >
                      {msg.sender === "user" ? "ME" : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-accent text-white rounded-tr-none"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/40 dark:border-white/5"
                      }`}
                    >
                      {msg.sender === "user" ? msg.text : formatMessageText(msg.text)}
                      {msg.shouldEscalate && (
                        <div className="mt-3 border-t border-slate-200/30 dark:border-white/5 pt-2.5 flex justify-end">
                          <button
                            onClick={() => handleEscalateToTicket(msg.text)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm active:scale-95"
                          >
                            <LifeBuoy className="w-3.5 h-3.5" />
                            Submit Support Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {aiTyping && (
                  <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 italic">
                      Copilot is thinking...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
 
          {/* Input field */}
          <div className="flex gap-2 border-t border-slate-200/50 dark:border-white/5 pt-4 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
              placeholder="Ask AI Copilot (e.g. how do I sync my planner?)..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none"
            />
            <Button onClick={() => handleSendAiMessage()} className="px-3.5 py-2.5">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
 
        {/* AI Quick tags sidebar */}
        <div className="space-y-4">
          <Card hover={false}>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Suggested Questions
            </h3>
            <div className="flex flex-col gap-2">
              {[
                "How do I reset my roadmap?",
                "Why isn't my planner syncing?",
                "How can I improve my readiness score?",
                "How do portfolio goals work?"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendAiMessage(q)}
                  className="text-left px-3 py-2.5 rounded-xl border border-slate-200/60 hover:border-sky-500 bg-white hover:bg-sky-500/5 text-xs font-semibold text-slate-600 dark:border-white/5 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-sky-500/10 dark:hover:text-sky-400 transition-all duration-200 active:scale-[0.98]"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderAboutTab = () => {
    const specs = [
      { label: "Version", value: "v1.0.0", icon: Tag },
      { label: "Build", value: "#20260701-01", icon: Cpu },
      { label: "Build Date", value: "July 2026", icon: Calendar },
      { label: "Developer", value: DEVELOPER_CONFIG.name, icon: User },
      { label: "Technology", value: "React, Supabase, TailwindCSS, Framer Motion, Docker", icon: Layers },
      { label: "License", value: "Licensed / Active", icon: Lock }
    ];

    return (
      <Card hover={false} className="max-w-2xl mx-auto p-6 md:p-8">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          About Career OS
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          PM Career OS is a lightweight, local-first workspace designed for modern Product Managers.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-white/[0.04] bg-slate-50/30 dark:bg-slate-900/10 rounded-3xl border border-slate-200/40 dark:border-white/5 p-2">
          {specs.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-4 px-4 text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{stat.label}</span>
                </div>
                <span className="text-slate-800 dark:text-white text-right font-medium max-w-[240px] truncate sm:max-w-none">{stat.value}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href={DEVELOPER_CONFIG.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-50 transition"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="currentColor">
              <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.175-.431.573-.878 1.242-.878.877 0 1.229.665 1.229 1.641v3.858h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
            </svg>
            Contact Developer
          </a>
          <button
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                category: "Bug Report",
                subject: "Security Report Submission",
                whatHappened: "[Please detail the potential security vulnerability here]",
              }));
              setActiveTab("submit");
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/10 text-xs font-bold text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 transition"
          >
            <ShieldAlert className="w-4 h-4" />
            Report Security Issue
          </button>
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "submit":
        return renderFormTab();
      case "tickets":
        return renderTicketsTab();
      case "ai":
        return renderAiTab();
      case "faq":
        return renderFaqTab();
      case "about":
        return renderAboutTab();
      case "admin":
        if (!isAdmin) {
          return (
            <Card hover={false} className="max-w-md mx-auto p-8 text-center border border-rose-500/20 bg-rose-500/5 mt-10">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">403 - Access Denied</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                You do not have administrative permissions to access the Support Control Room.
              </p>
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => setActiveTab("submit")}
                  className="text-xs font-bold px-4 py-2"
                >
                  Return to Safety
                </Button>
              </div>
            </Card>
          );
        }
        return renderAdminTab();
      default:
        return renderFormTab();
    }
  };

  // Authenticated workspace shell wrapper vs Standalone public layout wrapper
  if (isAuthWorkspace) {
    return (
      <PageShell
        title="Help & Support"
        description="Submit bug reports, feature ideas, request support assistance, or consult our system diagnostics."
      >
        {renderTabs()}
        {renderContent()}
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pt-24 pb-12">
      {renderHeader()}
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-800 dark:text-white">
            Support Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Ask questions, submit feature suggestions, or notify us about software bugs. No sign-in required.
          </p>
        </div>
        {renderTabs()}
        {renderContent()}
      </div>
    </div>
  );
}
