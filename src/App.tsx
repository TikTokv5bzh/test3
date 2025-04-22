import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import { useState } from "react";
import moment from "moment-hijri";
import html2canvas from "html2canvas";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<Id<"classes"> | null>(null);
  const [selectedSection, setSelectedSection] = useState<Id<"sections"> | null>(null);
  const [formData, setFormData] = useState({
    period: "",
    subject: "",
    lessonTitle: "",
    homework: "",
  });

  const classes = useQuery(api.assignments.getClasses);
  const sections = useQuery(api.assignments.getSections, 
    selectedClass ? { classId: selectedClass } : "skip"
  );
  const assignments = useQuery(api.assignments.getAssignments,
    selectedClass && selectedSection 
      ? { classId: selectedClass, sectionId: selectedSection }
      : "skip"
  );
  const addAssignment = useMutation(api.assignments.addAssignment);

  // تحويل التاريخ إلى هجري
  const today = moment();
  const hijriDate = today.format("iDD/iMM/iYYYY");
  const arabicDay = today.format("dddd");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) return;

    try {
      await addAssignment({
        classId: selectedClass,
        sectionId: selectedSection,
        date: hijriDate,
        dayName: arabicDay,
        ...formData
      });

      setFormData({
        period: "",
        subject: "",
        lessonTitle: "",
        homework: "",
      });

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة الواجب بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">نظام الواجبات المدرسية</h1>
            <SignOutButton />
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <select
                value={selectedClass ?? ""}
                onChange={(e) => {
                  setSelectedClass(e.target.value ? e.target.value as Id<"classes"> : null);
                  setSelectedSection(null);
                }}
                className="p-2 border rounded"
              >
                <option value="">اختر الفصل</option>
                {classes?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSection ?? ""}
                onChange={(e) => setSelectedSection(e.target.value ? e.target.value as Id<"sections"> : null)}
                className="p-2 border rounded"
                disabled={!selectedClass}
              >
                <option value="">اختر الشعبة</option>
                {sections?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center mb-4">
              <p className="text-lg">{arabicDay}</p>
              <p className="text-lg">{hijriDate}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="الحصة"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="المادة"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>
              <input
                type="text"
                placeholder="عنوان الدرس"
                value={formData.lessonTitle}
                onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="الواجب"
                value={formData.homework}
                onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                disabled={!selectedClass || !selectedSection}
              >
                حفظ
              </button>
            </form>
          </div>

          {assignments && assignments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">الواجبات المسجلة</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="border p-2">الحصة</th>
                    <th className="border p-2">المادة</th>
                    <th className="border p-2">عنوان الدرس</th>
                    <th className="border p-2">الواجب</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment._id}>
                      <td className="border p-2">{assignment.period}</td>
                      <td className="border p-2">{assignment.subject}</td>
                      <td className="border p-2">{assignment.lessonTitle}</td>
                      <td className="border p-2">{assignment.homework}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Authenticated>
      <Toaster />
    </div>
  );
}
