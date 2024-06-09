// Globals
const backgroundColor = '#4E4E4E';
const textColor = '#ffffff';
const fontSize = '25px';
let alertIndex = 0;

const removeAlert = (alertId) => {
    const alert = document.getElementById(alertId);
    if (alert){
        alert.remove();
    } else{
        console.error(`No alter with id '${alertId}`);
    }
}

export default (alertMsg, alertColor, alertLength) => {
    const borderRadius = '4px';
    // Create a new alertColumn if one doesn't already exist
    let alertColumn = document.querySelector('.AlertColumn');
    if (!alertColumn){
        alertColumn = document.createElement('div');
        alertColumn.className = 'AlertColumn';
        alertColumn.style.position = 'fixed';
        alertColumn.style.margin = '10px';
        alertColumn.style.bottom = '0';
        alertColumn.style.right = '0';
        alertColumn.style.display = 'flex';
        alertColumn.style.flexDirection = 'column';
        alertColumn.style.cursor = 'pointer';
    }

    let alertDiv = document.createElement('div');
    alertDiv.className = 'Alert';
    alertDiv.id = `Alert${alertIndex}`;
    alertDiv.style.display = 'flex';
    alertDiv.style.margin = '15px';
    alertDiv.style.position = 'relative';
    alertDiv.style.backgroundColor = `${backgroundColor}`;
    alertDiv.style.height = '100px';
    alertDiv.fontSize = fontSize;
    alertDiv.style.color = textColor;
    alertDiv.onclick = () => {
        removeAlert(alertDiv.id)
    };
    alertDiv.style.borderRadius = borderRadius;
    alertColumn.appendChild(alertDiv);

    let alertProgressBarWrapper = document.createElement('div');
    alertProgressBarWrapper.className = 'AlertProgressBarWrapper';
    alertProgressBarWrapper.style.position = 'relative';
    alertProgressBarWrapper.style.marginRight = '5px';
    alertDiv.appendChild(alertProgressBarWrapper);

    let alertProgressBar = document.createElement('div');
    alertProgressBar.className = 'AlertProgressBar';
    alertProgressBar.style.position = 'absolute'; 
    alertProgressBar.style.bottom = '0'; 
    alertProgressBar.style.left = '0';
    alertProgressBar.id = `AlertProgressBar${alertIndex}`;
    alertProgressBar.style.backgroundColor = alertColor;
    alertProgressBar.style.borderTopLeftRadius = borderRadius;
    alertProgressBar.style.borderBottomLeftRadius = borderRadius;
    alertProgressBar.style.width = 'max(5px, 0.3vh)';
    alertProgressBarWrapper.appendChild(alertProgressBar);

    let alertWrapper = document.createElement('div');
    alertWrapper.className = 'AlertWrapper';
    alertWrapper.style.padding = '5px';
    alertWrapper.style.width = 'max(150px, 6vw)';
    alertWrapper.style.display = 'flex';
    alertWrapper.style.justifyContent = 'center';
    alertWrapper.innerHTML = alertMsg;

    alertDiv.appendChild(alertWrapper);
    document.body.appendChild(alertColumn);

    let timer = alertLength; // Initial time (in seconds)
    timer = timer * 100; // Time in ms
    // Update timer every 1 milliseconds
    const interval = setInterval(() => {
        timer -= 1; // Decrease timer
        const previousHeight = parseInt(alertProgressBar.style.height, 10);
        if (previousHeight !== Math.round(timer / alertLength)){
            alertProgressBar.style.height = `${Math.round(timer / alertLength)}%`;
        }
        if (timer <= 0) {
            alertDiv.remove();
            clearInterval(interval);
        }
    }, 10); // Interval in milliseconds

    alertIndex++;
}