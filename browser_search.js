var browser_search_active=false;

function browser_search(e){
  var search=document.querySelector('#location').value;
  var search_uri=encodeURI(search);

  if (e.keyCode!=13){
    if (browser_search_active==false){
      browser_search_active=true;
      var height=document.documentElement.clientHeight;
      document.getElementById("browser_webview_container").classList.add('blur');
      height=height-document.querySelector('#browser_levelcase').offsetHeight;
      document.getElementById("browser_webview_overlay").innerHTML="<div class='case' style='height:" + height + "px;'><div class='frame'><div id='browser_search_content_sync'></div><div id='browser_search_content_duckduckgo'></div><div id='browser_search_content_bottom'></div></div><div class='close' onclick='javascript:browser_search_close();'></div>";
    }

    //make the requests to do a api search, some with a delay
    setTimeout("browser_search_api_duckduckgo('" + search_uri + "');", 100);
    setTimeout("browser_search_sync('" + search_uri + "');", 100);

    results="<div style='margin-top:10px;text-align:center;'>Press enter to search "+ storage_preferences["search_engine_name"] + " for " + search + "...</div>";
    document.getElementById("browser_search_content_bottom").innerHTML=results;


  }else{
    //key enter keypress
    browser_search_active=false;
    document.getElementById("browser_webview_overlay").innerHTML="";

    console.log(check_validurl(search));

    if (check_validurl(search)==true){
      browser_url_goto(search);
    }else{
      browser_url_goto('' + storage_preferences["search_engine_url"] + '' + search_uri + '');
    }
  }
}


function browser_search_close(){
  browser_search_active=false;
  document.getElementById("browser_webview_overlay").innerHTML="";
  document.getElementById("browser_webview_container").classList.remove('blur');
}

function browser_search_api_duckduckgo(query){
  if (query!=""){
    if (browser_search_active==true){
      if (decodeURIComponent(query)==document.querySelector('#location').value){

        //Now that we know the query asked is the same as the url now after delay we can get api results!
        getJSON("https://api.duckduckgo.com/?q=" + query + "&format=json&pretty=1&t=blazebrowser", function(err, response){
          var results="";
          if (err==null){
              if (response["Type"]!=undefined){
              if (response["Type"]!=""){

                //article
                if (response["Type"]=="A"){
                  var heading=false;
                  var image=response["Image"];
                  var text=response["AbstractText"];
                  var url=response["AbstractURL"];
                  var source=response["AbstractSource"];
                  results=browser_search_api_duckduckgo_formated(heading,image,text,url,source);
                  results="<h2>" + response["Heading"] + "</h2>" + results;
                }

                //disambiguation (multiple article results)
                if (response["Type"]=="D"){
                  response["RelatedTopics"].forEach(function(s){
                    if (s["Text"]!==undefined){
                      var url=s["FirstURL"].replace("duckduckgo.com/", "en.wikipedia.org/wiki/");
                      var heading=false;
                      var icon=s["Icon"]["URL"];
                      var text=s["Text"];
                      var source=response["AbstractSource"];
                      results=results + browser_search_api_duckduckgo_formated(heading,icon,text,url,source);
                    }
                  });
                  if (results!=""){
                    results="<h2>" + response["Heading"] + "</h2>" + results;
                  }
                }

                //category
                if (response["Type"]=="C"){
                  response["RelatedTopics"].forEach(function(s){
                    if (s["Text"]!==undefined){
                      var url=s["FirstURL"].replace("duckduckgo.com/", "en.wikipedia.org/wiki/");
                      var heading=false;
                      var icon=s["Icon"]["URL"];
                      var text=s["Text"];
                      var source=response["AbstractSource"];
                      results=results + browser_search_api_duckduckgo_formated(heading,icon,text,url,source);
                    }
                  });
                  if (results!=""){
                    results="<h2>" + response["Heading"] + "</h2>" + results;
                  }
                }
              }
            }
          }

          //return the results!
          if (results!=""){
            results=results + "<div style='margin-top:25px;text-align:right;'><img src='https://blazebrowser.com/cdn/webpage_logo?url=duckduckgo.com&size=64' style='max-width:32px;margin-top: -8px;margin-left: 10px;float: right;border-radius: 32px;'> Result(s) by DuckDuckGo</div>";
            if (document.getElementById("browser_search_content_duckduckgo")!=undefined){
              document.getElementById("browser_search_content_duckduckgo").innerHTML=results;
            }
          }else{
            if (document.getElementById("browser_search_content_duckduckgo")!=undefined){
              document.getElementById("browser_search_content_duckduckgo").innerHTML="";
            }
          }
        });

      }
    }
  }
}

