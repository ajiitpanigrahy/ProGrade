import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X,
    PlusCircle,
    Terminal,
    Code2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Edit3,
} from "lucide-react";
import { adminService } from "../../../../features/admin/adminService";

// 🌟 Import Central Taxonomy
import { TECHNOLOGY_TAXONOMY, ALL_TECHNOLOGIES } from "../../../../constants/taxonomy";

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: any | null; 
}

const getFileExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
        case "python": return "py";
        case "javascript": return "js";
        case "cpp": return "cpp";
        case "c": return "c";
        case "sql": return "sql";
        case "java": return "java";
        case "xml": return "xml";
        case "yaml": return "yml";
        case "properties": return "properties";
        case "bash": return "sh";
        default: return "txt";
    }
};

export default function CreateQuestionModal({
    isOpen,
    onClose,
    onSuccess,
    editData,
}: CreateQuestionModalProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [hasCode, setHasCode] = useState(false);
    const [isCustomTopic, setIsCustomTopic] = useState(false);

    // Fallbacks from central taxonomy
    const defaultTech = ALL_TECHNOLOGIES[0] || "Java";
    const defaultTopic = TECHNOLOGY_TAXONOMY[defaultTech]?.[0] || "General";

    const [formData, setFormData] = useState({
        technology: defaultTech,
        difficultyLevel: "EASY",
        topic: defaultTopic,
        questionText: "",
        codeSnippet: "",
        codeLanguage: "java",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
    });

    // 🌟 INITIALIZE DATA FOR EDIT MODE
    useEffect(() => {
        if (isOpen) {
            setResult(null);
            if (editData) {
                setFormData({
                    technology: editData.technology || defaultTech,
                    difficultyLevel: editData.difficultyLevel || "EASY",
                    topic: editData.topic || defaultTopic,
                    questionText: editData.questionText || "",
                    codeSnippet: editData.codeSnippet || "",
                    codeLanguage: editData.codeLanguage || "java",
                    optionA: editData.optionA || "",
                    optionB: editData.optionB || "",
                    optionC: editData.optionC || "",
                    optionD: editData.optionD || "",
                    correctOption: editData.correctOption || "A",
                });
                setHasCode(!!editData.codeSnippet);

                // If the existing topic isn't in our standard list, set custom topic to true
                const techTopics = TECHNOLOGY_TAXONOMY[editData.technology || defaultTech] || ["General"];
                if (editData.topic && !techTopics.includes(editData.topic)) {
                    setIsCustomTopic(true);
                } else {
                    setIsCustomTopic(false);
                }
            } else {
                // Reset for Create Mode
                setFormData({
                    technology: defaultTech,
                    difficultyLevel: "EASY",
                    topic: defaultTopic,
                    questionText: "",
                    codeSnippet: "",
                    codeLanguage: "java",
                    optionA: "",
                    optionB: "",
                    optionC: "",
                    optionD: "",
                    correctOption: "A",
                });
                setHasCode(false);
                setIsCustomTopic(false);
            }
        }
    }, [isOpen, editData]);

    // 🌟 AUTO-SYNC Tech language matching dynamic names
    useEffect(() => {
        if (editData) return; 
        const tech = formData.technology.toUpperCase();
        const availableTopics = TECHNOLOGY_TAXONOMY[formData.technology] || ["General"];
        
        let autoLang = "txt";
        
        if (tech.includes("JAVASCRIPT")) autoLang = "javascript";
        else if (tech === "JAVA" || tech.includes("SPRING") || tech.includes("HIBERNATE") || tech.includes("JUNIT")) autoLang = "java";
        else if (tech.includes("PYTHON")) autoLang = "python";
        else if (tech === "CPP" || tech === "C++") autoLang = "cpp";
        else if (tech === "C" || tech === "C PROGRAMMING") autoLang = "c";
        else if (tech.includes("SQL") || tech.includes("MYSQL")) autoLang = "sql";
        else if (tech.includes("MAVEN")) autoLang = "xml";
        else if (tech.includes("LOGGING")) autoLang = "properties";

        setFormData((prev) => ({
            ...prev,
            codeLanguage: autoLang,
            topic: availableTopics[0],
        }));
        setIsCustomTopic(false);
    }, [formData.technology]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === "CUSTOM") {
            setIsCustomTopic(true);
            setFormData({ ...formData, topic: "" });
        } else {
            setFormData({ ...formData, topic: e.target.value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const payload = {
                ...formData,
                questionType: hasCode ? "CODING" : "THEORY",
                codeSnippet: hasCode ? formData.codeSnippet : null,
                codeLanguage: hasCode ? formData.codeLanguage : null,
            };

            if (editData) {
                await adminService.updateQuestion(editData.id, payload);
                setResult({
                    type: "success",
                    message: "Question successfully updated.",
                });
            } else {
                await adminService.createQuestion(payload);
                setResult({
                    type: "success",
                    message: "Question successfully injected into the bank.",
                });
            }

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err: any) {
            setResult({
                type: "error",
                message: err.response?.data?.error || "Failed to process request.",
            });
        } finally {
            setLoading(false);
        }
    };

    const currentTopics = TECHNOLOGY_TAXONOMY[formData.technology] || ["General"];

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 md:p-12 animate-in fade-in duration-200">
            <div className="flex flex-col w-full max-w-5xl h-[95vh] sm:h-[90vh] max-h-[900px] bg-white dark:bg-[#150a29] rounded-2xl sm:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-purple-900/50 relative overflow-hidden">
                <div className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-[80px] -top-20 -left-20 pointer-events-none z-0"></div>

                <div className="flex-none flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-purple-900/30 bg-white/95 dark:bg-[#150a29]/95 relative z-20">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {editData ? (
                                <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                            ) : (
                                <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                            )}
                            {editData ? "Edit Asset" : "Manual Entry"}
                        </h2>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
                            {editData
                                ? `Updating Asset #${editData.id}`
                                : "Deploy a single asset to the database"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 min-h-0 relative z-10 w-full"
                >
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-transparent">
                        {result && (
                            <div
                                className={`mb-6 p-4 rounded-xl flex items-center gap-3 border-2 shadow-sm animate-in zoom-in-95 ${result.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"}`}
                            >
                                {result.type === "success" ? (
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                )}
                                <span className="text-xs sm:text-sm font-bold">
                                    {result.message}
                                </span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                        Technology
                                    </label>
                                    <select
                                        name="technology"
                                        value={formData.technology}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 sm:py-3 text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner dark:text-white transition-all cursor-pointer"
                                    >
                                        {/* 🌟 DYNAMIC TAXONOMY LOOP */}
                                        {ALL_TECHNOLOGIES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        name="difficultyLevel"
                                        value={formData.difficultyLevel}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 sm:py-3 text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner dark:text-white transition-all cursor-pointer"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <label className="block text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                        Topic Tag
                                    </label>
                                    {isCustomTopic ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                required
                                                type="text"
                                                name="topic"
                                                placeholder="Type custom topic..."
                                                value={formData.topic}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 sm:py-3 text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner dark:text-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomTopic(false);
                                                    setFormData({ ...formData, topic: currentTopics[0] });
                                                }}
                                                className="p-2.5 sm:p-3 bg-gray-200 dark:bg-gray-800 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                            >
                                                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                        </div>
                                    ) : (
                                        <select
                                            value={formData.topic}
                                            onChange={handleTopicChange}
                                            className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 sm:py-3 text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner dark:text-white transition-all cursor-pointer"
                                        >
                                            {currentTopics.map((topic) => (
                                                <option key={topic} value={topic}>
                                                    {topic}
                                                </option>
                                            ))}
                                            <option
                                                value="CUSTOM"
                                                className="font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                                            >
                                                + Type Custom Topic...
                                            </option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                    Question Prompt
                                </label>
                                <textarea
                                    required
                                    name="questionText"
                                    rows={2}
                                    placeholder="What is the output of the following snippet?"
                                    value={formData.questionText}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner dark:text-white transition-all custom-scrollbar resize-none"
                                />
                            </div>

                            <div className="p-4 sm:p-5 border-2 border-purple-200 dark:border-purple-900/40 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <label className="flex items-center gap-2 text-sm font-black text-purple-700 dark:text-purple-300 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={hasCode}
                                            onChange={(e) => setHasCode(e.target.checked)}
                                            className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-600 cursor-pointer shadow-sm"
                                        />
                                        Add Developer Code Snippet
                                    </label>

                                    {hasCode && (
                                        <div className="flex items-center gap-2">
                                            <Code2 className="w-4 h-4 text-purple-500 shrink-0" />
                                            <select
                                                name="codeLanguage"
                                                value={formData.codeLanguage}
                                                onChange={handleChange}
                                                className="w-full sm:w-44 bg-white dark:bg-[#1a0d36] border-2 border-purple-200 dark:border-purple-800 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-purple-500 dark:text-white cursor-pointer shadow-sm transition-all"
                                            >
                                                <option value="java">Java (.java)</option>
                                                <option value="python">Python (.py)</option>
                                                <option value="cpp">C++ (.cpp)</option>
                                                <option value="c">C (.c)</option>
                                                <option value="javascript">JavaScript (.js)</option>
                                                <option value="sql">SQL (.sql)</option>
                                                <option value="xml">XML (.xml)</option>
                                                <option value="yaml">YAML (.yml)</option>
                                                <option value="properties">
                                                    Properties (.properties)
                                                </option>
                                                <option value="bash">Bash/Shell (.sh)</option>
                                                <option value="txt">Plain Text (.txt)</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {hasCode && (
                                    <div className="rounded-xl overflow-hidden border-2 border-gray-800 bg-[#0c0618] shadow-xl animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#160b2e] border-b border-gray-800">
                                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500"></div>
                                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
                                            <div className="ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-gray-400 truncate">
                                                <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                                                <span>
                                                    Snippet.{getFileExtension(formData.codeLanguage)}
                                                </span>
                                            </div>
                                        </div>
                                        <textarea
                                            required
                                            name="codeSnippet"
                                            placeholder={`// Write or paste your ${formData.codeLanguage} code here...`}
                                            value={formData.codeSnippet}
                                            onChange={handleChange}
                                            className="w-full h-32 sm:h-48 bg-transparent text-emerald-400 font-mono text-xs sm:text-sm p-3 sm:p-4 outline-none resize-y custom-scrollbar whitespace-pre"
                                            spellCheck="false"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {["A", "B", "C", "D"].map((opt) => (
                                    <div key={opt} className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-black">
                                            {opt}
                                        </span>
                                        <input
                                            required
                                            type="text"
                                            name={`option${opt}`}
                                            placeholder={`Option ${opt} text...`}
                                            value={(formData as any)[`option${opt}`]}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl pl-12 pr-4 py-2.5 sm:py-3 text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner dark:text-white transition-all"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                    Correct Answer Designation
                                </span>
                                <div className="flex gap-2">
                                    {["A", "B", "C", "D"].map((opt) => (
                                        <button
                                            type="button"
                                            key={opt}
                                            onClick={() =>
                                                setFormData({ ...formData, correctOption: opt })
                                            }
                                            className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all cursor-pointer ${formData.correctOption === opt ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 border-2 border-emerald-600" : "bg-white dark:bg-[#1a0d36] text-gray-500 border-2 border-gray-200 dark:border-gray-800 hover:border-emerald-400"}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-none p-4 sm:p-6 border-t border-gray-100 dark:border-purple-900/30 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-white/95 dark:bg-[#150a29]/95 relative z-20">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_10px_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Committing...
                                </>
                            ) : editData ? (
                                "Save Changes"
                            ) : (
                                "Save Question to Bank"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}