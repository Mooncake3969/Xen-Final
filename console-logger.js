
const DEBUG_LEVEL = 'DEBUG'
const INFO_LEVEL = 'INFO'
const WARNING_LEVEL = 'WARNING'
const ERROR_LEVEL = 'ERROR'

export function logDebug(message) {
    logWithTimestamp(DEBUG_LEVEL, message)
}

export function logInfo(message) {
    logWithTimestamp(INFO_LEVEL, message)
}

export function logWarning(message) {
    logWithTimestamp(WARNING_LEVEL, message)
}

export function logError(message) {
    logWithTimestamp(ERROR_LEVEL, message)
}

export function logText(message) {
    console.log(message)
}

function logWithTimestamp(level, message) {
    const timestamp = (new Date()).toISOString()
    logText(`[${timestamp}] [${level}] ${message}`)
}