import newAlert from "./modules/alertModule.js";
import sendPOST from "./modules/network.js";

const sendToApp = () => {
    window.location.href = "/";
};

function login() {
    const username = document.getElementById("LoginUsername").value;
    const password = document.getElementById("LoginPassword").value;
    // Validate input
    const conditionalArray = [typeof username == "string", typeof password == "string", password.length >= 12, password.length <= 40, username.length <= 20, /^[a-zA-Z0-9_]*$/.test(username)];
    if (!conditionalArray.includes(false)) {
        const route = "/login";
        const credentials = {
            username: username,
            password: password,
        };
        sendPOST(route, credentials, (error, response) => {
            if (error) {
                newAlert(`Login failed with error ${error}`, "#FF0000", 5);
                console.error(error);
            } else {
                if (response.loginSuccess) {
                    newAlert(`Logging in with username '${credentials.username}' was successful!`, "#00FF02", 1);
                    sendToApp();
                } else {
                    newAlert(`Incorrect password for user '${credentials.username}'`, "#FF8A00", 4);
                }
            }
        });
    } else {
      newAlert("Credentials Invalid!", "#FF8A00", 4);
    }
};
const loginButton = document.getElementById("LoginButton");
loginButton.addEventListener("click", login);

document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key == 'Enter') {
        login();
    }
});