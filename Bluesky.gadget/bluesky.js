// Bluesky Gadget (c) www.rottensteiner.at

var USER_HANDLE = System.Gadget.Settings.read("USER_HANDLE");
var USER_HANDLE_SAVE = USER_HANDLE;

var USER_PASSWORD = System.Gadget.Settings.read("USER_PASSWORD");
var USER_PASSWORD = USER_PASSWORD;

var UPDATE_INTERVAL = System.Gadget.Settings.read("UPDATE_INTERVAL");
if (UPDATE_INTERVAL == "") { UPDATE_INTERVAL = 60000; } // in Millisekunden
var UPDATE_INTERVAL_SAVE = UPDATE_INTERVAL;

var GADGET_HEIGHT = System.Gadget.Settings.read("GADGET_HEIGHT");
if (GADGET_HEIGHT == "") { GADGET_HEIGHT = 700; } // in Pixel
var GADGET_HEIGHT_SAVE = GADGET_HEIGHT;


function loadFeed() {  

    //f. Tests:
    //feedContainer.innerHTML = "<p>Lade Feed...</p>"; 
    //document.body.innerHTML = UPDATE_INTERVAL + "/" + UPDATE_INTERVAL_SAVE + " - " + GADGET_HEIGHT + "/" + GADGET_HEIGHT_SAVE;
    //document.body.innerHTML = document.body.innerHTML + " - " + USER_HANDLE;
    //feedContainer.innerHTML = UPDATE_INTERVAL;
    //return; 

    //setInterval(loadFeed, UPDATE_INTERVAL);
    //document.body.style.height = GADGET_HEIGHT+"px";

    if (UPDATE_INTERVAL != UPDATE_INTERVAL_SAVE) {
	UPDATE_INTERVAL_SAVE = UPDATE_INTERVAL;
	setInterval(loadFeed, UPDATE_INTERVAL);
    }
    if (GADGET_HEIGHT != GADGET_HEIGHT_SAVE) {
        GADGET_HEIGHT_SAVE = GADGET_HEIGHT;
        document.body.style.height = GADGET_HEIGHT + "px";
    }

   if (USER_HANDLE == "" || USER_PASSWORD == "" ) { 
       feedContainer.innerHTML = "Bitte Einstellungen in den Optionen setzen!";
       return; 
   }

    makeBlueskyLoginRequest(USER_HANDLE, USER_PASSWORD, function(response, error) {
        if (error) {
            feedContainer.innerHTML = "<p>Login fehlgeschlagen: " + error + "</p>";
        } else {
		var accessToken = response.accessJwt;
	        //f. Test:
         	//feedContainer.innerHTML = "<p>Erfolgreich eingeloggt als: " + response.handle + "</p>";
		}
		
       // Jetzt den Feed mit dem Token abrufen
       getBlueskyFeed(accessToken, function(feedData, error) {
           if (error) {
               feedContainer.innerHTML = "<p>" + error + "</p>";
               return;
   	       }
	       // Überprüfe, ob Feed-Daten vorhanden sind
	       if (!feedData || !feedData.feed || feedData.feed.length === 0) {
	           feedContainer.innerHTML += "<p>Keine Posts im Feed gefunden.</p>";
	           return;
	       }        
   
   	      //f. Tests
	      //feedContainer.innerHTML += "<p>HALLO</p>";
	      //feedContainer.innerHTML += System.Gadget.Settings.readString("USER_HANDLE");
	      //return;  

	      // f. Tests:     
	      //var firstPost = feedData.feed[0].post;
	      //var author = firstPost.author;
	      //var content = firstPost.record.text;
	      //feedContainer.innerHTML = 
	      //    '<div style="border:1px solid #ddd; padding:10px; margin:10px;">' +
	      //    '<p><strong>Autor:</strong> ' + (author.displayName || author.handle) + '</p>' +
	      //    '<p>' + content + '</p>' +
	      //    '</div>';
              //return;
  	
	      displayPosts(feedData);
       });
   });	
}


  function displayPosts(feedData) { 
    feedContainer.innerHTML = ""; 
    // Durch alle Posts iterieren
    for (var i = 0; i < feedData.feed.length; i++) {
        var post = feedData.feed[i].post;
        var author = post.author;
        var content = post.record.text;
        var date = new Date(post.indexedAt).toLocaleString();
        var postURL = "https://bsky.app/profile/" + post.author.handle + "/post/" + post.uri.split("/").pop();

        // HTML für jeden Post zusammensetzen
        var postElement = document.createElement("div");
        postElement.className = "post";
        //var postHTML =
        postElement.innerHTML = '' +
        '<img src="' + author.avatar + '" width="40" style="border-radius:50%; margin-right:0px;">' +
        //'<a href="' + postURL + '" target="_blank">' + author.displayName + '</a></br>' +
        '<a href="' + postURL + '" target="_blank">' + author.handle + '</a></br>' +
        //author.handle + '</br>' + post.record.text + '</p>'
        post.record.text + '</br>'
        //'<small><a href="' + postURL + '" target="_blank">' + author.displayName + '</a></small></br>' +
        //'<small>' + author.handle + '</br>' + post.record.text + '</small></p>'
        //'<small>' + author.handle + '</small></p>' +
        //'<p><small>' + post.record.text.substring(0,150) + "..." + '</small></p>' +
        //post.record.text.substring(0,150) + "..." + '</small></p>'
        //'<div class="post-images">' + imagesHtml + '</div>'
        //'<small>' +
        //post.indexedAt + // Datum+Zeit anzeigen 
        //new Date(post.indexedAt).toLocaleString() + 
        //'</small>'
        ;

        // Post zum Container hinzufügen
        //feedContainer.innerHTML += postHTML;
        feedContainer.appendChild(postElement);
    }
  }  
  
