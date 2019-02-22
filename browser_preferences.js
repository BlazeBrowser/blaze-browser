
function browser_preferences_set_ui_headerimage(image){
  storage_preferences["ui_headerimage"]=image;
  browser_render_notification('normal','The header background has been updated.');
}

function browser_preferences_get_ui_headerimage(){
  return storage_preferences["ui_headerimage"];
}

function browser_preferences_set_homepage(url){
  storage_preferences["homepage"]=url;
  browser_render_notification('normal','Your homepage has been updated.');
}
function browser_preferences_get_homepage(){
  return storage_preferences["homepage"];
}

function browser_preferences_set_search_engine(name,url){
  if (name!=undefined && url!=undefined){
    storage_preferences["search_engine_name"]=makesafe(name);
    storage_preferences["search_engine_url"]=makesafe(url);
    browser_render_notification('normal','Search engine has been set to ' + name + '.');
  }else{
    browser_render_notification('error','We are unable to set the default search engine with the data provided.');
  }
}

function browser_preferences_get_search_engine(){
  if (storage_preferences["search_engine_name"]==false){
    storage_preferences["search_engine_name"]="DuckDuckGo";
  }
  return storage_preferences["search_engine_name"];
}

function browser_preferences_set_default_browser(){
  browser_preferences_set_default_browser_run("blaze");
  browser_preferences_set_default_browser_run("http");
  browser_preferences_set_default_browser_run("https");
}

function browser_preferences_set_default_browser_run(){
  var isdefault=app.isDefaultProtocolClient(protocol);
  if (isdefault==false){
    app.setAsDefaultProtocolClient(protocol);
  }else{
    if (protocol=="http"){
      browser_render_notification('normal','Blaze is already set as your default browser, how awesome is that!');
    }
  }
}

function browser_preferences_get_default_browser(){
  var isdefault=app.isDefaultProtocolClient("http");
  if (isdefault==false){
    return false;
  }else{
    return true;
  }
}
