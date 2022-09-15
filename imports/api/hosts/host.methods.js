import { Meteor } from 'meteor/meteor';
import { getHost } from '../_utils/shared';
import Hosts from './host';
import Pages from '../pages/page';
import { defaultMenu, defaultMainColor, defaultEmails } from '../../startup/constants';
import getTerms from '../_utils/terms';

Meteor.methods({
  createNewHost(values) {
    const currentUser = Meteor.user();
    if (!currentUser || !currentUser.isSuperAdmin) {
      throw new Meteor.Error('You are not allowed!');
    }

    if (Hosts.findOne({ host: values.host })) {
      throw new Meteor.Error('A hub with this url already exists');
    }

    try {
      Hosts.insert({
        host: values.host,
        settings: {
          name: values.name,
          email: values.email,
          address: values.address,
          city: values.city,
          country: values.country,
          menu: defaultMenu,
        },
        members: [
          {
            avatar: currentUser.avatar.src,
            date: new Date(),
            email: currentUser.emails[0].address,
            id: currentUser._id,
            role: 'admin',
            username: currentUser.username,
          },
        ],
        emails: defaultEmails,
        createdAt: new Date(),
      });

      Pages.insert({
        host: values.host,
        authorId: currentUser._id,
        authorName: currentUser.username,
        title: `About ${values.name}`,
        longDescription: values.about,
        isPublished: true,
        creationDate: new Date(),
      });

      Pages.insert({
        host: values.host,
        authorId: currentUser._id,
        authorName: currentUser.username,
        title: 'Terms',
        longDescription: getTerms(values),
        isPublished: true,
        creationDate: new Date(),
      });

      Meteor.users.update(currentUser._id, {
        $push: {
          memberships: {
            host: values.host,
            role: 'admin',
            date: new Date(),
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error);
    }
  },

  getHostMembers() {
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });
    return currentHost.members;
    const members = currentHost.members.map((member) => {
      const user = Meteor.users.findOne(member.id);
      if (!user) {
        return null;
      }
      const avatarSrc = user && user.avatar && user.avatar.src;
      return {
        ...member,
        avatarSrc,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      };
    });
    const validMembers = members.filter((member) => member && member.id);
    return validMembers;
  },
});
