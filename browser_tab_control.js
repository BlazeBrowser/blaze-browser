
function browser_tab_control_reload(tab_instance_id){
  if (tabs[tab_instance_id]["active"]==true){
    browser_tab_recheck_https(tab_instance_id,tabs[tab_instance_id]["url"]);
    var webview = document.querySelector("#browser_webview_" + tab_instance_id + "");
    webview.reload();
  }
}

function browser_tab_control_stop(tab_instance_id){
  if (tabs[tab_instance_id]["active"]==true){
    var webview = document.querySelector("#browser_webview_" + tab_instance_id + "");
    webview.stop();
  }
}

function browser_tab_control_back(tab_instance_id){
  if (tabs[tab_instance_id]["active"]==true){
    var webview = document.querySelector("#browser_webview_" + tab_instance_id + "");
    webview.goBack();
  }
}

function browser_tab_control_forward(tab_instance_id){
  if (tabs[tab_instance_id]["active"]==true){
    var webview = document.querySelector("#browser_webview_" + tab_instance_id + "");
    webview.goForward();
  }
}

function browser_tab_control_focus(tab_instance_id){
  if (tabs[tab_instance_id]["active"]==true){
    var oldid=tabs_current;
    if (tabs[tabs_current]["active"]==true){
      tabs_lastused=tabs_current;
      var current_tab_instance = document.querySelector("#browser_webview_" + tabs_current + "");
      current_tab_instance.classList.add('hidden');
    }else{
      tabs_lastused=null;
    }

    //Set new current tab and make it visable
    tabs_current=tab_instance_id;
    var new_tab_instance = document.querySelector("#browser_webview_" + tab_instance_id + "");
    new_tab_instance.classList.remove('hidden');
    new_tab_instance.classList.remove('processing');
  }
}
