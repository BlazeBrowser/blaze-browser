var render_menu_current="";
function browser_render_menu(){
  var rendered="";

  if (tabs[tabs_current]["title"]!=false && tabs[tabs_current]["hostname"]!="internal.blazebrowser.com"){
    rendered=rendered + "<div onclick=\"javascript:browser_ui_dropdown_toggle('dropdown_share');\" class='button share'><div class='dropdown' id='dropdown_share'><div class='box'>";

    rendered=rendered + "<div class='bubble'><div class='header'>Actions</div>";
    rendered=rendered + "<a onclick=\"javscript:sync_push_bookmark('" + tabs[tabs_current]["url"] + "','" + base64_encode(tabs[tabs_current]["title"]) + "',true);\">Add to bookmarks</a>";
    rendered=rendered + "<a onclick=\"javscript:browser_preferences_set_homepage('" + tabs[tabs_current]["url"] + "');\">Set as homepage</a>";
    rendered=rendered + "</div>";

    rendered=rendered + "</div></div></div>";
  }

  rendered=rendered + "<div onclick=\"javascript:browser_ui_dropdown_toggle('dropdown_menu');\" class='button menu'><div class='dropdown' id='dropdown_menu'><div class='box'>";

  rendered=rendered + "<div class='bubble'><div class='header'>Actions</div>";
  rendered=rendered + "<a onclick=\"javascript:browser_tab_new('https://internal.blazebrowser.com/account/splash',false);\">Bookmarks</a>";
  rendered=rendered + "<a onclick=\"javascript:browser_tab_new('https://internal.blazebrowser.com/account/history',false);\">History</a>";
  rendered=rendered + "<a onclick=\"javascript:browser_tab_new('https://internal.blazebrowser.com/account/apps',false);\">Browser Apps</a>";
  rendered=rendered + "</div>";

  rendered=rendered + "<div class='bubble'><div class='header'>Options</div>";
  rendered=rendered + "<a onclick=\"javascript:browser_tab_new('https://internal.blazebrowser.com/account/preferences',false);\">Browser Preferences</a>";
  rendered=rendered + "<a onclick=\"javascript:browser_tab_new('https://www.notion.so/lammcs/Recent-Updates-a4964f1c8c6e470d80cf9641cc8a6b8f',false);\">Recent Blaze Updates</a>";
  rendered=rendered + "</div>";

  rendered=rendered + "</div></div></div>";

  if (render_menu_current!=rendered){
    document.getElementById("browser_menu_container").innerHTML=rendered;
    render_menu_current=rendered;
    browser_render_layout();
  }
  setTimeout(function(){ browser_render_menu(); }, 77);
}
