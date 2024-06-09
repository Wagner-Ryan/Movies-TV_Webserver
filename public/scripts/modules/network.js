export default (route, dataToSend, callback) => {
    const options = {
        method: "POST",
        body: JSON.stringify(dataToSend),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    };
    fetch(route, options)
        .then(response => response.json())
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
}