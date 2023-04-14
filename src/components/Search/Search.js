import React from 'react';
import { Input } from 'antd';
import './Search.css';
export default class Search extends React.Component {
  state = {
    inputValue: '',
  };

  onChangeInput = (event) => {
    this.setState({ inputValue: event.target.value });
    this.props.changeStateValue(event.target.value);
    this.props.searchDebounce(event);
  };
  render() {
    return (
      <div className="search">
        <Input
          value={this.state.inputValue}
          className="search__input"
          placeholder="Введите название фильма"
          onChange={this.onChangeInput}
          autoFocus
          required
        />
      </div>
    );
  }
}
