import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const setupInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // إضافة الفصول
    const classes = [
      "الأول متوسط",
      "الثاني متوسط",
      "الثالث متوسط",
      "الأول ثانوي",
      "الثاني ثانوي",
      "الثالث ثانوي"
    ];

    for (const className of classes) {
      const classId = await ctx.db.insert("classes", { name: className });
      
      // إضافة الشعب لكل فصل
      const sections = ["أ", "ب", "ج"];
      for (const sectionName of sections) {
        await ctx.db.insert("sections", {
          name: sectionName,
          classId
        });
      }
    }
  }
});
