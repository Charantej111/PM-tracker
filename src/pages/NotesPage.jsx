import { Bold, Italic, List, Save, Search, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, Component } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import InputField from "../components/InputField";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { parseTags } from "../utils/helpers";

const exec = (command) => {
  try {
    document.execCommand(command, false);
  } catch (err) {
    console.error("Format command failed:", err);
  }
};

class NotesErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Notes Page crash captured by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageShell
          title="Notes"
          description="Keep rich-text thinking, story banks, frameworks, and interview prep notes in one searchable workspace."
        >
          <Card hover={false} className="p-8 text-center border-red-200 bg-red-50/50 dark:bg-red-950/10">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Notes Section Error</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              An error occurred while rendering the notes workspace.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 overflow-auto rounded-xl bg-slate-900 p-3 text-left text-xs text-red-300">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Reload Notes
            </button>
          </Card>
        </PageShell>
      );
    }
    return this.props.children;
  }
}

function NotesPageContent() {
  const { currentUserData, saveNote, deleteNote } = useAppContext();
  const [search, setSearch] = useState("");

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const [selectedId, setSelectedId] = useState(currentUserData.notes?.[0]?.id || null);
  const editorRef = useRef(null);

  const selectedNote = useMemo(() => {
    return (currentUserData.notes || []).find((note) => note.id === selectedId) || null;
  }, [currentUserData.notes, selectedId]);

  const [draft, setDraft] = useState({ title: "", content: "<p></p>", tags: [], favorite: false });
  const [tagsInput, setTagsInput] = useState("");

  // Sync draft state and editor element when selectedNote changes (switching notes)
  useEffect(() => {
    if (selectedNote) {
      setDraft({
        id: selectedNote.id,
        title: selectedNote.title || "",
        content: selectedNote.content || "<p></p>",
        tags: selectedNote.tags || [],
        favorite: selectedNote.favorite || false,
      });
      setTagsInput(selectedNote.tags ? selectedNote.tags.join(", ") : "");
      
      // Update editor element ref directly to avoid react re-render cursor issues
      if (editorRef.current) {
        editorRef.current.innerHTML = selectedNote.content || "<p></p>";
      }
    } else {
      setDraft({ title: "", content: "<p>Start writing...</p>", tags: [], favorite: false });
      setTagsInput("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "<p>Start writing...</p>";
      }
    }
  }, [selectedId, selectedNote]);

  const filteredNotes = useMemo(
    () =>
      (currentUserData.notes || []).filter((note) =>
        [note.title, (note.tags || []).join(" "), note.content]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [currentUserData.notes, search],
  );

  const handleSave = () => {
    try {
      if (!editorRef.current) {
        throw new Error("Notes editor component is not fully loaded yet.");
      }
      
      const htmlContent = editorRef.current.innerHTML;
      const noteToSave = {
        ...draft,
        content: htmlContent,
        tags: parseTags(tagsInput),
      };

      const saved = saveNote(noteToSave);
      if (saved && !draft.id) {
        setSelectedId(saved.id);
      }
    } catch (error) {
      console.error("Save Note Error:", error);
    }
  };

  const handleDelete = (noteId) => {
    try {
      deleteNote(noteId);
      const remaining = (currentUserData.notes || []).filter((n) => n.id !== noteId);
      setSelectedId(remaining[0]?.id || null);
    } catch (error) {
      console.error("Delete Note Error:", error);
    }
  };

  return (
    <PageShell
      title="Notes"
      description="Keep rich-text thinking, story banks, frameworks, and interview prep notes in one searchable workspace."
      actions={
        <Button
          variant="secondary"
          onClick={() => {
            setSelectedId(null);
            setDraft({ title: "", content: "<p>Start writing...</p>", tags: [], favorite: false });
            setTagsInput("");
            if (editorRef.current) {
              editorRef.current.innerHTML = "<p>Start writing...</p>";
            }
          }}
        >
          New note
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <Card hover={false}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes, tags, keywords"
              className="input-shell pl-11"
            />
          </div>
          <div className="mt-5 space-y-3">
            {filteredNotes.length ? (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    selectedId === note.id
                      ? "border-accent/25 bg-accent-soft/10"
                      : "border-slate-200/80 hover:border-accent/15 dark:border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink dark:text-white leading-tight">{note.title || "Untitled"}</div>
                      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {(note.tags || []).map((tag) => `#${tag}`).join(" ")}
                      </div>
                    </div>
                    {note.favorite ? <Star className="h-4 w-4 fill-warning text-warning shrink-0" /> : null}
                  </div>
                </button>
              ))
            ) : (
              <EmptyState title="No notes yet" description="Create your first PM note to build a reusable thinking system." />
            )}
          </div>
        </Card>

        <Card hover={false}>
          <div className="space-y-4">
            <InputField
              label="Title"
              value={draft.title}
              onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
              placeholder="Write a strong note title"
            />
            <InputField
              label="Tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="pm, metrics, interview"
            />
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-slate-950">
              <button type="button" onClick={() => exec("bold")} className="rounded-xl p-2 hover:bg-white dark:hover:bg-white/10 transition">
                <Bold className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => exec("italic")} className="rounded-xl p-2 hover:bg-white dark:hover:bg-white/10 transition">
                <Italic className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => exec("insertUnorderedList")} className="rounded-xl p-2 hover:bg-white dark:hover:bg-white/10 transition">
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDraft((previous) => ({ ...previous, favorite: !previous.favorite }))}
                className={`rounded-xl p-2 transition ${draft.favorite ? "bg-warning/15 text-warning" : "hover:bg-white dark:hover:bg-white/10"}`}
              >
                <Star className={`h-4 w-4 ${draft.favorite ? "fill-warning" : ""}`} />
              </button>
            </div>
            
            <div
              key={selectedId || "new"}
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[320px] rounded-[28px] border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 outline-none focus:border-accent/25 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save note
              </Button>
              {draft.id ? (
                <Button variant="ghost" onClick={() => handleDelete(draft.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

export default function NotesPage() {
  return (
    <NotesErrorBoundary>
      <NotesPageContent />
    </NotesErrorBoundary>
  );
}
