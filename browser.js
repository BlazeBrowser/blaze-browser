const {remote} = require('electron');
const {app} = remote;
const {BrowserWindow} = remote;
const win = BrowserWindow.getFocusedWindow();
var ipcRenderer = require('electron').ipcRenderer;
var os = require("os");
var debug=false;

var storage_settings=remote.getGlobal('storage_settings');
var storage_preferences=remote.getGlobal('storage_preferences');
var version_core=remote.getGlobal('version_core');

//--Load in default prefrences if we dont have set!
if (storage_preferences["search_engine_name"]==undefined){
  storage_preferences["search_engine_name"]="DuckDuckGo";
}
if (storage_preferences["search_engine_url"]==undefined){
  storage_preferences["search_engine_url"]="https://duckduckgo.com/?q=";
}
if (storage_preferences["homepage"]==undefined){
  storage_preferences["homepage"]="";
}
if (storage_preferences["security_webrequest_blocklist"]==undefined){
  storage_preferences["security_webrequest_blocklist"]={};
  storage_preferences["security_webrequest_blocklist"]["adscripts"]=true;
  storage_preferences["security_webrequest_blocklist"]["antiadblockscripts"]=true;
  storage_preferences["security_webrequest_blocklist"]["trackerscripts"]=true;
  storage_preferences["security_webrequest_blocklist"]["socialscripts"]=true;
  storage_preferences["security_webrequest_blocklist"]["spam"]=true;
  storage_preferences["security_webrequest_blocklist"]["custom"]=true;
  storage_preferences["security_webrequest_blocklist"]["badnetwork"]=true;
}

var tabs=[];
var domains_open=[];
var tabs_lastused=null;
var tabs_current=null;
var isLoading = false;
var settings_group_domains=false;
var platform=os.platform();

Array.prototype.remove = function(){
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function replaceNewline(input){
    var newline = String.fromCharCode(13, 10);
    return input.replaceAll('\\n', newline);
}
String.prototype.replaceAll = function (find, replace) {
    var result = this;
    do {
        var split = result.split(find);
        result = split.join(replace);
    } while (split.length > 1);
    return result;
};

function traverseChildren(elem){
  var children = [];
  var q = [];
  q.push(elem);
  while (q.length > 0) {
    var elem = q.pop();
    children.push(elem);
    pushAll(elem.children);
  }
  function pushAll(elemArray){
    for(var i=0; i < elemArray.length; i++) {
      q.push(elemArray[i]);
    }
  }
  return children;
}

function base64_encode(datathis) {
  datathis=unescape(encodeURIComponent(datathis));
  datathis=btoa(datathis);
  datathis=datathis.replace(/\s/g, "");
	datathis=datathis.replace(/\+/g, "-");
	datathis=datathis.replace(/\//g, "_");
	datathis=datathis.replace(/=/g, ",");
  return datathis;
}

function base64_ssfix(datathis) {
  datathis=datathis.replace(/\s/g, "");
	datathis=datathis.replace(/\+/g, "-");
	datathis=datathis.replace(/\//g, "_");
	datathis=datathis.replace(/=/g, ",");
  return datathis;
}

function base64_decode(datathis) {
  datathis=datathis.replace(/\s/g, "");
	datathis=datathis.replace(/-/g, "+");
	datathis=datathis.replace(/_/g, "/");
	datathis=datathis.replace(/,/g, "=");
	datathis=atob(datathis);
  return datathis;
}

function makesafe(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

var sort_by = function (path, reverse, primer, then) {
    var get = function (obj, path) {
            if (path) {
                path = path.split('.');
                for (var i = 0, len = path.length - 1; i < len; i++) {
                    obj = obj[path[i]];
                };
                return obj[path[len]];
            }
            return obj;
        },
        prime = function (obj) {
            return primer ? primer(get(obj, path)) : get(obj, path);
        };

    return function (a, b) {
        var A = prime(a),
            B = prime(b);

        return (
            (A < B) ? -1 :
            (A > B) ?  1 :
            (typeof then === 'function') ? then(a, b) : 0
        ) * [1,-1][+!!reverse];
    };
};

var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, JSON.parse(xhr.response));
    }
  };
  xhr.send();
};

