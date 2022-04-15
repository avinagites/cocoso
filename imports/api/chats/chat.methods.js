import { Meteor } from 'meteor/meteor';
import { getHost } from '../@/shared';
import { isContributorOrAdmin } from '../@users/user.roles';
import Hosts from '../@hosts/host';
import Processes from '../processes/process';
import Chats from './chat';

Meteor.methods({
  getChatByContextId(contextId) {
    const chat = Chats.findOne({contextId});
    return chat;
  },

  createChat(contextName, contextId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theChat = Chats.insert({
      host,
      contextName,
      contextId: contextId,
      createdBy: {
        userId: user._id,
        username: user.username,
      },
      isNotificationOn: false,
      messages: new Array(),
    });
    return theChat;
  },

  addChatMessage(values) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }
    const host = getHost(this);

    const unSeenIndex = Chats.findOne({ contextId: values.contextId })?.messages?.length;

    try {
      Chats.update(
        { contextId: values.contextId },
        {
          $push: {
            messages: {
              content: values.message,
              host,
              senderUsername: user.username,
              senderId: user._id,
              createdDate: new Date(),
            },
          },
          $set: {
            isNotificationOn: true,
            lastMessageBy: user._id,
          },
        }
      );
      if (values.context === 'process') {
        Meteor.call('createProcessNotification', values, unSeenIndex);
      }
    } catch (error) {
      throw new Meteor.Error(error);
    }
  },

  createProcessNotification(values, unSeenIndex) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }
    
    const contextId = values.contextId;

    try {
      const theProcess = Processes.findOne(contextId);
      const theOthers = theProcess.members
        .filter((member) => member.memberId !== user._id)
        .map((other) => Meteor.users.findOne(other.memberId));
      theOthers.forEach((member) => {
        let contextIdIndex = -1;
        for (let i = 0; i < member.notifications.length; i++) {
          if (member.notifications[i].contextId === contextId) {
            contextIdIndex = i;
            break;
          }
        }

        if (contextIdIndex !== -1) {
          const notifications = [...member.notifications];
          notifications[contextIdIndex].count += 1;
          if (!notifications[contextIdIndex].unSeenIndexes) {
            notifications[contextIdIndex].unSeenIndexes = []
          }
          
          notifications[contextIdIndex].unSeenIndexes?.push(unSeenIndex);
          Meteor.users.update(member._id, {
            $set: {
              notifications: notifications,
            },
          });
        } else {
          Meteor.users.update(member._id, {
            $push: {
              notifications: {
                title: theProcess.title,
                count: 1,
                context: 'process',
                contextId: theProcess._id,
                unSeenIndexes: [unSeenIndex],
              },
            },
          });
        }
      });
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(error);
    }
  },

  removeNotification(contextId, messageIndex) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }

    try {
      const notifications = [...user.notifications];
      if (!notifications) {
        return;
      }

      const notificationIndex = notifications.findIndex(
        (notification) => notification.contextId === contextId
      );

      if (notificationIndex < 0) {
        return;
      }

      notifications[notificationIndex].count -= 1;

      let newNotifications;
      if (notifications[notificationIndex].count === 0) {
        newNotifications = notifications.filter(
          (notification, index) => index !== notificationIndex
        );
      } else {
        const newUnSeenIndexes = notifications[
          notificationIndex
        ].unSeenIndexes.filter(unSeenIndex => unSeenIndex !== messageIndex);
        notifications[notificationIndex].unSeenIndexes = newUnSeenIndexes;
        newNotifications = notifications;
      }

      Meteor.users.update(user._id, {
        $set: {
          notifications: newNotifications
        },
      });
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(error);
    }
  },
});