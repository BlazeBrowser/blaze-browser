current_notification_id=0;

function browser_render_notification(type,text,title,image,link,selfclose){
	if (image==undefined){
		var image=false;
	}
	if (title==undefined){
		var title="Hey";
	}
	if (link==undefined){
		link=false;
	}
	if (selfclose==undefined){
		selfclose=true;
	}
	var theDiv = document.getElementById("browser_webview_notifications");
	var content = document.createElement("div");

	var linkbutton=false;
	if (link!=false){
		var linkbutton = document.createElement("a");
		linkbutton.href=link;
		linkbutton.innerText="Check it out";
		linkbutton.classList.add('notification_button');
	}

	var closebutton=false;
	if (selfclose==false){
		var closebutton = document.createElement("a");
		closebutton.href="javascript:browser_render_notification_clear('" + current_notification_id + "');";
		closebutton.innerText="Close";
		closebutton.classList.add('notification_button');
	}
	var titlebox=false;
	if (title!=false){
		var titlebox = document.createElement("div");
		titlebox.innerText=title;
		titlebox.classList.add('notification_title');
	}

	var imagecase=false;
	if (image!=false){
		var imagecase = document.createElement("img");
		imagecase.src=image;
		imagecase.classList.add('notification_image');
	}

	content.className="notification notification_" + type + " notification_slidein";
	content.id="notification_id_" + current_notification_id + "";
	content.innerText=text;

	//Insert links and buttons if needed
	if (linkbutton!=false){ content.appendChild(linkbutton); }
	if (closebutton!=false){ content.appendChild(closebutton); }
	if (titlebox!=false){ content.insertBefore(titlebox, content.firstChild); }
	if (imagecase!=false){ content.insertBefore(imagecase, content.firstChild); }

	theDiv.insertBefore(content, theDiv.firstChild);
	if (selfclose==true){
		setTimeout("browser_render_notification_clear('" + current_notification_id + "');", 5000);
	}
	current_notification_id=current_notification_id+1;
}

function browser_render_notification_clear(id){
  document.getElementById("notification_id_" + id + "").classList.remove('notification_slidein');

	setTimeout(function() {
    document.getElementById("notification_id_" + id + "").classList.add('notification_slideout');
	}, 25);
	setTimeout("browser_render_notification_delete('" + id + "');", 1000);
}

function browser_render_notification_delete(id){
	if (document.getElementById("notification_id_" + id + "")!=undefined){
		var element = document.getElementById("notification_id_" + id + "");
		element.parentNode.removeChild(element);
	}
}
