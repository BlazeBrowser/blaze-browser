var tab_orderon=0;

function browser_tab_new(url,selecturl,background){
  tab_orderon=tab_orderon+1;
  if (selecturl==undefined){
    selecturl=true;
  }
  if (background==undefined){
    background=false;
  }

  //If tab is open we need to hide it now (if we are not a background tab)
  if (background==false){
    if (tabs_current!=null){
      var current_tab_instance = document.querySelector("#browser_webview_" + tabs_current + "");
      if (current_tab_instance.classList!=undefined){
        current_tab_instance.classList.add('hidden');
        tabs_lastused=tabs_current;
      }else{
        tabs_current=null;
      }
    }
  }

  //generate useragent
  var useragent_platform=os.platform();
  if (useragent_platform=="darwin"){ useragent_platform="Macintosh; Intel Mac OS X"; }
  if (useragent_platform=="win32"){ useragent_platform="Windows"; }
  var useragent_version=os.release();

  var system_useragent="Mozilla/5.0 (" + useragent_platform + " " + useragent_version + ") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.42 Safari/537.36 Blaze/1.1.43";

  //Generate new empty tab to use
  var tab_instance_id=browser_tab_get_empty();
  if (background==false){ tabs_current=tab_instance_id; }

  //Start new tab, and selet input
  if (selecturl==true){
    var input = document.getElementById('location');
    input.focus();
    document.querySelector('#location').value = "";
    input.select();
  }

  tabs[tab_instance_id]["active"]=true;
  tabs[tab_instance_id]["url"]="blank";
  tabs[tab_instance_id]["title"]="New tab";
  tabs[tab_instance_id]["pagestate"]="loading";
  tabs[tab_instance_id]["lastused"]=Date.now;
  tabs[tab_instance_id]["opened"]=Date.now;
  tabs[tab_instance_id]["order"]=tab_orderon;

  if (url==undefined){ url="https://internal.blazebrowser.com/account/splash"; }
  var webview_element='<webview src="' + url + '" style="width:100%;height:100%;" id="browser_webview_' + tab_instance_id + '" preload="./webview/onsite.js" useragent="' + system_useragent + '" partition="persist:webviewsession"></webview>';
  document.getElementById("browser_webview_" + tab_instance_id + "_case").innerHTML=webview_element;

  //If tab is a background tab we should hide it now!
  if (background==true){
    tab_instance = document.querySelector("#browser_webview_" + tab_instance_id + "");
    tab_instance.classList.add('processing');
  }

  browser_set_taburl(tab_instance_id,url,true);

  //Check if URL is secure
  var urlbrekdown=extract_urldata(url);
  if (urlbrekdown["protocol"]=="http:"){
    tabs[tab_instance_id]["state_https"]=false;
    tabs[tab_instance_id]["state_https_elements"]=false;
  }else{
    tabs[tab_instance_id]["state_https"]=true;
    tabs[tab_instance_id]["state_https_elements"]=true;
  }

  var webview = document.querySelector("#browser_webview_" + tab_instance_id + "");
  webview.addEventListener('close', function(event){
    webview.src='about:blank';
    tabs[tab_instance_id]["pagestate"]="dead";
  });

  webview.addEventListener('did-start-loading', function(event){ //Corresponds to the points in time when the spinner of the tab starts spinning.
    browser_set_taburl(tab_instance_id,event.url,false);
    tabs[tab_instance_id]["pagestate"]="loading";
    browser_ui_statusbar_clear();
  });

  webview.addEventListener('load-commit', function(event){ //Fired when a load has committed. This includes navigation within the current document as well as subframe document-level loads, but does not include asynchronous resource loads. spinning.
    if (event.isMainFrame==true){
      browser_tab_recheck_https(tab_instance_id,event.url);
      tabs[tab_instance_id]["pagestate"]="loading";
    }
  });

  webview.addEventListener('did-get-redirect-request', function(event){ //Fired when a redirect was received while requesting a resource. It also apears that a requst to redrect when using isMainFrame of true is not followed so we fallow the request for redirect
    if (event.isMainFrame==true){
      browser_url_goto(event.newURL);
    }
  });

  webview.addEventListener('did-navigate-in-page', function(event){ //When in-page navigation happens, the page URL changes but does not cause navigation outside of the page. Examples of this occurring are when anchor links are clicked or when the DOM hashchange event is triggered.
    if (event.isMainFrame==true){
      browser_set_taburl(tab_instance_id,event.url);
    }
  });

  webview.addEventListener('did-stop-loading', function(event){ //Corresponds to the points in time when the spinner of the tab stops spinning.
    tabs[tab_instance_id]["pagestate"]="loaded";
  });

  webview.addEventListener('did-fail-load', function(event){ //This event is like did-finish-load, but fired when the load failed
    console.log(event);
    tabs[tab_instance_id]["pagestate"]="error";

    //Conenction was made but not accepted, try with or without https now
    if (event["errorDescription"]=="ERR_CONNECTION_RESET"){
      var urldata=extract_urldata(event["validatedURL"]);
      if (urldata["protocol"]=="http:"){
        var newurl=event["validatedURL"].replace("http://", "https://");
        browser_url_goto(newurl);
      }
      if (urldata["protocol"]=="https:"){
        var newurl=event["validatedURL"].replace("https://", "http://");
        browser_url_goto(newurl);
      }
    }

    //Did not connect, just incase it was our use of https default try without
    if (event["errorDescription"]=="ERR_TIMED_OUT"){
      var urldata=extract_urldata(event["validatedURL"]);
      if (urldata["protocol"]=="https:"){
        var newurl=event["validatedURL"].replace("https://", "http://");
        browser_url_goto(newurl);
      }
    }

    //Did not connect, just incase it was our use of https default try without
    if (event["errorDescription"]=="ERR_CONNECTION_REFUSED" && event["isMainFrame"]==true){
      browser_render_notification("error","We are unable to load this page, the website is not responding.");
      browser_url_goto("https://internal.blazebrowser.com/errors/browser_tab_connectionrefused?url=" + urlencoded + "");
    }

    //SSL is not valid
    if (event["errorDescription"]=="ERR_INSECURE_RESPONSE"){
      tabs[tab_instance_id]["state_https"]=false;
    }

    //MAIN - SSL is not valid
    if (event["errorDescription"]=="ERR_INSECURE_RESPONSE" && event["isMainFrame"]==true){
      tabs[tab_instance_id]["state_https"]=false;
      var urlencoded=base64_encode(event["validatedURL"]);
      browser_url_goto("https://internal.blazebrowser.com/errors/browser_tab_insecuresite?url=" + urlencoded + "");
    }

    //MAIN - Page failed to load
    if (event["errorDescription"]=="ERR_CONNECTION_TIMED_OUT" && event["isMainFrame"]==true){
      tabs[tab_instance_id]["state_https"]=false;
      browser_render_notification("error","We are unable to load this page, the website is not responding.");
    }

    //MAIN - Cant find host server
    if (event["errorDescription"]=="ERR_NAME_NOT_RESOLVED" && event["isMainFrame"]==true){
      tabs[tab_instance_id]["state_https"]=false;
      var urlinfo=extract_urldata(event["validatedURL"]);
      tabs[tab_instance_id]["hostname"]=urlinfo["hostname"];
      tabs[tab_instance_id]["url"]=event["validatedURL"];
      var urlencoded=base64_encode(event["validatedURL"]);
      browser_url_goto("https://internal.blazebrowser.com/errors/browser_tab_missingserver?url=" + urlencoded + "");
    }

    //Resources blocked by the main.js scripts
    if (event["errorDescription"]=="ERR_BLOCKED_BY_CLIENT" && event["isMainFrame"]==true){
      tabs[tab_instance_id]["state_https"]=false;
      browser_url_goto("https://internal.blazebrowser.com/errors/browser_tab_blocked");
    }

    if (debug==true){ console.log(event["errorDescription"]); }
  });

  webview.addEventListener('certificate-error', function(event){ //Emitted when failed to verify the certificate for url.

  });

  webview.addEventListener('did-finish-load', function(event){ //Fired when the navigation is done, i.e. the spinner of the tab will stop spinning, and the onload event is dispatched.
    browser_set_taburl(tab_instance_id,webview.getURL());
    tabs[tab_instance_id]["pagestate"]="loaded";
    var urlloaded=webview.getURL();
    var urlbrekdown=extract_urldata(urlloaded);
    if (urlbrekdown["protocol"]=="http:"){
      tabs[tab_instance_id]["state_https_elements"]=false;
    }
  });

  webview.addEventListener("dom-ready", function(event){

  });

  webview.addEventListener("arg-fillwhenneed", function(event){
    console.log(event);
  });

  webview.addEventListener("did-change-theme-color", function(event){ //Emitted when a page's theme color changes. This is usually due to encountering a meta tag: <meta name='theme-color' content='#ff0000'>
    tabs[tab_instance_id]["colour"]=event.themeColor;
  });

  webview.addEventListener("media-started-playing", function(event){ //Emitted when media starts playing.
    tabs[tab_instance_id]["state_mediaplaying"]=true;
  });

  webview.addEventListener("media-paused", function(event){ //Emitted when media is paused or done playing.
    tabs[tab_instance_id]["state_mediaplaying"]=false;
  });

  webview.addEventListener("new-window", function(event){ //Fired when the guest page attempts to open a new browser window.
    if (event.disposition=="default"){
      if (event.url!="about:blank"){
        browser_tab_new(event.url,false);
      }
    }
    if (event.disposition=="new-window"){
      if (event.url!="about:blank"){
        browser_tab_new(event.url,false);
      }
    }
    if (event.disposition=="foreground-tab"){
      if (event.url!="about:blank"){
        browser_tab_new(event.url,false);
      }
    }
    if (event.disposition=="background-tab"){
      if (event.url!="about:blank"){
        browser_tab_new(event.url,false,true);
      }
    }
  });

  webview.addEventListener("console-message", function(event){
    browser_webview_console_message(event,webview,tab_instance_id);
  });

  webview.addEventListener("crashed", function(event){ //Fired when the renderer process is crashed.
    tabs[tab_instance_id]["pagestate"]="crashed";
    browser_url_goto("https://internal.blazebrowser.com/errors/browser_tab_crash");
  });

  webview.addEventListener("gpu-crashed", function(event){ //Fired when the gpu process is crashed.
    tabs[tab_instance_id]["pagestate"]="crashed";
    browser_url_goto("https://internal.blazebrowser.com/errors/browser_tab_crash");
  });

  webview.addEventListener("plugin-crashed", function(event){ //Fired when a plugin process is crashed.
    tabs[tab_instance_id]["pagestate"]="crashed";
    browser_url_goto("https://internal.blazebrowser.com/errors/browser_tab_crash");
  });

  webview.addEventListener('ipc-message', function(event){

    var sendback=null;

    //--Basic from onsite (full access) this data is only from the onsite.js file and not from websites
    if (event.channel=="browser_ui_statusbar_set"){
      browser_ui_statusbar_set(event.args[0]);
    }
    if (event.channel=="browser_ui_statusbar_clear"){
      browser_ui_statusbar_clear();
    }
    if (event.channel=="webpage_open_devtools"){
      webview.openDevTools();
    }
    if (event.channel=="webpage_open_devtools_inspect"){
      webview.inspectElement(event.args[0], event.args[1]);
    }
    if (event.channel=="webpage_open_newtab"){
      browser_tab_new(event.args[0],false,false);
    }
    if (event.channel=="webpage_open_newtab_background"){
      browser_tab_new(event.args[0],false,true);
    }
    if (event.channel=="preferences_set_ui_headerimage"){
      browser_preferences_set_ui_headerimage(event.args[0]);
    }

    //--API! Advanced Internal Domain ONLY!
    if (urlbrekdown["hostname"]=="internal.blazebrowser.com"){

      //Preferences SET
      if (event.channel=="api_preferences_set_search_engine"){
        browser_preferences_set_search_engine(event.args[0],event.args[1]);
      }
      if (event.channel=="api_preferences_set_ui_headerimage"){
        browser_preferences_set_ui_headerimage(event.args[0]);
      }
      if (event.channel=="api_preferences_set_homepage"){
        browser_preferences_set_homepage(event.args[0]);
      }
      if (event.channel=="api_preferences_set_default_browser"){
        browser_preferences_set_default_browser();
      }

      //Core SET
      if (event.channel=="api_core_set_version_branch"){
        if (event.args[0]=="stable"){
          storage_settings["version_branch"]=event.args[0];
        }
        if (event.args[0]=="beta"){
          storage_settings["version_branch"]=event.args[0];
        }
        if (event.args[0]=="master"){
          storage_settings["version_branch"]=event.args[0];
        }
        browser_render_notification('normal','Your update branch has been change to ' + event.args[0] + '. Restart your browser to update.');
      }
      if (event.channel=="api_core_version_reset"){
        browser_render_notification('normal','Your browser is ready to be updated, just restart Blaze to begin the update.');
        storage_settings["version"]="reset_1_fn773j";
      }

      //Preferences GET
      if (event.channel=="api_preferences_get_homepage"){
        sendback=browser_preferences_get_homepage();
      }
      if (event.channel=="api_preferences_get_default_browser"){
        sendback=browser_preferences_get_default_browser();
      }

      //Core GET
      if (event.channel=="api_core_get_version_branch"){
        sendback=storage_settings["version_branch"];
      }

    }

    //--API! Advanced API for Domains!

    //Preferences GET
    if (event.channel=="api_preferences_get_ui_headerimage"){
      sendback=browser_preferences_get_ui_headerimage();
    }
    if (event.channel=="api_preferences_get_search_engine"){
      sendback=browser_preferences_get_search_engine();
    }

    if (event.channel=="api_event_notification"){
      var urlinfo=extract_urldata(tabs[tab_instance_id]["url"]);
      var image="https://blazebrowser.com/cdn/webpage_logo?url=" + urlinfo["hostname"] + "&size=128";
      browser_render_notification('website','' + event.args[0] + '',urlinfo["hostname"],image,false,false);
    }

    webview.send('' + event.channel + '_reply', sendback);
  });
}

