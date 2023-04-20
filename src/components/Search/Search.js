import React from 'react';
import { Input } from 'antd';
import './Search.css';
export default class Search extends React.Component {
  state = {
    inputValue: '',
  };

  // onChangeInput = (event) => {
  //   this.setState({ inputValue: event.target.value });
  //   this.props.changeStateValue(event.target.value);
  //   this.props.searchDebounce(event);
  // };
  render() {
    const { search } = this.props;

    return (
      <div className="search">
        {/* eslint-disable-next-line prettier/prettier */}
        <Input className="search__input" placeholder="Type to search a movie..." onChange={search} autoFocus required />
      </div>
    );
  }
}
