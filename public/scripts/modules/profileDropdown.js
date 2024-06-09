import sendPOST from "/scripts/modules/network.js";

document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('LogoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sendPOST('/logout', {}, () => {window.location.href = "/";});
        });
    }
});

const menu = document.getElementById('AccountMenu');
const clickableDiv = document.getElementById('AccountButtonInactive');
if (clickableDiv) {
    clickableDiv.addEventListener('click', function() {
        // Toggle visibility of the menu
        menu.classList.toggle('hidden');
    
        // Position the menu relative to the clicked div
        const rect = clickableDiv.getBoundingClientRect();
    
        // Calculate the maximum allowed position for the menu
        const maxTop = window.innerHeight - menu.offsetHeight;
        const maxLeft = window.innerWidth - menu.offsetWidth;
    
        // Set the menu position, ensuring it stays within the viewport
        menu.style.top = `${Math.min(rect.bottom, maxTop)}px`;
        menu.style.left = `${Math.min(rect.left, maxLeft)}px`;
    });

    // Close the menu when clicking outside of it
    document.addEventListener('click', function(event) {
        if (!clickableDiv.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.add('hidden');
    }});
}