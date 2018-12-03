function browser_tab_get_hostname_info(tab_instance_id,url,tryagain){
  if (tryagain==undefined){
    tryagain=true;
  }
  var urldata=extract_urldata(url);
  var searchhostname=urldata["hostname"];
  searchhostname=searchhostname.replace("www.", "");
  getJSON("https://blazebrowser.com/api/fetch_hostname_info?hostname=" + searchhostname + "", function(err, response){
    if (err==null){
      if (response["data"]["id"]!=undefined){
        tabs[tab_instance_id]["hostname_flags"]["data"]=response["data"];
      }else{
        tabs[tab_instance_id]["hostname_flags"]["data"]=false;
        //Try again with root domain
        if (tryagain==true){
          var temp = searchhostname.split('.').reverse();
          var root_domain = '' + temp[1] + '.' + temp[0];
          browser_tab_get_hostname_info(tab_instance_id,"https://"+ root_domain +"",false);
        }
      }
    }
  });
}

function browser_tab_get_empty(){
  var returnid=null;
  for (var i = 0; i < tabs.length; i++){
    if (returnid==null){
      if (tabs[i]["active"]==false){
        returnid=i;
      }
    }
  }
  return returnid;
}

function browser_tab_get_taken(){
  var returnid=null;
  for (var i = 0; i < tabs.length; i++){
    if (returnid==null){
      if (tabs[i]["active"]==true){
        returnid=i;
      }
    }
  }
  return returnid;
}
