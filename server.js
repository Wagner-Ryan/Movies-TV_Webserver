 const express = require("express");
const path = require("node:path");
require("dotenv").config();
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const database = require("./modules/database");
const userAuth = require("./modules/userAuth");
const serverUtils = require("./modules/serverUtils");
const expMiddle = require("./modules/expressMiddleware");
const cookieParser = require('cookie-parser')
const { createServer } = require("node:http");
const { getSystemErrorMap } = require("node:util");
const port = 7777;
const app = express();
const server = createServer(app);

app.set("view engine", "ejs");
app.use(cookieParser())
app.use(express.json({ limit: "1kb" }));
app.use(express.static(path.join(__dirname, "public")));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


// Named Constants
const accessTokenName = "access_token";
const bearerToken = process.env.TMDB_TOKEN;

function getMenuBarOptions(reqCookies, otherOptions) {
    const isLoggedIn = serverUtils.checkIsLoggedIn(reqCookies);
    const accessToken = serverUtils.getAccessToken(reqCookies)
    const username = serverUtils.getUserFromToken(accessToken);
    const isAdmin = serverUtils.getAdminStatusFromToken(accessToken);
    let options = { username: username, isLoggedIn: isLoggedIn, isAdmin: isAdmin };
    if (typeof(otherOptions) == "object") {
	    return {...options, ...otherOptions};
    }
    return options;
}

async function getPersonImagePath(tmdbId) {
    try {
        let data = null;
        const conn = await database.fetchConn();
        if (tmdbId) {
            // Check if ID exists and if so update data
            if ((await conn.query("SELECT * FROM Actors WHERE tmdb_id = ?", [tmdbId])).length > 0) {
                data = await conn.query("SELECT * FROM Actors WHERE tmdb_id = ?", [tmdbId]);
            } else if ((await conn.query("SELECT * FROM Directors WHERE tmdb_id = ?", [tmdbId])).length > 0) {
                data = await conn.query("SELECT * FROM Directors WHERE tmdb_id = ?", [tmdbId]);
            }
        }
        const path = (data[0].tmdb_image_path != null) ? `https://image.tmdb.org/t/p/w185${data[0].tmdb_image_path}` : "/icons/no-available-image.svg";
        return path;
    } catch(err) {
        console.error(err);
    }
}

async function getMovieImagePath(tmdbId) {
    try {
        let data = null;
        const conn = await database.fetchConn();
        if (tmdbId) {
            // Check if ID exists and if so update data
            if ((await conn.query("SELECT * FROM Movies WHERE tmdb_id = ?", [tmdbId])).length > 0) {
                data = await conn.query("SELECT * FROM Movies WHERE tmdb_id = ?", [tmdbId]);
            }
        }
        const path = (data[0].poster_path != null) ? `https://image.tmdb.org/t/p/w185${data[0].poster_path}` : "/icons/no-available-image.svg";
        return path;
    } catch(err) {
        console.error(err);
    }
}

async function getTVImagePath(tmdbId) {
    try {
        let data = null;
        const conn = await database.fetchConn();
        if (tmdbId) {
            // Check if ID exists and if so update data
            if ((await conn.query("SELECT * FROM TVShows WHERE tmdb_id = ?", [tmdbId])).length > 0) {
                data = await conn.query("SELECT * FROM TVShows WHERE tmdb_id = ?", [tmdbId]);
            }
        }
        const path = (data[0].poster_path != null) ? `https://image.tmdb.org/t/p/w185${data[0].poster_path}` : "/icons/no-available-image.svg";
        return path;
    } catch(err) {
        console.error(err);
    }
}

// Handle get requests
app.get("/", async (req, res) => {
    try {
        let data = [];
        const conn = await database.fetchConn();
        data[0] = await conn.query("SELECT title, poster_path, tmdb_rating, tmdb_id FROM Movies WHERE tmdb_rating > 8 AND tmdb_rating < 8.8 ORDER BY tmdb_rating DESC LIMIT 20");
        data[1] = await conn.query("SELECT * FROM TVShows WHERE tmdb_rating < 9 AND tmdb_rating >= 8.5 ORDER BY tmdb_rating DESC LIMIT 20");
        res.render("root", getMenuBarOptions(req.cookies, { data: data }));
    } catch(err) {
        console.error(err);
    }
});

app.get("/people/actors", (req, res) => {
    res.redirect("/people/actors/page/1");
});

