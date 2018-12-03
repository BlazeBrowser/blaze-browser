current_notification_id=0;

function browser_render_notification(type,text){
	console.log("New notification sent...");
	var theDiv = document.getElementById("browser_webview_notifications");
	var content = document.createElement("div");
	content.className="notification notification-" + type + " notification_slidein";
	content.id="notification_id_" + current_notification_id + "";
	content.innerText=text;
	theDiv.insertBefore(content, theDiv.firstChild);
	setTimeout("browser_render_notification_clear('" + current_notification_id + "');", 3000);
	current_notification_id=current_notification_id+1;
}

function browser_render_notification_clear(id){
  document.getElementById("notification_id_" + id + "").classList.remove('notification_slidein');

	setTimeout(function() {
    document.getElementById("notification_id_" + id + "").classList.add('notification_slideout');
	}, 25);
	setTimeout("browser_render_notification_delete('" + id + "');", 7000);
}

function browser_render_notification_delete(id){
	if (document.getElementById("notification_id_" + id + "")!=undefined){
		var element = document.getElementById("notification_id_" + id + "");
		element.parentNode.removeChild(element);
	}
}
