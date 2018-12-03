function browser_render_layout(){

  var webview = document.querySelector('#browser_webview_container');

  var browser_firstlevel = document.querySelector('#browser_firstlevel');
  var browser_firstlevel_height = browser_firstlevel.offsetHeight;
  var browser_firstlevel_left = document.querySelector('#browser_firstlevel_left');
  var browser_firstlevel_center = document.querySelector('#browser_firstlevel_center');
  var browser_firstlevel_right = document.querySelector('#browser_firstlevel_right');
  var browser_firstlevel_left_width = browser_firstlevel_left.offsetWidth;
  var browser_firstlevel_center_width = browser_firstlevel_center.offsetWidth;
  var browser_firstlevel_right_width = browser_firstlevel_right.offsetWidth;

  var browser_secondlevel = document.querySelector('#browser_secondlevel');
  var browser_secondlevel_height = browser_secondlevel.offsetHeight;
  var browser_secondlevel_left = document.querySelector('#browser_secondlevel_left');
  var browser_secondlevel_center = document.querySelector('#browser_secondlevel_center');
  var browser_secondlevel_right = document.querySelector('#browser_secondlevel_right');
  var browser_secondlevel_left_width = browser_secondlevel_left.offsetWidth;
  var browser_secondlevel_center_width = browser_secondlevel_center.offsetWidth;
  var browser_secondlevel_right_width = browser_secondlevel_right.offsetWidth;

  var browser_thirdlevel = document.querySelector('#browser_thirdlevel');
  var browser_thirdlevel_height = browser_thirdlevel.offsetHeight;

  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  if (platform=="win32"){
    windowWidth=windowWidth-2; //the border edges
    windowHeight=windowHeight-2; //the border edges
  }

  //browser first level elements
  browser_firstlevel_center.style.width = windowWidth - browser_firstlevel_left_width - browser_firstlevel_right_width - 10 + 'px';

  //browser second level elements
  browser_secondlevel_center.style.width = windowWidth - browser_secondlevel_left_width - browser_secondlevel_right_width + 'px';

  var browser_secondlevel_browser_addressbar = document.querySelector('#browser_addressbar').offsetWidth;
  var browser_secondlevel_browser_pageinfo_container = document.querySelector('#browser_pageinfo_container').offsetWidth;
  document.querySelector('#location').style.width = browser_secondlevel_browser_addressbar - browser_secondlevel_browser_pageinfo_container - 8 + 'px';

  //set webview area sizes
  var webviewWidth = windowWidth;
  var webviewHeight = windowHeight - browser_firstlevel_height - browser_secondlevel_height - browser_thirdlevel_height;

  webview.style.width = webviewWidth + 'px';
  webview.style.height = webviewHeight + 'px';
}

//--OS Specific render inputs
function browser_render_layout_os(){

  //--Window controls
  if (platform=="win32"){
    document.getElementById("browser_firstlevel_right").innerHTML='<div class="browser_controls"><div onclick="javascript:BrowserWindow.getFocusedWindow().minimize();" class="browser_minimize"></div><div onclick="javascript:BrowserWindow.getFocusedWindow().maximize();" class="browser_maximize"></div><div onclick="javascript:BrowserWindow.getFocusedWindow().close();" class="browser_close"></div></div>';
  }

  if (platform=="darwin"){
    document.getElementById("browser_firstlevel_left").innerHTML='<div class="browser_controls"><div onclick="javascript:BrowserWindow.getFocusedWindow().close();" class="browser_close"></div><div onclick="javascript:BrowserWindow.getFocusedWindow().minimize();" class="browser_minimize"></div><div onclick="javascript:BrowserWindow.getFocusedWindow().maximize();" class="browser_maximize"></div></div>';
  }
}
