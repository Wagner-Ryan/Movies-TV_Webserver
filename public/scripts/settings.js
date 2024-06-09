import newAlert from "./modules/alertModule.js";
import sendPOST from "./modules/network.js";
// Get profile privacy selector
const profilePrivateCheckbox = document.getElementById("PrivateProfileCheckbox");
// Get service subscriptions
const serviceNetflixCheckbox = document.getElementById("ServiceNetflixCheckbox");
const serviceHuluCheckbox = document.getElementById("ServiceHuluCheckbox");
const serviceAmazonCheckbox = document.getElementById("ServiceAmazon Prime VideoCheckbox");
const serviceYoutubeCheckbox = document.getElementById("ServiceYouTube TVCheckbox");
const serviceDisneyCheckbox = document.getElementById("ServiceDisney+Checkbox");
const servicePeacockCheckbox = document.getElementById("ServicePeacockCheckbox");
const serviceParamountCheckbox = document.getElementById("ServiceParamount+Checkbox");
const servicePlutoCheckbox = document.getElementById("ServicePlutoTVCheckbox");
const serviceESPNCheckbox = document.getElementById("ServiceESPN+Checkbox");
const serviceAppleCheckbox = document.getElementById("ServiceApple TV+Checkbox");

// Create an array to track which elements have been changed
let updatedPreferences = [];

function handleUpdate(textElement, checkboxElement) {
    const text = textElement.innerText;
    const lastChar = text.charAt(text.length - 1);
    if (lastChar === '*') {
        updatedPreferences.splice(updatedPreferences.indexOf(checkboxElement), 1);
        textElement.innerText = text.slice(0, text.length - 1);
        textElement.style.fontStyle = 'normal';
    } else {
        updatedPreferences.push(checkboxElement);
        textElement.innerText += '*';
        textElement.style.fontStyle = 'italic';
    }
}

function resetText() {
    const textElements = []
    textElements.push(document.getElementById(`SpanPrivateProfile`));
    textElements.push(document.getElementById(`ServiceSpanNetflix`));
    textElements.push(document.getElementById(`ServiceSpanHulu`));
    textElements.push(document.getElementById(`ServiceSpanAmazon Prime Video`));
    textElements.push(document.getElementById(`ServiceSpanYouTube TV`));
    textElements.push(document.getElementById(`ServiceSpanDisney+`));
    textElements.push(document.getElementById(`ServiceSpanPeacock`));
    textElements.push(document.getElementById(`ServiceSpanParamount+`));
    textElements.push(document.getElementById(`ServiceSpanPlutoTV`));
    textElements.push(document.getElementById(`ServiceSpanESPN+`));
    textElements.push(document.getElementById(`ServiceSpanApple TV+`));
    
    for (let textElement of textElements) {
        const text = textElement.innerText;
        const lastChar = text.charAt(text.length - 1);
        if (lastChar === '*') {
            textElement.innerText = text.slice(0, text.length - 1);
            textElement.style.fontStyle = 'normal';
        }
    }
}

// Add event listener to check if a checkbox has been checked
// If a checkbox has been clicked we should indicate that a value has changed on the UI
profilePrivateCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`SpanPrivateProfile`);
    handleUpdate(accompanyingText, profilePrivateCheckbox);
});

serviceNetflixCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanNetflix`);
    handleUpdate(accompanyingText, serviceNetflixCheckbox);
});
  
serviceHuluCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanHulu`);
    handleUpdate(accompanyingText, serviceHuluCheckbox);
});
  
serviceAmazonCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanAmazon Prime Video`);
    handleUpdate(accompanyingText, serviceAmazonCheckbox);
});
  
serviceYoutubeCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanYouTube TV`);
    handleUpdate(accompanyingText, serviceYoutubeCheckbox);
});

serviceDisneyCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanDisney+`);
    handleUpdate(accompanyingText, serviceDisneyCheckbox);
});

servicePeacockCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanPeacock`);
    handleUpdate(accompanyingText, servicePeacockCheckbox);
});

serviceParamountCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanParamount+`);
    handleUpdate(accompanyingText, serviceParamountCheckbox);
});

servicePlutoCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanPlutoTV`);
    handleUpdate(accompanyingText, servicePlutoCheckbox);
});

serviceESPNCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanESPN+`);
    handleUpdate(accompanyingText, serviceESPNCheckbox);
});

serviceAppleCheckbox.addEventListener("change", function() {
    const accompanyingText = document.getElementById(`ServiceSpanApple TV+`);
    handleUpdate(accompanyingText, serviceAppleCheckbox);
});

function savePreferences() {
    // Only send a post if there is changed data!
    if (updatedPreferences.length > 0) {
        let preferences = [];
    for (let preference of updatedPreferences) {
        preferences.push({ id: preference.id, value: preference.checked });
    }
    sendPOST("/settings", preferences, (error, response) => {
        if (error) {
            newAlert(`Saving preferences failed! ${error}`, "#FF0000", 5);
            console.error(error);
        } else {
            resetText();
            newAlert("Preferences Saved!", "#32CC5F", 2)
        }
    });
    }
}

// Add event listener to save button
const saveButton = document.getElementById("SaveButton");
saveButton.addEventListener("click", savePreferences);