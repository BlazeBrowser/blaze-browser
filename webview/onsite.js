const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const ipcRenderer = require('electron').ipcRenderer;
let rightClickPosition = null
let tooltip=false;
var goto_url="";

//###########################################
//########################################### Core functions
//###########################################
function extract_urldata(url){
  var databack=[];
  var link = document.createElement('a');
  link.setAttribute('href', url);
  databack["protocol"]=link.protocol; //http:
  databack["hostname"]=link.hostname;  //  'example.com'
  databack["port"]=link.port;      //  12345
  databack["search"]=link.search;    //  '?startIndex=1&pageSize=10'
  databack["pathname"]=link.pathname;  //  '/blog/foo/bar'
  link = null;
  return databack;
}

function setClipboard(value){
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

//Returns true if it is a DOM node
function isNode(o){
  return (
    typeof Node === "object" ? o instanceof Node :
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
  );
}

//Returns true if it is a DOM element
function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
);
}

//###########################################
//########################################### Exposed website APIs
//###########################################

init();

function init() {
  // Expose a bridging API to by setting an global on `window`.
  // We'll add methods to it here first, and when the remote web app loads,
  // it'll add some additional methods as well.

  window.blaze = {
    api: blaze_api
  };

  setTimeout(function(){ adblock_run(); }, 5500);
}

async function blaze_api(action,arg,callback){
  //if a callback is given we will return to that callback!
  if (callback==undefined){
    ipcRenderer.sendToHost('api_' + action, arg[0], arg[1], arg[2]);
    return true;
  }else{
    callagent_api('api_' + action, arg[0], arg[1], arg[2]).then(function(result){
      callback(result);
    });
  }
}

function callagent_api(action,arg1,arg2,arg3) {
  return new Promise(resolve => {
      ipcRenderer.sendToHost(action, arg1, arg2, arg3);
      ipcRenderer.on(action + '_reply', (event, result) => {
        resolve(result);
      });
  });
}

//###########################################
//########################################### Password manager
//###########################################

window.addEventListener("click", function(event){

  let target_elem = event.target.closest('input');
  if (target_elem!=undefined){
    var login_field=false;
    var login_user=null;
    var login_password=null;

    //username field
    if (target_elem.type.toLowerCase() === "text") {
      if (target_elem.name.toLowerCase() === "username"){
        login_user=target_elem;
      }
    }
    //email field
    if (target_elem.type.toLowerCase() === "email") {
      if (target_elem.name.toLowerCase() === "email"){
        login_user=target_elem;
      }
    }
    //email field
    if (target_elem.type.toLowerCase() === "text") {
      if (target_elem.name.toLowerCase() === "email"){
        login_user=target_elem;
      }
    }
    //password field
    if (target_elem.type.toLowerCase() === "password") {
      login_password=target_elem;
    }

    //selected user field so we need to find password field
    if (login_password==null){
      let find=event.target.closest("input[type='password']");
      if (find!=undefined){
        login_password=find;
      }
    }

    if (login_user!=null){
      if (login_password!=null){
        login_field=true;
      }
    }

    if (login_password!=null){
      login_field=true;
    }

    if (login_field==true){
      console.log("This is a login...");
    }
  }
});

//###########################################
//########################################### Mouse over events for status bar
//###########################################

document.onmouseover = function(event){
  if (event!=undefined){
    if (isElement(event.target)==true){
      let anchorElem = event.target.closest('a'); //THIS IS AWESOME! https://developer.mozilla.org/en-US/docs/Web/API/Element/closest

      if (anchorElem!=undefined){
        tooltip_set=true;
        var url=anchorElem.href;

        if (url.indexOf("script:") >= 1){
          tooltip_set=false;
        }

        if (url.indexOf("internal.blazebrowser.com") >= 1){
          tooltip_set=false;
        }

        if (tooltip_set==true){
          tooltip=true;
          //var url=extract_urldata(anchorElem.getAttribute("href")); Gets real value
          var url_pass=extract_urldata(url);
          if (url_pass["pathname"]=="/"){ url_pass["pathname"]=""; }
          ipcRenderer.sendToHost('browser_ui_statusbar_set',"" + url_pass["hostname"] + "" + url_pass["pathname"] + "");
        }
      }
    }
  }
}

