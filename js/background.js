console.log("Background Script Running...");
let state = false;
let speed = 1;
let message = {
   sender: "background.js", //sender of the message
   receiver: "", //intended message destination
   action: "",
   property: ""
}

function constructMessage(rec, act, prop){
   message.receiver = rec;
   message.action = act;
   message.property = prop;
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      //console.log(sender.tab ? "from a content script: " + sender.tab.url : "from the extension");
      console.log("message recieved", request);
      if(request.receiver == "background.js"){
         if(request.action != ""){ //requesting info from the background
            switch (request.action){
               case "request":
                  switch(request.property) {
                     case "state" :
                        console.log('requesting state');
                        constructMessage(request.sender, "response", state.toString());
                        sendResponse(message);
                        break;
                     case "speed" :
                        console.log('requesting speed');
                        constructMessage(request.sender, "Response", )
                        sendResponse(message);
                        break;
                     case "initInfo" :
                        console.log('requesting initialization information');
                        let initInfo = {
                           state : state.toString(),
                           speed : speed.toString()
                        }
                        sendResponse(initInfo);
                        break;
                     default :
                        constructMessage(request.sender, "Error Fetching property", "ERROR");
                        sendResponse(message);
                  }
                  break;
               case "toggle":
                  switch(request.property){
                     case "state" :
                        state == true ? state = false : state = true;
                        let callbackResponse;
                        chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
                           constructMessage("content.js", "toggle", "navControl");
                           console.log("sending message to content script");
                           chrome.tabs.sendMessage(tabs[0].id, message);
                        });
                        constructMessage(request.sender, "State property changed. Content script responded with " + callbackResponse, state.toString());
                        sendResponse(message);
                        break;
                     default :
                        constructMessage(request.sender, "Unknown property", "ERROR");
                        sendResponse(message);
                  }
                  break;
               case "set" :
                  switch(request.property){
                     case 'speed' :
                        console.log("setting speed");
                        speed = Number(request.value);
                        //message.value = request.value;
                        //constructMessage('content.js', 'set', 'speed');
                        //chrome.runtime.sendMessage(message, (response) => {
                        //   console.log("response from content script after settign speed", response);
                        //});
                        chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
                           constructMessage("content.js", "set", "speed");
                           console.log("sending message to content script");
                           message.value = request.value;
                           chrome.tabs.sendMessage(tabs[0].id, message);
                        });
                        message.value = undefined;
                        constructMessage(request.sender, "Speed property set", "ok");
                        sendResponse(message);
                        break;
                     default :
                        constructMessage(request.sender, "Unknown Property to set", "ERROR");
                        sendResponse(message);
                  }
                  break;
               default :
                  constructMessage(request.sender, "Unknown request", "ERROR");
                  sendResponse(message);
            }
         }
         else {
            console.log("Something broke");
            constructMessage(request.sender, "No action specified", "ERROR");
            sendResponse(message);
         }
      }

});
