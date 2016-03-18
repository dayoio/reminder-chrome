import React, { Component, PropTypes } from 'react'
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import TimePicker from 'material-ui/lib/time-picker/time-picker';
import DatePicker from 'material-ui/lib/date-picker/date-picker';
import Checkbox from 'material-ui/lib/checkbox';
import * as types from './actionTypes';

const style = {
  checkbox: {
    display: 'block',
    paddingRight: 25,
    paddingTop: 10,
  },
  textfield: {
    width: '90%'
  },
  row: {
    paddingTop: 24,
    display: 'inline-flex'
  },
  title: {
    background:'teal',
    padding:15,
    color:'white'
  }
};

export default class Edit extends Component {

  static propTypes = {
    handleClose: React.PropTypes.func.isRequired
  }

  constructor(props, context) {
    super(props, context);

    const currentAlarm = props.currentAlarm;
    let defaultDate = currentAlarm.name !== undefined ? new Date(currentAlarm.when) : new Date(Date.now()+600000); // after 10 minutes
    this.state = {
      date: defaultDate,
      open: true,
      repeat: currentAlarm.repeat,
      defaultDate: defaultDate
    };
  }

  componentDidMount() {
    this.refs.message.focus();
  }

  _handleClose = (action) => {
    this.setState({
      open: false
    });
    const { currentAlarm } = this.props;
    let alarm;
    if(action === types.SAVE) {
      const { message, date, time, after, enable, repeat } = this.refs;
      alarm = {
        name: currentAlarm.name,
        message: message.getValue() || 'No Message.',
        enable: enable.isChecked(),
        repeat: repeat.isChecked(),
        after: currentAlarm.after,
        when: currentAlarm.when,
      };
      if(alarm.repeat) {
        alarm.after = parseInt(after.getValue());
      }else{
        let when = new Date(date.getDate());
        when.setHours(time.state.time.getHours());
        when.setMinutes(time.state.time.getMinutes());
        when.setSeconds(0);
        alarm.when = when.getTime();
      }
    }else if (action === types.DELETE) {
      alarm = currentAlarm;
    }
    if(this.props.handleClose)
      setTimeout(this.props.handleClose, 450, action, alarm);
  }

  renderWhen () {
    const { currentAlarm } = this.props;
    const { defaultDate, repeat } = this.state;
    if(repeat) {
      return (
        <div>
          <TextField
            ref="after"
            style={style.textfield}
            type="number"
            defaultValue={currentAlarm.after}
            hintText="Default 10 minutes"
            floatingLabelText="After (min)*" />
        </div>
      )
    } else {
      return (
        <div style={style.row}>
          <DatePicker
            ref="date"
            minDate={defaultDate}
            value={defaultDate}
            disableYearSelection={true}
            textFieldStyle={style.textfield}
             />
          <TimePicker
            ref="time"
            format="24hr"
            onChange={this.handleChange}
            value={defaultDate}
            textFieldStyle={style.textfield}
            />
        </div>
      )
    }
  }

  render () {
    const { currentAlarm } = this.props;
    const { open } = this.state;
    let actions = [
      <FlatButton
        label="Save"
        secondary={true}
        keyboardFocused={true}
        onTouchTap={() => this._handleClose(types.SAVE)} />
      ];
    if(currentAlarm.name !== undefined) {
      actions.splice(0,0,<FlatButton
        label="Delete"
        primary={true}
        onTouchTap={() => this._handleClose(types.DELETE)} />);
    }
    return (
      <Dialog
        title="Edit"
        titleStyle={style.title}
        bodyStyle={{padding:15}}
        actions={actions}
        modal={false}
        open={open}
        onRequestClose={() => this._handleClose(types.NONE)}>
        <TextField
          ref="message"
          hintText="No Message."
          defaultValue={currentAlarm.message}
          style={style.textfield}
          floatingLabelText="Message*"
          />
        {this.renderWhen()}
        <div style={style.row}>
          <Checkbox
            ref="enable"
            label="Enable"
            style={style.checkbox}
            defaultChecked={currentAlarm.enable}
            />
          <Checkbox
            ref="repeat"
            label="Repeat"
            onCheck={e => this.setState({repeat: e.target.checked})}
            style={style.checkbox}
            defaultChecked={currentAlarm.repeat}
            />
        </div>
      </Dialog>
    )
  }
}
