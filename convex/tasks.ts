import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { TaskValidator } from "./schema";

export const get = query({
  args: {},
  returns: v.array(v.object(TaskValidator)),
  handler: async (ctx) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_when")
      .order("desc")
      .collect();
  },
});

export const setCompleted = mutation({
  args: {
    taskId: v.id("tasks"),
    completed: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { taskId, completed }) => {
    // hack until we figure out how to send booleans from android
    const isCompleted = completed === "true";
    await ctx.db.patch(taskId, { isCompleted });
  },
});

export const createHotTubTask = internalMutation({
  args: { daysAgo: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, { daysAgo }) => {
    const millisAgo = (daysAgo || 0) * 86400 * 1000;
    const today = new Date(Date.now() - millisAgo).toLocaleDateString("en-CA");
    const when = Date.parse(today);

    const existingTask = await ctx.db
      .query("tasks")
      .withIndex("by_when", (q) => q.eq("when", when))
      .first();
    if (existingTask) return;

    const task = `Hot Tub on ${today}`;
    await ctx.db.insert("tasks", {
      text: task,
      when,
      isCompleted: false,
    });
  },
});
