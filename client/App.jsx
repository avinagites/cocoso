import React from 'react';
import { Grommet } from 'grommet';

import Routes from './RouterComponents/Routes';

const theme = {
  spacing: 12,
  global: {
    font: {
      family: 'sans-serif',
      size: '15px',
      height: '24px'
    },
    colors: {
      brand: '#020202',
      focus: 'none'
    }
  },
  formField: {
    border: 'none'
  },
  list: {
    item: {
      border: false
    }
  }
};

export default function() {
  return (
    <Grommet theme={theme}>
      <Routes />
    </Grommet>
  );
}