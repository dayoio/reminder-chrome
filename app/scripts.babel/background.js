'use strict';

let defaultData = {
  reminds: [],
  time: Date.now()
};

let appData = {
  time: -1,
  reminds: []
};

let app = {
  fixData: function () {
    let now = Date.now();
    appData.reminds.forEach(x => {
      if(x.when <= now){
        x.enable = false;
        chrome.alarms.clear(x.name);
      }else if(x.when > now && x.enable){
        chrome.alarms.get(x.name, function(alarm){
          if(alarm === null) {
            chrome.alarms.create(x.name, {
              'when': x.when
            });
          }
        });
      }
    });
  },
  syncAllReminds: function () {
    return new Promise((resolve) => {
      chrome.storage.sync.get(defaultData, function (data) {
        if (data.time > appData.time) {
          appData = {
            reminds: data.reminds,
            time: data.time
          };
          app.fixData();
        } else if(appData.time > data.time){
          chrome.storage.sync.set(appData);
        }
        resolve(appData);
      });
    });
  },
  updateRemind: function (r) {
    if (r.enable) {
      r.when = Date.now() + parseInt(r.after) * 60000;
      chrome.alarms.create(r.name, {
        'when': r.when
      });
    } else {
      chrome.alarms.clear(r.name);
    }
  },
  deleteRemind: function (r) {
    let index = appData.reminds.findIndex(x => x.name === r.name);
    if (index > -1) {
      this.updateRemind(r);
      appData.reminds.splice(index, 1);
      appData.time = Date.now();
      this.syncAllReminds();
    }
  },
  addRemind: function (r) {
    r.name = this.randString(6);
    appData.reminds.push(r);
    appData.time = Date.now();
    this.updateRemind(r);
    this.syncAllReminds();
  },
  randString: function (x) {
    var s = '';
    while (s.length < x && x > 0) {
      var r = Math.random();
      s += (r < 0.1 ? Math.floor(r * 100) : String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65)));
    }
    return s;
  },
  saveRemind: function (r) {
    if (!this.validRemind(r)) {
      return {error: 'invalid data.'};
    }
    if (r.name === undefined) {
      this.addRemind(r);
      return r;
    }
    let index = appData.reminds.findIndex(x => x.name === r.name);
    if (index > -1) {
      appData.reminds.splice(index, 1, r);
      appData.time = Date.now();
      this.updateRemind(r);
      this.syncAllReminds();
    }
    return r;
  },
  validRemind: function (r) {
    if (r.message === undefined || r.message === null || r.message === ''){
      return false;
    }
    if (r.after === undefined || r.after === null || parseInt(r.after) === 0){
      return false;
    }
    return true;
  }
};

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

// chrome.runtime.onSuspend.addListener(() => {
// });

// Alarm handler
chrome.alarms.onAlarm.addListener(alarm => {
  let index = appData.reminds.findIndex(x => x.name === alarm.name);
  if (index > -1) {
    let remind = appData.reminds[index];
    if (remind.repeat) {
      app.updateRemind(remind);
    } else {
      remind.enable = false;
    }
    chrome.notifications.create(remind.name, {
      title: chrome.i18n.getMessage('reminderTitle'),
      type: 'basic',
      message: remind.message,
      iconUrl: 'images/icon-24.png'
    });
    appData.time = Date.now();
    app.syncAllReminds();
  }
});

// Notifications Handler
chrome.notifications.onClicked.addListener(id => {
  chrome.notifications.clear(id);
});

// Messages Handler
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  let method = app[request.method];
  if (typeof method !== 'function') {
    console.error('error method');
    return;
  }
  let p = Promise.resolve().then(() => method.apply(app, request.args));
  p.then(result => {
    //console.log('send result: ', result);
    if (result !== undefined && result.error !== undefined) {
      callback({error: result.error});
    } else {
      callback({result: result});
    }
  });
  return true;
});

app.syncAllReminds();
