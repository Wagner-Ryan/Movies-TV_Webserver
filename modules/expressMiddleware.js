const serverUtils = require("./serverUtils");

async function verifyIsAdmin(req, res, next) {
    try {
        const isAdmin = serverUtils.getAdminStatusFromToken(serverUtils.getAccessToken(req.cookies));
        if (isAdmin) {
            return next();
        } else {
            return res.status(403).json({ error: "You are not authorized to this resource" });
        }
    } catch(err) {
        console.error(err);
    }
}

async function verifyIsLoggedIn(req, res, next) {
    try {
        const isLoggedIn = serverUtils.checkIsLoggedIn(req.cookies);
        if (isLoggedIn){
            return next()
        } else {
            return res.status(401).redirect("/login");
        }
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    verifyIsLoggedIn,
    verifyIsAdmin
}