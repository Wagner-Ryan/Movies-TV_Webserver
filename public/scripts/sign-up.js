import newAlert from "./modules/alertModule.js";
import sendPOST from "./modules/network.js";

const sendToApp = () => {
    window.location.href = "/";
};

function createAccount() {
    const username = document.getElementById("LoginUsername").value;
    const email = document.getElementById("LoginEmail").value;
    const password = document.getElementById("LoginPassword").value;
    // Validate input
    const conditionalArray = [typeof username == "string", typeof password == "string",
        password.length >= 12, password.length <= 40, username.length <= 20, /^[a-zA-Z0-9_]*$/.test(username)];
    if (!conditionalArray.includes(false)){
        const route = "/sign-up";
        const credentials = {
            username: username,
            email: email,
            password: password
        };
        sendPOST(route, credentials, (error, response) => {
            if (error) {
                newAlert(`Attempt to create account with username '${credentials.username}', email '${credentials.email}', and a password failed!`, '#FF0000', 5);
                console.error(error);
            } else {
                if (response.wasCreated) {
                    newAlert(`Account Created!`, '#00FF02', 1);
                    sendToApp();
                } else {
                    newAlert(`<span style="color: #FF6767;"><strong>${response.error}</strong></span>`, '#FF8A00', 4);
                }
            }
        });
    } else {
        newAlert("Credentials Invalid!", '#FF8A00', 4);
    }
}

// Function to change text color of html elements when cases match
function changeTextColor(callingElement) {
    const inputValue = callingElement.value;
    if (callingElement.id == "LoginUsername"){
        if (inputValue.length <= 20 && inputValue.length >= 1){
            let element = document.getElementById(callingElement.id + "Case1");
            element.setAttribute("class", "MatchCase");
            element.innerText = "✅ Length 1 - 20";
        } else{
            let element = document.getElementById(callingElement.id + "Case1");
            element.setAttribute("class", "NotMatchCase");
            element.innerText = "❌ Length 1 - 20";
        }
        if (!(/^[a-zA-Z0-9_]*$/.test(inputValue))){
            let element = document.getElementById(callingElement.id + "Case2");
            element.setAttribute("class", "NotMatchCase");
            element.innerText = "❌ Only includes a-z, A-Z, 0-9 or _";
        } else{
            let element = document.getElementById(callingElement.id + "Case2");
            element.setAttribute("class", "MatchCase");
            element.innerText = "✅ Only includes a-z, A-Z, 0-9 or _";
        }
        if (inputValue.length == 0){
            let element = document.getElementById(callingElement.id + "Case2");
            element.setAttribute("class", "NotMatchCase");
            element.innerText = "❌ Only includes a-z, A-Z, 0-9 or _";
        }
    }
    if (callingElement.id == "LoginPassword"){
        if (inputValue.length <= 40 && inputValue.length >= 12){
            let element = document.getElementById(callingElement.id + "Case");
            element.setAttribute("class", "MatchCase");
            element.innerText = "✅ Length 12 - 40";
        } else{
            let element = document.getElementById(callingElement.id + "Case");
            element.setAttribute("class", "NotMatchCase");
            element.innerText = "❌ Length 12 - 40";
        }
        if (inputValue == document.getElementById("ConfirmLoginPassword").value && inputValue.length != 0){
            let element = document.getElementById("ConfirmLoginPasswordCase");
            element.setAttribute("class", "MatchCase");
            element.innerText = "✅ Passwords match";
        } else{
            let element = document.getElementById("ConfirmLoginPasswordCase");
            element.setAttribute("class", "NotMatchCase");
            element.innerText = "❌ Passwords do not match!";
        }
    }
    if (callingElement.id == "ConfirmLoginPassword"){
        if (inputValue == document.getElementById("LoginPassword").value && inputValue.length != 0){
            let element = document.getElementById(callingElement.id + "Case");
            element.setAttribute("class", "MatchCase");
            element.innerText = "✅ Passwords match";
        } else{
            let element = document.getElementById(callingElement.id + "Case");
            element.setAttribute("class", "NotMatchCase");
            element.innerText = "❌ Passwords do not match!";
        }
    }
}

// Add an event listener for the input fields
const inputFieldUsername = document.getElementById("LoginUsername");
inputFieldUsername.addEventListener("input", function () {
    changeTextColor(inputFieldUsername);
});
const inputFieldPassword = document.getElementById("LoginPassword");
inputFieldPassword.addEventListener("input", function () {
    changeTextColor(inputFieldPassword);
});
const inputFieldConfirmPassword = document.getElementById("ConfirmLoginPassword");
inputFieldConfirmPassword.addEventListener("input", function () {
    changeTextColor(inputFieldConfirmPassword);
});
const loginButton = document.getElementById('CreateAccountButton');
loginButton.addEventListener('click', createAccount);

document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key == 'Enter') {
        createAccount();
    }
});