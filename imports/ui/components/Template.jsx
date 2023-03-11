import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { Box, Container, Heading, SimpleGrid } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';

import { StateContext } from '../LayoutContainer';

const publicSettings = Meteor.settings.public;

function Template({ heading, leftContent, rightContent, titleCentered = false, children }) {
  const { isDesktop } = useContext(StateContext);

  return (
    <>
      <Helmet>
        <title>{heading || publicSettings.name}</title>
      </Helmet>
      {isDesktop ? (
        <SimpleGrid columns={{ md: 1, lg: 3 }} p="4" templateColumns="25% 50% 25%">
          <Box>{leftContent}</Box>

          <Box>
            {heading && (
              <Box px="4">
                <Heading as="h1" mb="4" size="lg" textAlign={titleCentered ? 'center' : 'start'}>
                  {heading}
                </Heading>
              </Box>
            )}
            <Box>{children}</Box>
          </Box>

          <Box>{rightContent}</Box>
        </SimpleGrid>
      ) : (
        <Box p="4">
          <Box>{leftContent}</Box>
          <Box>
            {heading && (
              <Box mb="2" px="4">
                <Heading as="h3" mt="4" size="md" textAlign={titleCentered ? 'center' : 'start'}>
                  {heading}
                </Heading>
              </Box>
            )}
            <Box>{children}</Box>
          </Box>
          <Box>{rightContent}</Box>
        </Box>
      )}
    </>
  );
}

export default Template;
