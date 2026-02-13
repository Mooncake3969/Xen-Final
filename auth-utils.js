import axios from "axios";
import { createRequire } from 'module';
import {logInfo, logError} from './console-logger.js'

const require = createRequire(import.meta.url)
const cookieParser = require("cookie")
const url = require("url")
const querystring = require("querystring")
const fs = require('fs');

const AUTH_COOKIE_KEY = "__auth_key"
const AUTH_LAST_SEEN = "__last_seen"
const AUTH_EXECEPTION_REFER = [/sw.js$/, /\/service\/go\//]
const AUTH_INTERVAL_SECONDS = 86400

export function shouldDisableCache(request) {
    const thisUrl = url.parse(request.url)
    const thisParam = querystring.parse(thisUrl.query)
    return (request.url == "/") || (!!thisParam.key)
}
// return "true" or "false"
export async function authorize(request, response) {
    if (isRefererAllowListed(request)) {
        return true
    }

    if (isLastSeenInSeconds(request, AUTH_INTERVAL_SECONDS)) {
        return true
    }

    const thisUrl = url.parse(request.url)
    const thisParam = querystring.parse(thisUrl.query)

    // Convert key status to number
    const parseKeyStatus = (keyStatusString) => parseInt(keyStatusString?.trim() ?? "-1")

    // Registration session, verify key.
    if (thisParam.key) {
      const [key, user, keyStatusString] = await getKeyStatus(thisParam.key)
      const keyStatus = parseKeyStatus(keyStatusString)

      if (keyStatus == 1) {
        setAuthCookie(response, thisParam.key)
        setLastSeenCookie(response, Date.now())
        // TODO: return here reload without querystring
        logInfo(`Register key for "${user}" successfully. Key status: ${keyStatusString}`)
        return true
      } else {
        logError(`Failed to register key for "${user}". Key status: ${keyStatusString}`)
        return false
      }
    } else { // parse cookie
      const authCookieValue = getAuthCookie(request)
      if (authCookieValue) {
        const [key, user, keyStatusString] = await getKeyStatus(authCookieValue)
        const keyStatus = parseKeyStatus(keyStatusString)

        if (keyStatus == 0 || keyStatus == 1) {
            logInfo(`Authorize key for "${user}" successfully. Key status: ${keyStatusString}`)
            setLastSeenCookie(response, Date.now())
            return true
        } else {
            logError(`Failed to authorize key for "${user}". Key status: ${keyStatusString}`)
            return false
        }
      }

      return false
    }
}

export function sendToUnauthorizedPage(response) {
    response.setHeader("Content-Type", "text/html");
    const htmlText = fs.readFileSync('./src/page.html').toString()

    response.write(htmlText);
    response.end();
}

function isRefererAllowListed(request) {
    const referer = request.headers.referer ?? ''
    var isAllowListed = false;

    for (const i in AUTH_EXECEPTION_REFER) {
        if (referer.match(AUTH_EXECEPTION_REFER[i])) {
            return true
        }
    }
    return false
}

function isLastSeenInSeconds(request, seconds) {
    const now = Date.now();
    const lastSeenAt = parseInt(getLastSeenCookie(request))

    if (isNaN(lastSeenAt)) {
        return false
    }

    return ((now - lastSeenAt) < (seconds * 1000))
}

async function getKeyStatus(key) {
    const info = await axios.get(
        "https://raw.githubusercontent.com/Mooncake3969/Configuration/main/info.txt",
        {
            cache: false
        }
    )
    const data = info.data
    const lines = data.split("\n")
    var keyParameters = []
        
    for (let i = 0; i < lines.length; i++) {
        keyParameters = lines[i].split(",")
        if (keyParameters[0] == key) {
            return keyParameters // Return all fields for logging purpose
        }
    }
    return ["", "", "-1"]
}

function getAuthCookie(request) {
    return getCookie(request, AUTH_COOKIE_KEY)
}

function setAuthCookie(response, value) {
    setCookie(response, AUTH_COOKIE_KEY, value, 999999999999)
}

function getLastSeenCookie(request) {
    return getCookie(request, AUTH_LAST_SEEN)
}

function setLastSeenCookie(response, value) {
    setCookie(response, AUTH_LAST_SEEN, value)
}

function getCookie(request, cookieKey) {
    const requestCookies = cookieParser.parse(request.headers.cookie ?? '');
    return requestCookies[cookieKey]
}

function setCookie(response, key, value, age) {
    var cookies = response.getHeader('set-cookie');
    const cookieValue = (!!age) ? `${key}=${value};max-age=${age};` : `${key}=${value};`
    
    // TODO: fix the duplicated cookie
    if (cookies) {
      cookies.push(cookieValue)
    } else {
      cookies = [cookieValue]
    }
  
    response.setHeader('set-cookie', cookies)
}

