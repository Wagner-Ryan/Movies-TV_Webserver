import newAlert from "./modules/alertModule.js";
import sendPOST from "./modules/network.js";

function createNewEntertainmentElement(data) {
    let entertainmentPosterImg = document.createElement('img');
    entertainmentPosterImg.className = "EntertainmentPosterImg";
    entertainmentPosterImg.src = (data.movie_id) ? `https://image.tmdb.org/t/p/w185${data.movie_poster_path}` : `https://image.tmdb.org/t/p/w185${data.tvshow_poster_path}`;

    let entertainmentPosterA = document.createElement('a');
    entertainmentPosterA.className = "EntertainmentPosterA";
    entertainmentPosterA.href = (data.movie_id) ? `/movies/get/${data.movie_id}` : `/movies/get/${data.tvshow_id}`;
    entertainmentPosterA.appendChild(entertainmentPosterImg);

    let trashImage = document.createElement('img');
    trashImage.className = (data.movie_id) ? 'TrashImageMovie' : 'TrashImageTVShow';
    trashImage.id = (data.movie_id) ? `${data.movie_id}` : `${data.tvshow_id}`;
    trashImage.src = '/icons/trash.svg';

    let trashButton = document.createElement('button');
    trashButton.className = "TrashButton";
    trashButton.id = (data.movie_id) ? `TrashButton${data.movie_id}` : `TrashButton${data.tvshow_id}`;
    trashButton.appendChild(trashImage);
    trashButton.addEventListener('click', (event) => {
        handleClick(event);
    });

    let trash = document.createElement('div');
    trash.className = "Trash";
    trash.appendChild(trashButton);

    let entertainmentTitle = document.createElement('span');
    entertainmentTitle.className = 'EntertainmentTitle';
    entertainmentTitle.innerText = (data.movie_id) ? data.movie_title : data.tvshow_title;

    let entertainmentInfoWrapper = document.createElement('div');
    entertainmentInfoWrapper.className = 'EntertainmentInfoWrapper';
    entertainmentInfoWrapper.appendChild(entertainmentTitle);

    let entertainmentWrapper = document.createElement('div');
    entertainmentWrapper.className = "EntertainmentWrapper";
    entertainmentWrapper.appendChild(entertainmentPosterA);
    entertainmentWrapper.appendChild(trash);
    entertainmentWrapper.appendChild(entertainmentInfoWrapper);

    const watchlistContainer = document.getElementById("WatchlistContainer");
    watchlistContainer.appendChild(entertainmentWrapper);
}

function handleClick(event) {
    const className = event.target.className;
    const id = event.target.id;
    const endpoint = (className == "TrashImageMovie") ? `/movies/get/${id}/remove-from-watchlist` : `/tv/get/${id}/remove-from-watchlist`;
    const endpointGetNext = window.location.href + "/get-next";

    sendPOST(endpoint, {}, (error, response) => {
        if (error) {
            newAlert(`Removing tv show from watchlist failed! ${error}`, "#FF0000", 2);
            console.error(error);
        } else {
            if (response.success) {
                newAlert("Removed tv show from Watchlist!", "#32CC5F", 2);
                document.getElementById(id).parentElement.parentElement.parentElement.remove();
                sendPOST(endpointGetNext, {}, (error, response) => {
                    if (error) {
                        console.error(error)
                    } else {
                        if (response.success) {
                            // Create new enterainment element on screen with returned film or tv show
                            createNewEntertainmentElement(response.data);
                        }
                    }
                });
            } else {
                newAlert(`Removing tv show from watchlist failed! ${response.error}`, "#FF0000", 5);
            }
        }
    });
}

const trashButtons = document.querySelectorAll('.TrashButton');

trashButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        handleClick(event);
    });
});