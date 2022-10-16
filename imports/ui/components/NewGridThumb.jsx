import React from 'react';
import { Avatar, Box, Flex, Heading, useMediaQuery } from '@chakra-ui/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import Tag from './Tag';

export default function GridThumb({ avatar, imageUrl, subTitle, title, tag }) {
  if (!title || !imageUrl) {
    return null;
  }
  const [isMobile] = useMediaQuery('(min-width: 960px)');

  return (
    <Box className="text-link-container" m="6" mb="40px">
      <LazyLoadImage
        alt={title}
        effect="blur"
        fit="contain"
        src={imageUrl}
        style={{
          height: '100%',
          maxHeight: 300,
          marginBottom: 12,
        }}
      />
      <Flex align="flex-start" justify="space-between" mb="2">
        <Box pr="2" maxW={300}>
          <Heading className="text-link" fontSize="1.4rem" fontWeight="light" mb="2">
            {title}
          </Heading>
          {subTitle && (
            <Heading className="text-link" fontSize="md" fontWeight="light">
              <em>{subTitle}</em>
            </Heading>
          )}
          {tag && <Tag label={tag} mb="1" />}
        </Box>
        {avatar && <Avatar name={avatar.name} src={avatar.url} />}
      </Flex>
    </Box>
  );
}
