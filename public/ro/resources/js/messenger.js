window.MESSENGER_VAR = "MESSENGER"; // messenger's global variable name

// initialize messenger to specified global variableName
function initializeMessenger(variableName) {

    var messenger = window[variableName] = new Object();
    messenger.request = function (message, callback) {
        // Delegate to the casino handler set up in casino-game.html
        if (typeof window._casinoMessengerRequest === 'function') {
            window._casinoMessengerRequest(message, callback);
        } else {
            var response = {
                classifier: "IError", code: -1,
                message: "Casino MESSENGER handler not initialized yet."
            };
            console.error('[casino]', response.message);
            callback.done(JSON.stringify(response));
        }
    }
}

// execute JS --->
if (typeof window[MESSENGER_VAR] == "undefined") {
    initializeMessenger(MESSENGER_VAR);
    console.log("Messenger object has been created. See window['" + MESSENGER_VAR + "']");
} else {
    // MESSENGER already defined by casino-game.html — attach our handler to it
    if (typeof window[MESSENGER_VAR].request !== 'function' ||
        window[MESSENGER_VAR]._isCasinoHandler !== true) {
        window[MESSENGER_VAR].request = function (message, callback) {
            if (typeof window._casinoMessengerRequest === 'function') {
                window._casinoMessengerRequest(message, callback);
            } else {
                callback.done('{"classifier":"IError","code":-1}');
            }
        };
        window[MESSENGER_VAR]._isCasinoHandler = true;
    }
    console.log("[casino] MESSENGER already defined — handler attached.");
}