app.get("/people/actors/page/:pageNumber", async (req, res) => {
    try {
        let data = null;
        const conn = await database.fetchConn();
        const pageId = parseInt(req.params['pageNumber']);
        const pageOffset = (( pageId - 1 ) * 15);
        // Only make a DB call if pageId is an int!
        if (pageId){
            data = await conn.query("SELECT * FROM Actors LIMIT 15 OFFSET ?", [pageOffset]);
        }   
        if (data) {
            res.render("actors", getMenuBarOptions(req.cookies, { rows: data, pageId: pageId }));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.get("/people/get/:id", async (req, res) => {
    try {
        let data = null;
        const personId = parseInt(req.params['id']);
        const conn = await database.fetchConn();
        // Only make a DB call if personId is an int!
        if (personId) {
            // Check if ID exists and if so update data
            if ((await conn.query("SELECT * FROM Actors WHERE tmdb_id = ?", [personId])).length > 0) {
                data = await conn.query("SELECT * FROM Actors WHERE tmdb_id = ?", [personId]);
            } else if ((await conn.query("SELECT * FROM Directors WHERE tmdb_id = ?", [personId])).length > 0) {
                data = await conn.query("SELECT * FROM Directors WHERE tmdb_id = ?", [personId]);
            }
        }
        if (data) {
            const name = data[0].name;
            const birthday = data[0].birth_date;
            const biography = data[0].biography;
            const birthplace = data[0].birthplace;
            const imagePath = await getPersonImagePath(personId);
            res.render("person", getMenuBarOptions(req.cookies, { person: name, birthday: birthday, biography: biography, birthplace: birthplace, imagePath: imagePath }));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.get("/people/directors", (req, res) => {
    res.redirect("/people/directors/page/1");
});

app.get("/people/directors/page/:pageNumber", async (req, res) => {
    try {
        let data = null;
        const conn = await database.fetchConn();
        const pageId = parseInt(req.params['pageNumber']);
        const pageOffset = (( pageId - 1 ) * 15);
        // Only make a DB call if pageId is an int!
        if (pageId){
            data = await conn.query("SELECT * FROM Directors LIMIT 15 OFFSET ?", [pageOffset]);
        }   
        if (data) {
            res.render("directors", getMenuBarOptions(req.cookies, { rows: data, pageId: pageId }));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.get("/profile/:username", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        let data = null;
        const username = req.params["username"];
        
        // Check if requested users profile is a real user
        data = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (data.length > 0) {
            /* Default Profile Options */
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            const isProfilePrivateResponse = await conn.query("SELECT is_profile_private FROM user_preferences WHERE user_id = ?", [userId]);
            const isProfilePrivate = isProfilePrivateResponse[0].is_profile_private;
            const requestingUser = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
            const hiddenToRequester = (isProfilePrivate && (username != requestingUser)) ? true : false;
            /* Watchlist Options */
            const watchlist = await conn.query("SELECT Watchlisted_Items.movie_id, Watchlisted_Items.tvshow_id, Movies.title as movie_title, Movies.poster_path as movie_poster_path, TVShows.title as tvshow_title, TVShows.poster_path as tvshow_poster_path FROM Watchlisted_Items LEFT JOIN Movies ON Watchlisted_Items.movie_id = Movies.tmdb_id LEFT JOIN TVShows ON Watchlisted_Items.tvshow_id = TVShows.tmdb_id WHERE user_id = ? LIMIT 20", [userId]);
            /* Favorites Options */
            const favorites = await conn.query("SELECT Favorites.movie_id, Favorites.tvshow_id, Movies.title as movie_title, Movies.poster_path as movie_poster_path, TVShows.title as tvshow_title, TVShows.poster_path as tvshow_poster_path FROM Favorites LEFT JOIN Movies ON Favorites.movie_id = Movies.tmdb_id LEFT JOIN TVShows ON Favorites.tvshow_id = TVShows.tmdb_id WHERE user_id = ? LIMIT 20", [userId]);
            /* Reviews Options */
            const reviews = await conn.query("SELECT Reviews.review_id, Reviews.review_text, Reviews.rating, Movies.title AS movie_title, TVShows.title AS tvshow_title FROM Reviews LEFT JOIN Movies ON Reviews.movie_id = Movies.tmdb_id LEFT JOIN TVShows ON Reviews.tvshow_id = TVShows.tmdb_id WHERE Reviews.user_id = ? LIMIT 20", [userId]);


            res.render("profile", getMenuBarOptions(req.cookies, { profileOf: username, hiddenToRequester: hiddenToRequester, watchlist: watchlist, favorites: favorites, reviews: reviews}));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err)
    }
});

app.get("/profile/:username/watchlist/page/:page", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        let data = null;
        const username = req.params["username"];
        const pageId = req.params.page;
        const offset = (pageId - 1) * 40;
        
        // Check if requested users profile is a real user
        data = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (data.length > 0) {
            /* Default Profile Options */
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            const isProfilePrivateResponse = await conn.query("SELECT is_profile_private FROM user_preferences WHERE user_id = ?", [userId]);
            const isProfilePrivate = isProfilePrivateResponse[0].is_profile_private;
            const requestingUser = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
            const hiddenToRequester = (isProfilePrivate && (username != requestingUser)) ? true : false;
            const isOwner = (username == requestingUser);
            /* Watchlist Options */
            const watchlist = await conn.query("SELECT Watchlisted_Items.movie_id, Watchlisted_Items.tvshow_id, Movies.title as movie_title, Movies.poster_path as movie_poster_path, TVShows.title as tvshow_title, TVShows.poster_path as tvshow_poster_path FROM Watchlisted_Items LEFT JOIN Movies ON Watchlisted_Items.movie_id = Movies.tmdb_id LEFT JOIN TVShows ON Watchlisted_Items.tvshow_id = TVShows.tmdb_id WHERE user_id = ? LIMIT 40 OFFSET ?", [userId, offset]);

            res.render("watchlist", getMenuBarOptions(req.cookies, { profileOf: username, hiddenToRequester: hiddenToRequester, watchlist: watchlist, pageId: pageId, isOwner: isOwner }));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.get("/profile/:username/favorites/page/:page", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        let data = null;
        const username = req.params["username"];
        const pageId = req.params.page;
        const offset = (pageId - 1) * 40;
        
        // Check if requested users profile is a real user
        data = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (data.length > 0) {
            /* Default Profile Options */
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            const isProfilePrivateResponse = await conn.query("SELECT is_profile_private FROM user_preferences WHERE user_id = ?", [userId]);
            const isProfilePrivate = isProfilePrivateResponse[0].is_profile_private;
            const requestingUser = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
            const hiddenToRequester = (isProfilePrivate && (username != requestingUser)) ? true : false;
            const isOwner = (username == requestingUser);
            /* Favorites Options */
            const favorites = await conn.query("SELECT Favorites.movie_id, Favorites.tvshow_id, Movies.title as movie_title, Movies.poster_path as movie_poster_path, TVShows.title as tvshow_title, TVShows.poster_path as tvshow_poster_path FROM Favorites LEFT JOIN Movies ON Favorites.movie_id = Movies.tmdb_id LEFT JOIN TVShows ON Favorites.tvshow_id = TVShows.tmdb_id WHERE user_id = ? LIMIT 40 OFFSET ?", [userId, offset]);

            res.render("favorites", getMenuBarOptions(req.cookies, { profileOf: username, hiddenToRequester: hiddenToRequester, pageId: pageId, isOwner: isOwner, favorites: favorites}));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.get("/people", (req, res) => {
    res.render("people", getMenuBarOptions(req.cookies));
});

app.get("/genres", async (req, res) => {
    try {
        let data = null;
        const conn = await database.fetchConn();
        // Query DB to get genres
        data = await conn.query("SELECT * FROM Genres");
        res.render("genres", getMenuBarOptions(req.cookies, { rows: data }));
    } catch(err) {
        console.error(err);
    }
});

app.get("/genres/get/:id", async (req, res) => {
    try {
        const genre_id = req.params.id;
        res.redirect(`/genre-section/${genre_id}/1`);
    } catch(err){
        console.error(err);
    }
});


app.get("/genre-section/:genre_id/:pageNumber", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const genre_id = parseInt(req.params['genre_id']);
        const pageId = parseInt(req.params['pageNumber']);
        const pageOffset = ((pageId - 1) * 15);
        const genre = await conn.query("SELECT * FROM Genres WHERE tmdb_id = ?", [genre_id]);
        let data = await conn.query("SELECT * FROM Movies WHERE genre_id = ? LIMIT 15 OFFSET ?", [genre_id, pageOffset]);
        data = data.map(row => {
            row.is_movie = true;
            return row;
        });
        let tvShows = await conn.query("SELECT * FROM TVShows WHERE genre_id = ? LIMIT 15 OFFSET ?", [genre_id, pageOffset]);
        tvShows = tvShows.map(row => {
            row.is_movie = false;
            return row;
        });
        data = data.concat(tvShows);
        res.render("genre-section", getMenuBarOptions(req.cookies, {rows: data, genre: genre, pageId: pageId, genre_id: genre_id}));
    } catch(err) {
        console.error(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login", getMenuBarOptions(req.cookies));
});

app.get("/movies", (req, res) => {
    res.redirect("/movies/page/1");
});

app.get("/movies/page/:pageNumber", async (req, res) => {
    try {
        let data = null;
        const conn = await database.fetchConn();
        const pageId = parseInt(req.params['pageNumber']);
        const pageOffset = (( pageId - 1 ) * 15);
        // Only make a DB call if pageId is an int!
        if (pageId){
            data = await conn.query("SELECT * FROM Movies LIMIT 15 OFFSET ?", [pageOffset]);
        }   
        if (data) {
            res.render("movies", getMenuBarOptions(req.cookies, { rows: data, pageId: pageId }));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.get("/movies/get/:id", async (req, res) => {
    try {
        const tmdb_id = req.params["id"];
        console.log("Occurance 1: " + tmdb_id);
        const conn = await database.fetchConn();
        const response = await conn.query("SELECT Movies.title, Movies.overview, Movies.duration, Movies.tmdb_rating, Movies.release_year, Genres.genre_name, Genres.tmdb_id AS genre_tmdb_id, Directors.name AS director_name, Directors.tmdb_id AS director_tmdb_id FROM Movies LEFT JOIN Genres ON Movies.genre_id = Genres.tmdb_id LEFT JOIN Directors ON Movies.director_id = Directors.tmdb_id WHERE Movies.tmdb_id = ?", [tmdb_id]);
        let data = response[0];
        const reviews = await conn.query("SELECT Reviews.review_id, Reviews.review_text, Reviews.rating, Reviews.movie_id, Reviews.user_id, users.username AS username FROM Reviews JOIN users ON Reviews.user_id = users.id WHERE Reviews.movie_id = ?;", [tmdb_id]);
        const requester = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        const isLoggedIn = serverUtils.checkIsLoggedIn(req.cookies);
        let userId = null;
        let isWatchlisted = false;
        let isFavorited = false;
        let subscriptions = [];
        let services = [];
        if (requester) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [requester]);
            userId = userIdResponse[0].id;
            isWatchlisted = (await conn.query("SELECT watchlist_id FROM Watchlisted_Items WHERE user_id = ? AND movie_id = ?", [userId, tmdb_id])).length > 0;
            isFavorited = (await conn.query("SELECT favorite_id FROM Favorites WHERE user_id = ? AND movie_id = ?", [userId, tmdb_id])).length > 0;
            services = await conn.query("SELECT service_name, service_id, logo_path, service_link FROM `Streaming Services`");
            subscriptions = await conn.query("SELECT `Streaming Services`.service_name, `Streaming Services`.service_id, `Streaming Services`.service_link FROM Subscriptions LEFT JOIN `Streaming Services` ON Subscriptions.service_id = `Streaming Services`.service_id WHERE user_id = ?", [userId]);
        }

        if (data) {
            data.poster_path = await getMovieImagePath(tmdb_id);
            res.render("movie", getMenuBarOptions(req.cookies, { data: data, isLoggedIn: isLoggedIn, isWatchlisted: isWatchlisted, isFavorited: isFavorited, services: services, subscriptions: subscriptions, reviews: reviews, user_id: userId, tmdb_id: tmdb_id }));
        } else {
            res
                .status(404)
                .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/movie/review", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const user_id = req.body.userID;
        const tmdbId = req.body.tmdbId;
        const reviewText = req.body.reviewText;
        const rating = req.body.rating;
                
        await conn.query("INSERT INTO Reviews (review_text, rating, movie_id, user_id) VALUES (?, ?, ?, ?)", [reviewText, rating, tmdbId, user_id]);
        
        res.redirect('/movies/get/' + tmdbId);
    } catch (err) {
        console.error(err);
    }
});

app.get("/sign-up", (req, res) => {
    res.render("sign-up", getMenuBarOptions(req.cookies));
});

app.get("/tv", (req, res) => {
    res.redirect("/tv/page/1");
});

app.get("/tv/page/:pageNumber", async (req, res) => {
    try {
        let data = null;
        const conn = await database.fetchConn();
        const pageId = parseInt(req.params['pageNumber']);
        const pageOffset = (( pageId - 1 ) * 15);
        // Only make a DB call if pageId is an int!
        if (pageId){
            data = await conn.query("SELECT * FROM TVShows LIMIT 15 OFFSET ?", [pageOffset]);
        }
        if (data) {
            res.render("tv-shows", getMenuBarOptions(req.cookies, { rows: data, pageId: pageId }));
        } else {
            res
            .status(404)
            .render("404", getMenuBarOptions(req.cookies));
        }
    } catch(err) {
        console.error(err);
    }
});

app.get("/tv/get/:id", async (req, res) => {
    try {
        const tmdb_id = req.params["id"];
        const conn = await database.fetchConn();
        const response = await conn.query("SELECT TVShows.title, TVShows.overview, TVShows.status, TVShows.tmdb_rating, TVShows.first_air_date, TVShows.last_air_date, TVShows.num_episodes, TVShows.num_seasons, Genres.genre_name, Genres.tmdb_id AS genre_tmdb_id, Directors.name AS director_name, Directors.tmdb_id AS director_tmdb_id FROM TVShows LEFT JOIN Genres ON TVShows.genre_id = Genres.tmdb_id LEFT JOIN Directors ON TVShows.director_id = Directors.tmdb_id WHERE TVShows.tmdb_id = ?", [tmdb_id]);
        const reviews = await conn.query("SELECT Reviews.review_id, Reviews.review_text, Reviews.rating, Reviews.tvshow_id, Reviews.user_id, users.username AS username FROM Reviews JOIN users ON Reviews.user_id = users.id WHERE Reviews.tvshow_id = ?;", [tmdb_id]);
        let data = response[0];
        const requester = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        const isLoggedIn = serverUtils.checkIsLoggedIn(req.cookies);

        let isWatchlisted = false;
        let isFavorited = false;
        let userId = null;
        let services = [];
        let subscriptions = [];
        if (requester) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [requester]);
            userId = userIdResponse[0].id;
            isWatchlisted = (await conn.query("SELECT watchlist_id FROM Watchlisted_Items WHERE user_id = ? AND tvshow_id = ?", [userId, tmdb_id])).length > 0;
            isFavorited = (await conn.query("SELECT favorite_id FROM Favorites WHERE user_id = ? AND tvshow_id = ?", [userId, tmdb_id])).length > 0;
            services = await conn.query("SELECT service_name, service_id, logo_path, service_link FROM `Streaming Services`");
            subscriptions = await conn.query("SELECT `Streaming Services`.service_name, `Streaming Services`.service_id, `Streaming Services`.service_link FROM Subscriptions LEFT JOIN `Streaming Services` ON Subscriptions.service_id = `Streaming Services`.service_id WHERE user_id = ?", [userId]);
        }

        if (data) {
            data.poster_path = await getTVImagePath(tmdb_id);
            res.render("tv-show", getMenuBarOptions(req.cookies, { data: data, isLoggedIn: isLoggedIn, isWatchlisted: isWatchlisted, isFavorited: isFavorited, services: services, subscriptions: subscriptions, reviews: reviews, tmdb_id: tmdb_id, user_id: userId }));
        } else {
            res
                .status(404)
                .render("404", getMenuBarOptions(req.cookies));
        }
        
    } catch(err) {
        console.error(err);
    }
});

app.post("/tvshow/review", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const user_id = req.body.userID;
        const tmdbId = req.body.tmdbId;
        const reviewText = req.body.reviewText;
        const rating = req.body.rating;
                
        await conn.query("INSERT INTO Reviews (review_text, rating, tvshow_id, user_id) VALUES (?, ?, ?, ?)", [reviewText, rating, tmdbId, user_id]);
        
        res.redirect('/tv/get/' + tmdbId);
    } catch (err) {
        console.error(err);
    }
});

app.get("/settings", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        const preferences = await conn.query("SELECT user_preferences.is_profile_private FROM users LEFT JOIN user_preferences ON users.id = user_preferences.user_id WHERE username = ?", [username]);
        const user_id_response = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
        const user_id = user_id_response[0].id;
        const userServices = await conn.query("SELECT `Streaming Services`.service_name FROM Subscriptions LEFT JOIN `Streaming Services` ON Subscriptions.service_id = `Streaming Services`.service_id WHERE user_id = ?", [user_id]);
        const services = await conn.query("SELECT service_name FROM  `Streaming Services`");
        const isProfilePrivate = (preferences[0].is_profile_private == 1) ? true : false;

        res.render("settings", getMenuBarOptions(req.cookies, { username: username, isProfilePrivate: isProfilePrivate, services: services, userServices: userServices }));
    } catch(err) {
        console.error(err);
    }
});

app.get("/admin-panel", expMiddle.verifyIsLoggedIn, expMiddle.verifyIsAdmin, async (req, res) => {
    try {
        let data = {};
        const conn = await database.fetchConn();

        const numMovies = await conn.query("SELECT COUNT(*) AS row_count FROM Movies");
        data.numMovies = numMovies[0].row_count;
        const numTVShows = await conn.query("SELECT COUNT(*) AS row_count FROM TVShows");
        data.numTVShows = numTVShows[0].row_count;
        const numActors = await conn.query("SELECT COUNT(*) AS row_count FROM Actors");
        data.numActors = numActors[0].row_count;
        const numDirectors = await conn.query("SELECT COUNT(*) AS row_count FROM Directors");
        data.numDirectors = numDirectors[0].row_count;
        const numUsers = await conn.query("SELECT COUNT(*) AS row_count FROM users");
        data.numUsers = numUsers[0].row_count;
        const numFavoritedItems = await conn.query("SELECT COUNT(*) AS row_count FROM Favorites");
        data.numFavoritedItems = numFavoritedItems[0].row_count;
        const numWatchlistedItems = await conn.query("SELECT COUNT(*) AS row_count FROM Watchlisted_Items");
        data.numWatchlistedItems = numWatchlistedItems[0].row_count;
        res.render("admin", getMenuBarOptions(req.cookies, { data: data }));
    } catch(err) {
        console.error(err);
    }
    
})

// Keep this GET at the end!
app.get("*", function (req, res) {
    res
	  .status(404)
	  .render("404", getMenuBarOptions(req.cookies));
});


// Handle post requests  
app.post("/login", async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;
        const conditionalArray = [typeof username == "string", typeof password == "string", password.length >= 12, password.length <= 40, username.length <= 20, /^[a-zA-Z0-9_]*$/.test(username)];
        if (!conditionalArray.includes(false)) {
            const userObject = await userAuth.loginUser(username, password);
            let loginSuccess = userObject.loginSuccess;
            // Send back a proper response if an access token IS in the userObject
            if (loginSuccess) {
                return res
                    .status(200)
                    .cookie(accessTokenName, userObject.accessToken, {
                        path: "/",
                        httpOnly: true,
                        secure: true,
                    })
                    .json({ loginSuccess: loginSuccess });
            } else {
                return res.status(404).json({ loginSuccess: loginSuccess });
            }
        }
    } catch(err) {
        console.error(err);
    }
});
  
app.post("/sign-up", async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const conditionalArray = [typeof username == "string", typeof password == "string", typeof email == "string", email.length >= 5, password.length >= 12, password.length <= 40, username.length <= 20, /^[a-zA-Z0-9_]*$/.test(username)];
        if (!conditionalArray.includes(false)) {
            let newUserObject = await userAuth.createNewUser(username, email, password);
            let resObject = {
                wasCreated: newUserObject.wasCreated,
                error: newUserObject.error
            }
            let wasCreated = newUserObject.wasCreated;
            // Send back a proper response if an access token IS in the userObject
            if (wasCreated) {
                return res
                    .status(200)
                    .cookie(accessTokenName, newUserObject.accessToken, {
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    })
                    .json(resObject);
            } else {
                return res.status(404).json(resObject);
            }
        }
    } catch(err) {
        console.error(err);
    }
});

const idToNameMapping = {
    "ServiceNetflixCheckbox": "Netflix",
    "ServiceHuluCheckbox": "Hulu",
    "ServiceAmazon Prime VideoCheckbox": "Amazon Prime Video",
    "ServiceYouTube TVCheckbox": "YouTube TV",
    "ServiceDisney+Checkbox": "Disney+",
    "ServicePeacockCheckbox": "Peacock",
    "ServiceParamount+Checkbox": "Paramount+",
    "ServicePlutoTVCheckbox": "PlutoTV",
    "ServiceESPN+Checkbox": "ESPN+",
    "ServiceApple TV+Checkbox": "Apple TV+",
    "PrivateProfileCheckbox": "is_profile_private"
};

function renameIds(preferences) {
    for (let preference of preferences) {
        let id = preference.id;
        preference.id = idToNameMapping[id]
    }
    return preferences;
}

app.post("/settings", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            let preferences = req.body;
            const user_id_response = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const user_id = user_id_response[0].id;
            const services = await conn.query("Select service_id, service_name FROM `Streaming Services`");
            // Rename preference ids
            preferences = renameIds(preferences);
            // Iterate through and update DB
            for (let preference of preferences) {
                if (preference.id == "is_profile_private") {
                    await conn.query("UPDATE user_preferences SET is_profile_private = ? WHERE user_id = ?", [preference.value, user_id]);
                } else {
                    for (let service of services) {
                        if (preference.id == service.service_name) {
                            const service_id = service.service_id;
                            // Check if subscription exists
                            if ((await conn.query("SELECT subscription_id FROM Subscriptions WHERE user_id = ? AND service_id = ?", [user_id, service_id])).length > 0) {
                                if (!preference.value) {
                                    await conn.query("DELETE FROM Subscriptions WHERE user_id = ? AND service_id = ?", [user_id, service_id]);
                                }
                            } else {
                                if (preference.value) {
                                    await conn.query("INSERT INTO Subscriptions (user_id, service_id) VALUES (?, ?)", [user_id, service_id]);
                                }
                            }
                        }
                    }
                }
            }
            res.json({ success: true });
        } else {
            res.sendStatus(401);
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/movies/get/:id/add-to-watchlist", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const movieId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure movie is not watchlisted already
            if ((await conn.query("SELECT * FROM Watchlisted_Items WHERE user_id = ? AND movie_id = ?", [userId, movieId])).length == 0) {
                await conn.query("INSERT INTO Watchlisted_Items (movie_id, user_id) VALUES (?, ?)", [movieId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "Movie already exists in your watchlist!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/tv/get/:id/add-to-watchlist", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const tvId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure tvshow is not watchlisted already
            if ((await conn.query("SELECT * FROM Watchlisted_Items WHERE user_id = ? AND tvshow_id = ?", [userId, tvId])).length == 0) {
                await conn.query("INSERT INTO Watchlisted_Items (tvshow_id, user_id) VALUES (?, ?)", [tvId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "TV Show already exists in your watchlist!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/movies/get/:id/remove-from-watchlist", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const movieId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure movie is in watchlist
            if ((await conn.query("SELECT * FROM Watchlisted_Items WHERE user_id = ? AND movie_id = ?", [userId, movieId])).length > 0) {
                await conn.query("DELETE FROM Watchlisted_Items WHERE movie_id = ? AND user_id = ?", [movieId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "Movie is not in your watchlist!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/tv/get/:id/remove-from-watchlist", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const tvId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure tvshow is in watchlist
            if ((await conn.query("SELECT * FROM Watchlisted_Items WHERE user_id = ? AND tvshow_id = ?", [userId, tvId])).length > 0) {
                await conn.query("DELETE FROM Watchlisted_Items WHERE tvshow_id = ? AND user_id = ?", [tvId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "TV Show in not in your watchlist!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/profile/:username/watchlist/page/:page/get-next", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        let data = null;
        const username = req.params["username"];
        const pageId = req.params.page;
        const offset = (pageId * 40) - 1;
        
        // Check if requested users profile is a real user
        data = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (data.length > 0) {
            /* Default Profile Options */
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            const isProfilePrivateResponse = await conn.query("SELECT is_profile_private FROM user_preferences WHERE user_id = ?", [userId]);
            const isProfilePrivate = isProfilePrivateResponse[0].is_profile_private;
            const requestingUser = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
            const hiddenToRequester = (isProfilePrivate && (username != requestingUser)) ? true : false;
            const isOwner = (username == requestingUser);
            /* Watchlist Options */
            const watchlist = await conn.query("SELECT Watchlisted_Items.movie_id, Watchlisted_Items.tvshow_id, Movies.title as movie_title, Movies.poster_path as movie_poster_path, TVShows.title as tvshow_title, TVShows.poster_path as tvshow_poster_path FROM Watchlisted_Items LEFT JOIN Movies ON Watchlisted_Items.movie_id = Movies.tmdb_id LEFT JOIN TVShows ON Watchlisted_Items.tvshow_id = TVShows.tmdb_id WHERE user_id = ? LIMIT 1 OFFSET ?", [userId, offset]);
            const watchlistItem = watchlist[0];
            if (hiddenToRequester) {
                res.status(400).json({ success: false })
            } else {
                // Only return a success value of true if there is data on next 'page'!
                if (watchlist.length > 0) {
                    res.status(200).json({ success: true, data: watchlistItem });
                } else {
                    // Respond with a 200 because the client can't know if there is data on next 'page'. We simply return a success value of false
                    res.status(200).json({ success: false });
                }
            }
            
        } else {
            res
            .status(404).json({ success: false, error: "You are not logged in!"});
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/movies/get/:id/add-to-favorites", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const movieId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure movie is not favorited already
            if ((await conn.query("SELECT * FROM Favorites WHERE user_id = ? AND movie_id = ?", [userId, movieId])).length == 0) {
                await conn.query("INSERT INTO Favorites (movie_id, user_id) VALUES (?, ?)", [movieId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "Movie already exists in your Favorites!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/tv/get/:id/add-to-favorites", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const tvId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure tvshow is not favorited already
            if ((await conn.query("SELECT * FROM Favorites WHERE user_id = ? AND tvshow_id = ?", [userId, tvId])).length == 0) {
                await conn.query("INSERT INTO Favorites (tvshow_id, user_id) VALUES (?, ?)", [tvId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "TV Show already exists in your favorites!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/movies/get/:id/remove-from-favorites", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const movieId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure movie is in favorites
            if ((await conn.query("SELECT * FROM Favorites WHERE user_id = ? AND movie_id = ?", [userId, movieId])).length > 0) {
                await conn.query("DELETE FROM Favorites WHERE movie_id = ? AND user_id = ?", [movieId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "Movie is not in your favorites!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/tv/get/:id/remove-from-favorites", expMiddle.verifyIsLoggedIn, async (req, res) => {
    try {
        const tvId = req.params.id;
        const conn = await database.fetchConn();
        const username = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
        if (username) {
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            // Make sure tvshow is in favorites
            if ((await conn.query("SELECT * FROM Favorites WHERE user_id = ? AND tvshow_id = ?", [userId, tvId])).length > 0) {
                await conn.query("DELETE FROM Favorites WHERE tvshow_id = ? AND user_id = ?", [tvId, userId]);
                res.status(200).json({ success: true });
            } else {
                res.status(409).json({ success: false, error: "TV Show in not in your favorites!" });
            }
        } else {
            res.status(400).json({ success: false, error: "You are not logged in!" });
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/profile/:username/favorites/page/:page/get-next", async (req, res) => {
    try {
        const conn = await database.fetchConn();
        let data = null;
        const username = req.params["username"];
        const pageId = req.params.page;
        const offset = (pageId * 40) - 1;
        
        // Check if requested users profile is a real user
        data = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (data.length > 0) {
            /* Default Profile Options */
            const userIdResponse = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
            const userId = userIdResponse[0].id;
            const isProfilePrivateResponse = await conn.query("SELECT is_profile_private FROM user_preferences WHERE user_id = ?", [userId]);
            const isProfilePrivate = isProfilePrivateResponse[0].is_profile_private;
            const requestingUser = serverUtils.getUserFromToken(serverUtils.getAccessToken(req.cookies));
            const hiddenToRequester = (isProfilePrivate && (username != requestingUser)) ? true : false;
            /* Favorites Options */
            const favoritesResponse = await conn.query("SELECT Favorites.movie_id, Favorites.tvshow_id, Movies.title as movie_title, Movies.poster_path as movie_poster_path, TVShows.title as tvshow_title, TVShows.poster_path as tvshow_poster_path FROM Favorites LEFT JOIN Movies ON Favorites.movie_id = Movies.tmdb_id LEFT JOIN TVShows ON Favorites.tvshow_id = TVShows.tmdb_id WHERE user_id = ? LIMIT 1 OFFSET ?", [userId, offset]);
            const favorites = favoritesResponse[0];
            if (hiddenToRequester) {
                res.status(400).json({ success: false })
            } else {
                // Only return a success value of true if there is data on next 'page'!
                if (favoritesResponse.length > 0) {
                    res.status(200).json({ success: true, data: favorites });
                } else {
                    // Respond with a 200 because the client can't know if there is data on next 'page'. We simply return a success value of false
                    res.status(200).json({ success: false });
                }
            }
            
        } else {
            res
            .status(404).json({ success: false, error: "You are not logged in!"});
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/movies", expMiddle.verifyIsLoggedIn, expMiddle.verifyIsAdmin, async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const data = req.body;

        await conn.query("INSERT INTO Movies (title, duration, genre_id, tmdb_id, tmdb_rating, overview, release_year, director_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [data.title, data.duration, data.genre_id, data.tmdb_id, data.tmdb_rating, data.overview, data.release_year, data.director_id]);
        res.status(200).json({ success: true });
    } catch(err) {
        res.status(400).json({ success: false});
        console.error(err);
    }
});

app.post("/tv", expMiddle.verifyIsLoggedIn, expMiddle.verifyIsAdmin, async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const data = req.body;

        await conn.query("INSERT INTO TVShows (title, first_air_date, last_air_date, num_seasons, tmdb_id, status, num_episodes, tmdb_rating, overview, director_id, genre_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [data.title, data.first_air_date, data.last_air_date, data.num_seasons, data.tmdb_id, data.status, data.num_episodes, data.tmdb_rating, data.overivew, data.director_id, data.genre_id]);
        res.status(200).json({ success: true });
    } catch(err) {
        res.status(400).json({ success: false});
        console.error(err);
    }
});

app.post("/people/directors", expMiddle.verifyIsLoggedIn, expMiddle.verifyIsAdmin, async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const data = req.body;

        await conn.query("INSERT INTO Directors (name, birth_date, birthplace, tmdb_id, biography) VALUES (?, ?, ?, ?, ?)", [data.name, data.birth_date, data.birthplace, data.tmdb_id, data.biography]);
        res.status(200).json({ success: true });
    } catch(err) {
        res.status(400).json({ success: false});
        console.error(err);
    }
});

app.post("/people/actors", expMiddle.verifyIsLoggedIn, expMiddle.verifyIsAdmin, async (req, res) => {
    try {
        const conn = await database.fetchConn();
        const data = req.body;

        await conn.query("INSERT INTO Actors (name, birth_date, birthplace, tmdb_id, biography) VALUES (?, ?, ?, ?, ?)", [data.name, data.birth_date, data.birthplace, data.tmdb_id, data.biography]);
        res.status(200).json({ success: true });
    } catch(err) {
        res.status(400).json({ success: false});
        console.error(err);
    }
});

// Logs a user out by removing their auth token
app.post("/logout", async (req, res) => {
    res.clearCookie(accessTokenName);
    return res.sendStatus(200);
});

server.listen(port, () => {
    console.log(`Listen server running @ http://localhost:${port}`);
});