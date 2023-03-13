import React, { useContext } from 'react';
import { Avatar, Box, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import { StateContext } from '../LayoutContainer';
import { DateJust } from './FancyDate';
import Tag from './Tag';

export default function GridThumb({ avatar, color, dates, host, imageUrl, subTitle, title, tag }) {
  const { currentHost } = useContext(StateContext);

  if (!title || !imageUrl) {
    return null;
  }

  const remaining = dates?.length - 1;

  return (
    <Box m="4">
      <Box className="text-link-container" position="relative">
        <LazyLoadImage
          alt={title}
          effect="blur"
          fit="contain"
          src={imageUrl}
          style={{
            position: 'relative',
            maxHeight: 260,
            marginBottom: 6,
          }}
        />
        {host && currentHost.isPortalHost && (
          <Box position="absolute" top="0" right="0" pl="2" pb="2" bg="white">
            <Tag border="1px solid #2d2d2d" label={host} />
          </Box>
        )}
        <Flex align="flex-start" justify="space-between">
          <Box pr="2" maxW={300}>
            <Heading className="text-link" fontSize="1.3rem" fontWeight="light" mb="1">
              {title}
            </Heading>
            {subTitle && (
              <Heading className="text-link" fontSize="1.1rem" fontWeight="light">
                {subTitle}
              </Heading>
            )}
            <HStack py="2" spacing="4">
              {tag && <Tag filterColor={color} label={tag} />}
            </HStack>
          </Box>
          {avatar && <Avatar name={avatar.name} src={avatar.url} />}
          {dates && (
            <Flex>
              {dates.slice(0, 1).map((date) => (
                <DateJust key={date?.startDate + date?.startTime} date={date}>
                  {date}
                </DateJust>
              ))}
              {remaining > 0 && (
                <Text fontSize="xl" ml="2" wordBreak="keep-all">
                  + {remaining}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
