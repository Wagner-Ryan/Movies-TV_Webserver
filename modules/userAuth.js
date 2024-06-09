const bcrypt = require("bcrypt");
const database = require("./database");
const serverUtils = require("./serverUtils")

async function loginUser (username, password) {
    // Get DB connection
    const conn = await database.fetchConn();
    let userObject = {
      loginSuccess: false,
    };
    try {
      // Make sure the user exists in the database first!
      if ((await conn.query("SELECT * FROM users WHERE username = ?", username)).length > 0) {
        const userDetails = await conn.query("SELECT * FROM users WHERE username = ?", username);
        const hashedPassword = userDetails[0].password_hash;
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
        if (isPasswordCorrect) {
          console.log(`Logging in ${username}...`);
          const isAdmin = userDetails[0].is_admin;
          const accessToken = serverUtils.createJWT({ username: username, isAdmin: isAdmin });
          userObject.loginSuccess = isPasswordCorrect;
          userObject.accessToken = accessToken;
        }
      }
    } catch (err) {
      console.error(err);
    }
    return userObject;
}

async function createNewUser(username, email, password) {
    // Get DB connection
    const conn = await database.fetchConn();
    let wasAccountCreated = false;
    let newUserObject = {
        wasCreated: wasAccountCreated,
    };
    try {
        if ((await conn.query("SELECT * FROM users WHERE username = ?", username)).length === 0) {
            console.log(`Creating new user with username: ${username}`);
            const saltRounds = 10;
            let hashedPassword = await bcrypt.hash(password, saltRounds);
            await conn.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hashedPassword]);
            const accessToken = serverUtils.createJWT({ username: username });
            newUserObject.wasCreated = true;
            newUserObject.accessToken = accessToken;
        } else {
            newUserObject.error = "Username already taken!";
            console.log("Account Creation Cancelled: User already exists");
        }
    } catch (err) {
        console.error(err);
    }
    return newUserObject;
}

module.exports = {
    loginUser,
    createNewUser
}