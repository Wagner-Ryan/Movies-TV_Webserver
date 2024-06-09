// Returns the value of a key
function parseStringCookiesKey(cookie, key) {
    let value = null;
    try {
    // Remove whitespace
    cookie = cookie.replace(' ', '');
    // Split at ;
    cookie = cookie.split(';');
    // Split each keyPair
    cookie.forEach((keyPair) => {
        let keyArray = keyPair.split('=')
        if (keyArray[0] === key){
            value = keyArray[1];
        }
    })
    } catch (err) {
        // Do nothing as cookie string was empty
    }
    return value;
}

// Returns all values with keys in JSON
function parseStringCookies(cookie) {
    let cookieJSON = {};
    try {
    // Remove whitespace
    cookie = cookie.replace(' ', '');
    // Split at ;
    cookie = cookie.split(';');
    // Split each keyPair
    cookie.forEach((keyPair) => {
        let keyArray = keyPair.split('=')
        cookieJSON[keyArray[0]] = keyArray[1];
    })
    } catch (err) {
    // Do nothing as cookie string was empty
    }
    return cookieJSON;
}

// Returns key's value if exists
function parseJSONCookiesKey(cookie, key) {
    let value = null;
    try {
        value = cookie[key];
    } catch (err) {
        // Do nothing as cookies were invalid or empty
    }
    return value;
}

module.exports = {
    parseStringCookiesKey,
    parseStringCookies,
    parseJSONCookiesKey
}