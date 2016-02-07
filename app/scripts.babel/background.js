'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

// Alarm handler
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm && alarm.name.indexOf('reminder_') === -1) {
    // find remind detail
    let r = {};
    chrome.notifications.create('Reminder', {
      title: 'It\'s time to do this.',
      message: r.message,
      iconUrl: 'images/icon-64.png'
    });
  }
});

// Message Handler
chrome.runtime.onMessage.addListener(message => {
  if(message.remind !== undefined)
  {
    if(message.remind.enable)
    {
      chrome.alarms.create(message.remind.name, {
        'periodInMinutes': message.remind.after
      });
    }else{
      chrome.alarms.clear(message.remind.name, function (val) {
        //
        if(val) {
          // success
        }else{
          // fail
        }
      });
    }
  }
});