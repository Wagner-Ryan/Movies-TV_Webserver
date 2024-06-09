import newAlert from "./modules/alertModule.js";
import sendPOST from "./modules/network.js";

const insertMovieButton = document.getElementById("InsertButtonAddMovie");
const insertTVShowButton = document.getElementById("InsertButtonAddTVShow");
const insertDirectorButton = document.getElementById("InsertButtonAddDirector");
const insertActorButton = document.getElementById("InsertButtonAddActor");

function insertItemToDB(endpoint, data) {
    sendPOST(endpoint, data, (error, response) => {
        if (error) {
            console.error(error);
        } else {
            if (response.success) {
                newAlert(`Creation of new entry was successful!`, "#00FF02", 2)
            } else {
                newAlert(`Creation of new entry failed!`, "#FF0000", 4);
            }
        }
    });
}

insertMovieButton.addEventListener('click', () => {
  const movieInputs = document.querySelectorAll('#MovieInputWrapper input');
  const movieData = {};
  movieInputs.forEach(input => {
    movieData[input.id] = input.value;
  });
  insertItemToDB('/movies', movieData);
});

insertTVShowButton.addEventListener('click', () => {
  const tvShowInputs = document.querySelectorAll('#TVShowInputWrapper input');
  const tvShowData = {};
  tvShowInputs.forEach(input => {
    tvShowData[input.id] = input.value;
  });
  insertItemToDB('/tv', tvShowData);
});

insertDirectorButton.addEventListener('click', () => {
  const directorInputs = document.querySelectorAll('#DirectorInputWrapper input');
  const directorData = {};
  directorInputs.forEach(input => {
    directorData[input.id] = input.value;
  });
  insertItemToDB('/people/directors', directorData);
});

insertActorButton.addEventListener('click', () => {
  const actorInputs = document.querySelectorAll('#ActorInputWrapper input');
  const actorData = {};
  actorInputs.forEach(input => {
    actorData[input.id] = input.value;
  });
  insertItemToDB('/people/actors', actorData);
});