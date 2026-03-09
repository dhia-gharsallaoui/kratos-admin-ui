/**
 * Centralized logging utility with environment-aware levels and formatting
 */

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	NONE = 4,
}

interface LoggerConfig {
	level: LogLevel;
	prefix?: string;
	enableTimestamp?: boolean;
	enableColors?: boolean;
}

class Logger {
	private config: LoggerConfig;

	constructor(config: Partial<LoggerConfig> = {}) {
		const defaultConfig: LoggerConfig = {
			level: this.getDefaultLogLevel(),
			prefix: "",
			enableTimestamp: true,
			enableColors: typeof window !== "undefined", // Enable colors in browser
		};

		this.config = { ...defaultConfig, ...config };
	}

	private getDefaultLogLevel(): LogLevel {
		// Use environment variable or default to INFO in production, DEBUG in development
		if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
			return LogLevel.WARN;
		}
		return LogLevel.DEBUG;
	}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.config.level;
	}

	private formatMessage(level: LogLevel, message: string, ...args: any[]): [string, ...any[]] {
		const timestamp = this.config.enableTimestamp
			? new Date().toISOString().slice(11, 23) // HH:mm:ss.sss format
			: "";

		const levelName = LogLevel[level];
		const prefix = this.config.prefix ? `[${this.config.prefix}]` : "";

		let formattedMessage = "";

		if (this.config.enableColors && typeof window !== "undefined") {
			// Browser console styling
			const colors: Record<LogLevel, string> = {
				[LogLevel.DEBUG]: "color: #6b7280", // gray
				[LogLevel.INFO]: "color: #3b82f6", // blue
				[LogLevel.WARN]: "color: #f59e0b", // yellow
				[LogLevel.ERROR]: "color: #ef4444", // red
				[LogLevel.NONE]: "color: #000000", // black
			};

			formattedMessage = `%c${timestamp ? `${timestamp} ` : ""}${prefix}${levelName}: ${message}`;
			return [formattedMessage, colors[level] || "", ...args];
		} else {
			// Node.js or plain console
			formattedMessage = `${timestamp ? `${timestamp} ` : ""}${prefix}${levelName}: ${message}`;
			return [formattedMessage, ...args];
		}
	}

	debug(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.DEBUG)) {
			const [formattedMessage, ...formattedArgs] = this.formatMessage(LogLevel.DEBUG, message, ...args);
			console.debug(formattedMessage, ...formattedArgs);
		}
	}

	info(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.INFO)) {
			const [formattedMessage, ...formattedArgs] = this.formatMessage(LogLevel.INFO, message, ...args);
			console.info(formattedMessage, ...formattedArgs);
		}
	}

	warn(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.WARN)) {
			const [formattedMessage, ...formattedArgs] = this.formatMessage(LogLevel.WARN, message, ...args);
			console.warn(formattedMessage, ...formattedArgs);
		}
	}

	error(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.ERROR)) {
			const [formattedMessage, ...formattedArgs] = this.formatMessage(LogLevel.ERROR, message, ...args);
			console.error(formattedMessage, ...formattedArgs);
		}
	}

	/**
	 * Logs an error with stack trace
	 */
	logError(error: Error | unknown, context?: string): void {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const contextMsg = context ? `${context}: ` : "";

		this.error(`${contextMsg}${errorMessage}`);

		if (error instanceof Error && error.stack && this.shouldLog(LogLevel.DEBUG)) {
			console.error("Stack trace:", error.stack);
		}
	}

	/**
	 * Creates a child logger with a specific prefix
	 */
	child(prefix: string): Logger {
		return new Logger({
			...this.config,
			prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
		});
	}

	/**
	 * Sets the log level
	 */
	setLevel(level: LogLevel): void {
		this.config.level = level;
	}

	/**
	 * Gets the current log level
	 */
	getLevel(): LogLevel {
		return this.config.level;
	}
}

// Create default logger instance
const defaultLogger = new Logger();

// Export default logger methods for easy use
export const logger = {
	debug: (message: string, ...args: any[]) => defaultLogger.debug(message, ...args),
	info: (message: string, ...args: any[]) => defaultLogger.info(message, ...args),
	warn: (message: string, ...args: any[]) => defaultLogger.warn(message, ...args),
	error: (message: string, ...args: any[]) => defaultLogger.error(message, ...args),
	logError: (error: Error | unknown, context?: string) => defaultLogger.logError(error, context),
	child: (prefix: string) => defaultLogger.child(prefix),
	setLevel: (level: LogLevel) => defaultLogger.setLevel(level),
	getLevel: () => defaultLogger.getLevel(),
};

// Create specialized loggers for different modules
export const apiLogger = defaultLogger.child("API");
export const authLogger = defaultLogger.child("AUTH");
export const uiLogger = defaultLogger.child("UI");

// Export Logger class for creating custom instances
export { Logger };

// Utility for replacing console statements
export const replaceConsole = {
	log: logger.info,
	info: logger.info,
	warn: logger.warn,
	error: logger.error,
	debug: logger.debug,
};
