let message = {
   sender: "popup.js", //sender of the message
   receiver: "", //intended message destination
   action: "",
   property: ""
}

function constructMessage(rec, act, prop){
   message.receiver = rec;
   message.action = act;
   message.property = prop;
}

document.addEventListener('DOMContentLoaded', () => {
   let toggle = document.getElementById("navToggle");
   let speed = document.getElementById('scrubSpeed');

   //get initialization info
   constructMessage('background.js', 'request', 'initInfo');
   chrome.runtime.sendMessage(message, (response) => {
      response.state == "true" ? toggle.checked = true : toggle.checked = false;
      speed.value = response.speed;
   });

   speed.addEventListener('change', ()=>{
      constructMessage('background.js', 'set', 'speed');
      message.value = speed.value;
      chrome.runtime.sendMessage(message);
      message.value = undefined;
   });

   toggle.addEventListener('click', () => {
         let togstat = (toggle.checked).toString();
         constructMessage("background.js", "toggle", "state");
         chrome.runtime.sendMessage(message, (response) => {});
   });
});
