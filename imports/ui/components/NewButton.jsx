import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

const getRoute = (item, index) => {
  if (item.name === 'info') {
    return '/pages/new';
  }
  return `/${item.name}/new`;
};

function NewButton({ canCreateContent, currentHost }) {
  const menu = currentHost.settings.menu;
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [tc] = useTranslation('common');

  const menuItems = menu
    .filter((item) => item.isVisible)
    .map((item, index) => ({
      ...item,
      route: getRoute(item, index),
    }));

  const pathname = history.location.pathname;

  const isCurrentPage = (name) => {
    if (name === 'info') {
      return pathname.substring(0, 6) === '/pages';
    }
    return name === pathname.substring(1, pathname.length);
  };

  const activeMenuItem = menuItems.find((item) => isCurrentPage(item.name));

  const getPathname = (item) => {
    if (item.name === 'calendar') {
      return '/activities/new';
    } else if (item.name === 'info') {
      return '/pages/new';
    } else {
      return `/${item.name}/new`;
    }
  };

  if (!canCreateContent) {
    return null;
  }

  return (
    <Box>
      <Menu
        isOpen={isOpen}
        placement="bottom-end"
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      >
        <MenuButton
          as={IconButton}
          borderColor="#fff"
          borderRadius="8px"
          borderWidth="2px"
          h="48px"
          icon={<AddIcon />}
          w="48px"
          onClick={() => setIsOpen(!isOpen)}
        />
        <MenuList>
          <Text mx="3">
            <em>{tc('labels.newPopupLabel')}:</em>
          </Text>
          {activeMenuItem && <MenuDivider />}
          {activeMenuItem && (
            <MenuItem key={activeMenuItem.name} pl="5">
              <Text fontWeight="bold" textTransform="capitalize">
                {activeMenuItem.name}
              </Text>{' '}
              <Text pl="1">({tc('labels.thislisting')})</Text>
            </MenuItem>
          )}
          <MenuDivider />
          <Box pl="2">
            {menuItems
              .filter((itemm) => itemm.name !== 'members' && itemm.name !== activeMenuItem?.name)
              .map((item) => (
                <MenuItem
                  key={item.name}
                  fontWeight="bold"
                  textTransform="capitalize"
                  onClick={() => history.push(getPathname(item))}
                >
                  {item.name}
                </MenuItem>
              ))}
          </Box>
        </MenuList>
      </Menu>
      <Box position="relative">
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="gray.900"
          position="absolute"
          textTransform="uppercase"
          top="-1px"
          left="12px"
        >
          {tc('actions.create')}
        </Text>
      </Box>
      <Modal isOpen={isOpen}>
        <ModalOverlay />
      </Modal>
    </Box>
  );
}

export default NewButton;