// JSON-Polyfill einfügen
if (typeof JSON === "undefined") {
    JSON = {
        parse: function(str) {
            try {
                return eval("(" + str + ")");
            } catch(e) {
                throw new Error("JSON parse error");
            }
        },
        stringify: function(obj) {
            // Vereinfachte Implementierung für grundlegende Objekte
            if (obj === null) return "null";
            if (typeof obj === "number") return isFinite(obj) ? obj.toString() : "null";
            if (typeof obj === "boolean") return obj.toString();
            if (typeof obj === "string") return '"' + obj.replace(/"/g, '\\"') + '"';
            
            if (typeof obj === "object") {
                var parts = [];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        parts.push('"' + key + '":' + JSON.stringify(obj[key]));
                    }
                }
                return "{" + parts.join(",") + "}";
            }
            return "null";
        }
    };
}

function makeBlueskyLoginRequest(identifier, password, callback) {
    var xhr = new ActiveXObject("Microsoft.XMLHTTP");
    var url = "https://bsky.social/xrpc/com.atproto.server.createSession";
    var requestData = JSON.stringify({
        identifier: identifier,
        password: password
    });

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    callback(response, null);
                } catch(e) {
                    callback(null, "Fehler beim Parsen der Antwort");
                }
            } else {
                callback(null, "Fehler: " + xhr.status + " - " + xhr.statusText);
            }
        }
    };
    
    xhr.send(requestData);
}


function getBlueskyFeed(accessToken, callback) {
    var xhr = new ActiveXObject("Microsoft.XMLHTTP");
    var url = "https://bsky.social/xrpc/app.bsky.feed.getTimeline?limit=100&=" + new Date().getTime();;
    
	  //feedContainer.innerHTML += "<p>Starte Request zu: " + url + "</p>";
	
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    //var response = xhr.responseText;
                    callback(response, null);
                } catch(e) {
                    callback(null, "Fehler beim Parsen des Feeds: " + e.message);
                }
            } else {
                callback(null, "Feed-Abfrage fehlgeschlagen: " + xhr.status + " - " + xhr.statusText);
            }
        }
    };
    
    xhr.send();
}


function onLoad() {
  startAutoRefresh();
  System.Gadget.settingsUI = "settings.html";
};

// Auto-Update starten
function startAutoRefresh() {
  loadFeed(); // Sofort laden
  setInterval(loadFeed, UPDATE_INTERVAL);
}

System.Gadget.onSettingsClosed = function() {
    // Gadget neu laden
    loadFeed();
    //window.location.reload();
};