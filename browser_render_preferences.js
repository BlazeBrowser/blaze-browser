var render_preferences_current={};
function browser_render_preferences(){

  //Check if header changed and render the changes if needed
  if (render_preferences_current["ui_headerimage"]!=storage_preferences["ui_headerimage"]){
    if (storage_preferences["ui_headerimage"]!=""){
      document.getElementById('browser_levelcase').style.backgroundImage="url('" + storage_preferences["ui_headerimage"] + "')";
      document.getElementById('browser_levelcase').style.backgroundPosition="center center";
      document.getElementById('browser_levelcase').style.backgroundSize="cover";
      render_preferences_current["ui_headerimage"]=storage_preferences["ui_headerimage"];
    }else{
      document.getElementById('browser_levelcase').style.backgroundImage="";
      document.getElementById('browser_levelcase').style.backgroundPosition="";
      document.getElementById('browser_levelcase').style.backgroundSize="";
      render_preferences_current["ui_headerimage"]=storage_preferences["ui_headerimage"];
    }
  }

  setTimeout(function(){ browser_render_preferences(); }, 90);
}
