function browser_tabs_update(){
  var idon=0;
  var render_tabs=[];
  while (idon!=101){
    if (tabs[idon]["active"]==true){
      render_tabs.push(idon);
    }
    idon=idon+1;
  }

  //update time on current tab
  tabs[tabs_current]["lastused"]=Date.now();

  render_tabs.forEach(function(tabid){
    var webview = document.querySelector("#browser_webview_" + tabid + "");

    //state - reload
    if (tabs[tabid]["pagestate"]=="loaded"){
      tabs[tabid]["state_canrefresh"]=true;
    }else{
      tabs[tabid]["state_canrefresh"]=false;
    }

    //state - goback
    if (tabs[tabid]["pagestate"]=="loaded"){
      if (webview.canGoBack()==true){
        tabs[tabid]["state_cangoback"]=true;
      }else{
        tabs[tabid]["state_cangoback"]=false;
      }
    }

    //state - goforward
    if (tabs[tabid]["pagestate"]=="loaded"){
      if (webview.canGoForward()==true){
        tabs[tabid]["state_cangoforward"]=true;
      }else{
        tabs[tabid]["state_cangoforward"]=false;
      }
    }

    //title
    if (tabs[tabid]["pagestate"]=="loaded"){
      var title=makesafe(webview.getTitle());
      if (title!=""){
        if (tabs[tabid]["title"]!=title){
          //Update the history API
          setTimeout(function(){ sync_update_history_title(tabid,tabs[tabid]["url"],true,title); }, 200);
        }
        tabs[tabid]["title"]=title;
      }
    }else{
      //tabs[tabid]["title"]="Loading...";
    }

  });

  setTimeout(function(){ browser_tabs_update(); }, 30);
}
