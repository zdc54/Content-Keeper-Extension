var refreshDisplayTimeout;
var bgpage = chrome.extension.getBackgroundPage();
var previousValues = [3, 5, 10, 30];
var editing = false;
var running = false;

document.addEventListener('DOMContentLoaded', function () {
    load();
});

function show(section)
{
    document.getElementById(section).style.display = "block";
}

function showInline(section)
{
    document.getElementById(section).style.display = "inline";
}

function hide(section)
{
    document.getElementById(section).style.display = "none";
}

function load()
{
	chrome.extension.getBackgroundPage().console.log('***** run');

    show("display");
    editing = false;

	if(!bgpage.alarmDate)
	{
		for(var i = 0; i < document.choices.radio.length; i++)
			if(localStorage[i] != null)
				document.getElementById("s"+i).textContent = localStorage[i];

	}

	else
	{
		show("display");
		refreshDisplay();
	}

	if (!bgpage.alarmDate)
		setTimer();
}

function swap()
{
	editing = true;

	// swap text with fields
	for(var i = 0; i < document.choices.radio.length; i++)
	{
		var span = document.getElementById("s"+i);
		var num = parseInt(span.textContent);

		previousValues[i] = num;

		var html = "<input class='input-mini' type='text' name='custom' id='c"+i;
		html += "' value='"+num;
		html += "'>";
		// used to select on click and auto save on change

		span.innerHTML = html;
	}

	// swap edit button with done button
	var butt = document.getElementById("swapper");
	butt.innerHTML = "<a href='#' id='done' class='btn'><i class='icon-ok'></i></a>";
    document.querySelector('#done').addEventListener('click', swapBack);
}

function swapBack()
{
	// swap fields with text
	for(var i = 0; i < document.choices.radio.length; i++)
	{
		var span = document.getElementById("s"+i);
		var num = parseInt(document.getElementById("c"+i).value);

		if(isValid(num))
        {
            localStorage[i] = num;
            span.textContent = num;
        }
		else
			span.textContent = previousValues[i];
	}

	// swap done button with edit button
	var butt = document.getElementById("swapper");
	butt.innerHTML = "<a href='#' id='wrench' class='btn'><i class='icon-wrench'></i></a>";
    document.querySelector('#wrench').addEventListener('click', swap);

	editing = false;
}

function setTimer()
{
	running = true;
	// make sure we're dealing with text not fields
	if(editing)
		swapBack();

	// SET background timer for selected number
	// HIDE settings, DISPLAY countdown

	var num = 0.5;

	// set timer, hide settings, display reset button
	if(isValid(num))
	{
		bgpage.setAlarm(num * 60000);
        show("display");

		refreshDisplay();
	}
	else
		bgpage.error();
}

// Returns true if 0 <= amt <= 240
function isValid(amt)
{
	if(isNaN(amt) || (amt == null))
		return false;
	else if((amt < 0) || (amt > 240))
		return false;
	else
		return true;
}

function refreshDisplay()
{
    percent = bgpage.getTimeLeftPercent();

    if(percent < 15)
        document.getElementById("bar").style.color = "grey";
	document.getElementById("bar").textContent = bgpage.getTimeLeftString();
    document.getElementById("bar").style.width = percent + "%";

	refreshDisplayTimeout = setTimeout(refreshDisplay, 100);
}

function pauseTimer()
{
    bgpage.pause();
    clearTimeout(refreshDisplayTimeout);
}

function resumeTimer()
{
    refreshDisplay();
    bgpage.resume();
}

function restartTimer()
{
    refreshDisplay();
    bgpage.restart();
}

function reset()
{
	clearTimeout(refreshDisplayTimeout);
	bgpage.turnOff();
	show("display");
}
