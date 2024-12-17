export const LOG_PREFIX = "[SUBTITLE-WEBAPP]";
const levels = ["error", "debug", "warn"] as const;
type Level = (typeof levels)[number];
type LogFn = (...args: unknown[]) => void;
type Logger = Record<Level, LogFn>;
const getLog = (level: Level) => {
    return (...args: unknown[]) => {
        console[level](LOG_PREFIX, ...args.length ? args : [undefined]);
    }
}
const _log = levels.reduce<Partial<Logger>>((acc, level) => {
    acc[level] = getLog(level)
    return acc
}, {});

const log = _log as Logger;

export default log;
