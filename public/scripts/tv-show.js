import sendPost from "./modules/network.js";
import newAlert from "./modules/alertModule.js";

let watchlistButton = document.getElementById("AddToWatchlistButton");
const watchlistImage = document.getElementById("WatchlistImage");
let removeFromWatchlistButton = document.getElementById("RemoveFromWatchlistButton");
if (watchlistButton) {
    watchlistButton.addEventListener("click", addToWatchList);
}
if (removeFromWatchlistButton) {
    removeFromWatchlistButton.addEventListener("click", removeFromWatchList);
}

function addToWatchList() {
    const endpoint = window.location.href + "/add-to-watchlist";
    sendPost(endpoint, {}, (error, response) => {
        if (error) {
            newAlert(`Adding tv show to watchlist failed! ${error}`, "#FF0000", 2);
            console.error(error);
        } else {
            if (response.success) {
                newAlert("Added tv show to Watchlist!", "#32CC5F", 2);
                watchlistButton.removeEventListener("click", addToWatchList);
                watchlistButton.id = 'RemoveFromWatchlistButton';
                removeFromWatchlistButton = document.getElementById("RemoveFromWatchlistButton");
                removeFromWatchlistButton.addEventListener("click", removeFromWatchList);
                watchlistButton = null; // Nullify the old reference
                watchlistImage.src = '/icons/minus-circle.svg';
            } else {
                newAlert(`Adding tv show to watchlist failed! ${response.error}`, "#FF0000", 5);
            }
        }
    });
}

function removeFromWatchList() {
    const endpoint = window.location.href + "/remove-from-watchlist";
    sendPost(endpoint, {}, (error, response) => {
        if (error) {
            newAlert(`Removing tv show from watchlist failed! ${error}`, "#FF0000", 2);
            console.error(error);
        } else {
            if (response.success) {
                newAlert("Removed tv show from Watchlist!", "#32CC5F", 2);
                removeFromWatchlistButton.removeEventListener("click", removeFromWatchList);
                removeFromWatchlistButton.id = 'AddToWatchlistButton';
                watchlistButton = document.getElementById("AddToWatchlistButton");
                watchlistButton.addEventListener("click", addToWatchList);
                removeFromWatchlistButton = null; // Nullify the old reference
                watchlistImage.src = '/icons/plus-circle.svg';
            } else {
                newAlert(`Removing tv show from watchlist failed! ${response.error}`, "#FF0000", 5);
            }
        }
    });
}

let favoritesButton = document.getElementById("AddToFavoritesButton");
const favoritesImage = document.getElementById("FavoritesImage");
let removeFromFavoritesButton = document.getElementById("RemoveFromFavoritesButton");

if (favoritesButton) {
    favoritesButton.addEventListener("click", addToFavorites);
}
if (removeFromFavoritesButton) {
    removeFromFavoritesButton.addEventListener("click", removeFromFavorites);
}

function addToFavorites() {
    const endpoint = window.location.href + "/add-to-favorites";
    sendPost(endpoint, {}, (error, response) => {
        if (error) {
            newAlert(`Adding tv show to favorites failed! ${error}`, "#FF0000", 2);
            console.error(error);
        } else {
            if (response.success) {
                newAlert("Added tv show to favorites!", "#32CC5F", 2);
                favoritesButton.removeEventListener("click", addToFavorites);
                favoritesButton.id = 'RemoveFromFavoritesButton';
                removeFromFavoritesButton = document.getElementById("RemoveFromFavoritesButton");
                removeFromFavoritesButton.addEventListener("click", removeFromFavorites);
                favoritesButton = null; // Nullify the old reference
                favoritesImage.src = '/icons/star-filled.svg';
            } else {
                newAlert(`Adding tv show to favorites failed! ${response.error}`, "#FF0000", 5);
            }
        }
    });
}

function removeFromFavorites() {
    const endpoint = window.location.href + "/remove-from-favorites";
    sendPost(endpoint, {}, (error, response) => {
        if (error) {
            newAlert(`Removing tv show from favorites failed! ${error}`, "#FF0000", 2);
            console.error(error);
        } else {
            if (response.success) {
                newAlert("Removed tv show from favorites!", "#32CC5F", 2);
                removeFromFavoritesButton.removeEventListener("click", removeFromFavorites);
                removeFromFavoritesButton.id = 'AddToFavoritesButton';
                favoritesButton = document.getElementById("AddToFavoritesButton");
                favoritesButton.addEventListener("click", addToFavorites);
                removeFromFavoritesButton = null; // Nullify the old reference
                favoritesImage.src = '/icons/star.svg';
            } else {
                newAlert(`Removing tv show from favorites failed! ${response.error}`, "#FF0000", 5);
            }
        }
    });
}