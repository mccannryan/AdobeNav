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
   if(request.receiver == "background.js"){
      if(request.action != ""){
         switch (request.action){
            case "request":
               switch(request.property) {
                  case "state" :
                     constructMessage(request.sender, "response", state.toString());
                     sendResponse(message);
                     break;
                  case "speed" :
                     constructMessage(request.sender, "Response", )
                     sendResponse(message);
                     break;
                  case "initInfo" :
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
                     speed = Number(request.value);
                     chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
                        constructMessage("content.js", "set", "speed");
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
         constructMessage(request.sender, "No action specified", "ERROR");
         sendResponse(message);
      }
   }
});
