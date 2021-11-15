var timeout;
var interval;

var setDate;
var pauseDate;
var alarmDate;

var greenColor = [76, 187, 23, 100];
var yellowColor = [230, 230, 0, 100];
var redColor = [230, 0, 0, 100];
var guiLagAdjustment = 500;

var userEmail;
var thisCKPortIP;
var thisChromeIP;
var ckAuthData;

var bGetCKIPSemphor = false;
var decryptedData = "";
var ckIDHash = "";
var doesGEOLocation = 0;
var platformSupported = 1;
var firstRun = true;

var requestFilter = {
	urls: [
		"<all_urls>"
	]
};

chrome.runtime.getPlatformInfo(function(info) {
	console.log (info);
	
	//    if(info.os == "linux")j
	//      platformSupported = 1;
	//    else
	//      platformSupported = 0;
});

chrome.runtime.onStartup.addListener(function()
{
	console.log ("pluginStarted");
	console.log (chrome.runtime.PlatformOs);
});

chrome.identity.getProfileUserInfo(function(userInfo)
{
	console.log(">>>>>>>" + userInfo.email);
	userEmail = userInfo.email;
});

chrome.webRequest.onHeadersReceived.addListener(function(details)
{
	if (platformSupported < 1)
	return;
	
	var headers = details.responseHeaders;
	var i = 0;
	for (i = 0; i < headers.length; i++)
	{
		nHeader = headers[i];
		if (nHeader.name == "X-CKBYOD") {
			console.log ("found authentication hash!");
			ckIDHash = nHeader.value;
			chrome.browserAction.setBadgeBackgroundColor({color:greenColor});
			chrome.browserAction.setBadgeText({text: "on"});
						chrome.browserAction.setIcon({
				path : "img/ckauth19x.png"
			});

			break;
		}
	}
}, {urls: ["http://*/*"]},["responseHeaders"]);


chrome.webRequest.onBeforeSendHeaders.addListener(function(details)
{
	var headers = details.requestHeaders;
	var url = details.url;
	
	var ippos1 = url.search ("192.0.2.1");			// 203.7.198.253
	var ippos2 = url.search ("192.0.2.2");			// 202.166.186.253
	var i = 0;
	
	//    if (platformSupported < 1)
	//	return {requestHeaders: headers};
	
	//    console.log (headers);
	
	if (ckIDHash.length > 1)
	{
		for(i = 0, l = headers.length; i < l; ++i)
		{
			if( headers[i].name == 'User-Agent' )
			{
				headers[i].value = headers[i].value + "ck={" + ckIDHash + "}";
				console.log (headers[i].value);
				break;
			}
		}
	}
	
	if (ippos1>0 || ippos2>0)
	{
		if(i < headers.length) {
			headers[i].value = "CKAuthenticator/Chromebook";
		}
	}
	
	return {requestHeaders: headers};
	
}, requestFilter, ['requestHeaders']);


// run extension in background
setAlarm(2 * 1000);

function getGEOLocation () {
	var startPos;
	var geoSuccess = function(position) {
		startPos = position;
		document.getElementById('startLat').innerHTML = startPos.coords.latitude;
		document.getElementById('startLon').innerHTML = startPos.coords.longitude;
	};
	navigator.geolocation.getCurrentPosition(geoSuccess);
}

// This function is called by common.js when the NaCl module is
// loaded.
function moduleDidLoad()
{
    console.log ("moduleDidLoad started");

	chrome.browserAction.setBadgeBackgroundColor({color:redColor});
	chrome.browserAction.setBadgeText({text: "off"});
	
	common.hideModule();
	if (!common.naclModule)
	console.log ("naclModule is NOT loaded!!!");
	else
	{
		console.log ("naclModule is loaded!!!");
		ring();
		
		//	chrome.runtime.getPlatformInfo (function(platformInfo)
		//	{
		//	    console.log (platformInfo.os);
		//	    if (platformInfo.os == "linux") {
		//		platformSupported = 1;
		//		ring();
		//	    }
		//	    else {
		//		platformSupported = 0;
		//		chrome.browserAction.setIcon({
		//		    path : "img/ckauths19x.png"
		//		});
		//	    }
		//	});
	}
	
	if (navigator.geolocation) {
		doesGEOLocation = 1;
	}
	else {
		doesGEOLocation = 0;
	}  
}

function setAlarm(tMillis)
{
	interval = tMillis;
	ringIn(tMillis + guiLagAdjustment);
}

function ringIn(tMillis)
{
	clearTimeout(timeout);
	pauseDate = null;
	
	var tSecs = parseInt(tMillis / 1000);
	var tMins = parseInt(tSecs / 60);
	var secs = tSecs % 60;
	var tHrs = parseInt(tMins / 60);
	var mins = tMins % 60;
	var millis = tMillis % 1000;
	
	alarmDate = new Date();
	alarmDate.setHours(alarmDate.getHours() + tHrs);
	alarmDate.setMinutes(alarmDate.getMinutes() + mins);
	alarmDate.setSeconds(alarmDate.getSeconds() + secs);
	alarmDate.setMilliseconds(alarmDate.getMilliseconds() + millis);
	
	setDate = new Date();
	timeout = setTimeout(ring, alarmDate.getTime() - setDate.getTime());
}

