import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Center, Flex, Heading, Image } from '@chakra-ui/react';

import HeaderMenu from './HeaderMenu';
import UserPopup from './UserPopup';
import { StateContext } from '../LayoutContainer';

function Header() {
  const { currentHost, currentUser, isDesktop } = useContext(StateContext);

  return (
    <Box p="2" w="100%">
      <Flex w="100%" align="flex-start" justify="space-between">
        <Flex align="flex-end">
          <Box>
            <Link to="/">
              <Box maxHeight="80px" mr="4">
                <Image fit="contain" maxHeight="80px" src={currentHost && currentHost.logo} />
              </Box>
            </Link>
          </Box>
          <Box>
            <Heading size="lg">SKOGEN</Heading>
            <Heading size="md" fontWeight="light">
              Artistrun House for Performing Arts
            </Heading>
          </Box>
        </Flex>

        <Flex justify="flex-end">
          <UserPopup currentUser={currentUser} />
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
