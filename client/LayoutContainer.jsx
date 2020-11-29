import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Anchor,
  Box,
  Button,
  DropButton,
  Footer,
  Heading,
  Image,
  Grommet,
  Paragraph,
  Text,
} from 'grommet';
import { FormPrevious, Down } from 'grommet-icons';
import { Container, Row, Col, ScreenClassRender } from 'react-grid-system';

export const StateContext = React.createContext(null);

import UserPopup from './UIComponents/UserPopup';
import NotificationsPopup from './UIComponents/NotificationsPopup';
import theme from './constants/theme';

const menu = [
  {
    label: 'Activities',
    route: '/',
  },
  {
    label: 'Processes',
    route: '/processes',
  },
  {
    label: 'Calendar',
    route: '/calendar',
  },
  {
    label: 'Works',
    route: '/works',
  },
  {
    label: 'Info',
    route: `/page/about`,
  },
];

const getRoute = (item, index) => {
  if (index === 0) {
    return '/';
  }
  if (item.name === 'info') {
    return '/page/about';
  }
  return `/${item.name}`;
};

pathsWithMenu = menu.map((item) => item.route !== '/page/about' && item.route);

const getGotoPath = (pathname) => {
  const shortPath = pathname.substring(0, 3);
  if (shortPath === '/pr') {
    return '/processes';
  } else if (pathname.includes('/work/')) {
    return '/works';
  } else {
    return '/';
  }
};

