
var render_pageinfo_current="";
function browser_render_pageinfo(){
  //This system shows the site next to the url bar as a tab, this tab contains the refresh info and more
  //on hover shows the other tabs that are sharing the same host name...
  var hostname=tabs[tabs_current]["hostname"];
  var pageinfo="";

  secured_type="unknown";
  secured_message="Loading";

  pageinfo=pageinfo + "<div class='bubble' style='text-align:center;'><img src='https://blazebrowser.com/cdn/website_icon?hostname=" + hostname + "&size=256' style='max-width:200px;max-height:90px;border-radius:5px;'></div>";

  if (tabs[tabs_current]["state_https"]==true && tabs[tabs_current]["state_https_elements"]==true){
    secured_type="secure";
    secured_message="Connected";
    pageinfo=pageinfo + "<div class='bubble'><div class='header'>Connection Secured</div>This page connection is secure, this means that the connection between you and the site is private.</div>";
  }

  if (tabs[tabs_current]["state_https"]==false){
    secured_type="error";
    secured_message="Not Secure";
    pageinfo=pageinfo + "<div class='bubble'><div class='header'>Connection NOT Secure</div>The connection to this site is not secure. You should not enter personal information on this webpage (for example, passwords or credit cards).</div>";
  }

  if (tabs[tabs_current]["state_https_elements"]==false && tabs[tabs_current]["state_https"]==true){
    secured_type="error";
    secured_message="Not Secure";
    pageinfo=pageinfo + "<div class='bubble'><div class='header'>Elements NOT Secure</div>One of more resources on this webpage (images, media, scripts) are not secure. You should not enter personal information on this webpage (for example, passwords or credit cards).</div>";
  }

  //CHECK FOR HOSTNAME FLAGS TO GENERATE
  if (tabs[tabs_current]["hostname_flags"]["data"]!=undefined && tabs[tabs_current]["hostname_flags"]["data"]!=false){

    //VERIFIED
    if (tabs[tabs_current]["hostname_flags"]["data"]["verified"]=="true" && secured_type!="error"){
      secured_type="verified";
      secured_message="Verified";
      pageinfo=pageinfo + "<div class='bubble'><h3>Verified</h3>This is the official website.</div>";
    }

    //CONTENTS
    if (tabs[tabs_current]["hostname_flags"]["data"]["content"]!="false"){
      if (tabs[tabs_current]["hostname_flags"]["data"]["content"]["data"]=="misleading"){
        pageinfo=pageinfo + "<div class='bubble'><div class='header'>Misleading information</div>This website is known to provide false and misleading information.</div>";
      }

      if (tabs[tabs_current]["hostname_flags"]["data"]["content"]["data"]=="reliable"){
        pageinfo=pageinfo + "<div class='bubble'><div class='header'>Reliable information</div>This website contains verified and reliable information and resources.</div>";
      }

      if (tabs[tabs_current]["hostname_flags"]["data"]["content"]["data"]=="crowdsourced"){
        pageinfo=pageinfo + "<div class='bubble'><div class='header'>Crowdsourced information</div>This website contains information and resources from many users, it is a open shared collection of works. Most information is fact checked but is not always verified.</div>";
      }
    }
  }

  if (pageinfo==""){
    pageinfo="<div class='bubble'>No page info to display...</div>";
  }

  var loading="";
  if (tabs[tabs_current]["pagestate"]=="loading"){
    loading="<div class='loading'></div>";
  }

  rendered="<div class='tab_container_master " + secured_type + "' onclick=\"javascript:browser_ui_dropdown_toggle('dropdown_pageinfo');\">" + secured_message + "</div><div class='dropdown' id='dropdown_pageinfo'><div class='box'>" + pageinfo + "</div></div>" + loading + "";

  if (render_pageinfo_current!=rendered){
    document.getElementById("browser_pageinfo_container").innerHTML=rendered;
    render_pageinfo_current=rendered;
    browser_render_layout();
  }
  setTimeout(function(){ browser_render_pageinfo(); }, 200);
}