function browser_tab_recheck_https(tab_instance_id,url){
  var urlbrekdown=extract_urldata(url);
  if (urlbrekdown["protocol"]=="http:"){
    tabs[tab_instance_id]["state_https"]=false;
    tabs[tab_instance_id]["state_https_elements"]=false;
  }else{
    tabs[tab_instance_id]["state_https"]=true;
    tabs[tab_instance_id]["state_https_elements"]=true;
  }
}

function browser_closetab(tab_instance_id){
  if (tabs[tab_instance_id]["active"]==true){
    sync_push_history_clean(tab_instance_id,tabs[tab_instance_id]["url"]);

    tabs[tab_instance_id]["active"]=false;
    tabs[tab_instance_id]["url"]=false;
    tabs[tab_instance_id]["hostname"]=false;
    tabs[tab_instance_id]["hostname_flags"]=false;
    tabs[tab_instance_id]["title"]="New tab";
    tabs[tab_instance_id]["pagestate"]="closed";
    tabs[tab_instance_id]["syncdelay"]=0;
    tabs[tab_instance_id]["order"]=0;
    tabs[tab_instance_id]["state_canrefresh"]=false;
    tabs[tab_instance_id]["state_cangoback"]=false;
    tabs[tab_instance_id]["state_https"]=false;
    tabs[tab_instance_id]["state_https_elements"]=false;
    tabs[tab_instance_id]["state_cangoforward"]=false;
    tabs[tab_instance_id]["state_mediaplaying"]=false;
    document.getElementById("browser_webview_" + tab_instance_id + "_case").innerHTML="";
    var new_current_tab=tabs_lastused;
    if (tabs_current==tab_instance_id){
      if (new_current_tab!=null){
        if (tabs[new_current_tab]["active"]==true){
          browser_tab_control_focus(new_current_tab,false);
        }else{
          browser_tab_control_focus(browser_tab_get_taken(),false);
        }
      }else{
        if (browser_tab_get_taken()==null){
          tabs_current=null;
          //No more tabs close the app
          BrowserWindow.getFocusedWindow().close();
        }else{
          browser_tab_control_focus(browser_tab_get_taken(),false);
        }
      }
    }
  }
}

