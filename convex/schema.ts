import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    isCompleted: v.boolean(),
    when: v.float64(),
    text: v.string(),
  })
    .index("by_text", ["text"])
    .index("by_when", ["when"]),
});
