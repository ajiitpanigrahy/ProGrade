package mac.prograde.api.enums;

public enum InfractionType {
    TAB_SWITCH,
    DEV_TOOLS,          // Captured by useProctoring
    COPY_PASTE,         // Captured by useProctoring
    AUDIO_ANOMALY,      // Captured by Web Audio API
    MOBILE_DISCONNECT,
    FULLSCREEN_EXIT
}