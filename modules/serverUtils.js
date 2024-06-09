require("dotenv").config();
const expressCookieParser = require("cookie-parser");
const cookieParser = require("./cookieParser");
const jwt = require("jsonwebtoken");
const database = require("./database")

const accessTokenName = "access_token";

function createJWT(data) {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);
}
  
  // Returns JWT data AND verifies that the token was created by the server
function getJWTData(JWT) {
    let data = null;
    try {
        data = jwt.verify(JWT, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        // Do nothing
    }
    return data;
}
function isString(possibleString) {
    return typeof possibleString == "string";
}
function getAccessToken(cookies) {
    let accessToken;
    try {
        if (typeof cookies == "string") {
            accessToken = cookieParser.parseStringCookiesKey(cookies, accessTokenName);
        } else {
        accessToken = cookieParser.parseJSONCookiesKey(cookies, accessTokenName);
        }
    } catch (err) {
        console.error("Incorrect type passed to getAccessToken!");
    }
    return accessToken;
}
  
function getUserFromToken(token) {
    let username = null;
    const data = getJWTData(token);
    if (data) {
        try {
            username = data.username;
        } catch (err) {
            // Do nothing
        }
    }
    return username;
}

function getAdminStatusFromToken(token) {
    let isAdmin = false;
    const data = getJWTData(token);
    if (data) {
        try {
            isAdmin = data.isAdmin;
        } catch (err) {
            // Do nothing
        }
    }
    return isAdmin;
}
  
function checkIsLoggedIn(cookies) {
    let isLoggedIn = false;
    let JSONCookies = expressCookieParser.JSONCookies(cookies);
    let token = cookieParser.parseJSONCookiesKey(JSONCookies, accessTokenName);
    if (token) {
        if (getJWTData(token)) isLoggedIn = true;
    }
    return isLoggedIn;
}

async function checkIfUserExists(username) {
    const conn = await database.fetchConn();
    let userExists = false
    if ((await conn.query("SELECT * FROM users WHERE username = ?", username)).length > 0) {
        userExists = true;
    }
    return userExists;
}

module.exports = {
    createJWT,
    getJWTData,
    isString,
    getAccessToken,
    getUserFromToken,
    checkIsLoggedIn,
    checkIfUserExists,
    getAdminStatusFromToken
}