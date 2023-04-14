import React from 'react';
import { Tabs } from 'antd';

import './Header.css';

const Header = (props) => {
  const { active, setActive } = props;
  const arr = [
    { label: 'Search', key: 'search' },
    { label: 'Rated', key: 'rated' },
  ];
  return (
    <div className="tabs">
      <Tabs className="tabs__items" onChange={setActive} items={arr} selectedkeys={active} mode="horizontal" />
    </div>
  );
};

export default Header;
