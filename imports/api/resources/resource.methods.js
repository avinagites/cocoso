import { Meteor } from 'meteor/meteor';
import { getHost } from '../@/shared';
import { isContributorOrAdmin } from '../@users/user.roles';
import Hosts from '../@hosts/host';
import Resources from './resource';
import Activities from '../activities/activity';

function validateLabel(label, host, resourceId) {
  // set resource query
  let resourceQuery = { host, label };
  if (resourceId) resourceQuery._id = { $ne: resourceId };
  // validate label
  if (label.length < 3) {
    throw new Meteor.Error('Resource name is too short. Minimum 3 letters required');
  } else if (Resources.find(resourceQuery).fetch().length > 0) {
    throw new Meteor.Error('There already is a resource with this name');
  }
  return true;
}

// RESOURCE METHODS
Meteor.methods({
  getResources() {
    const host = getHost(this);
    const sort = { createdAt: -1 };
    return Resources.find({ host }, { sort }).fetch();
  },

  getResourceById(resourceId) {
    const fields = Resources.publicFields;
    return Resources.findOne(resourceId, { fields });
  },

  getResourceBookingsForUser(resourceId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host }, { fields: { members: 1 }});
    if (!isContributorOrAdmin(user, currentHost) ) {
      return 'Not valid user!';
    }

    try {
      const bookings = Activities.find(
        { 
          resourceId,
          authorId: user._id,
        }, 
        { fields: { 
          title: 1,
          longDescription: 1,
          datesAndTimes: 1,
        }}
        ).fetch();

      return bookings.map(booking => {
        return {
          _id: booking._id,
          startDate: booking.datesAndTimes[0].startDate,
          startTime: booking.datesAndTimes[0].startTime,
          endDate: booking.datesAndTimes[0].endDate,
          endTime: booking.datesAndTimes[0].endTime,
          title: booking.title,
          description: booking.longDescription,
        }
      });
    } catch (error) {
      console.error(error);
    }
  },

  createResource(values) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host }, { fields: { members: 1 }});
    const resourceIndex = Resources.find({ host }).count();
    if (!isContributorOrAdmin(user, currentHost) || !validateLabel(values.label, host)) {
      return 'Not valid user or label!';
    }
    try {
      const newResourceId = Resources.insert({
        host,
        userId: user._id,
        ...values,
        resourceIndex,
        createdBy: user.username,
        createdAt: new Date(),
      },
      () => {
        Meteor.call('createChat', values.label, newResourceId, (error, result) => {
          if (error) {
            console.log('Chat is not created due to error: ', error);
          }
        });
      }
      );
      return newResourceId;
    } catch (error) {
      throw new Meteor.Error(error);
    }
  },

  updateResource(resourceId, values) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host }, { fields: { members: 1 }});
    if(!isContributorOrAdmin(user, currentHost) || !validateLabel(values.label, host, resourceId)) {
      throw new Meteor.Error(error, "Not allowed");
    }

    try {
      Resources.update(resourceId, {
        $set: {
          ...values,
          updatedBy: user.username,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't add to Collection");
    }
  
  },

  deleteResource(resourceId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host }, { fields: { members: 1 }});
    if(isContributorOrAdmin(user, currentHost)) {
      try {
        Resources.remove(resourceId);
      } catch (error) {
        throw new Meteor.Error(error, "Couldn't remove from collection");
      }
    }
  },

});