document.onmouseout = function() {
  if (tooltip==true) {
    tooltip=false;
    ipcRenderer.sendToHost('browser_ui_statusbar_clear');
  }
}


//###########################################
//########################################### Built in function override
//###########################################

var Notification = function(title,ops){
  //Send to main process in the future to show
  ipcRenderer.sendToHost('api_event_notification', title);
  return false;
};
window.Notification = Notification;


//###########################################
//########################################### Context Menu!
//###########################################

var menu_image = new Menu();
menu_image.append(new MenuItem({ label: 'Open media in new tab', click: function() { ipcRenderer.sendToHost('webpage_open_newtab',goto_url); } }));
menu_image.append(new MenuItem({ label: 'Copy media link', click: function() { setClipboard(goto_url); } }));
menu_image.append(new MenuItem({ type: 'separator' }));
menu_image.append(new MenuItem({ label: 'Set header', click: function() { ipcRenderer.sendToHost('preferences_set_ui_headerimage', goto_url); } }));

var menu_link = new Menu();
menu_link.append(new MenuItem({ label: 'Open in new tab', click: function() { ipcRenderer.sendToHost('webpage_open_newtab',goto_url); } }));
menu_link.append(new MenuItem({ label: 'Open in background tab', click: function() { ipcRenderer.sendToHost('webpage_open_newtab_background',goto_url); } }));
menu_link.append(new MenuItem({ label: 'Copy link', click: function() { setClipboard(goto_url); } }));

var menu_normal = new Menu();
menu_normal.append(new MenuItem({ label: 'Copy', click: function() { document.execCommand("copy"); } }));
menu_normal.append(new MenuItem({ label: 'Paste', click: function() { document.execCommand("paste"); } }));
menu_normal.append(new MenuItem({ type: 'separator' }));
menu_normal.append(new MenuItem({ label: 'Undo', click: function() { document.execCommand("undo"); } }));
menu_normal.append(new MenuItem({ label: 'Redo', click: function() { document.execCommand("redo"); } }));
menu_normal.append(new MenuItem({ type: 'separator' }));
menu_normal.append(new MenuItem({ label: 'Select All', click: function() { document.execCommand("selectAll"); } }));
menu_normal.append(new MenuItem({ type: 'separator' }));
menu_normal.append(new MenuItem({ label: 'Open Dev Tools', click: function() { ipcRenderer.sendToHost('webpage_open_devtools'); } }));
menu_normal.append(new MenuItem({ label: 'Inspect element', click: function() {  ipcRenderer.sendToHost('webpage_open_devtools_inspect', rightClickPosition.x, rightClickPosition.y); } }));

window.addEventListener('contextmenu', function (e) {
  rightClickPosition = {x: e.x, y: e.y}
  var menufound=false;

  if (event.target.src!=undefined && menufound==false){
    if (event.target.src!=""){
      menufound=true;
      goto_url=event.target.src;
      menu_image.popup(remote.getCurrentWindow());
    }
  }

  if (event.target.href!=undefined && menufound==false){
    if (event.target.href!=""){
      menufound=true;
      goto_url=event.target.href;
      menu_link.popup(remote.getCurrentWindow());
    }
  }

  var findlink = event.target.closest('a');
  if (findlink!=undefined && menufound==false){
    if (findlink.href!=""){
      menufound=true;
      goto_url=findlink.href;
      menu_link.popup(remote.getCurrentWindow());
    }
  }

  if (menufound==false){
    menu_normal.popup(remote.getCurrentWindow());
  }
}, false);



//###########################################
//########################################### Ad Blocker for elements
//###########################################

var blocked_elements=array(".blaze-neverfindme");
if (window.location.hostname=="twitter.com"){
  blocked_elements.push(".promoted-tweet");
}

function adblock_run(){
  for(var ir = 0; ir < blocked_elements.length; ir++) {
    var theelm=blocked_elements[ir];
    var checkfor =document.querySelectorAll(theelm);
    if (checkfor.length>=1){
      for(var i = 0; i < checkfor.length; i++) {
        //checkfor[i]
        checkfor[i].parentNode.removeChild(checkfor[i]);
        console.log("Adblock: Blocked ad element " + theelm + " from showing.");
      }​
    }
  }
  setTimeout(function(){ adblock_run(); }, 5500);
}
