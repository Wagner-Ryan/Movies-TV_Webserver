// Create event listner for view watchlist button
const viewWatchlistButton = document.getElementById("ViewWatchlistButton");
viewWatchlistButton.addEventListener("click", () => {
    const currentEndpoint = window.location.href;
    window.location.href = `${currentEndpoint}/watchlist/page/1`;
});

const viewFavoritesButton = document.getElementById("ViewFavoritesButton");
viewFavoritesButton.addEventListener("click", () => {
    const currentEndpoint = window.location.href;
    window.location.href = `${currentEndpoint}/favorites/page/1`;
});