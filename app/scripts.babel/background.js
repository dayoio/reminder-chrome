'use strict';

let defaultData = {
  reminds: [{after: 10, message: 'Hello World'}],
  time: Date.now()
};

let appData = {
  time: -1
};

let app = {
  updateAllReminds: function () {
    return new Promise((resolve) => {
      chrome.storage.sync.get(defaultData, function (data) {
        if (data.time >= appData.time) {
          appData = {
            reminds: data.reminds,
            time: data.time
          };
        } else {
          chrome.storage.sync.set(appData);
        }
        console.log(appData);
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
    let index = appData.reminds.findIndex(x => x.name === x.name);
    if (index > -1) {
      appData.reminds.splice(index, 1);
      appData.time = Date.now();
      this.updateRemind(r);
      this.updateAllReminds();
    }
  },
  addRemind: function (r) {
    r.name = this.randString(16);
    appData.reminds.push(r);
    appData.time = Date.now();
    this.updateRemind(r);
    this.updateAllReminds();
  },
  randString: function (x) {
    var s = "";
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
      return;
    }
    let index = appData.reminds.findIndex(x => x.name === r.name);
    if (index > -1) {
      this.updateRemind(r);
      appData.reminds.splice(index, 1, r);
      appData.time = Date.now();
    }
    return r;
  },
  validRemind: function (r) {
    if (r.message === undefined || r.message === null || r.message === '')
      return false;
    if (r.after === undefined || r.after === null || parseInt(r.after) === 0)
      return false;
    return true;
  }
};

chrome.runtime.onInstalled.addListener(details => {
  //console.log('previousVersion', details.previousVersion);
  app.updateAllReminds();
});

/*chrome.storage.onChanged.addListener((changes, areaName) => {
 console.log(areaName + ' changed!');
 });*/

// Alarm handler
chrome.alarms.onAlarm.addListener(alarm => {
  let index = appData.reminds.findIndex(x => x.name === alarm.name);
  if (index > -1) {
    let remind = appData.reminds[index];
    if (remind.repeat) {
      app.updateRemind(remind);
    } else {
      remind.enable = false;
      appData.time = Date.now();
      app.updateAllReminds();
    }
    chrome.notifications.create(remind.name, {
      title: 'Time\'s up!',
      type: 'basic',
      message: remind.message,
      iconUrl: 'images/icon-38.png'
    });
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
  //console.log('calling', request.method);
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