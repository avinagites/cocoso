import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Switch,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Text,
} from '@chakra-ui/react';
import { Table, Tbody, Thead, Tr, Td, Th } from '@chakra-ui/react';

import { DragHandleIcon } from '@chakra-ui/icons';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import { call } from '../../@/shared';
import Loader from '../../components/Loader';
import { message } from '../../components/message';
import { StateContext } from '../../LayoutContainer';
import FormField from '../../components/FormField';

export default function Menu() {
  const [loading, setLoading] = useState(true);
  const [localSettings, setLocalSettings] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const { currentUser, currentHost, role } = useContext(StateContext);

  if (!currentUser || role !== 'admin') {
    return <Alert>You are not allowed</Alert>;
  }

  useEffect(() => {
    if (!currentHost) {
      return;
    }
    setLocalSettings(currentHost.settings);
    currentHost.settings && handleSetActiveMenu();
    setLoading(false);
  }, []);

  const handleSetActiveMenu = (key, label) => {
    const newActiveMenu = {};
    currentHost.settings.menu.forEach((item) => {
      newActiveMenu[item.name] = item.label;
    });

    setActiveMenu(newActiveMenu);
  };

  const handleMenuItemCheck = (changedItemIndex, value) => {
    const newMenu = localSettings.menu.map((item, index) => {
      if (changedItemIndex === index) {
        return {
          ...item,
          isVisible: value,
        };
      }
      return item;
    });
    setLocalSettings({ ...localSettings, menu: newMenu });
  };

  const handleMenuItemLabelChange = (changedItemIndex, value) => {
    const newMenu = localSettings.menu.map((item, index) => {
      if (changedItemIndex === index) {
        return {
          ...item,
          label: value,
        };
      }
      return item;
    });
    setLocalSettings({ ...localSettings, menu: newMenu });
  };

  const onSortMenuEnd = ({ oldIndex, newIndex }) => {
    const { menu } = localSettings;
    const visibleItems = menu.filter((item) => item.isVisible);
    const invisibleItems = menu.filter((item) => !item.isVisible);
    const newSettings = {
      ...localSettings,
      menu: [...arrayMove(visibleItems, oldIndex, newIndex), ...invisibleItems],
    };
    setLocalSettings(newSettings);
  };

  const handleMenuSave = async () => {
    setLoading(true);
    try {
      await call('updateHostSettings', localSettings);
      message.success('Settings are successfully saved');
    } catch (error) {
      message.error(error.reason);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !localSettings || !localSettings.menu || !activeMenu) {
    return <Loader />;
  }

  return (
    <Box>
      <Heading as="h3" size="md">
        Menu
      </Heading>
      <Tabs align="center">
        <TabList>
          <Tab>Visibility & Labels</Tab>
          <Tab>Order</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Text mb="4" fontSize="sm">
              Check/uncheck items for visibility, and label them as you prefer
              in order to compose the menu
            </Text>
            <MenuTable
              menu={localSettings.menu}
              handleMenuItemCheck={handleMenuItemCheck}
              handleMenuItemLabelChange={handleMenuItemLabelChange}
            />

            <Flex justify="flex-end" py="4">
              <Button onClick={handleMenuSave}>Confirm</Button>
            </Flex>
          </TabPanel>

          <TabPanel>
            <Text mb="4" size="sm">
              Reorder items by dragging up and down, if you want to change the
              menu display order
            </Text>
            <Box>
              {localSettings && localSettings.menu && (
                <SortableContainer
                  onSortEnd={onSortMenuEnd}
                  helperClass="sortableHelper"
                >
                  {localSettings.menu
                    .filter((item) => item.isVisible)
                    .map((value, index) => (
                      <SortableItem
                        key={`item-${value.name}`}
                        index={index}
                        value={value.label}
                      />
                    ))}
                </SortableContainer>
              )}
            </Box>

            <Flex justify="flex-end" my="4">
              <Button onClick={handleMenuSave} type="submit">
                Confirm
              </Button>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function MenuTable({ menu, handleMenuItemCheck, handleMenuItemLabelChange }) {
  return (
    <Table size="sm" variant="simple" w="100%">
      <Thead>
        <Tr>
          <Th w="100px">Visibility</Th>
          <Th>Labels</Th>
        </Tr>
      </Thead>
      <Tbody>
        {menu.map((item, index) => (
          <Tr key={item.name}>
            <Td>
              <Center>
                <Switch
                  isChecked={item.isVisible}
                  onChange={(event) =>
                    handleMenuItemCheck(index, event.target.checked)
                  }
                />
              </Center>
            </Td>
            <Td>
              <FormField>
                <Input
                  isDisabled={!item.isVisible}
                  value={item.label}
                  onChange={(e) =>
                    handleMenuItemLabelChange(index, e.target.value)
                  }
                />
              </FormField>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

const SortableItem = sortableElement(({ value }) => (
  <Flex align="center" bg="gray.100" cursor="move" mb="4" p="2">
    <DragHandleIcon /> <Box pl="2">{value}</Box>
  </Flex>
));

const SortableContainer = sortableContainer(({ children }) => (
  <Box>{children}</Box>
));
