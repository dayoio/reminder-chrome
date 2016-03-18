import React, { Component, PropTypes } from 'react';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import * as Colors from 'material-ui/lib/styles/colors';
import AddAlarmIcon from 'material-ui/lib/svg-icons/action/alarm-add';
import AlarmIcon from 'material-ui/lib/svg-icons/image/timelapse';
import RepeatIcon from 'material-ui/lib/svg-icons/action/update';
import TimeIcon from 'material-ui/lib/svg-icons/av/av-timer';
import DoneIcon from 'material-ui/lib/svg-icons/action/done';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import VolumeUpIcon from 'material-ui/lib/svg-icons/av/volume-up';
import VolumeOffIcon from 'material-ui/lib/svg-icons/av/volume-off';

import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';

import Divider from 'material-ui/lib/divider';
import Toggle from 'material-ui/lib/toggle';
import Snackbar from 'material-ui/lib/snackbar';
import Edit from './edit';
import * as types from './actionTypes';

let callBackground = (method, ...args) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      method: method,
      args: args
    }, function(res) {
      if (res.error !== undefined) {
        reject(res.error);
      } else {
        resolve(res.result);
      }
    })
  });
}

export default class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
          alarms: [],
          currentAlarm: null,
          open:false,
          message: '',
          sound: false
    };
  }

  componentWillMount() {
    let self = this;
    callBackground('sync').then(data => {
      console.log(data);
      self.setState({
        alarms: data.reminds,
        sound: data.sound
      })
    });
  }

  formatDate(x) {
    if(!x.enable && x.repeat)
      return 'After ' + x.after + 'min';
    let d = new Date(x.when);
    return d.toLocaleString('es-US',{year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hour12:false});
  }

  fixzero = i => {
    return ('0'+i).substr(-2);
  }

  handleEditAlarm(value) {
    let alarm = value || {
      enable: true,
      repeat: false,
      after: 10
    };
    this.setState({
      currentAlarm: alarm
    });
  }

  handleClose = (action, alarm) => {
    this.setState({
      currentAlarm: null,
      open: alarm !== undefined,
      message: 'Alarm ' + action
    });

    this._doActions(action, alarm);
  }

  _doActions = (action, alarm) => {
    const { alarms } = this.state;
    switch (action) {
      case types.SAVE:
        callBackground('save', alarm).then(newValue => {
          let index = alarms.findIndex(a => a.name === newValue.name);
          if(index > -1){
            alarms.splice(index, 1, newValue);
          }else {
            alarms.push(newValue);
          }
          this.setState({
            alarms: alarms
          })
        });
        break;
      case types.DELETE:
        callBackground('delete', alarm).then(delValue => {
          let index = alarms.findIndex(a => a.name === delValue.name);
          if(index > -1){
            alarms.splice(index, 1)
            this.setState({
              alarms: alarms
            })
          }
        });
        break;
    }
  }

  handleMore = (action, alarm) => {
    if(action === types.SAVE) {
      alarm.enable = !alarm.enable;
    }
    this._doActions(action, alarm);
  }

  renderEdit() {
    const { state: { currentAlarm } } = this;
    if(currentAlarm === null)
      return;
    return (
      <Edit currentAlarm={currentAlarm}
            handleClose={this.handleClose}/>
    )
  }

  handleConfigChanged(config) {
    this.setState({
      sound: config.sound
    });
    callBackground('setConfig', config);
  }

  renderToolbar() {
    const { sound } = this.state;
    return (
      <div>
        <IconButton onTouchTap={() => this.handleConfigChanged({sound:!sound})}>
          {sound ? <VolumeUpIcon color={Colors.grey50} /> : <VolumeOffIcon color={Colors.grey300}/> }
        </IconButton>
        <IconButton onClick={() => this.handleEditAlarm()}>
          <AddAlarmIcon color={Colors.grey50}/>
        </IconButton>
      </div>
    )
  }

  renderMoreMenu(a) {
    const iconButtonElement = (
      <IconButton touch={true} >
        <MoreVertIcon color={Colors.grey400}/>
      </IconButton>
    );

    return (
      <IconMenu
        menuStyle={{width:85}}
        touchTapCloseDelay={0}
        iconButtonElement={iconButtonElement}
        onChange={(e,v) => this.handleMore(v, a)}>
        <MenuItem value={types.SAVE} primaryText={a.enable?"Disable":"Enable"} />
        <MenuItem value={types.DELETE} style={{color:Colors.red400}} primaryText="Delete" />
      </IconMenu>
    );
  }

  render() {
    const { state: { alarms, currentAlarm, open, message } } = this;

    return (
      <div>
        <AppBar
          title="Reminder"
          style={{background:'teal'}}
          showMenuIconButton = {false}
          iconElementRight={this.renderToolbar()} />
        <List style={{height:500, overflowX:'hidden',paddingTop:0,paddingBottom:0}}>
          {alarms.map((x) =>
            <div key={x.name}>
              <ListItem
                leftIcon={x.enable ? <AlarmIcon /> : x.repeat ? <RepeatIcon /> : <TimeIcon />}
                rightIconButton={this.renderMoreMenu(x)}
                onTouchTap={() => this.handleEditAlarm(x)}
                primaryText={x.message}
                secondaryText={this.formatDate(x)} />
              <Divider />
            </div>
          )}
        </List>
        {this.renderEdit()}
        <Snackbar
          open={open}
          message={message}
          autoHideDuration={1000}
          onRequestClose={() => this.setState({open:false})} />
      </div>
    );
  }
}