function restart()
{
	ringIn(interval + guiLagAdjustment);
}

function getTimeLeft()
{
	if (pauseDate)
	return (alarmDate.getTime() - pauseDate.getTime());
	
	var now = new Date();
	return (alarmDate.getTime() - now.getTime());
}

function getTimeLeftPercent()
{
	return parseInt(getTimeLeft() / interval * 100);
}

function getTimeLeftString()
{
	var until = getTimeLeft();
	var tSecs = parseInt(until / 1000);
	var tMins = parseInt(tSecs / 60);
	var secs = tSecs % 60;
	var tHrs = parseInt(tMins / 60);
	var mins = tMins % 60;
	if(secs < 10) secs = "0" + secs;
	if(mins < 10) mins = "0" + mins;
	if(tHrs < 10) tHrs = "0" + tHrs;
	return ((tHrs > 0 ? tHrs + ":" : "") + mins + ":" + secs);
}

function didCreateNotification(notificationId) { }

function exchangeData ()
{
	console.log ("-------------------------------");
	console.log ("thisChromeIP is " + thisChromeIP);
	console.log ("thisCKPortIP is " + thisCKPortIP);
	console.log ("userEmail is " + userEmail);
	
	//  if (thisCKPortIP == null)
	getCKPortIP("192.0.2.1", parsePortIPData);
	
	//  if (typeof userEmail == 'undefined')
	if (!userEmail)
	  getUserEmail();
	
	prepDataForCK();
}

function prepDataForCK ()
{
	// send names to ck, but encrypt data first
	// collect information using userEmail and thisChromeIP
	// enrtypt it and send to SYN responder URL /?send_ck_ping
	
	if ((!thisCKPortIP) || (!userEmail))
	    return;

	if (common.naclModule == null)
		return;

	//  var data = "<st>Chrome</st><mt>chrome</mt><uname>" + userEmail + "</uname><sysv>ChromeOS or Chrome Browser</sysv><iip>" + thisChromeIP + "</iip><v>1</v><iimac>ff:ff:ff:ff:ff:ff</iimac>"
	var data = "<st>Chrome</st><>1</v><uname>" + userEmail + "</uname><iip>" + thisChromeIP + "</iip>";
	common.naclModule.postMessage('encrypt|'+data);
}

function sendDataToSYNResp(ip)
{
	var url = "http://" + ip + "/?send_ck_ping=" + ckAuthData;
	jQuery.ajax({ type: "GET", url: url }).done(function(data) {
		console.log (ip);
	}).fail(function(data){
		console.log(data);
		if (ip == "192.0.2.1") {
			console.log ("send ping to second responder");
			sendDataToSYNResp("192.0.2.2", ckAuthData);
		}
	});
}

function tickleUser(ip)
{
	if (ckIDHash.length > 1)
	{
		var url = "http://" + ip + "/?tickle_user&<h>" + ckIDHash + "</h>";
		jQuery.ajax({ type: "GET", url: url }) .done(function(data) {
			console.log (data);
			if (data.search("FAILURE") > 0)
			{
			  console.log ("tickleUser failed");
				ckIDHash = "";
				//		    userEmail = "";
				chrome.browserAction.setBadgeBackgroundColor({color:redColor});
				chrome.browserAction.setBadgeText({text: "off"});
			}
			else {
			   console.log ("tickleUser sent");
 				chrome.browserAction.setBadgeBackgroundColor({color:greenColor});
				chrome.browserAction.setBadgeText({text: "on"});
							chrome.browserAction.setIcon({
				path : "img/ckauth19x.png"
			});

			}
		}).fail(function(data) {
		   if (ip == "192.0.2.1") {
		    console.log ("tickleUser");
			  tickleUser("192.0.2.2");
		   }
		});
	}
}

// This function is called by common.js when a message
// is received from the NaCl module.
function handleMessage(message)
{
	var naclData = message.data;
	var delpos = naclData.search ("\\|");
	var respType = naclData.substring (0, delpos);
	
	if (respType == "decrypted")
	{
		decryptedData = message.data;
		if (!decryptedData)
		return;
		
		thisChromeIP = decryptedData.substring (decryptedData.search ("<x>") + 3, decryptedData.search ("</x>"));
		thisCKPortIP = decryptedData.substring (decryptedData.search ("<ip>") + 4, decryptedData.search ("</ip>"));
		
		if (thisCKPortIP) {
			if (!thisChromeIP.match(/^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/)) {
				
				//        chrome.browserAction.setBadgeBackgroundColor({color:redColor});
				//        chrome.browserAction.setBadgeText({text: "off"});
				
				thisChromeIP = "";
			}
		}
	}
	else if (respType == "encrypted")
	{
		ckAuthData = "<ckauth>" + naclData.substring (delpos+1, naclData.length) + "</ckauth>";
		// ok, we got this encrypted string, send it back to SYN responder
		
		console.log ("send ping to first responder");	
		sendDataToSYNResp("192.0.2.1", ckAuthData);
	}
	else
	return;
}