const LayoutPage = ({
  currentUser,
  currentHost,
  userLoading,
  hostLoading,
  history,
  children,
}) => {
  // const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(
  //   false
  // );

  if (hostLoading) {
    return (
      <Box width="100%">
        <Box pad="medium" alignSelf="center">
          <Text>Loading...</Text>
        </Box>
      </Box>
    );
  }

  const hsl =
    currentHost &&
    currentHost.settings.mainColor &&
    currentHost.settings.mainColor.hsl;
  const customTheme = {
    ...theme,
  };
  if (hsl) {
    customTheme.global.colors.brand = `hsl(${hsl.h}, ${100 * hsl.s}%, ${
      100 * hsl.l
    }%)`;
    customTheme.global.colors.focus = `hsl(${hsl.h}, 80%, 60%)`;
  }

  const headerProps = {
    currentUser,
    currentHost,
    history,
    title: 'Fanus',
  };

  const hostWithinUser =
    currentUser &&
    currentUser.memberships &&
    currentUser.memberships.find(
      (membership) => membership.host === location.host
    );

  const role = hostWithinUser && hostWithinUser.role;
  const canCreateContent = role && ['admin', 'contributor'].includes(role);

  return (
    <Grommet theme={customTheme}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@500;800&family=Inknut+Antiqua:wght@700&display=swap');
      `}</style>
      <StateContext.Provider
        value={{
          currentUser,
          userLoading,
          currentHost,
          role,
          canCreateContent,
        }}
      >
        <Box
          className="main-viewport"
          justify="center"
          fill
          background="light-2"
        >
          <Box width={{ max: '1280px' }} alignSelf="center" fill>
            <Header {...headerProps} />
            <Box>{children}</Box>
            {/* <FooterInfo settings={settings} /> */}
          </Box>
        </Box>
      </StateContext.Provider>
    </Grommet>
  );
};

const boldBabe = {
  textTransform: 'uppercase',
  fontWeight: 700,
};

const Header = ({ currentUser, currentHost, title, history }) => {
  const UserStuff = () => (
    <Box justify="end" direction="row" alignContent="center">
      {currentUser && (
        <NotificationsPopup notifications={currentUser.notifications} />
      )}
      <UserPopup currentUser={currentUser} />
    </Box>
  );

  const pathname = location.pathname;
  const gotoPath = getGotoPath(pathname);

  const isPage = pathname.substring(0, 5) === '/page';
  const isMenuPage = isPage || pathsWithMenu.includes(pathname);

  return (
    <ScreenClassRender
      render={(screenClass) => {
        const large = ['lg', 'xl', 'xxl'].includes(screenClass);

        return (
          <Container fluid style={{ width: '100%' }}>
            <Row style={{ marginLeft: 0, marginRight: 0 }} align="center">
              <Col xs={3} style={{ paddingLeft: 0 }}>
                <Box>
                  <Link to="/">
                    <Box width="120px" height="80px" margin={{ top: 'small' }}>
                      <Image
                        fit="contain"
                        src={currentHost && currentHost.logo}
                        className="header-logo"
                      />
                    </Box>
                  </Link>
                </Box>
              </Col>
              <Col xs={6} style={{ display: 'flex', justifyContent: 'center' }}>
                <Menu
                  currentHost={currentHost}
                  large={large}
                  history={history}
                />
              </Col>
              <Col xs={3} style={{ paddingRight: 0 }}>
                <UserStuff />
              </Col>
            </Row>
          </Container>
        );
      }}
    />
  );
};

const Menu = ({ currentHost, large, history }) => {
  const [open, setOpen] = useState(false);

  if (!currentHost || !currentHost.settings || !currentHost.settings.menu) {
    return null;
  }

  const menu = currentHost.settings.menu;

  const menuItems = menu
    .filter((item) => item.isVisible)
    .map((item, index) => ({
      ...item,
      route: getRoute(item, index),
    }));

  const menuProps = {
    large,
    history,
  };

  const pathname = history.location.pathname;
  const currentPage = menu.find((item) => {
    return (
      item.name.toLowerCase() === 'info' ||
      item.name.toLowerCase() ===
        pathname.substring(1, pathname.length).toLowerCase()
    );
  });

  if (large) {
    return (
      <MenuContent currentPage={currentPage} items={menuItems} {...menuProps} />
    );
  }

  return (
    <DropButton
      label={
        <Box direction="row" gap="small" align="center">
          <Anchor as="span">
            {(currentPage && currentPage.label) || 'Menu'}
          </Anchor>
          <Down size="small" />
        </Box>
      }
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      alignSelf="center"
      dropContent={
        <Box width="small" pad="small">
          <MenuContent
            {...menuProps}
            items={menuItems}
            closeMenu={() => setOpen(false)}
          />
        </Box>
      }
      dropProps={{ align: { top: 'bottom' } }}
      plain
    />
  );
};

const MenuContent = ({ items, large, history, closeMenu, currentPage }) => {
  if (!items) {
    return null;
  }

  const handleClick = (item) => {
    !large && closeMenu();
    history.push(item.route);
  };

  const isCurrentPage = (label) => {
    if (!currentPage) {
      return false;
    }
    if (currentPage.label === 'info') {
      return label.substring(0, 5) === '/page';
    }
    return currentPage && currentPage.label === label;
  };

  return (
    <Box
      pad="small"
      justify={large ? 'center' : 'start'}
      direction={large ? 'row' : 'column'}
      flex={{ shrink: 0 }}
      alignSelf="center"
      wrap
      gap={large ? 'none' : 'small'}
    >
      {items.map((item) => (
        <Box pad="small" key={item.label}>
          <Anchor
            onClick={() => handleClick(item)}
            label={item.label.toUpperCase()}
            size="small"
            style={{
              borderBottom: isCurrentPage(item.label) ? '1px solid' : 'none',
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

const FooterInfo = ({ currentHost }) =>
  currentHost && (
    <Footer pad="medium" direction="row" justify="center">
      <Box alignSelf="center">
        <Heading level={4} style={boldBabe}>
          {currentHost.name}
        </Heading>
        <Paragraph>
          {currentHost.address}, {currentHost.city}
        </Paragraph>
        <Paragraph>
          <Anchor href={`mailto:${currentHost.email}`}>
            {currentHost.email}
          </Anchor>
        </Paragraph>
      </Box>
    </Footer>
  );

export default withTracker((props) => {
  const meSub = Meteor.subscribe('me');
  const currentUser = Meteor.user();
  const userLoading = !meSub.ready();

  const hostSub = Meteor.subscribe('currentHost');
  const currentHost = Hosts ? Hosts.findOne() : null;
  const hostLoading = !hostSub.ready();
  return {
    currentUser,
    currentHost,
    userLoading,
    hostLoading,
  };
})(LayoutPage);
