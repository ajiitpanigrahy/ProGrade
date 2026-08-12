import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Rocket,
  Lock,
  XCircle,
  KeyRound,
  X,
  Loader2,
  ArrowLeft,
  Clock,
  ShieldCheck,
  UserCircle,
  Fingerprint,
  Code2,
} from "lucide-react";
import { studentService } from "../../../features/student/studentService";

export default function ActiveExaminationsTab() {
  const navigate = useNavigate();
  const [publicExams, setPublicExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 Helper to extract Full Name from email (e.g. john.doe@email.com -> John Doe)
  const formatFullName = (email: string) => {
    if (!email) return "Admin User";
    return email
      .split("@")[0]
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedExam, setSearchedExam] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [techFilter, setTechFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Security Modal States
  const [examToJoin, setExamToJoin] = useState<any | null>(null);
  const [passkey, setPasskey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  useEffect(() => {
    studentService
      .getPublicAssessments()
      .then(setPublicExams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getExamState = (exam: any) => {
    if (exam.status === "PAUSED")
      return {
        state: "EXPIRED",
        color: "gray",
        label: "Expired",
        text: "This exam is paused or no longer accepting submissions.",
      };
    if (!exam.startTime)
      return {
        state: "LIVE",
        color: "emerald",
        label: "Live Now",
        text: "Instantly available.",
      };

    const now = new Date();
    const start = new Date(exam.startTime);
    const endWindow = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    if (now < start)
      return {
        state: "SCHEDULED",
        color: "amber",
        label: "Scheduled",
        text: `Unlocks at ${start.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}`,
      };
    if (now >= start && now <= endWindow)
      return {
        state: "LIVE",
        color: "emerald",
        label: "Live Now",
        text: `Closes at ${endWindow.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}`,
      };

    return {
      state: "EXPIRED",
      color: "gray",
      label: "Expired",
      text: "The operational window for this exam has passed.",
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchedExam(null);
    try {
      const result = await studentService.searchPrivateAssessment(searchQuery);
      setSearchedExam(result);
    } catch (err) {
      alert("No educator exam found with that ID.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyPasskey = async () => {
    if (!examToJoin) return;
    setIsVerifying(true);
    setVerifyError(false);
    try {
      const response = await studentService.verifyExamPassword(
        examToJoin.examId,
        passkey,
      );
      if (response.verified) {
        setExamToJoin(null);
        // 🌟 SUCCESS ROUTING: Navigates to the live portal!
        navigate(
          `/student/exam/live/${response.assessmentId}?token=${response.accessToken}`,
        );
      }
    } catch (err) {
      setVerifyError(true);
      setTimeout(() => setVerifyError(false), 500);
    } finally {
      setIsVerifying(false);
    }
  };

  const getTechStacks = (title: string) => {
    const stacks = [];
    const t = title.toLowerCase();
    if (t.includes("java") || t.includes("spring"))
      stacks.push("Core Java", "Spring Boot");
    if (t.includes("react") || t.includes("front"))
      stacks.push("React", "JavaScript");
    if (t.includes("sql") || t.includes("data"))
      stacks.push("MySQL", "Database");
    if (stacks.length === 0) stacks.push("Mixed Technologies");
    return stacks;
  };

  const renderExamCard = (exam: any, isPrivate: boolean = false) => {
    const { state, color, label, text } = getExamState(exam);
    const techs = exam.tags
      ? exam.tags.split(",").map((t: string) => t.trim())
      : ["Mixed Technologies"];
    return (
      <div
        key={exam.id}
        className={`bg-white dark:bg-[#1a0d36] rounded-2xl p-5 sm:p-6 shadow-sm border-2 transition-all relative overflow-hidden group flex flex-col h-full ${
          state === "LIVE"
            ? "border-emerald-500/30 hover:border-emerald-500 dark:border-emerald-500/20 dark:hover:border-emerald-500/50"
            : state === "SCHEDULED"
              ? "border-amber-500/30 dark:border-amber-500/20"
              : "border-gray-200 dark:border-purple-900/30 opacity-80"
        }`}
      >
        <div className="absolute top-4 sm:top-5 right-4 sm:right-5">
          <span
            className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider ${
              color === "emerald"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : color === "amber"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {state === "LIVE" && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            )}
            {state === "SCHEDULED" && (
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            {state === "EXPIRED" && (
              <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            {label}
          </span>
        </div>

        <div className="flex-1 pr-20 sm:pr-24">
          {isPrivate && (
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded w-max mb-3 uppercase">
              <KeyRound className="w-3 h-3" /> Private Educator Exam
            </div>
          )}

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
            {exam.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4 flex items-center gap-1.5">
            <UserCircle className="w-3.5 h-3.5" />{" "}
            {formatFullName(exam.creatorEmail)}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {techs.map((t, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 px-2 py-0.5 rounded uppercase tracking-wider"
              >
                <Code2 className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            <span className="bg-gray-50 dark:bg-[#0f0a1c] px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-100 dark:border-purple-900/30 whitespace-nowrap">
              {exam.totalQuestions} Questions
            </span>
            <span className="bg-gray-50 dark:bg-[#0f0a1c] px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-100 dark:border-purple-900/30 whitespace-nowrap">
              {exam.durationMinutes} Minutes
            </span>
          </div>

          <p className="text-[10px] sm:text-xs text-gray-500 mb-4 sm:mb-6 min-h-[1rem]">
            {text}
          </p>
        </div>

        <div className="mt-auto">
          {state === "LIVE" && (
            <button
              onClick={() => {
                setExamToJoin(exam);
                setPasskey("");
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] text-sm sm:text-base cursor-pointer"
            >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" /> START EXAM
            </button>
          )}
          {state === "SCHEDULED" && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/10 text-amber-500 font-bold py-2.5 sm:py-3 rounded-xl border border-amber-200 dark:border-amber-900/50 cursor-not-allowed text-sm sm:text-base"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> Locked Until Launch
            </button>
          )}
          {state === "EXPIRED" && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#0f0a1c] text-gray-400 font-bold py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-800 cursor-not-allowed text-sm sm:text-base"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Closed
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in">
      <div className="bg-white dark:bg-[#1a0d36] p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-1/2 flex items-center">
          <div className="absolute left-3 sm:left-4 bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="🔍 Enter Exam Code (EXM-...)"
            className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl pl-12 sm:pl-14 pr-20 sm:pr-24 py-3 sm:py-3.5 focus:ring-2 ring-purple-600 outline-none text-gray-900 dark:text-white transition-all text-xs sm:text-sm font-medium uppercase"
          />
          <button
            onClick={handleSearch}
            disabled={!searchQuery || isSearching}
            className="absolute right-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {!searchedExam && (
          <div className="flex w-full md:w-auto items-center gap-2 sm:gap-3">
            <div className="flex-1 md:flex-none flex items-center gap-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-2 sm:px-3 py-2">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer w-full"
              >
                <option value="ALL">All Techs</option>
                <option value="JAVA">Java</option>
                <option value="SPRING_BOOT">Spring</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-none bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="LIVE">Live Now</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 flex justify-center text-purple-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : searchedExam ? (
        <div className="animate-in slide-in-from-bottom-4">
          <button
            onClick={() => {
              setSearchedExam(null);
              setSearchQuery("");
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-purple-600 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Back to Public
            Schedule
          </button>
          <div className="max-w-2xl mx-auto md:mx-0">
            {renderExamCard(searchedExam, true)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in">
          {publicExams.length === 0 ? (
            <div className="col-span-full py-24 text-center text-gray-500 font-bold text-sm sm:text-base">
              No public examinations currently scheduled.
            </div>
          ) : (
            publicExams.map((exam) => renderExamCard(exam))
          )}
        </div>
      )}

      {examToJoin && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150a29] w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-200 dark:border-purple-900/50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 dark:bg-[#0f0a1c] p-6 text-center relative border-b border-gray-200 dark:border-purple-900/50">
              <button
                onClick={() => setExamToJoin(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-purple-200 dark:border-purple-800 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">
                Security Gateway
              </h3>
              <p className="text-xs text-gray-500 mt-2 font-medium tracking-wide uppercase">
                Authentication Required
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gray-50 dark:bg-[#1a0d36] rounded-xl p-4 border border-gray-100 dark:border-purple-900/30">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                  {examToJoin.title}
                </h4>
                <div className="flex flex-col gap-1 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-purple-500" /> ID:{" "}
                    <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">
                      {examToJoin.examId}
                    </span>
                  </span>
                  {/* 🌟 APPLIED formatFullName TO THE MODAL UI */}
                  <span className="flex items-center gap-1.5">
                    <UserCircle className="w-3.5 h-3.5 text-blue-500" /> By:{" "}
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatFullName(examToJoin.creatorEmail)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="relative pt-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">
                  Instructor Passkey
                </label>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyPasskey()}
                  placeholder="••••••••"
                  className={`w-full bg-white dark:bg-[#0f0a1c] border-2 rounded-xl px-4 py-3.5 text-center text-xl tracking-[0.5em] font-mono font-bold focus:outline-none transition-all ${
                    verifyError
                      ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/10 animate-[shake_0.4s_ease-in-out]"
                      : "border-gray-200 dark:border-purple-900/50 focus:border-purple-500 shadow-inner dark:text-white"
                  }`}
                />
                {verifyError && (
                  <p className="text-xs text-red-500 text-center font-bold mt-2 absolute w-full bottom-[-20px]">
                    Access Denied. Invalid passkey.
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 pt-2">
              <button
                onClick={handleVerifyPasskey}
                disabled={isVerifying || !passkey}
                className="w-full py-3.5 rounded-xl font-black bg-gray-900 dark:bg-purple-600 text-white hover:bg-gray-800 dark:hover:bg-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Unlock Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-6px); }
                    40%, 80% { transform: translateX(6px); }
                }
            `,
        }}
      />
    </div>
  );
}
