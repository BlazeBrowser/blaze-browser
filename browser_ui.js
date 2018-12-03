function browser_ui_statusbar_set(content){
  var rendered="<div class='case'>" + content + "</div>";
  document.getElementById("browser_webview_statusbar").innerHTML=rendered;
}

function browser_ui_statusbar_clear(){
  document.getElementById("browser_webview_statusbar").innerHTML="";
}

function browser_ui_dropdown_toggle(div){
  if (document.getElementById(div)!=undefined){
    var open=document.getElementById(div).classList.contains('open');
    if (open==false){
      document.getElementById(div).classList.add('open');
      document.getElementById(div).onmouseout = function(event){
        var list = traverseChildren(document.getElementById(div));
        var e = event.toElement || event.relatedTarget;
        if (!!~list.indexOf(e)) {
          //nothing
        }else{
          browser_ui_dropdown_close(div);
        }
      };
      document.getElementById(div).onclick = function(event){
        console.log(event);
        if(event.target.tagName.toLowerCase() == "a"){
          console.log("sent close event");
          browser_ui_dropdown_close(div);
          setTimeout(function(){ browser_ui_dropdown_close(div); }, 15);
        }else{
          browser_ui_dropdown_open(div);
          setTimeout(function(){ browser_ui_dropdown_open(div); }, 15);
        }
      };
    }else{
      document.getElementById(div).classList.remove('open');
    }
  }
}

function browser_ui_dropdown_close(div){
  if (document.getElementById(div)!=undefined){
    var open=document.getElementById(div).classList.contains('open');
    if (open==true){
      document.getElementById(div).classList.remove('open');
    }
  }
}

function browser_ui_dropdown_open(div){
  if (document.getElementById(div)!=undefined){
    var open=document.getElementById(div).classList.contains('open');
    if (open==false){
      document.getElementById(div).classList.add('open');
    }
  }
}