function browser_set_taburl(tab_instance_id,url,sync){
  if (sync==undefined){
    sync=true;
  }
  if (url!=undefined){
    //If it's changed we may need to update the history and sync
    if (tabs[tab_instance_id]["url"]!=url){
      //Send in the history event to sync system
      if (sync==true){
        //5 second delay so redirects are not counted.
        tabs[tab_instance_id]["syncdelay"]=tabs[tab_instance_id]["syncdelay"]+1;
        setTimeout("if (tabs[" + tab_instance_id + "]['syncdelay']==" + tabs[tab_instance_id]["syncdelay"] + "){ if (tabs[" + tab_instance_id + "]['url']=='" + url + "'){ sync_push_history('" + tab_instance_id + "','" + url + "'); }}", 5200);
        setTimeout(function(){ sync_update_history_title(tab_instance_id,tabs[tab_instance_id]["url"],true,tabs[tab_instance_id]["title"]); }, 5500);
        //But we will at this time get the update id ready for the title and other sync scripts
        sync_push_history_prepare(tab_instance_id,url);
        sync_push_history_clean(tab_instance_id,tabs[tab_instance_id]["url"]);
      }
    }

    //Update tab info
    var urldata=extract_urldata(url);
    if (urldata["hostname"]!="internal.blazebrowser.com"){
      tabs[tab_instance_id]["url"]=url;
      tabs[tab_instance_id]["hostname"]=urldata["hostname"];
    }

    if (urldata["hostname"]=="internal.blazebrowser.com"){
      tabs[tab_instance_id]["url"]=url;
      tabs[tab_instance_id]["hostname"]=urldata["hostname"];
    }

    //Fetch URL data if not already done for this hostname
    var fetch_hostname_flags=false;
    if (tabs[tab_instance_id]["hostname_flags"]["hostname"]==undefined){
      fetch_hostname_flags=true;
    }
    if (tabs[tab_instance_id]["hostname_flags"]["hostname"]!=urldata["hostname"]){
      fetch_hostname_flags=true;
    }
    if (fetch_hostname_flags==true){
      tabs[tab_instance_id]["hostname_flags"]={};
      tabs[tab_instance_id]["hostname_flags"]["hostname"]=urldata["hostname"];
      browser_tab_get_hostname_info(tab_instance_id,url);
    }

  }
}

function browser_url_goto(url){
  browser_search_close();

  var urlinfo=extract_urldata(url);
  if (urlinfo["protocol"]!="https:" && urlinfo["protocol"]!="http:"){
    url="https://" + url + "";
  }

  var webview = document.querySelector("#browser_webview_" + tabs_current + "");
  browser_set_taburl(tabs_current,url);

  webview.src = url;
}

function browser_open_developertools(){
  var webview = document.querySelector("#browser_webview_" + tabs_current + "");
  webview.openDevTools();
}

function browser_webview_console_message(event,webview,tab_instance_id){
   //console.log('Guest page logged a message:', event.message)
}
