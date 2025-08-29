// Production-ready logger utility
class Logger {
    constructor() {
        this.isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';
        this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'error';
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
    }

    shouldLog(level) {
        if (!this.isDevelopment) {
            // In production, only log errors
            return level === 'error';
        }
        return this.levels[level] >= this.levels[this.logLevel];
    }

    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }

    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    error(message, error, ...args) {
        if (this.shouldLog('error')) {
            console.error(`[ERROR] ${message}`, error, ...args);
            
            // In production, you might want to send errors to a logging service
            if (!this.isDevelopment && window.gtag) {
                window.gtag('event', 'exception', {
                    description: message,
                    fatal: false
                });
            }
        }
    }

    // For API errors
    apiError(endpoint, error, requestData = null) {
        const message = `API Error: ${endpoint}`;
        if (this.shouldLog('error')) {
            console.error(message, {
                error: error.message || error,
                status: error.response?.status,
                data: error.response?.data,
                requestData
            });
        }
    }
}

// Export singleton instance
const logger = new Logger();

export default logger;