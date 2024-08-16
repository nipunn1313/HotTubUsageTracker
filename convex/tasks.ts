import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const get = query({
  args: {},
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
  handler: async (ctx, { taskId, completed }) => {
    // hack until we figure out how to send booleans from android
    const isCompleted = completed === "true";
    await ctx.db.patch(taskId, { isCompleted });
    // hack until we figure out how to return null or strings or undefined;
    return {};
  },
});

export const createHotTubTask = internalMutation({
  args: { daysAgo: v.optional(v.number()) },
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
