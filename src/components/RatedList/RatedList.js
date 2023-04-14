import React from 'react';
import { Rate } from 'antd';

export default class RatedList extends React.Component {
  state = {
    voteRate: 0,
  };
  render() {
    return <Rate />;
  }
}