var sendPAYLOAD = function(url, payload_name, payload_content, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.responseType = 'json';
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, JSON.parse(xhr.response));
    }
  };
  xhr.send("" + payload_name + "=" + payload_content + "");
};

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

function check_validurl(str){
  var result=false;

  //If does not contain http add it and lable as not good
  if (str.indexOf("http") < 0){
    result=false;
    str="http://" + str;
  }

  //Regix check of strucutre
  var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
  + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
  + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
  + "|" // 允许IP和DOMAIN（域名）
  + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
  + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
  + "[a-z]{2,6}|localhost)" // first level domain- .com or .museum
  + "(:[0-9]{1,4})?" // 端口- :80
  + "((/?)|" // a slash isn't required if there is no file name
  + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  var re=new RegExp(strRegex);
  var regresult=re.test(str);
  if (regresult==true){
    result=true;
  }

  //If missing even one dot dont allow it
  if (str.indexOf(".") < 0){
    result=false;
  }

  //If over one dot and contains a slash its good
  if (str.indexOf(".") >= 1){
    if (str.indexOf("/") >= 1){
      result=true;
    }
  }

  //Localhost domains!
  if (str.indexOf("localhost") >= 1){
    result=true;
  }

  return result;
}

function refresh_calls_1s(){
  browser_render_layout();
  setTimeout(function(){ refresh_calls_1s(); }, 1000);
}

function update_maindata(){
  ipcRenderer.send('update_storage_settings',storage_settings);
  ipcRenderer.send('update_storage_preferences',storage_preferences);
  setTimeout(function(){ update_maindata(); }, 1000);
}

window.addEventListener('resize', function(e){
  browser_render_layout();

  //update data on preferences
  var widthx = document.documentElement.clientWidth;
  var heightx = document.documentElement.clientHeight;
  storage_preferences["window_width"]=widthx;
  storage_preferences["window_height"]=heightx;
});

ipcRenderer.on('startup_url' , function(event , data){
  console.log("event");
  browser_tab_new(data.url,false);
});

ipcRenderer.on('startup_command' , function(event , data){

  if (data.command=="nothing"){
    browser_render_notification("normal","Welcome back!");
  }

  if (data.command=="update_failed"){
    browser_render_notification("error","We ran into a few problems attempting to update Blaze. Check you are connected to the internet and try restarting Blaze again to install updates.");
  }

  if (data.command=="update_installed"){
    var timecode=Date.now();
    browser_render_notification("success","Blaze has a fresh coat of paint! We just installed some updates. You can check them out by clicking on Recent Blaze Updates in the menu.");

    getJSON("https://raw.blazebrowser.com/" + storage_settings["version_branch"] + "_version.json?version=" + timecode + "", function(err, response){
      if (err==null){
        if (response["version"]!=undefined){
          var version=response["version"];
          var message=response["message"];
          if (message!=false){
            browser_render_notification("normal","Welcome to Blaze version " + version + ". " + message + "");
          }
        }
      }
    });
  }

});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  //if (url === 'https://github.com'){
    // Verification logic.
    //event.preventDefault();
    //callback(true);
  //} else {
    callback(false);
  //}
  console.log(url + error);
});

//--Keyboard Shortcuts!
document.onkeydown = function(e) {
  var key = e.key.toLowerCase();

  var command=false;
  if (e.ctrlKey || e.metaKey){
    command=true;
  }

  //--Close open tab
  if (command==true && key=="w"){
    e.preventDefault();
    browser_closetab(tabs_current);
  }

  //--Reload current tab
  if (command==true && key=="r"){
    e.preventDefault();
    browser_tab_control_reload(tabs_current);
  }

  //--Open new tab
  if (command==true && key=="t"){
    e.preventDefault();
    browser_tab_new();
  }

  //--open main dev tools
  if (command==true && key=="i"){
    e.preventDefault();
    remote.getCurrentWindow().toggleDevTools();
    browser_open_developertools();
  }
};
