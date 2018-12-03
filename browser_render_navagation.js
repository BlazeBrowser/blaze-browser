var render_navagation_current="";
function browser_render_navagation(){
  var rendered="";

  if (tabs[tabs_current]["state_cangoback"]==true){
    rendered=rendered + "<div onclick=\"javascript:browser_tab_control_back('" + tabs_current + "');\" class='button back'></div>";
  }
  if (tabs[tabs_current]["state_cangoforward"]==true){
    rendered=rendered + "<div onclick=\"javascript:browser_tab_control_forward('" + tabs_current + "');\" class='button forward'></div>";
  }
  if (tabs[tabs_current]["state_canrefresh"]==true){
    rendered=rendered + "<div onclick=\"javascript:browser_tab_control_reload('" + tabs_current + "');\" class='button refresh'></div>";
  }
  if (tabs[tabs_current]["state_canrefresh"]==false){
    rendered=rendered + "<div onclick=\"javascript:browser_tab_control_stop('" + tabs_current + "');\" class='button stop'></div>";
  }

  if (storage_preferences["homepage"]!=""){
    rendered=rendered + "<div onclick=\"javascript:browser_url_goto('" + storage_preferences["homepage"] + "');\" class='button homepage'></div>";
  }

  if (render_navagation_current!=rendered){
    document.getElementById("browser_navagation_container").innerHTML=rendered;
    render_navagation_current=rendered;
    browser_render_layout();
  }
  setTimeout(function(){ browser_render_navagation(); }, 70);
}
