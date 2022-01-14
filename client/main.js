const clientID = setInterval(function() {
    // When the user has loaded in to the server, shift the queue
    if (NetworkIsSessionStarted()) {
        emitNet("zqueue:shiftQueue");
        clearInterval(clientID);
    }
}, 500);