function parsePortIPData (fromIP, data)
{
	// if received no dat a, call secons server
	if (!data) 
	{ 
		if (fromIP != "192.0.2.2")
		   getCKPortIP("192.0.2.2", parsePortIPData);
		return;
	}

	if (common.naclModule == null)
    		return;

	// decrypt data, pull CK Port IP from there...
	var encData = data.substring (data.search ("<get_ck_ip>") + 11, data.search ("</get_ck_ip>"));
	common.naclModule.postMessage('decrypt|'+encData);
}

function getCKPortIP(ip, callback) {
  
  console.log ("sending request to " + ip)
  
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(data)
	{
		if (xhr.readyState == 4)
		{
			if (xhr.status == 200) {
				var dataT = xhr.responseText;
				callback(ip, dataT);
			} else {
				callback(ip, null);
			}
		}
	};
	
	xhr.onerror = function () {
    callback(ip, null);
  };
	
	var url = "http://" + ip + "/?get_ck_ip";
	xhr.open('GET', url, true);
	try {
		xhr.send();
	}
	catch (e) {
		console.log ("exception: ", e);
		callback(ip, null);
	}
}

function parseGoogleData (data)
{
	if (!data)
	return;
	
	var nStart = data.search ("dashboard/overview");
	var rawRec = data.substring (nStart, nStart+256);
	
	var fStart = rawRec.search("]");
	var fAcc = rawRec.substr (fStart+3, fStart+3+256);
	var elems = fAcc.split (",");
	var rawemail = elems[5];
	
	console.log ("email found: " + userEmail);
	
	if (rawemail)
	userEmail = rawemail.substring(1, rawemail.length-1);
}

function getUserInfo(userInfo, callback) {
	userEmail = userInfo.email;
	userDomain = userEmail.split("@")[1];
	if (defined(userDomain)) {
        callback({ error: false, userEmail: userEmail, userDomain: userDomain });
	} else {
        callback({ error: true, message: "User Domain Not Found"});
    }
}

function getUserEmail()
{
	chrome.identity.getProfileUserInfo(function(userInfo)
            {
                getUserInfo(userInfo, response);
            });
}

function ring()
{
	var ringIn = 30;
	if (platformSupported < 1)
	{
		chrome.browserAction.setIcon({
			path : "img/ckauths19x.png"
		});
		chrome.browserAction.setBadgeText({text: ""});
		
		return;
	}
	
	console.log("ring!");
	
	// reset timer
	clearTimeout(timeout);
	interval = 0;
	alarmDate = null;
	pauseDate = null;
	setDate = null;
	
	
	if ((!userEmail) || (!thisCKPortIP) || (common.naclModule == null))
	{
	  console.log ("-------------NO USER EMAIL OR CKPORT IP OR NACL IS NOT INITIALISED------------------");
	  console.log ("thisChromeIP is " + thisChromeIP);
	  console.log ("thisCKPortIP is " + thisCKPortIP);
	  console.log ("userEmail is " + userEmail);

		console.log("ring in 2 sec");
		setAlarm(2 * 1000);		// 2 seconds timer
		chrome.browserAction.setIcon({
			path : "img/ckauths19x.png"
		});
		ringIn = 2;
	}
	else
	{
		if ((userEmail.length < 2) || (thisCKPortIP.length < 2))
		{
  	  console.log ("-------------NO USER EMAIL OR CKPORT IP------------------");
    	console.log ("thisChromeIP is " + thisChromeIP);
	    console.log ("thisCKPortIP is " + thisCKPortIP);
	    console.log ("userEmail is " + userEmail);
		  
			console.log("ring in 2 sec");
			setAlarm(2 * 1000);		// 2 seconds timer
			chrome.browserAction.setIcon({
				path : "img/ckauths19x.png"
			});
			ringIn = 2;
		}
		else
		{
			chrome.browserAction.setBadgeBackgroundColor({color:greenColor});
			chrome.browserAction.setBadgeText({text: "on"});
			
			console.log("ring in 30 sec");
			setAlarm(30 * 1000);		// 30 seconds timer
			chrome.browserAction.setIcon({
				path : "img/ckauth19x.png"
			});
			if (firstRun) {
			  ringIn = 1;
			  firstRun = false;
			}
			else {
			  ringIn = 30;
			}
		}
	}
	
	exchangeData();
	
	
	//    if (ckIDHash.length > 1)
	//    {
	//	    tickleUser("192.0.2.1");
	//	    tickleUser("192.0.2.2");
	//    }
	
	setAlarm(ringIn * 1000);		// 30 seconds timer
	
}