function browser_search_api_duckduckgo_formated(heading,image,text,link,source){
  var result="";

  if (heading==false){
    heading="";
  }else{
    heading="<h2>" + heading + "</h2>";
  }

  result="<div style='overflow:hidden;' class='bubble'>" + heading + "<img src='" + image + "' style='max-width:80px;max-height:100px;float:left;margin-right:10px;margin-bottom:10px;border-radius:3px;'>" + text + "<BR><a href=\"javascript:browser_url_goto('" + link + "');\">Read more on " + source + ".</a></div>";

  return result;
}

function browser_search_sync(query){
  if (query!=""){
    if (browser_search_active==true){
      if (query==document.querySelector('#location').value){
        var query=encodeURI(query);

        //Now that we know the query asked is the same as the url now after delay we can get api results!
        getJSON("https://internal.blazebrowser.com/api/sync_browser_fetch_search?search=" + query + "", function(err, response){
          if (err==null){
            if (response!=undefined){

              var results="";
              var results_history="";
              var results_bookmarks="";

              if (response["data"]!=undefined){
                if (response["data"]["history"]!="false"){
                  results_history="<h2>History</h2>" + results_history;
                  response["data"]["history"].forEach(function(s){
                    if (s["url_hostname"]!==undefined){
                      results_history=results_history + browser_search_sync_formated(s["title"],s["url_protocol"],s["url_hostname"],s["url_port"],s["url_path"],s["url_search"]);
                    }
                  });
                  browser_search_sync_formated_done={};
                }
              }

              if (response["data"]!=undefined){
                if (response["data"]["bookmarks"]!="false"){
                  results_bookmarks="<h2>Bookmarks</h2>" + results_bookmarks;
                  response["data"]["bookmarks"].forEach(function(s){
                    if (s["url_hostname"]!==undefined){
                      results_bookmarks=results_bookmarks + browser_search_sync_formated(s["title"],s["url_protocol"],s["url_hostname"],s["url_port"],s["url_path"],s["url_search"]);
                    }
                  });
                  browser_search_sync_formated_done={};
                }
              }

              results="" + results_bookmarks + "" + results_history + "";
              //return the results!
              if (document.getElementById("browser_search_content_sync")!=undefined){
                document.getElementById("browser_search_content_sync").innerHTML=results;
              }

            }
          }
        });

      }
    }
  }
}

var browser_search_sync_formated_done={};
function browser_search_sync_formated(title,protocol,hostname,port,path,search){
  var generated=""
  if (port=="false"){ port=""; }
  if (search=="false"){ search=""; }
  if (path=="/"){ if (search==""){ path=""; }}

  var url="" + protocol + "//" + hostname + "" + port + "" + path + "" + search + "";
  var url_clean="" + hostname + "" + port + "" + path + "" + search + "";
  if (browser_search_sync_formated_done[url_clean]==undefined){
    browser_search_sync_formated_done[url_clean]=true;
    generated="<div style='overflow:hidden;' class='bubble' onclick=\"javascript:browser_url_goto('" + url + "');\"><div class='icon' style=\"background:#ffffff;background-image:url('https://blazebrowser.com/cdn/webpage_logo?url=" + hostname + "&size=128');background-size: cover;background-position: center center;width:30px;height:30px;border-radius:3px;float:left;margin-right:10px;\"></div>" + title + "<BR><a href=\"javascript:browser_url_goto('" + url + "');\">" + url_clean + "</a></div>";
  }
  return generated;
}
