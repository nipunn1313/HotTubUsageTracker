import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const TaskValidator = {
  _id: v.id("tasks"),
  _creationTime: v.float64(),
  isCompleted: v.boolean(),
  when: v.float64(),
  text: v.string(),
};

export default defineSchema({
  tasks: defineTable(TaskValidator)
    .index("by_text", ["text"])
    .index("by_when", ["when"]),
});
