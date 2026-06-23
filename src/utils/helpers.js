import clsx from "clsx";

export const cn = (...inputs) => clsx(inputs);

export const formatDate = (dateLike, options = {}) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: options.includeYear === false ? undefined : "numeric",
    ...options,
  }).format(new Date(dateLike));

export const formatShortDate = (dateLike) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateLike));

export const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getTodayKey = () => formatDateKey(new Date());

export const getMonthLabel = (date = new Date()) =>
  new Intl.DateTimeFormat("en-IN", { month: "long" }).format(date);

export const percent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

export const average = (values) => {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export const daysUntil = (dateLike) => {
  const start = new Date(getTodayKey());
  const end = new Date(dateLike);
  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
};

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const levelOrder = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

export const downloadTextFile = (filename, text, mime = "application/json") => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const parseTags = (value) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const generateId = (prefix) => `${prefix}-${crypto.randomUUID()}`;
