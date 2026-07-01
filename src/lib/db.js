import { supabase } from "./supabaseClient";
import { fromDbRows, toMainTopicRow, CATEGORY_SENTINEL } from "./roadmapAdapter";

// Helper to get current authenticated user ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user.id;
};

export const db = {
  projects: {
    async getProjects() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((p) => ({
        id: p.id,
        title: p.name || "",
        notes: p.description || "",
        status: p.status || "To Do",
        progress: p.progress || 0,
        tag: p.tags?.[0] || "",
        deadline: p.deadline || "",
        priority: p.priority || "Medium",
        link: p.link || "",
      }));
    },

    async createProject(project) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: project.title,
          description: project.notes || project.description || "",
          status: project.status || "To Do",
          progress: project.progress || 0,
          tags: project.tag ? [project.tag] : [],
          deadline: project.deadline || null,
          priority: project.priority || "Medium",
          link: project.link || "",
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.name || "",
        notes: data.description || "",
        status: data.status || "To Do",
        progress: data.progress || 0,
        tag: data.tags?.[0] || "",
        deadline: data.deadline || "",
        priority: data.priority || "Medium",
        link: data.link || "",
      };
    },

    async updateProject(id, updates) {
      const userId = await getUserId();
      const payload = {};
      if (updates.title !== undefined) payload.name = updates.title;
      if (updates.notes !== undefined) payload.description = updates.notes;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.progress !== undefined) payload.progress = updates.progress;
      if (updates.tag !== undefined) payload.tags = updates.tag ? [updates.tag] : [];
      if (updates.deadline !== undefined) payload.deadline = updates.deadline || null;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.link !== undefined) payload.link = updates.link;

      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },

    async deleteProject(id) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
  },

  skills: {
    async getSkills() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((s) => ({
        id: s.id,
        name: s.name,
        progress: s.progress || 0,
        focusHours: Number(s.focus_hours || 0),
        level: s.level || "Beginner",
      }));
    },

    async createSkill(skill) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("skills")
        .insert({
          user_id: userId,
          name: skill.name,
          progress: skill.progress || 0,
          focus_hours: skill.focusHours || 0,
          level: skill.level || "Beginner",
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        progress: data.progress || 0,
        focusHours: Number(data.focus_hours || 0),
        level: data.level || "Beginner",
      };
    },

    async updateSkill(id, updates) {
      const userId = await getUserId();
      const payload = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.progress !== undefined) payload.progress = updates.progress;
      if (updates.focusHours !== undefined) payload.focus_hours = updates.focusHours;
      if (updates.level !== undefined) payload.level = updates.level;

      const { error } = await supabase
        .from("skills")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },

    async deleteSkill(id) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("skills")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
  },

  tasks: {
    async getTasks() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((t) => ({
        id: t.id,
        title: t.title || "",
        completed: t.completed || false,
        period: t.period || "morning",
        date: t.date || "",
        due_date: t.due_date || null,
      }));
    },

    async createTask(task) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: task.title,
          completed: task.completed || false,
          period: task.period || "morning",
          date: task.date,
          due_date: task.due_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title || "",
        completed: data.completed || false,
        period: data.period || "morning",
        date: data.date || "",
        due_date: data.due_date || null,
      };
    },

    async updateTask(id, updates) {
      const userId = await getUserId();
      const payload = {};
      if (updates.completed !== undefined) payload.completed = updates.completed;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.period !== undefined) payload.period = updates.period;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.due_date !== undefined) payload.due_date = updates.due_date || null;

      const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },

    async deleteTask(id) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
  },

  notes: {
    async getNotes() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data.map((n) => ({
        id: n.id,
        title: n.title || "",
        content: n.content || "",
        tags: n.tags || [],
        favorite: n.pinned || false,
        color: n.color || "default",
        updatedAt: n.updated_at || new Date().toISOString(),
      }));
    },

    async createNote(note) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: userId,
          title: note.title || "Untitled",
          content: note.content || "",
          tags: note.tags || [],
          pinned: note.pinned || note.favorite || false,
          color: note.color || "default",
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title || "",
        content: data.content || "",
        tags: data.tags || [],
        favorite: data.pinned || false,
        color: data.color || "default",
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    },

    async updateNote(id, updates) {
      const userId = await getUserId();
      const payload = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.content !== undefined) payload.content = updates.content;
      if (updates.tags !== undefined) payload.tags = updates.tags;
      if (updates.pinned !== undefined) payload.pinned = updates.pinned;
      if (updates.favorite !== undefined) payload.pinned = updates.favorite;
      if (updates.color !== undefined) payload.color = updates.color;

      const { error } = await supabase
        .from("notes")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },

    async deleteNote(id) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
  },

  roadmap: {
    async getRoadmapProgress() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("roadmap_progress")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return fromDbRows(data);
    },

    async createMainTopic(name, sortOrder = 0) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("roadmap_progress")
        .insert(toMainTopicRow(userId, name, sortOrder))
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    
    async renameMainTopic(oldCategory, newName) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("roadmap_progress")
        .update({ category: newName, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("category", oldCategory);
        
      if (error) throw error;
    },

    async deleteMainTopic(category) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("roadmap_progress")
        .delete()
        .eq("user_id", userId)
        .eq("category", category);

      if (error) throw error;
    },
    
    async createSubTopic(category, topicId, name, sortOrder = 0, priority = "Medium") {
      const userId = await getUserId();
      const payload = {
        user_id: userId,
        category,
        topic_id: topicId,
        topic_title: name,
        completed: false,
        progress: 0,
        notes: "",
        estimated_hours: null,
        priority: priority,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("roadmap_progress")
        .insert(payload)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },

    async updateSubTopic(category, topicId, updates) {
      const userId = await getUserId();
      const payload = {
        updated_at: new Date().toISOString(),
      };

      if (updates.completed !== undefined) payload.completed = updates.completed;
      if (updates.progress !== undefined) payload.progress = updates.progress;
      if (updates.name !== undefined) payload.topic_title = updates.name;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.estimatedHours !== undefined) payload.estimated_hours = updates.estimatedHours;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

      const { data: existing } = await supabase
        .from("roadmap_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("category", category)
        .eq("topic_id", topicId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("roadmap_progress")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        payload.user_id = userId;
        payload.category = category;
        payload.topic_id = topicId;
        const { error } = await supabase
          .from("roadmap_progress")
          .insert(payload);
        if (error) throw error;
      }
    },

    async deleteSubTopic(category, topicId) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("roadmap_progress")
        .delete()
        .eq("user_id", userId)
        .eq("category", category)
        .eq("topic_id", topicId);

      if (error) throw error;
    },
    
    async reorderTopics(rows) {
      // rows: Array of { id, sort_order }
      // Requires multiple requests or a batch update RPC. Using multiple updates for now
      // since it's a small array.
      const userId = await getUserId();
      for (const row of rows) {
         await supabase
          .from("roadmap_progress")
          .update({ sort_order: row.sort_order })
          .eq("id", row.id)
          .eq("user_id", userId);
      }
    }
  },

  resources: {
    async getResources() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category || "",
        url: r.url || "",
        description: r.description || "",
        type: r.type || "",
        bookmarked: r.bookmarked || false,
        favorite: r.favorite || false,
        completed: r.completed || false,
      }));
    },

    async createResource(resource) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("resources")
        .insert({
          user_id: userId,
          title: resource.title,
          category: resource.category || "",
          url: resource.url || "",
          description: resource.description || "",
          type: resource.type || "",
          bookmarked: resource.bookmarked || false,
          favorite: resource.favorite || false,
          completed: resource.completed || false,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        category: data.category || "",
        url: data.url || "",
        description: data.description || "",
        type: data.type || "",
        bookmarked: data.bookmarked || false,
        favorite: data.favorite || false,
        completed: data.completed || false,
      };
    },

    async updateResource(id, updates) {
      const userId = await getUserId();
      const payload = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.url !== undefined) payload.url = updates.url;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.bookmarked !== undefined) payload.bookmarked = updates.bookmarked;
      if (updates.favorite !== undefined) payload.favorite = updates.favorite;
      if (updates.completed !== undefined) payload.completed = updates.completed;

      const { error } = await supabase
        .from("resources")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },

    async deleteResource(id) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
  },

  reviews: {
    async getReviews() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((r) => ({
        id: r.id,
        date: r.created_at,
        learned: r.wins || "",
        challenge: r.challenges || "",
        improved: r.improvements || "",
        focusNextWeek: r.next_focus || "",
        rating: r.rating || null,
      }));
    },

    async createReview(review) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("weekly_reviews")
        .insert({
          user_id: userId,
          wins: review.learned || "",
          challenges: review.challenge || "",
          improvements: review.improved || "",
          next_focus: review.focusNextWeek || "",
          rating: review.rating || null,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        date: data.created_at,
        learned: data.wins || "",
        challenge: data.challenges || "",
        improved: data.improvements || "",
        focusNextWeek: data.next_focus || "",
        rating: data.rating || null,
      };
    },

    async deleteReview(id) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("weekly_reviews")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
  },

  weeklyGoals: {
    async getWeeklyGoal(weekStart) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("weekly_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        targetHours: data.target_hours,
        currentHours: data.current_hours,
        weekStart: data.week_start,
      };
    },

    async updateWeeklyGoal(weekStart, targetHours, currentHours) {
      const userId = await getUserId();
      const payload = {
        user_id: userId,
        week_start: weekStart,
      };
      if (targetHours !== undefined) payload.target_hours = targetHours;
      if (currentHours !== undefined) payload.current_hours = currentHours;

      const { data, error } = await supabase
        .from("weekly_goals")
        .upsert(payload, { onConflict: "user_id, week_start" })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        targetHours: data.target_hours,
        currentHours: data.current_hours,
        weekStart: data.week_start,
      };
    },
  },

  portfolioGoals: {
    async getPortfolioGoals() {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("portfolio_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((g) => ({
        id: g.id,
        title: g.title || "",
        milestone: g.description || "",
        progress: g.progress || 0,
        completed: g.completed || g.status === "Completed" || g.progress === 100,
        priority: g.priority || "Medium",
        deadline: g.target_date || "",
      }));
    },

    async createPortfolioGoal(goal) {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("portfolio_goals")
        .insert({
          user_id: userId,
          title: goal.title,
          description: goal.milestone || "",
          progress: goal.progress || 0,
          completed: goal.completed || goal.progress === 100,
          status: goal.completed || goal.progress === 100 ? "Completed" : "In Progress",
          priority: goal.priority || "Medium",
          target_date: goal.deadline || null,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title || "",
        milestone: data.description || "",
        progress: data.progress || 0,
        completed: data.completed || data.status === "Completed" || data.progress === 100,
        priority: data.priority || "Medium",
        deadline: data.target_date || "",
      };
    },

    async updatePortfolioGoal(id, updates) {
      const userId = await getUserId();
      const payload = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.milestone !== undefined) payload.description = updates.milestone;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.progress !== undefined) {
        payload.progress = updates.progress;
        payload.completed = updates.progress === 100;
        payload.status = updates.progress === 100 ? "Completed" : "In Progress";
      }
      if (updates.completed !== undefined) {
        payload.completed = updates.completed;
        payload.status = updates.completed ? "Completed" : "In Progress";
        if (updates.completed) {
          payload.progress = 100;
        }
      }
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.deadline !== undefined) payload.target_date = updates.deadline;
      if (updates.target_date !== undefined) payload.target_date = updates.target_date;
      if (updates.status !== undefined) payload.status = updates.status;

      const { error } = await supabase
        .from("portfolio_goals")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },

    async deletePortfolioGoal(id) {
      const userId = await getUserId();
      const { error } = await supabase
        .from("portfolio_goals")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
  },

  supportTickets: {
    async createTicket(ticket) {
      const { data, error } = await supabase
        .rpc("submit_support_ticket", {
          p_name: ticket.name,
          p_email: ticket.email,
          p_category: ticket.category,
          p_subject: ticket.subject,
          p_message: ticket.message,
          p_metadata: ticket.metadata || {},
          p_priority: ticket.priority || "normal"
        })
        .single();

      if (error) throw error;
      return data;
    },

    async uploadScreenshot(ticketId, file) {
      const extension = file.name.split('.').pop() || 'png';
      const filePath = `tickets/${ticketId}/screenshot.${extension}`;
      
      const { error: uploadError } = await supabase.storage
        .from("support-attachments")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("support_tickets")
        .update({ attachment_url: filePath })
        .eq("id", ticketId);

      if (updateError) throw updateError;
      return filePath;
    },

    async getTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async getAllTickets() {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async updateTicketAdmin(ticketId, updates) {
      const { data, error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getAttachmentSignedUrl(filePath) {
      const { data, error } = await supabase.storage
        .from("support-attachments")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      return data.signedUrl;
    }
  }
};
