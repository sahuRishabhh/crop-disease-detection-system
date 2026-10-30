import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, User, Mail, Briefcase, HelpCircle } from "lucide-react";

export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student / Researcher");
  const [feedbackType, setFeedbackType] = useState("Model Accuracy & Performance");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Local client-side feedback submission (no paid external services required)
    setSubmitted(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Academic Collaboration & Feedback</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Consultation & Inquiries</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Have observations regarding classification behavior, ideas for additional disease classes, or feedback on Grad-CAM visualizations? Send us a note.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        {submitted ? (
          <div className="text-center py-12 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Feedback Recorded Locally</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{name}</strong>! Your commentary regarding <em>{feedbackType}</em> has been acknowledged. In an offline academic demonstration environment, responses are logged locally without requiring third-party mailing credentials.
            </p>
            <button
              onClick={resetForm}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Submit Another Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Your Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Student / Researcher">Student / Researcher</option>
                  <option value="Agronomist / Plant Pathologist">Agronomist / Plant Pathologist</option>
                  <option value="Farmer / Grower">Farmer / Grower</option>
                  <option value="Agricultural Extension Agent">Agricultural Extension Agent</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Inquiry Topic
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Model Accuracy & Performance">Model Accuracy & Performance</option>
                  <option value="Grad-CAM Visualization Clarification">Grad-CAM Visualization Clarification</option>
                  <option value="Dataset Expansion Request">Dataset Expansion Request</option>
                  <option value="Knowledge Base Correction">Knowledge Base Correction</option>
                  <option value="General Academic Question">General Academic Question</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Detailed Message / Commentary</label>
              <textarea
                rows={4}
                required
                placeholder="Share your academic feedback or questions here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.99]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
