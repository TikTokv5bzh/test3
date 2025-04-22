import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  classes: defineTable({
    name: v.string(),
  }),
  sections: defineTable({
    name: v.string(),
    classId: v.id("classes"),
  }).index("by_class", ["classId"]),
  assignments: defineTable({
    classId: v.id("classes"),
    sectionId: v.id("sections"),
    date: v.string(), // Hijri date
    dayName: v.string(), // Arabic day name
    period: v.string(), // Period number (e.g. "الأولى")
    subject: v.string(),
    lessonTitle: v.string(),
    homework: v.string(),
  }).index("by_class_section", ["classId", "sectionId"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
