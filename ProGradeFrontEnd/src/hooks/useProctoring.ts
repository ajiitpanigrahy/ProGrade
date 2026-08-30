import { useEffect, useRef, useState } from 'react';
import { axiosClient } from '../api/axiosClient';

export function useProctoring(assessmentId: number) {
    const [audioWarning, setAudioWarning] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // 🚨 1. BROWSER LOCKDOWN & ANTI-TAMPER
    useEffect(() => {
        const preventTampering = (e: KeyboardEvent) => {
            // Block F12, Ctrl+Shift+I, Cmd+Option+I, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
                (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key)) ||
                (e.ctrlKey && e.key === 'u') ||
                (e.metaKey && e.key === 'u')
            ) {
                e.preventDefault();
                reportInfraction('DEV_TOOLS', 'Attempted to open Developer Tools or view source.');
            }
        };

        const preventContextMenu = (e: MouseEvent) => e.preventDefault();
        const preventCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            reportInfraction('COPY_PASTE', 'Attempted to copy/paste content.');
        };

        window.addEventListener('keydown', preventTampering);
        window.addEventListener('contextmenu', preventContextMenu);
        window.addEventListener('copy', preventCopyPaste);
        window.addEventListener('paste', preventCopyPaste);

        return () => {
            window.removeEventListener('keydown', preventTampering);
            window.removeEventListener('contextmenu', preventContextMenu);
            window.removeEventListener('copy', preventCopyPaste);
            window.removeEventListener('paste', preventCopyPaste);
        };
    }, []);

    // 🎤 2. AUDIO ANOMALY DETECTION (Runs strictly locally)
    const startAudioProctoring = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            
            source.connect(analyser);
            analyser.fftSize = 256;
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const checkAudioLevel = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                
                // Calculate average volume level
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                
                // Volume threshold (adjust between 30-60 based on mic sensitivity)
                if (average > 45) { 
                    setAudioWarning(true);
                    reportInfraction('AUDIO_ANOMALY', `High background noise detected (Loudness: ${Math.round(average)}).`);
                    setTimeout(() => setAudioWarning(false), 3000);
                }
            };

            // Check audio every 1.5 seconds to save CPU
            const interval = setInterval(checkAudioLevel, 1500);
            return () => clearInterval(interval);

        } catch (err) {
            console.error("Microphone access denied", err);
        }
    };

    const reportInfraction = (type: string, details: string) => {
        axiosClient.post(`/student/exam/${assessmentId}/malpractice`, {
            infraction: type,
            details: details
        }).catch(console.error);
    };

    const stopProctoring = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close();
    };

    return { startAudioProctoring, stopProctoring, audioWarning };
}