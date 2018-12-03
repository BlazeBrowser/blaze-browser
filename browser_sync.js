var sync_api_endpoint="https://blazebrowser.com/api/";
var sync_push_history_urls={};


function sync_startup_generateid(){
  var platform=os.platform();
  var memory=os.totalmem();
  var hostname=os.hostname();
  getJSON(sync_api_endpoint + "create_browser_idcode?platform=" + platform + "&memory=" + memory + "&hostname=" + hostname + "", function(err, response){
    if (err==null){
      if (response["data"]["id"]!=undefined){
        storage_settings["browser_id"]=response["data"]["id"];
      }
    }
  });
}

function sync_push_history_prepare(tabid,url){
  var urlinbase=base64_encode(url);
  sync_push_history_urls["" + tabid + "_" + urlinbase + ""]=0;
}

function sync_push_history_clean(tabid,url){
  var urlinbase=base64_encode(url);
  sync_push_history_urls["" + tabid + "_" + urlinbase + ""]=undefined;
}

function sync_push_history(tabid,url,title){
  var urlinbase=base64_encode(url);
  var urldata=extract_urldata(url);

  if (urldata["hostname"]!="internal.blazebrowser.com"){
    if (title==undefined){
      titleencode=base64_encode(urldata["hostname"]);
    }else{
      titleencode=base64_encode(title);
    }

    sync_push_history_urls["" + tabid + "_" + urlinbase + ""]=0;

    var protocol=base64_encode(urldata["protocol"]);
    var hostname=base64_encode(urldata["hostname"]);
    var port=base64_encode(urldata["port"]);
    var pathname=base64_encode(urldata["pathname"]);
    var search=base64_encode(urldata["search"]);
    getJSON(sync_api_endpoint + "sync_browser_push_history?protocol=" + protocol + "&hostname=" + hostname + "&port=" + port + "&pathname=" + pathname + "&search=" + search + "&title=" + titleencode + "", function(err, response){
      if (err==null){
        if (response["data"]["saved"]!=undefined){
          if (response["data"]["saved"]=="true"){
            //We are good, the save happened. Nothing more to do
            if (debug==true){ console.log("SYNC: History event was saved"); }
            sync_push_history_urls["" + tabid + "_" + urlinbase + ""]=response["data"]["id"];
          }else{
            //Sync history push failed on the server end...
            sync_push_history_urls["" + tabid + "_" + urlinbase + ""]=false;
          }
        }else{
          //Sync history push failed
        }
      }else{
        setTimeout(function(){ sync_push_history(tabid,url,title); }, 500);
      }
    });
  }
}

function sync_update_history_title(tabid,url,retry,title){
  var urlinbase=base64_encode(url);
  var urldata=extract_urldata(url);

  if (urldata["hostname"]!="internal.blazebrowser.com"){
    if (title==undefined){
      titleencode=base64_encode(urldata["hostname"]);
    }else{
      titleencode=base64_encode(title);
    }

    //only update if we have the id saved for this url
    if (sync_push_history_urls["" + tabid + "_" + urlinbase + ""]!=undefined){
      var runupdate=true;
      if (sync_push_history_urls["" + tabid + "_" + urlinbase + ""]==0){
        runupdate=false;
        if (retry==true){
          if (debug==true){ console.log("SYNC: Cant update page title yet, waiting for history first."); }
          setTimeout(function(){ sync_update_history_title(tabid,url,true,title); }, 100);
        }
      }

      if (sync_push_history_urls["" + tabid + "_" + urlinbase + ""]==false){
        runupdate=false;
      }

      if (runupdate==true){
        getJSON(sync_api_endpoint + "sync_browser_update_history?id=" + sync_push_history_urls["" + tabid + "_" + urlinbase + ""] + "&title=" + titleencode + "", function(err, response){
          if (err==null){
            if (response["data"]["updated"]!=undefined){
              if (response["data"]["updated"]=="true"){
                //We are good, the save happened. Nothing more to do
                if (debug==true){ console.log("SYNC: Page title updated in history."); }
                sync_push_history_urls["" + tabid + "_" + urlinbase + ""]=undefined;
              }else{
                //Sync history push failed on the server end...
                sync_push_history_urls["" + tabid + "_" + urlinbase + ""]=undefined;
              }
            }else{
              //Sync history push failed
            }
          }else{
            setTimeout(function(){ sync_update_history_title(tabid,url,false,title); }, 200);
          }
        });
      }
    }else{
      if (retry==true){
        setTimeout(function(){ sync_update_history_title(tabid,url,false,title); }, 100);
      }
    }
  }
}

function sync_push_bookmark(url,title,preencoded){
  if (preencoded==undefined){
    preencoded=false;
  }
  var urlinbase=base64_encode(url);
  var urldata=extract_urldata(url);

  if (title==undefined){
    titleencode=base64_encode(urldata["hostname"]);
  }else{
    if (preencoded==false){
      titleencode=base64_encode(title);
    }
  }
  if (urldata["hostname"]!="internal.blazebrowser.com"){
    var protocol=base64_encode(urldata["protocol"]);
    var hostname=base64_encode(urldata["hostname"]);
    var port=base64_encode(urldata["port"]);
    var pathname=base64_encode(urldata["pathname"]);
    var search=base64_encode(urldata["search"]);
    getJSON(sync_api_endpoint + "sync_browser_push_bookmark?protocol=" + protocol + "&hostname=" + hostname + "&port=" + port + "&pathname=" + pathname + "&search=" + search + "&title=" + titleencode + "", function(err, response){
      if (err==null){
        if (response["data"]["saved"]!=undefined){
          if (response["data"]["saved"]=="true"){
            //We are good, the save happened. Nothing more to do
            browser_render_notification("normal","Bookmark has been created.");
          }else{
            //Sync history push failed on the server end...
            browser_render_notification("error","We are unable to create the bookmark.");
          }
        }else{
          //Sync history push failed
          browser_render_notification("error","We are unable to create the bookmark.");
        }
      }
    });
  }
}

function sync_fetch_history(url){

}


function sync_startup(){
  if (storage_settings["browser_id"]==undefined){
    sync_startup_generateid();
  }

  //Download data now!

}
