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
    // التحقق من وجود نفس الحصة في نفس اليوم
    const existingAssignments = await ctx.db
      .query("assignments")
      .withIndex("by_class_section", q => 
        q.eq("classId", args.classId).eq("sectionId", args.sectionId))
      .collect();

    const hasDuplicatePeriod = existingAssignments.some(assignment => 
      assignment.date === args.date && assignment.period === args.period
    );

    if (hasDuplicatePeriod) {
      throw new Error("هذه الحصة مسجلة مسبقاً لهذا اليوم");
    }

    return await ctx.db.insert("assignments", args);
  },
});

// باقي الدوال كما هي...
export const addClass = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("classes", { name: args.name });
  },
});

export const addSection = mutation({
  args: { 
    name: v.string(),
    classId: v.id("classes")
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sections", { 
      name: args.name,
      classId: args.classId
    });
  },
});

export const resetAndInitialize = mutation({
  args: {},
  handler: async (ctx) => {
    // حذف جميع البيانات الموجودة
    const assignments = await ctx.db.query("assignments").collect();
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    const sections = await ctx.db.query("sections").collect();
    for (const section of sections) {
      await ctx.db.delete(section._id);
    }

    const classes = await ctx.db.query("classes").collect();
    for (const class_ of classes) {
      await ctx.db.delete(class_._id);
    }

    // إضافة الفصول الجديدة
    const classNames = [
      "الأول متوسط",
      "الثاني متوسط",
      "الثالث متوسط",
      "الأول ثانوي",
      "الثاني ثانوي",
      "الثالث ثانوي"
    ];

    // إضافة الفصول
    for (const className of classNames) {
      const classId = await ctx.db.insert("classes", { name: className });
      
      // إضافة الشعب لكل فصل
      const sectionNames = ["أ", "ب", "ج"];
      for (const sectionName of sectionNames) {
        await ctx.db.insert("sections", {
          name: sectionName,
          classId
        });
      }
    }
  },
});
