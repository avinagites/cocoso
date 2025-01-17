import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import { getHost } from '../_utils/shared';
import { isAdmin, isContributorOrAdmin } from '../users/user.roles';
import Hosts from '../hosts/host';
import Activities from './activity';
import Processes from '../processes/process';
import Resources from '../resources/resource';
import { getRegistrationEmailBody, getUnregistrationEmailBody } from './activity.mails';

Meteor.methods({
  getAllActivitiesFromAllHosts(onlyPublic = false) {
    const user = Meteor.user();
    try {
      let allActs = [];
      if (onlyPublic) {
        allActs = Activities.find({
          $or: [{ isPublicActivity: true }, { isProcessMeeting: true }],
        }).fetch();
      } else {
        allActs = Activities.find({
          $ne: {
            isPublicActivity: true,
          },
        });
      }
      return allActs.filter((act) => {
        if (!act.isProcessPrivate) {
          return true;
        }
        if (!user) {
          return false;
        }
        const process = Processes.findOne({ _id: act.processId });
        const userId = user?._id;
        return (
          process.adminId === userId ||
          process.members.some((member) => member.memberId === userId) ||
          process.peopleInvited.some((person) => person.email === user.emails[0].address)
        );
      });
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch data");
    }
  },

  getAllActivities(onlyPublic = false) {
    const host = getHost(this);
    const user = Meteor.user();
    try {
      let allActs = [];
      if (onlyPublic) {
        allActs = Activities.find({
          host,
          $or: [{ isPublicActivity: true }, { isProcessMeeting: true }],
        }).fetch();
      } else {
        allActs = Activities.find({
          host,
          isPublicActivity: false,
        });
      }
      return allActs.filter((act) => {
        if (!act.isProcessPrivate) {
          return true;
        }
        if (!user) {
          return false;
        }
        const process = Processes.findOne({ _id: act.processId });
        const userId = user?._id;
        return (
          process.adminId === userId ||
          process.members.some((member) => member.memberId === userId) ||
          process.peopleInvited.some((person) => person.email === user.emails[0].address)
        );
      });
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch data");
    }
  },

  getActivityById(activityId) {
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });
    try {
      if (currentHost.isPortal) {
        return Activities.findOne(activityId);
      }
      return Activities.findOne({ _id: activityId, host });
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch data");
    }
  },

  getMyActivities() {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }
    const host = getHost(this);

    try {
      const activities = Activities.find({
        host,
        authorId: user._id,
      }).fetch();
      return activities;
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch data");
    }
  },

  getActivitiesByUser(username) {
    if (!username) {
      throw new Meteor.Error('Not allowed!');
    }
    const host = getHost(this);

    try {
      const activities = Activities.find({
        host,
        authorName: username,
      }).fetch();
      return activities;
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch activities");
    }
  },

  getAllOccurences() {
    const host = getHost(this);
    try {
      const activities = Activities.find(
        { host },
        {
          fields: {
            title: 1,
            authorName: 1,
            longDescription: 1,
            isPublicActivity: 1,
            imageUrl: 1,
            datesAndTimes: 1,
            resource: 1,
            resourceIndex: 1,
          },
        }
      ).fetch();

      const occurences = [];

      activities.forEach((activity) => {
        if (activity?.datesAndTimes && activity.datesAndTimes.length > 0) {
          activity.datesAndTimes.forEach((recurrence) => {
            const occurence = {
              _id: activity._id,
              title: activity.title,
              authorName: activity.authorName,
              longDescription: activity.longDescription,
              imageUrl: activity.imageUrl,
              isPublicActivity: activity.isPublicActivity,
              isWithComboResource: false,
              start: moment(
                recurrence.startDate + recurrence.startTime,
                'YYYY-MM-DD HH:mm'
              ).toDate(),
              end: moment(recurrence.endDate + recurrence.endTime, 'YYYY-MM-DD HH:mm').toDate(),
              startDate: recurrence.startDate,
              startTime: recurrence.startTime,
              endDate: recurrence.endDate,
              endTime: recurrence.endTime,
              isMultipleDay:
                recurrence.isMultipleDay || recurrence.startDate !== recurrence.endDate,
            };

            const resource = Resources.findOne(activity.resourceId, {
              fields: { isCombo: 1 },
            });

            if (resource?.isCombo) {
              resource.resourcesForCombo.forEach((resId) => {
                const res = Resources.findOne(resId, {
                  fields: { label: 1, resourceIndex: 1 },
                });
                occurences.push({
                  ...occurence,
                  resource: res.label,
                  resourceIndex: res.resourceIndex,
                });
              });
            }

            occurences.push({
              ...occurence,
              resource: activity.resource,
              resourceIndex: activity.resourceIndex,
            });
          });
        }
      });

      return occurences;
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch works");
    }
  },

  getAllProcessMeetings(isPortalHost = false) {
    const host = getHost(this);

    try {
      if (isPortalHost) {
        return Activities.find({
          isProcessMeeting: true,
        }).fetch();
      }
      return Activities.find({
        host,
        isProcessMeeting: true,
      }).fetch();
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch data");
    }
  },

  createActivity(values) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    if (values.isPublicActivity && !values.imageUrl) {
      throw new Meteor.Error('Image is required for public activities');
    }

    try {
      const activityId = Activities.insert({
        ...values,
        host,
        authorId: user._id,
        authorName: user.username,
        isSentForReview: false,
        isPublished: true,
        creationDate: new Date(),
      });
      // () => {
      //   if (!formValues.isPublicActivity) {
      //     return;
      //   }
      //   Meteor.call('createChat', formValues.title, add, (error, result) => {
      //     if (error) {
      //       throw new Meteor.Error('Chat is not created');
      //     }
      //   });
      // }
      return activityId;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't add to Collection");
    }
  },

  updateActivity(activityId, values) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }

    const theActivity = Activities.findOne(activityId);
    if (user._id !== theActivity.authorId && !isAdmin(user, currentHost)) {
      throw new Meteor.Error('You are not allowed!');
    }

    try {
      Activities.update(activityId, {
        $set: {
          ...values,
        },
      });
      return activityId;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't add to Collection");
    }
  },

  deleteActivity(activityId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const activityToDelete = Activities.findOne(activityId);
    if (activityToDelete.authorId !== user._id) {
      throw new Meteor.Error('You are not allowed!');
    }

    try {
      Activities.remove(activityId);
      return true;
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't remove from collection");
    }
  },

  registerAttendance(activityId, values, occurenceIndex = 0) {
    const theActivity = Activities.findOne(activityId);
    const rsvpValues = {
      ...values,
      registerDate: new Date(),
    };

    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });
    const hostName = currentHost?.settings?.name;

    const field = `datesAndTimes.${occurenceIndex}.attendees`;
    const occurence = theActivity.datesAndTimes[occurenceIndex];
    const currentUser = Meteor.user();
    const emailBody = getRegistrationEmailBody(
      theActivity,
      values,
      occurence,
      currentHost,
      currentUser
    );

    try {
      Activities.update(activityId, {
        $push: {
          [field]: rsvpValues,
        },
      });
      Meteor.call('sendEmail', values.email, `"${theActivity.title}", ${hostName}`, emailBody);
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't register attendance");
    }
  },

  updateAttendance(activityId, values, occurenceIndex) {
    const theActivity = Activities.findOne(activityId);
    const rsvpValues = {
      ...values,
      registerDate: new Date(),
    };
    const newDatesAndTimes = [...theActivity.datesAndTimes];
    const theOccurence = newDatesAndTimes[occurenceIndex];

    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });
    const currentUser = Meteor.user();
    const emailBody = getRegistrationEmailBody(
      theActivity,
      rsvpValues,
      theOccurence,
      currentHost,
      currentUser,
      true
    );

    const attendeeIndex = theOccurence.attendees.findIndex((a) => a.email === values.email);
    const field = `datesAndTimes.${occurenceIndex}.attendees.${attendeeIndex}`;

    try {
      Activities.update(activityId, {
        $set: {
          [field]: rsvpValues,
        },
      });
      Meteor.call(
        'sendEmail',
        values.email,
        `Update to your registration for "${theActivity.title}" at ${currentHost.settings.name}`,
        emailBody
      );
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't update attendance");
    }
  },

  removeAttendance(activityId, occurenceIndex, email) {
    const theActivity = Activities.findOne(activityId);
    const newOccurences = [...theActivity.datesAndTimes];
    const theOccurence = newOccurences[occurenceIndex];
    const theNonAttendee = theOccurence.attendees.find((a) => a.email === email);
    newOccurences[occurenceIndex].attendees = theOccurence.attendees.filter(
      (a) => a.email !== email
    );

    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });
    const hostName = currentHost.settings.name;
    const currentUser = Meteor.user();

    try {
      Activities.update(activityId, {
        $set: {
          datesAndTimes: newOccurences,
        },
      });
      Meteor.call(
        'sendEmail',
        email,
        `Update to your registration for "${theActivity.title}" at ${hostName}`,
        getUnregistrationEmailBody(theActivity, theNonAttendee, currentHost, currentUser)
      );
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't update document");
    }
  },
});
