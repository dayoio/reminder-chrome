'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.alarms.onAlarm.addEventListener(alarm => {
  if(alarm && alarm.name.indexOf('reminder_') === -1)
  {
    //
    chrome.notifications.create('title', {
      title: '',
      message: '',
      iconUrl: ''
    });

  }
});

chrome.runtime.onMessage.addEventListener(message => {
  //
  if(message.type === 'put' )
  {
    chrome.alarms.create('', {});
  }
  else if(message.type === 'delete')
  {
    chrome.alarms.clear('');
  }
});