import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, XCircle, KeyRound, X, Loader2, Clock, ShieldCheck, UserCircle, Fingerprint, Code2, FileText, Trophy, CheckCircle2, ShieldAlert, DatabaseZap, Target, Activity, Rocket } from "lucide-react";
import { studentService } from "../../../features/student/studentService";

const KNOWN_TECHS = [
  'JAVA', 'PYTHON', 'CPP', 'C', 'JAVASCRIPT', 'SQL', 'MYSQL', 'DSA',
  'SPRING_CORE', 'SPRING_BOOT', 'SPRING_MVC', 'SPRING_DATA_JPA',
  'SPRING_JDBC', 'SPRING_ORM', 'REST_API', 'HIBERNATE', 'MAVEN', 'JUNIT', 'LOGGING'
];

export default function ActiveExaminationsTab() {
  const navigate = useNavigate();
  const [publicExams, setPublicExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [techFilter, setTechFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  const formatFullName = (email: string) => {
    if (!email) return "Admin User";
    return email.split("@")[0].split(/[._-]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const [searchId, setSearchId] = useState("");
  const [searchedExam, setSearchedExam] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [errorModal, setErrorModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });

  const [examToJoin, setExamToJoin] = useState<any | null>(null);
  const [passkeyArray, setPasskeyArray] = useState<string[]>(Array(8).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  const [attemptResult, setAttemptResult] = useState<any | null>(null);

  useEffect(() => {
    studentService.getPublicAssessments()
      .then(setPublicExams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getExamState = (exam: any) => {
    if (exam.status === "PAUSED") return { state: "EXPIRED", color: "gray", label: "Expired", text: "This exam is paused or no longer accepting submissions." };
    if (!exam.startTime) return { state: "LIVE", color: "purple", label: "Live Now", text: "Instantly available." };

    const now = new Date();
    const start = new Date(exam.startTime);
    const endWindow = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    if (now < start) return { state: "SCHEDULED", color: "amber", label: "Scheduled", text: `Unlocks at ${start.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}` };
    if (now >= start && now <= endWindow) return { state: "LIVE", color: "purple", label: "Live Now", text: `Closes at ${endWindow.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}` };

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

  const handleStartExamClick = async (exam: any) => {
    if (exam.examId && exam.examId.startsWith('PRAC-')) {
      setIsVerifying(true);
      try {
        const response = await studentService.verifyExamPassword(exam.examId, "PRACTICE");
        if (response.verified) {
          sessionStorage.setItem('exam_access_token', response.accessToken);
          navigate(`/student/exam/live/${response.assessmentId}`);
        }
      } catch (err: any) {
        if (err.response?.data?.maxAttemptsReached) {
          setAttemptResult({ ...err.response.data, examTitle: exam.title });
        } else {
          setExamToJoin(exam);
        }
      } finally {
        setIsVerifying(false);
      }
    } else {
      setExamToJoin(exam);
      setPasskeyArray(Array(8).fill(""));
      setVerifyError(false);
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
      if (err.response?.data?.maxAttemptsReached) {
        setExamToJoin(null);
        setPasskeyArray(Array(8).fill(""));
        setAttemptResult({ ...err.response.data, examTitle: examToJoin.title });
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

  const getExamTech = (tags?: string) => {
    if (!tags) return 'MIXED';
    const upperTags = String(tags).toUpperCase();
    const foundTechs = KNOWN_TECHS.filter(tech => {
      const formattedTech = tech.replace(/_/g, '');
      return upperTags.includes(formattedTech);
    });
    if (foundTechs.length > 1) return 'MIXED';
    if (foundTechs.length === 1) return foundTechs[0].replace(/_/g, ' ');
    return 'CUSTOM';
  };

  const safeExams = Array.isArray(publicExams) ? publicExams : [];
  const processedPublicExams = safeExams.filter(exam => {
    const examDiff = exam.difficultyLevel ? String(exam.difficultyLevel).toUpperCase() : 'MIXED';
    const matchesLevel = levelFilter === 'ALL' || examDiff === levelFilter;

    const tags = exam.tags ? String(exam.tags).toUpperCase() : '';
    const normalizedTechFilter = techFilter.replace(/_/g, '');
    const matchesTech = techFilter === 'ALL' || tags.includes(normalizedTechFilter);

    return matchesLevel && matchesTech;
  }).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
    return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
  });

  const AttemptResultModal = () => (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={() => setAttemptResult(null)}>
      <div className="bg-white dark:bg-[#150a29] max-w-sm w-full rounded-[2rem] p-8 text-center shadow-2xl border border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95 relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/30 border-4 border-white dark:border-[#150a29]">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Attempt Completed</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">You have reached the maximum allowed attempts for <strong>{attemptResult.examTitle}</strong>.</p>

        <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-2xl p-5 mb-6 border border-gray-100 dark:border-purple-900/30 text-left space-y-3 shadow-inner">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-purple-900/30 pb-3">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Final Score</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">{attemptResult.score} <span className="text-xs text-gray-400 font-bold">/ {attemptResult.maxScore}</span></span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-purple-900/30 py-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Time Taken</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> {formatTime(attemptResult.timeTaken)}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Submission Date</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{new Date(attemptResult.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button onClick={() => setAttemptResult(null)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2 uppercase tracking-widest text-xs border-b-4 border-purple-800 active:border-b-0 active:translate-y-1">
          <CheckCircle2 className="w-4 h-4" /> Understood
        </button>
      </div>
    </div>
  );

  const renderExamCard = (exam: any, isPrivate: boolean = false) => {
    const { state, color, label, text } = getExamState(exam);
    const isPractice = exam.examId && exam.examId.startsWith('PRAC-');
    const isLive = state === "LIVE";

    const parsedTags = exam.tags ? exam.tags.split(/[\s,]+/).filter(Boolean).map((t: string) => t.startsWith('#') ? t.toUpperCase() : `#${t.replace(/\s+/g, '').toUpperCase()}`) : ['#GENERAL'];

    const techDisplay = getExamTech(exam.tags);
    const difficultyClass =
      exam.difficultyLevel === 'EASY' ? 'text-emerald-500' :
        exam.difficultyLevel === 'MEDIUM' ? 'text-amber-500' :
          exam.difficultyLevel === 'HARD' ? 'text-rose-500' : 'text-blue-500';

    return (
      <div key={exam.id} className={`bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl rounded-[2rem] p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 transition-all duration-300 relative overflow-hidden group flex flex-col h-full transform hover:-translate-y-1 hover:shadow-xl ${isLive ? "border-purple-500/30 hover:border-purple-400 dark:border-purple-500/20 dark:hover:border-purple-500/50" : state === "SCHEDULED" ? "border-amber-500/30 dark:border-amber-500/20" : "border-gray-200 dark:border-purple-900/30 opacity-80"}`}>

        {isLive && <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>}

        <div className="absolute top-5 right-5 z-20">
          <span className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${color === "purple" ? "bg-purple-600 text-white border-none shadow-[0_0_15px_rgba(168,85,247,0.4)]" : color === "amber" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}>
            {isLive && <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0"></div>}
            {state === "SCHEDULED" && <Clock className="w-3.5 h-3.5 shrink-0" />}
            {state === "EXPIRED" && <XCircle className="w-3.5 h-3.5 shrink-0" />}
            {label}
          </span>
        </div>

        <div className="flex-1 flex flex-col w-full relative z-10 mb-5">
          <div className="pr-28 sm:pr-36">
            {isPrivate && !isPractice && <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-white bg-purple-600 px-3 py-1.5 rounded-lg w-max mb-4 uppercase tracking-widest shadow-md"><KeyRound className="w-3.5 h-3.5 shrink-0" /> Private Roster</div>}
            {isPractice && <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-white bg-purple-600 px-3 py-1.5 rounded-lg w-max mb-4 uppercase tracking-widest shadow-md"><Target className="w-3.5 h-3.5 shrink-0" /> Private Arena Exam</div>}

            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-all">{exam.title}</h3>

            <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 leading-snug w-full">
              {isPractice ? <DatabaseZap className="w-4 h-4 text-purple-500 shrink-0" /> : <UserCircle className="w-4 h-4 text-purple-500 shrink-0" />}
              <span className="truncate">{isPractice ? 'Auto-Compiled from Bank' : `By ${formatFullName(exam.creatorEmail)}`}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 w-full">
            {parsedTags.map((t: string, i: number) => (
              <span key={i} className="text-[9px] sm:text-[10px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 px-2 py-1 rounded shadow-sm tracking-widest break-all max-w-full">
                {t}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto w-full">
            <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-purple-900/30 shadow-inner flex flex-col justify-center w-full transition-colors hover:border-purple-300 dark:hover:border-purple-700/50">
              <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Questions</p>
              <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-1.5"><FileText className="w-4 h-4 text-purple-500 shrink-0" /> <span>{exam.totalQuestions}</span></div>
            </div>

            <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-purple-900/30 shadow-inner flex flex-col justify-center w-full transition-colors hover:border-amber-300 dark:hover:border-amber-700/50">
              <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Duration</p>
              <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500 shrink-0" /> <span>{exam.durationMinutes} Min</span></div>
            </div>

            <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-purple-900/30 shadow-inner flex flex-col justify-center w-full transition-colors hover:border-blue-300 dark:hover:border-blue-700/50">
              <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Level</p>
              <div className={`text-sm sm:text-base font-black flex items-center gap-1.5 ${difficultyClass}`}>
                <Activity className="w-4 h-4 shrink-0" />
                <span className="uppercase">{exam.difficultyLevel || 'MIXED'}</span>
              </div>
            </div>

            {isPractice ? (
              <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-purple-900/30 shadow-inner flex flex-col justify-center w-full transition-colors hover:border-emerald-300 dark:hover:border-emerald-700/50 overflow-hidden">
                <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Passkey</p>
                <div className="text-sm sm:text-base font-black text-emerald-500 flex items-center gap-1.5"><KeyRound className="w-4 h-4 shrink-0" /> <span>PRACTICE</span></div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-purple-900/30 shadow-inner flex flex-col justify-center w-full transition-colors hover:border-indigo-300 dark:hover:border-indigo-700/50 overflow-hidden">
                <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Tech Stack</p>
                <div className="text-sm sm:text-base font-black text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5"><Code2 className="w-4 h-4 shrink-0" /> <span className="truncate">{techDisplay}</span></div>
              </div>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-5 leading-relaxed">{text}</p>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-purple-900/30 relative z-10 w-full">
          {isLive && (
            <button onClick={() => handleStartExamClick(exam)} className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] active:scale-[0.98] text-xs sm:text-sm cursor-pointer uppercase tracking-widest border-b-4 border-purple-800 active:border-b-0 active:translate-y-1">
              START ASSESSMENT
            </button>
          )}
          {state === "SCHEDULED" && (
            <button disabled className="w-full flex items-center justify-center bg-gray-100 dark:bg-[#0f0a1c] text-gray-400 font-black py-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 cursor-not-allowed text-xs sm:text-sm uppercase tracking-widest transition-all">
              LOCKED UNTIL LAUNCH
            </button>
          )}
          {state === "EXPIRED" && (
            <button disabled className="w-full flex items-center justify-center bg-gray-100 dark:bg-[#0f0a1c] text-gray-400 font-black py-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 cursor-not-allowed text-xs sm:text-sm uppercase tracking-widest transition-all">
              SUBMISSIONS CLOSED
            </button>
          )}
        </div>
      </div>
    );
  };

  const selectClass = "bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 focus:border-purple-500 rounded-xl px-3 py-2.5 outline-none cursor-pointer dark:text-white text-xs font-bold transition-all shadow-inner appearance-none w-full";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 relative scroll-smooth">
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {errorModal.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={() => setErrorModal({ isOpen: false, message: '' })}>
          <div className="bg-white dark:bg-[#150a29] max-w-sm w-full rounded-[2rem] p-8 text-center shadow-2xl border border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 border-4 border-white dark:border-[#150a29]"><ShieldAlert className="w-10 h-10" /></div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Access Denied</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">{errorModal.message}</p>
            <button onClick={() => setErrorModal({ isOpen: false, message: '' })} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-4 rounded-xl transition-all cursor-pointer hover:opacity-90 shadow-md active:scale-95 uppercase tracking-widest text-xs">Understood</button>
          </div>
        </div>
      )}

      {attemptResult && <AttemptResultModal />}

      {examToJoin && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={() => setExamToJoin(null)}>
          <div className="bg-white dark:bg-[#150a29] w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-purple-900/50 overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col" onClick={e => e.stopPropagation()}>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>

            <div className="bg-gray-50/50 dark:bg-[#0f0a1c]/80 backdrop-blur-sm p-6 sm:p-8 text-center relative border-b border-gray-200 dark:border-purple-900/50">
              <button onClick={() => setExamToJoin(null)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer bg-white dark:bg-[#1a0d36] shadow-sm"><X className="w-5 h-5" /></button>
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-white/20 transform rotate-12"><ShieldCheck className="w-10 h-10 text-white drop-shadow-md" /></div>
              <h3 className="font-black text-2xl text-gray-900 dark:text-white leading-tight tracking-tight">Security Gateway</h3>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-2 font-black tracking-widest uppercase bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full w-max mx-auto border border-purple-200 dark:border-purple-800/50">Authentication Required</p>
            </div>

            <div className="p-6 sm:p-8 space-y-6 relative z-10 flex-1">
              <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-5 border-2 border-gray-100 dark:border-purple-900/40 shadow-sm">
                <h4 className="text-base font-black text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug">{examToJoin.title}</h4>
                <div className="flex flex-col gap-2 text-xs font-bold">
                  <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Fingerprint className="w-4 h-4 text-purple-500" /> ID: <span className="font-mono text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded shadow-inner">{examToJoin.examId}</span></span>
                  <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><UserCircle className="w-4 h-4 text-purple-500" /> By: <span className="text-gray-900 dark:text-gray-200">{formatFullName(examToJoin.creatorEmail)}</span></span>
                </div>
              </div>

              <div className="relative pt-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-4 block text-center">Instructor Passkey (8 Characters)</label>
                <div className={`flex justify-center gap-1.5 sm:gap-2 mb-2 ${verifyError ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                  {passkeyArray.map((digit, index) => (
                    <input
                      // 🌟 FIX: Proper ref assignment returning void
                      key={index} ref={(el) => { inputRefs.current[index] = el; }}
                      type="password" maxLength={8} value={digit}
                      onChange={(e) => handlePasskeyChange(index, e.target.value)}
                      onKeyDown={(e) => handlePasskeyKeyDown(index, e)}
                      className={`w-9 h-12 sm:w-10 sm:h-14 text-center text-xl font-black rounded-xl border-2 focus:outline-none transition-all shadow-inner 
                            ${verifyError ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/10 focus:ring-4 ring-red-500/20"
                          : "bg-gray-50 dark:bg-[#0f0a1c] border-gray-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-4 ring-purple-600/20 dark:text-white"}`}
                    />
                  ))}
                </div>
                {verifyError && <p className="text-[11px] text-red-500 text-center font-black mt-4 absolute w-full -bottom-6 tracking-wide">ACCESS DENIED. INVALID PASSKEY.</p>}
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0 bg-transparent shrink-0">
              <button
                onClick={handleVerifyPasskey}
                disabled={isVerifying || passkeyArray.join('').length !== 8}
                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-0.5 active:scale-95 border-b-4 border-purple-800 active:border-b-0"
              >
                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-5 h-5" /> Unlock Assessment</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 dark:border-purple-900/30 p-8 sm:p-12 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none transition-all duration-700 group-hover:scale-110"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform group-hover:rotate-12 transition-transform duration-500">
            <Search className="w-10 h-10 text-white dark:text-gray-900" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Find an Assessment</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-8 font-medium max-w-lg mx-auto leading-relaxed">Enter your unique Exam ID to securely access private assessments directly assigned to your specific roster batch.</p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-white dark:bg-[#0f0a1c] p-2 rounded-2xl border-2 border-gray-100 dark:border-purple-900/50 shadow-sm focus-within:border-purple-500 focus-within:ring-4 ring-purple-600/10 transition-all">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text" placeholder="ENTER EXAM ID (e.g. EXM-A48F9B)" value={searchId} onChange={e => setSearchId(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-14 pr-5 py-4 bg-transparent border-none rounded-xl text-sm sm:text-base font-black tracking-widest focus:outline-none dark:text-white uppercase placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>
            <button onClick={handleSearch} disabled={!searchId || loading || isSearching} className="bg-purple-600 text-white font-black py-4 px-10 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md cursor-pointer uppercase tracking-widest text-xs active:scale-95 shrink-0 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1">
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Locate Exam'}
            </button>
          </div>

          {searchedExam && (
            <div className="mt-8 text-left animate-in slide-in-from-bottom-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4" /> Match Found</h4>
              {renderExamCard(searchedExam, true)}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" /> Public Registry
            </h3>
            <span className="text-[10px] sm:text-xs font-black bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800/50 uppercase tracking-widest">{processedPublicExams.length} Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto mt-4 md:mt-0">
            <div className="relative w-full">
              <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500" />
              <select value={techFilter} onChange={e => setTechFilter(e.target.value)} className={`${selectClass} pl-9`}>
                <option value="ALL">All Tech</option>
                <option value="JAVA">Java</option>
                <option value="PYTHON">Python</option>
                <option value="CPP">C++</option>
                <option value="C">C</option>
                <option value="JAVASCRIPT">JavaScript</option>
                <option value="SQL">SQL</option>
                <option value="MYSQL">MySQL</option>
                <option value="DSA">Data Structures</option>
                <option value="SPRING_CORE">Spring Core</option>
                <option value="SPRING_BOOT">Spring Boot</option>
                <option value="SPRING_MVC">Spring MVC</option>
                <option value="SPRING_DATA_JPA">Spring JPA</option>
                <option value="SPRING_JDBC">Spring JDBC</option>
                <option value="SPRING_ORM">Spring ORM</option>
                <option value="REST_API">REST API</option>
                <option value="HIBERNATE">Hibernate</option>
                <option value="MAVEN">Maven</option>
                <option value="JUNIT">JUnit</option>
                <option value="LOGGING">Logging</option>
              </select>
            </div>
            <div className="relative w-full">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
              <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className={`${selectClass} pl-9`}>
                <option value="ALL">All Levels</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div className="relative w-full">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500" />
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className={`${selectClass} pl-9`}>
                <option value="NEWEST">Newest</option>
                <option value="OLDEST">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {processedPublicExams.length === 0 ? (
          <div className="bg-white/50 dark:bg-[#150a29]/50 backdrop-blur-xl rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-purple-900/30 p-16 sm:p-24 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-[#0f0a1c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Rocket className="w-10 h-10 text-gray-300 dark:text-gray-700" /></div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Public Exams Active</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">There are currently no globally accessible assessments matching your filters. Try adjusting them or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
            {processedPublicExams.map(exam => renderExamCard(exam, false))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
      `}} />
    </div>
  );
}