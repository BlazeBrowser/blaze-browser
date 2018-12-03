var render_tabs_current="";
var render_tabs_count=0;
function browser_render_tabs(){
  var tabs_open=0;
  var render_tabs_id=[];
  var render_tabs_hostnames=[];
  var render_tabs_hostnames_date=[];

  tabsnew=tabs.slice();
  tabsnew.sort(sort_by('order'));
  for (var i = 0; i < tabsnew.length; i++){
    var idon=tabsnew[i]["id"];
    if (tabs[idon]["active"]==true){
      if (settings_group_domains==false){
        render_tabs_id.push(idon);
        render_tabs_hostnames.push(tabs[idon]["hostname"]);
        render_tabs_hostnames_date.push(tabs[idon]["lastused"]);
        tabs_open=tabs_open+1;
      }
      if (settings_group_domains==true){
        if (render_tabs_hostnames.indexOf(tabs[idon]["hostname"])==-1){
          //active tab, time to make a nice element now!
          render_tabs_id.push(idon);
          render_tabs_hostnames.push(tabs[idon]["hostname"]);
          render_tabs_hostnames_date.push(tabs[idon]["lastused"]);
          tabs_open=tabs_open+1;
        }else{
          var id=render_tabs_hostnames.indexOf(tabs[idon]["hostname"]);
          var date_other=render_tabs_hostnames_date[id];
          if (date_other>=tabs[idon]["lastused"]){
            //already better one found
          }else{
            //found better tab...
            render_tabs_hostnames[id]=tabs[idon]["hostname"];
            render_tabs_hostnames_date[id]=tabs[idon]["lastused"];
            render_tabs_id[id]=idon;
          }
        }
      }
    }
  }

  var rendered="";
  render_tabs_id.forEach(function(tabid){
    var urlinfo=extract_urldata(tabs[tabid]["url"]);
    var width=100/(tabs_open+1);
    var active="";
    if (tabid==tabs_current){
      var active=" active";
    }
    rendered=rendered + "<div style='width:" + width + "%;' class='tab_container'><div class='tab" + active + "' onclick=\"javascript:browser_tab_control_focus('" + tabid + "');\"><img src='./media/tab_active_edge_left.svg' class='edge_left'><div class='icon' style=\"background-image:url('https://blazebrowser.com/cdn/website_icon?hostname=" + urlinfo["hostname"] + "&size=64');background-size: cover;background-position: center center;\"></div><div class='title'>" + tabs[tabid]["title"] + "</div><div class='close' onclick=\"javascript:browser_closetab('" + tabid + "');\"></div><img src='./media/tab_active_edge_right.svg' class='edge_right'></div></div>";
  });

  if (render_tabs_current!=rendered){
    var tablink="<a href=\"javascript:browser_tab_new();\"><div id=\"browser_tabs_new\"></div></a>";

    //--box width (this determins the min width of each tab)
    var widthgo=tabs_open*120;
    var casebox = document.querySelector('#browser_tabs_container');
    casebox.style.minWidth=widthgo + "px";


    if (render_tabs_count!=tabs_open){
      var firstlevel_center = document.querySelector('#browser_firstlevel_center');
      firstlevel_center.scrollLeft=firstlevel_center.scrollWidth;
      render_tabs_count=tabs_open;
    }

    document.getElementById("browser_tabs_container").innerHTML=rendered + "" + tablink + "";
    render_tabs_current=rendered;

    browser_render_layout();
  }

  setTimeout(function(){ browser_render_tabs(); }, 200);
}
