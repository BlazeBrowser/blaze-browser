function browser_render_urlbar(){
  var address=tabs[tabs_current]["url"];
  var urlinfo=extract_urldata(address);
  var currentvalue=document.querySelector('#location').value;
  if (urlinfo["port"]!=""){
    urlinfo["port"]=":" + urlinfo["port"];
  }
  var newvalue="" + urlinfo["hostname"] + "" + urlinfo["port"] + "" + urlinfo["pathname"] + ""; //" + urlinfo["search"] + "
  if (urlinfo["pathname"]=="/" && urlinfo["search"]==""){
    newvalue="" + urlinfo["hostname"] + "" + urlinfo["port"] + "";
  }

  if (urlinfo["hostname"]=="internal.blazebrowser.com"){
    newvalue="" + urlinfo["pathname"] + "";
  }

  if (newvalue!=currentvalue){
    if (document.querySelector('#location') !== document.activeElement){
      document.querySelector('#location').value = newvalue;
    }
  }
  setTimeout(function(){ browser_render_urlbar(); }, 200);
}

function browser_render_urlbar_full(){
  var address=tabs[tabs_current]["url"];
  var urlinfo=extract_urldata(address);
  var currentvalue=document.querySelector('#location').value;
  if (urlinfo["port"]!=""){
    urlinfo["port"]=":" + urlinfo["port"];
  }

  var newvalue="" + urlinfo["hostname"] + "" + urlinfo["port"] + "" + urlinfo["pathname"] + "" + urlinfo["search"] + "";
  if (urlinfo["pathname"]=="/" && urlinfo["search"]==""){
    newvalue="" + urlinfo["hostname"] + "" + urlinfo["port"] + "";
  }

  if (urlinfo["hostname"]=="internal.blazebrowser.com"){
    newvalue="";
  }
  document.querySelector('#location').value = newvalue;
}

function browser_render_urlbar_part(){

}
