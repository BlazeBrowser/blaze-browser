onload = function() {
  browser_startup();

  //--Open homepage if we have one set
  if (storage_preferences["homepage"]!=""){
    browser_tab_new(storage_preferences["homepage"]);
  }else{
    browser_tab_new();
  }

  browser_render_layout();
  browser_render_layout_os();
  browser_render_tabs();
  browser_render_navagation();
  browser_render_pageinfo();
  browser_render_urlbar();
  browser_render_preferences();
  browser_render_menu();

  browser_tabs_update();

  refresh_calls_1s();
  update_maindata();
  sync_startup();

  document.getElementById("location").addEventListener("keyup", function(event) {
    if (event.keyCode === 13){
      event.preventDefault();
      this.blur();
    }
    browser_search(event);
  });

  browser_startup_wifi_check();
  browser_startup_update_check();

  if (platform=="win32"){
    document.getElementById("browser_body").classList.add('windows');
  }
  if (platform=="darwin"){
    document.getElementById("browser_body").classList.add('macos');
  }

};

function browser_startup_wifi_check(){
  getJSON('http://blazebrowser.com/api/hello_wificheck', function(err, response) {
    if (err !== null) {
      browser_render_notification("normal","We are unable to connect to the network, if this is a public wifi you should now be taken to the login page.");
      browser_tab_new("http://www.wificonnect.ca",false);
      browser_closetab(0);
    }else{
      if (response==null){
        browser_render_notification("normal","We are unable to connect to the network, if this is a public wifi you should now be taken to the login page.");
        browser_tab_new("http://www.wificonnect.ca",false);
        browser_closetab(0);
      }else{
        if (response["system_connection"]=="true"){
          //Internet connection is good!
        }else{
          browser_render_notification("normal","We are unable to connect to the network, if this is a public wifi you should now be taken to the login page.");
          browser_tab_new("http://www.wificonnect.ca",false);
          browser_closetab(0);
        }
      }
    }
  });
}

var browser_startup_update_check_alerts=0;
function browser_startup_update_check(){
  var timecode=Date.now();
  getJSON("https://raw.githubusercontent.com/BlazeBrowser/blaze-browser/" + storage_settings["version_branch"] + "/version.json?version=" + timecode + "", function(err, response){
    if (err==null){
      if (response["version"]!=undefined){
        var version=response["version"];
        var message=response["message"];
        if (storage_settings["version"]!=version){
          getJSON("https://raw.githubusercontent.com/BlazeBrowser/blaze-browser/" + storage_settings["version_branch"] + "/main_updater_list.json", function(err2, response2){
            if (err2==null){
              if (response2["requirement_core"]<=version_core){
                if (browser_startup_update_check_alerts==0){
                  browser_render_notification("normal","You have an update waiting! Restart your browser to update instantly.");
                  browser_startup_update_check_alerts=browser_startup_update_check_alerts+1;
                }else{
                  browser_startup_update_check_alerts=browser_startup_update_check_alerts+1;
                  if (browser_startup_update_check_alerts>=120){
                    //Every 120 30 second breaks alert user of update. This is every hour.
                    browser_startup_update_check_alerts=0;
                  }
                }
              }else{
                if (browser_startup_update_check_alerts==0){
                  browser_render_notification("normal","We have an update waiting but you will need to download a new version of blaze at blazebrowser.com before we can update.");
                  browser_startup_update_check_alerts=browser_startup_update_check_alerts+1;
                }else{
                  browser_startup_update_check_alerts=browser_startup_update_check_alerts+1;
                  if (browser_startup_update_check_alerts>=120){
                    //Every 120 30 second breaks alert user of update. This is every hour.
                    browser_startup_update_check_alerts=0;
                  }
                }
              }
            }
          });
        }
      }
    }
  });

  setTimeout(function(){ browser_startup_update_check(); }, 120000);
}

function browser_startup(){

  //render web view containers for tabs
  var idon=0;
  while (idon!=101){
    var oldcontent=document.getElementById("browser_webview_container").innerHTML;
    document.getElementById("browser_webview_container").innerHTML="" + oldcontent + "<div id='browser_webview_" + idon + "_case'></div>";
    tabs[idon]=[];
    tabs[idon]["id"]=idon;
    tabs[idon]["active"]=false;
    tabs[idon]["rendered"]=false;
    tabs[idon]["syncdelay"]=0;
    tabs[idon]["order"]=0;
    tabs[idon]["icon"]=false;
    tabs[idon]["url"]=false;
    tabs[idon]["hostname"]=false;
    tabs[idon]["hostname_flags"]=false;
    tabs[idon]["title"]=false;
    tabs[idon]["pagestate"]="closed";
    tabs[idon]["state_https_elements"]=false;
    tabs[idon]["state_https"]=false;
    tabs[idon]["state_canrefresh"]=false;
    tabs[idon]["state_cangoback"]=false;
    tabs[idon]["state_cangoforward"]=false;
    tabs[idon]["state_mediaplaying"]=false;
    tabs[idon]["colour"]=false;
    idon=idon+1;
  }
}
