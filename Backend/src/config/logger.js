const logger = {
    info: (...messages) => {
        console.log("[INFO]", ...messages);
    },

    warn: (...messages) => {
        console.warn("[WARN]", ...messages);
    },

    error: (...messages) => {
        console.error("[ERROR]", ...messages);
    },

    debug: (...messages) => {
        console.debug("[DEBUG]", ...messages);
    }
};

export default logger;