import { Bookmark, ExternalLink, Search, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Card from "../components/Card";
import Button from "../components/Button";
import InputField from "../components/InputField";
import EmptyState from "../components/EmptyState";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { normalizeUrl } from "../utils/helpers";

const categories = ["All", "Courses", "YouTube", "Articles", "Books", "Templates", "LinkedIn Learning"];

export default function ResourcesPage() {
  const { currentUserData, updateResource, addResource, deleteResource } = useAppContext();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Courses");
  const [newType, setNewType] = useState("");

  const items = useMemo(
    () =>
      (currentUserData.resources || []).filter((resource) => {
        const matchesSearch = [resource.title, resource.type, resource.category]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory = category === "All" || resource.category === category;
        return matchesSearch && matchesCategory;
      }),
    [category, currentUserData.resources, search],
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let typeVal = newType.trim();
    if (!typeVal) {
      if (newCategory === "Courses" || newCategory === "LinkedIn Learning") typeVal = "Course";
      else if (newCategory === "YouTube") typeVal = "Playlist/Video";
      else if (newCategory === "Articles") typeVal = "Article";
      else if (newCategory === "Books") typeVal = "Book";
      else if (newCategory === "Templates") typeVal = "Template";
      else typeVal = "Resource";
    }

    addResource({
      title: newTitle.trim(),
      url: normalizeUrl(newUrl),
      category: newCategory,
      type: typeVal,
    });

    setNewTitle("");
    setNewUrl("");
    setNewCategory("Courses");
    setNewType("");
    setShowAddForm(false);
  };

  return (
    <PageShell
      title="Resource Library"
      description="Curate courses, YouTube playlists, articles, books, and templates you actually want to revisit."
      actions={
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Resource
        </Button>
      }
    >
      <Card hover={false}>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-shell pl-11"
              placeholder="Search the library"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {currentUserData.resources.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No resources added"
          description="Save useful learning resources here."
          actionLabel="Add Resource"
          onAction={() => setShowAddForm(true)}
        />
      ) : items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((resource) => (
            <Card key={resource.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                    {resource.category}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-ink dark:text-white">{resource.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{resource.type}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateResource(resource.id, { bookmarked: !resource.bookmarked })}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-400 hover:text-warning"
                    title="Bookmark resource"
                  >
                    <Bookmark className={`h-5 w-5 ${resource.bookmarked ? "fill-warning text-warning" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteResource(resource.id)}
                    className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition"
                    title="Delete resource"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                  Open resource
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No resources match" description="Try a different keyword or category filter." />
      )}

      {/* Add Resource Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-ink dark:text-white">Add New Resource</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Save your favorite courses, playlists, or bookmarks.</p>

              <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
                <InputField
                  label="Title"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Coursera PM Foundations"
                />

                <InputField
                  label="URL"
                  required
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="e.g. https://coursera.org/..."
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Courses">Courses</option>
                    <option value="LinkedIn Learning">LinkedIn Learning</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Articles">Articles</option>
                    <option value="Books">Books</option>
                    <option value="Templates">Templates</option>
                  </select>
                </div>

                <InputField
                  label="Type (Optional)"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="e.g. Playlist, PDF, Book (Auto-derived if empty)"
                />

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Resource
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
