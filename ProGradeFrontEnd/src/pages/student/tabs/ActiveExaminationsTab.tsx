import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Rocket, Lock, XCircle, KeyRound, X, Loader2, ArrowLeft, Clock, ShieldCheck, UserCircle, Fingerprint, Code2, FileText, Trophy, CheckCircle2 } from "lucide-react";
import { axiosClient } from "../../../api/axiosClient";
import { studentService } from "../../../features/student/studentService";

export default function ActiveExaminationsTab() {
  const navigate = useNavigate();
  const [publicExams, setPublicExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatFullName = (email: string) => {
    if (!email) return "Admin User";
    return email.split("@")[0].split(/[._-]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const [searchId, setSearchId] = useState("");
  const [searchedExam, setSearchedExam] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [errorModal, setErrorModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });

  // Passkey States
  const [examToJoin, setExamToJoin] = useState<any | null>(null);
  const [passkeyArray, setPasskeyArray] = useState<string[]>(Array(8).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  // 🌟 MAX ATTEMPTS STATE
  const [attemptResult, setAttemptResult] = useState<any | null>(null);

  useEffect(() => {
    studentService.getPublicAssessments().then(setPublicExams).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getExamState = (exam: any) => {
    if (exam.status === "PAUSED") return { state: "EXPIRED", color: "gray", label: "Expired", text: "This exam is paused or no longer accepting submissions." };
    if (!exam.startTime) return { state: "LIVE", color: "emerald", label: "Live Now", text: "Instantly available." };

    const now = new Date();
    const start = new Date(exam.startTime);
    const endWindow = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    if (now < start) return { state: "SCHEDULED", color: "amber", label: "Scheduled", text: `Unlocks at ${start.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}` };
    if (now >= start && now <= endWindow) return { state: "LIVE", color: "emerald", label: "Live Now", text: `Closes at ${endWindow.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}` };

    return { state: "EXPIRED", color: "gray", label: "Expired", text: "The operational window for this exam has passed." };
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsSearching(true);
    setSearchedExam(null);
    try {
      const result = await studentService.searchPrivateAssessment(searchId);
      setSearchedExam(result);
    } catch (err: any) {
        setErrorModal({ isOpen: true, message: err.response?.data?.error || "We couldn't locate an exam with that ID." });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePasskeyChange = (index: number, value: string) => {
    setVerifyError(false);
    if (value.length > 1) {
        const chars = value.split('').slice(0, 8);
        const newPasskey = Array(8).fill('');
        chars.forEach((char, i) => newPasskey[i] = char);
        setPasskeyArray(newPasskey);
        inputRefs.current[Math.min(chars.length, 7)]?.focus();
        return;
    }
    const newPasskey = [...passkeyArray];
    newPasskey[index] = value;
    setPasskeyArray(newPasskey);
    if (value !== '' && index < 7) inputRefs.current[index + 1]?.focus();
  };

  const handlePasskeyKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && passkeyArray[index] === '' && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'Enter' && passkeyArray.join('').length === 8) handleVerifyPasskey();
  };

  const handleVerifyPasskey = async () => {
    if (!examToJoin) return;
    const finalPasskey = passkeyArray.join('');
    if (finalPasskey.length !== 8) { setVerifyError(true); return; }

    setIsVerifying(true);
    setVerifyError(false);
    try {
      const response = await studentService.verifyExamPassword(examToJoin.examId, finalPasskey);
      if (response.verified) {
        setExamToJoin(null);
        sessionStorage.setItem('exam_access_token', response.accessToken);
        navigate(`/student/exam/live/${response.assessmentId}`);
      }
    } catch (err: any) {
      // 🌟 INTERCEPT THE MAX ATTEMPTS BLOCKER!
      if (err.response?.data?.maxAttemptsReached) {
          setExamToJoin(null);
          setPasskeyArray(Array(8).fill(""));
          setAttemptResult({
              ...err.response.data,
              examTitle: examToJoin.title
          });
      } else {
          setVerifyError(true);
          setTimeout(() => setVerifyError(false), 600); 
          setPasskeyArray(Array(8).fill("")); 
          inputRefs.current[0]?.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0m 0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // 🌟 THE NEW CUSTOM POPUP
  const AttemptResultModal = () => (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setAttemptResult(null)}>
        <div className="bg-white dark:bg-[#150a29] max-w-sm w-full rounded-[2rem] p-8 text-center shadow-2xl border border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-blue-100 dark:border-blue-800">
                <Trophy className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Attempt Completed</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">You have reached the maximum allowed attempts for <strong>{attemptResult.examTitle}</strong>.</p>
            
            <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-2xl p-5 mb-6 border border-gray-100 dark:border-purple-900/50 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-purple-900/30 pb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Final Score</span>
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">{attemptResult.score} <span className="text-[10px] text-gray-400">/ {attemptResult.maxScore}</span></span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-purple-900/30 pb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Time Taken</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500"/> {formatTime(attemptResult.timeTaken)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Submission Date</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{new Date(attemptResult.submittedAt).toLocaleDateString()}</span>
                </div>
            </div>

            <button onClick={() => setAttemptResult(null)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer flex justify-center items-center gap-2">
                <CheckCircle2 className="w-5 h-5"/> Understood
            </button>
        </div>
    </div>
  );

  const renderExamCard = (exam: any, isPrivate: boolean = false) => {
    const { state, color, label, text } = getExamState(exam);
    const techs = exam.tags ? exam.tags.split(",").map((t: string) => t.trim()) : ["Mixed Technologies"];
    
    return (
      <div key={exam.id} className={`bg-white dark:bg-[#1a0d36] rounded-2xl p-5 sm:p-6 shadow-sm border-2 transition-all relative overflow-hidden group flex flex-col h-full ${state === "LIVE" ? "border-emerald-500/30 hover:border-emerald-500 dark:border-emerald-500/20 dark:hover:border-emerald-500/50" : state === "SCHEDULED" ? "border-amber-500/30 dark:border-amber-500/20" : "border-gray-200 dark:border-purple-900/30 opacity-80"}`}>
        <div className="absolute top-4 sm:top-5 right-4 sm:right-5">
          <span className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider ${color === "emerald" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : color === "amber" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
            {state === "LIVE" && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
            {state === "SCHEDULED" && <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            {state === "EXPIRED" && <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            {label}
          </span>
        </div>

        <div className="flex-1 pr-20 sm:pr-24">
          {isPrivate && <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded w-max mb-3 uppercase"><KeyRound className="w-3 h-3" /> Private Educator Exam</div>}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">{exam.title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4 flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5" /> {formatFullName(exam.creatorEmail)}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {techs.map((t, i) => <span key={i} className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 px-2 py-0.5 rounded uppercase tracking-wider"><Code2 className="w-3 h-3" /> {t}</span>)}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            <span className="bg-gray-50 dark:bg-[#0f0a1c] px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-100 dark:border-purple-900/30 whitespace-nowrap">{exam.totalQuestions} Questions</span>
            <span className="bg-gray-50 dark:bg-[#0f0a1c] px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-100 dark:border-purple-900/30 whitespace-nowrap">{exam.durationMinutes} Minutes</span>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-4 sm:mb-6 min-h-[1rem]">{text}</p>
        </div>

        <div className="mt-auto">
          {state === "LIVE" && (
            <button onClick={() => { setExamToJoin(exam); setPasskeyArray(Array(8).fill("")); setVerifyError(false); }} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] text-sm sm:text-base cursor-pointer">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" /> START EXAM
            </button>
          )}
          {state === "SCHEDULED" && <button disabled className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/10 text-amber-500 font-bold py-2.5 sm:py-3 rounded-xl border border-amber-200 dark:border-amber-900/50 cursor-not-allowed text-sm sm:text-base"><Lock className="w-4 h-4 sm:w-5 sm:h-5" /> Locked Until Launch</button>}
          {state === "EXPIRED" && <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#0f0a1c] text-gray-400 font-bold py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-800 cursor-not-allowed text-sm sm:text-base"><XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Closed</button>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in">
      {errorModal.isOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setErrorModal({ isOpen: false, message: '' })}>
            <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 text-red-500 dark:bg-red-900/20"><ShieldAlert className="w-8 h-8" /></div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">{errorModal.message}</p>
                <button onClick={() => setErrorModal({ isOpen: false, message: '' })} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl transition-all cursor-pointer hover:opacity-90 shadow-md">Understood</button>
            </div>
        </div>
      )}
      
      {/* 🌟 MOUNT THE ATTEMPT MODAL */}
      {attemptResult && <AttemptResultModal />}

      {examToJoin && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setExamToJoin(null)}>
          <div className="bg-white dark:bg-[#150a29] w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-200 dark:border-purple-900/50 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-50 dark:bg-[#0f0a1c] p-6 text-center relative border-b border-gray-200 dark:border-purple-900/50">
              <button onClick={() => setExamToJoin(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"><X className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-purple-200 dark:border-purple-800 shadow-inner"><ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" /></div>
              <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">Security Gateway</h3>
              <p className="text-xs text-gray-500 mt-2 font-medium tracking-wide uppercase">Authentication Required</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 dark:bg-[#1a0d36] rounded-xl p-4 border border-gray-100 dark:border-purple-900/30">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{examToJoin.title}</h4>
                <div className="flex flex-col gap-1 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5 text-purple-500" /> ID: <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{examToJoin.examId}</span></span>
                  <span className="flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5 text-blue-500" /> By: <span className="text-gray-700 dark:text-gray-300">{formatFullName(examToJoin.creatorEmail)}</span></span>
                </div>
              </div>
              <div className="relative pt-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 block text-center">Instructor Passkey (8 Characters)</label>
                <div className={`flex justify-center gap-1 sm:gap-2 mb-2 ${verifyError ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                    {passkeyArray.map((digit, index) => (
                        <input key={index} ref={(el) => (inputRefs.current[index] = el)} type="password" maxLength={8} value={digit} onChange={(e) => handlePasskeyChange(index, e.target.value)} onKeyDown={(e) => handlePasskeyKeyDown(index, e)} className={`w-9 h-11 sm:w-10 sm:h-12 text-center text-xl font-bold rounded-lg border-2 focus:outline-none transition-all ${verifyError ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/10" : "bg-white dark:bg-[#0f0a1c] border-gray-200 dark:border-purple-900/50 focus:border-purple-500 shadow-inner dark:text-white"}`} />
                    ))}
                </div>
                {verifyError && <p className="text-xs text-red-500 text-center font-bold mt-3 absolute w-full bottom-[-24px]">Access Denied. Invalid passkey.</p>}
              </div>
            </div>
            <div className="p-6 pt-4">
              <button onClick={handleVerifyPasskey} disabled={isVerifying || passkeyArray.join('').length !== 8} className="w-full py-3.5 rounded-xl font-black bg-gray-900 dark:bg-purple-600 text-white hover:bg-gray-800 dark:hover:bg-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md">
                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-4 h-4" /> Unlock Assessment</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & SEARCH */}
      <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">Find an Assessment</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Enter your unique Exam ID to access private assessments assigned to your batch.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                  type="text" placeholder="e.g. EXM-A48F9B" value={searchId} onChange={e => setSearchId(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl text-sm font-bold tracking-wider focus:outline-none focus:border-purple-500 focus:ring-2 ring-purple-600/20 transition-all dark:text-white uppercase"
              />
            </div>
            <button onClick={handleSearch} disabled={!searchId || loading || isSearching} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 sm:py-4 px-8 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-all shadow-md cursor-pointer">
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Locate Exam'}
            </button>
          </div>
        </div>
      </div>

      {/* PUBLIC EXAMS GRID */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Public Assessments
        </h3>
        {publicExams.length === 0 ? (
          <div className="bg-white dark:bg-[#1a0d36] rounded-2xl border border-gray-100 dark:border-purple-900/30 p-10 text-center text-gray-500">
            No public assessments are available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicExams.map(exam => (
              <div key={exam.id} className="max-w-2xl mx-auto md:mx-0 w-full">
                  {renderExamCard(exam)}
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
      `}} />
    </div>
  );
}