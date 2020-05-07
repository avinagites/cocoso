import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Radio, Alert, message, Divider } from 'antd/lib';
import { Box, Text, Heading, TextInput } from 'grommet';

import Loader from '../../UIComponents/Loader';
import NiceList from '../../UIComponents/NiceList';
import Template from '../../UIComponents/Template';

const menuRoutes = [
  { label: 'Settings', value: '/admin/settings' },
  { label: 'Members', value: '/admin/members' }
];

const RadioGroup = Radio.Group;

const compareUsersByDate = (a, b) => {
  const dateA = new Date(a.createdAt);
  const dateB = new Date(b.createdAt);
  return dateB - dateA;
};
state = {
  sortBy: 'join-date',
  filter: 'all',
  filterWord: ''
};

function Members({ history }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState('join-date');
  const [filter, setFilter] = useState('all');
  const [filterWord, setFilterWord] = useState('');

  const getAndSetUsers = () => {
    setLoading(true);
    Meteor.call('getUsers', (error, respond) => {
      if (error) {
        message.error(error.reason);
        setLoading(false);
        return;
      }
      setUsers(respond);
      setLoading(false);
    });
  };

  useEffect(() => {
    getAndSetUsers();
  }, []);

  if (loading) {
    return <Loader />;
  }

  toggleVerification = user => {
    if (user.isRegisteredMember) {
      Meteor.call('unVerifyMember', user._id, (error, response) => {
        if (error) {
          message.error(error.reason);
          console.log(error);
          getAndSetUsers();
          return;
        }
        getAndSetUsers();
        message.success('Verification removed');
      });
    } else {
      Meteor.call('verifyMember', user._id, (error, response) => {
        if (error) {
          message.error(error.reason);
          console.log(error);
          getAndSetUsers();
          return;
        }
        getAndSetUsers();
        message.success('User is now verified');
      });
    }
  };

  const currentUser = Meteor.user();

  if (!currentUser || !currentUser.isSuperAdmin) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Alert
          message="You are not allowed to view this content"
          type="warning"
        />
      </div>
    );
  }

  const usersFiltered =
    users &&
    users.filter(user => {
      if (filter === 'all') {
        return true;
      } else if (filter === 'verified') {
        return user.isRegisteredMember;
      } else if (filter === 'unverified') {
        return !Boolean(user.isRegisteredMember);
      }
    });

  const usersList = usersFiltered.map(user => ({
    ...user,
    actions: [
      {
        content: user.isRegisteredMember
          ? 'Remove user membership'
          : 'Verify this user',
        handleClick: () => this.toggleVerification(user),
        isDisabled: user.isSuperAdmin
      }
    ]
  }));

  const filterOptions = [
    {
      label: 'All',
      value: 'all'
    },
    {
      label: 'Verified',
      value: 'verified'
    },
    {
      label: 'Unverified',
      value: 'unverified'
    }
  ];

  const sortOptions = [
    {
      label: 'Date joined',
      value: 'join-date'
    },
    {
      label: 'Username',
      value: 'username'
    }
  ];

  const usersFilteredWithType = usersList.filter(user => {
    return (
      user.username.toLowerCase().indexOf(filterWord.toLowerCase()) !== -1 ||
      user.emails[0].address.toLowerCase().indexOf(filterWord.toLowerCase()) !==
        -1
    );
  });

  let usersSorted;
  switch (sortBy) {
    case 'username':
      usersSorted = usersFilteredWithType.sort((a, b) =>
        a.username.localeCompare(b.username)
      );
      break;
    case 'join-date':
    default:
      usersSorted = usersFilteredWithType.sort(compareUsersByDate);
      break;
  }

  const pathname = history && history.location.pathname;

  return (
    <Template
      heading="Members"
      leftContent={menuRoutes.map(datum => (
        <Link to={datum.value} key={datum.value}>
          <Text
            margin={{ bottom: 'medium' }}
            size="small"
            weight={pathname === datum.value ? 'bold' : 'normal'}
          >
            {datum.label.toUpperCase()}
          </Text>
        </Link>
      ))}
    >
      <div style={{ background: '#f8f8f8', padding: 12 }}>
        <span style={{ marginRight: 12 }}>filtered by </span>
        <RadioGroup
          options={filterOptions}
          onChange={event => setFilter(event.target.value)}
          value={filter}
          style={{ marginBottom: 12 }}
        />

        <TextInput
          plain={false}
          placeholder="filter by username or email address..."
          value={filterWord}
          onChange={event => setFilterWord(event.target.value)}
        />

        <Divider />

        <span style={{ marginRight: 12 }}>sorted by </span>
        <RadioGroup
          options={sortOptions}
          onChange={event => setSortBy(event.target.value)}
          value={sortBy}
          style={{ marginBottom: 12 }}
        />
      </div>

      <Box pad="medium">
        <Heading level={4} alignSelf="center">
          {filter} members ({usersSorted.length}){' '}
        </Heading>
      </Box>

      <NiceList list={usersSorted}>
        {user => (
          <div key={user.username}>
            <Text size="large" weight="bold">
              {user.username}
            </Text>
            <Text as="div" size="small">
              {user && user.emails ? user.emails[0].address : null}
            </Text>
            <Text
              as="div"
              size="xsmall"
              style={{ fontSize: 10, color: '#aaa' }}
            >
              joined {moment(user.createdAt).format('Do MMM YYYY')}
            </Text>
          </div>
        )}
      </NiceList>
    </Template>
  );
}

export default Members;
