import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getClasses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("classes").collect();
  },
});

export const getSections = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sections")
      .withIndex("by_class", q => q.eq("classId", args.classId))
      .collect();
  },
});

export const getAssignments = query({
  args: {
    classId: v.id("classes"),
    sectionId: v.id("sections"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_class_section", q => 
        q.eq("classId", args.classId).eq("sectionId", args.sectionId))
      .collect();
  },
});

export const addAssignment = mutation({
  args: {
    classId: v.id("classes"),
    sectionId: v.id("sections"),
    date: v.string(),
    dayName: v.string(),
    period: v.string(),
    subject: v.string(),
    lessonTitle: v.string(),
    homework: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("assignments", args);
  },
});

// إضافة الفصول والشعب مباشرة
const initialClasses = [
  "الأول متوسط",
  "الثاني متوسط",
  "الثالث متوسط",
  "الأول ثانوي",
  "الثاني ثانوي",
  "الثالث ثانوي"
];

const sections = ["أ", "ب", "ج"];

export const initializeData = mutation({
  args: {},
  handler: async (ctx) => {
    // إضافة الفصول
    for (const className of initialClasses) {
      const classId = await ctx.db.insert("classes", { name: className });
      
      // إضافة الشعب لكل فصل
      for (const sectionName of sections) {
        await ctx.db.insert("sections", {
          name: sectionName,
          classId
        });
      }
    }
  },
});
