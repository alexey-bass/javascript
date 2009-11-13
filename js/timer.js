/*!
 * 
 * Copyright 2009 Alexey Bass (alexey.bass@gmail.com)
 * License: MIT License (http://www.opensource.org/licenses/mit-license.html)
 *  
 */
var Timer = 
{
	// onload hooks
	init: function()
	{
		// unobtrusive JS
		$$('#quick-container ul li').each(function(li)
		{
			// attach onclicks
			li.observe('click', Timer.launchQuickTimer.bind(this, li.readAttribute('title')));
			// make nice titles
			li.writeAttribute('title', 'Start this timer');
		});
		
		// attach action to the button
		$('trigger').observe('click', Timer.trigger.bind(this));
		
		// set focus on timer input
		$('timer')
			.observe('focus',	function(){ this.addClassName('focused'); })
			.observe('blur',	function(){ this.removeClassName('focused'); })
			.observe('keydown',	function(event)
			{
				if (event.keyCode == Event.KEY_RETURN && !Timer.isRunning())
					Timer.start();
			})
			.activate()
		;
		
		// hidden elements
		$$('.hidden').each(function(element)
		{
			element.hide().removeClassName('hidden');	
		});
		
		// help window
		$('help-trigger').observe('click', Timer.toggleHelp.bind(this));
		$$('#help-container div.close')[0].observe('click', Timer.toggleHelp.bind(this));
	},
	
	// holds current timer seconds
	currentTimer: 0,
	
	// need for progress bar
	startTimer: 0,
	
	// will holds timer interval reference for stop
	timerReference: null,
	
	// fires predefined quick list items
	launchQuickTimer: function(seconds)
	{
		if (Timer.isRunning())
			Timer.stop();
		
		$('timer').setValue(seconds);
		
		Timer.start();
	},
	
	// parses timer text value into seconds
	parseValue: function()
	{
		var newTimer = 0;
		// clear from any spaces
		var text = $F('timer').replace(/\s+/g, '');
		
		if (text.length == 0)
		{
			alert('Please, type desired time interval to start.');
			$('timer').focus();
			return;
		}
		else if (text.match(/^\d+:\d+$/)) // 00:15
		{
			var matches = text.match(/^(\d+):(\d+)$/);
			newTimer = parseInt(matches[1])*60 + parseInt(matches[2]); 
		}
		else if (text.match(/^\d+:\d+:\d+$/)) // 01:15:00
		{
			var matches = text.match(/^(\d+):(\d+):(\d+)$/);
			newTimer = parseInt(matches[1])*3600 + parseInt(matches[2]*60) + parseInt(matches[3]);  
		}
		else if (text.match(/\d+[hms]/)) // Xhour Ymin Zsec
		{
			if (text.match(/\d+h/)) // 1 hour OR 1h
				newTimer += parseInt(text.match(/(\d+)h/)[1])*3600;
			
			if (text.match(/\d+m/)) // 45 min OR 45m
				newTimer += parseInt(text.match(/(\d+)m/)[1])*60;
			
			if (text.match(/\d+s/)) // 50 s OR 50s
				newTimer += parseInt(text.match(/(\d+)s/)[1]);
		}
		else if (parseInt(text)) // 777
		{
			newTimer = parseInt(text);
		}
		else
		{
			alert('Sorry, can not parse timer value.');
			return;
		}
		
		return newTimer;
	},
	
	// proccess counting - main counting method
	proccessCounting: function()
	{
		if (Timer.currentTimer >= 0)
		{
			Timer.showCounter();
			Timer.moveProgressBar();
			Timer.currentTimer--;
			
			Timer.timerReference = setTimeout(Timer.proccessCounting.bind(this), 1000);
		}
		else
		{
			Timer.stop();
			Timer.finished();
		}
	},
	
	// display current timer
	showCounter: function()
	{
		var hours = mins = secs = 0;
		var timer = Timer.currentTimer;
		
		var hours = parseInt(timer/3600);
		if (hours)
			timer -= hours*3600;
		
		var mins = parseInt(timer/60);
		if (mins)
			timer -= mins*60;
		
		var secs = timer;
		var timeValue = (hours < 10 ? '0'+hours : hours) +':'+ (mins < 10 ? '0'+mins : mins) +':'+ (secs < 10 ? '0'+secs : secs);
		
		$('timer').setValue(timeValue);
		Timer.updateDocumentTitle(timeValue);
	},
	
	// changes document title on counting
	updateDocumentTitle: function(time)
	{
		document.title = (time !== false) ? time + ' - Timer' : 'Timer';
	},
	
	// button action
	trigger: function()
	{
		if (Timer.isRunning())
		{
			Timer.stop();
		}
		else
		{
			Timer.start();
		}
	},
	
	// checks if timer is running
	isRunning: function()
	{
		return (Timer.currentTimer) ? true : false;
	},
	
	// starts timer
	start: function()
	{
		Timer.currentTimer = Timer.startTimer = Timer.parseValue();
//		$('trigger').setValue('Stop').focus();
		$('trigger').setValue('Stop');
		setTimeout('$(\'trigger\').focus()', 500);
		$('timer').addClassName('running').disable();
		
		Timer.proccessCounting();
	},
	
	// stops timer
	stop: function()
	{
		if (Timer.timerReference)
			clearTimeout(Timer.timerReference);
		
		Timer.timerReference = null;
		Timer.currentTimer = 0;
		Timer.startTimer = 0;
		
		Timer.updateDocumentTitle(false);
		$('trigger').setValue('Start');
		$('timer').removeClassName('running').enable().focus();
		$('progress').setStyle({'width': '0%'});
	},
	
	// will be fired on timer end
	// you can put blinking here, puffing - whatever you want to signal user about end of the time
	finished: function()
	{
		alert('Boooooooooooom! >--(O_O)--<');
	},
	
	// moves background bar
	moveProgressBar: function()
	{
		var width = 100 - parseInt( (Timer.currentTimer * 100) /  Timer.startTimer );
		$('progress').setStyle({'width': width+'%'});
	},
	
	toggleHelp: function()
	{
		if ($('help-container').visible())
		{
			$('help-container').hide();
			$('timer').focus();
		}
		else
		{
			$('help-container').show();
		}
	}
};

document.observe('dom:loaded', function()
{
	Timer.init();
});
