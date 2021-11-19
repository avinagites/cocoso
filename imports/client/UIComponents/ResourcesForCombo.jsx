import React from 'react';
import { Text } from '@chakra-ui/react';
import Tag from './Tag';

function ResourcesForCombo({ resource }) {
  if (!resource) {
    return null;
  }
  const resourcesForCombo = resource.resourcesForCombo;
  const length = resource.resourcesForCombo.length;
  return (
    <span>
      {resource.label}
      <br />
      <Tag label="COMBO" size="xsmall" />
      {' ['}
      {resourcesForCombo.map((res, i) => (
        <Text fontSize="sm" key={res._id}>
          {res.label + (i < length - 1 ? ' + ' : '')}
        </Text>
      ))}
      ]
    </span>
  );
}

export default ResourcesForCombo;
