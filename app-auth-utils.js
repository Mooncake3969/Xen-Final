import axios from "axios";
import { createRequire } from 'module';

const require = createRequire(import.meta.url)
const cookieParser = require("cookie")
const url = require("url")
const querystring = require("querystring")
const fs = require('fs');

const AUTH_COOKIE_KEY = "__auth_key"
const AUTH_LAST_SEEN = "__last_seen"
const AUTH_EXECEPTION_REFER = [/sw.js$/, /\/service\/go\//]
const AUTH_INTERVAL_SECONDS = 600

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

    // Registration session, verify key.
    if (thisParam.key) {
      const keyStatus = await getKeyStatus(thisParam.key)
      if (keyStatus == 1) {
        setAuthCookie(response, thisParam.key)
        setLastSeenCookie(response, Date.now())
        // TODO: return here reload without querystring
        return true
      }
    } else { // parse cookie
      const authCookieValue = getAuthCookie(request)
      if (authCookieValue) {
        const keyStatus = await getKeyStatus(authCookieValue)
        if (keyStatus.trim() == '0' || keyStatus.trim() == '1') {
            setLastSeenCookie(response, Date.now())
            return true
        }
      }

      return false
    }
}

export function sendToUnauthorizedPage(response) {
    response.setHeader("Content-Type", "text/html");
    const htmlText = fs.readFileSync('./static/page.html').toString()

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
        "https://raw.githubusercontent.com/mooncake39/Configuration/main/info.txt",
        {
            cache: false
        }
    )
    const data = info.data
    const userKeyList = data.split("\n")

    for (const i in userKeyList) {
        const keyParts = userKeyList[i].split(",")
        if (keyParts.length != 3) {
            continue
        }

        if (keyParts[0] == key) {
            return keyParts[2]
        }

        return 2
    }
}

function getAuthCookie(request) {
    return getCookie(request, AUTH_COOKIE_KEY)
}

function setAuthCookie(response, value) {
    setCookie(response, AUTH_COOKIE_KEY, value)
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

function setCookie(response, key, value) {
    var cookies = response.getHeader('set-cookie');
    const cookieValue = key + "=" + value
    
    // TODO: fix the duplicated cookie
    if (cookies) {
      cookies.push(cookieValue)
    } else {
      cookies = [cookieValue]
    }
  
    response.setHeader('set-cookie', cookies)
}


