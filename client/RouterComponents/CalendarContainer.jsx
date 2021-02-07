import { withTracker } from 'meteor/react-meteor-data';
import Calendar from './Calendar';
import moment from 'moment';

export default CalendarContainer = withTracker((props) => {
  // here we can pull out the props.subID and change our Meteor subscription based on it
  // this is handled on the publication side of things

  // const handle = Meteor.subscribeLite('myDataSub', props.subID);

  const activities = Meteor.subscribeLite('activities');
  const isLoading = !activities.ready();
  const activitiesList = Activities ? Activities.find().fetch() : null;
  const currentUser = Meteor.user();
  const resourcesSub = Meteor.subscribeLite('resources');
  const resourcesList = Resources ? Resources.find().fetch() : null;
  const processesSubscription = Meteor.subscribeLite('processes');
  const processesList = Processes ? Processes.find().fetch() : null;

  const manualsSubscription = Meteor.subscribeLite('manuals');
  const manuals = Documents ? Documents.find().fetch() : null;

  const allActivities = [];
  if (activitiesList) {
    activitiesList.forEach((activity) => {
      if (activity.datesAndTimes) {
        activity.datesAndTimes.forEach((recurrence) => {
          allActivities.push({
            title: activity.title,
            start: moment(
              recurrence.startDate + recurrence.startTime,
              'YYYY-MM-DD HH:mm'
            ).toDate(),
            end: moment(
              recurrence.endDate + recurrence.endTime,
              'YYYY-MM-DD HH:mm'
            ).toDate(),
            startDate: recurrence.startDate,
            startTime: recurrence.startTime,
            endDate: recurrence.endDate,
            endTime: recurrence.endTime,
            authorName: activity.authorName,
            longDescription: activity.longDescription,
            isMultipleDay:
              recurrence.isMultipleDay ||
              recurrence.startDate !== recurrence.endDate,
            resource: activity.resource,
            resourceIndex: activity.resourceIndex,
            isPublicActivity: activity.isPublicActivity,
            imageUrl: activity.imageUrl,
            _id: activity._id,
          });
        });
      }
    });
  }

  if (processesList) {
    processesList.forEach((process) => {
      if (process.meetings) {
        process.meetings.forEach((meeting) => {
          allActivities.push({
            title: process.title,
            start: moment(
              meeting.startDate + meeting.startTime,
              'YYYY-MM-DD HH:mm'
            ).toDate(),
            end: moment(
              meeting.endDate + meeting.endTime,
              'YYYY-MM-DD HH:mm'
            ).toDate(),
            startDate: meeting.startDate,
            startTime: meeting.startTime,
            endDate: meeting.endDate,
            endTime: meeting.endTime,
            authorName: process.adminUsername,
            resource: meeting.resource,
            longDescription: process.description,
            isMultipleDay: false,
            resourceIndex: meeting.resourceIndex,
            isPublicActivity: true,
            imageUrl: process.imageUrl,
            _id: process._id,
            isProcess: true,
            isPrivateProcess: process.isPrivate,
          });
        });
      }
    });
  }

  return {
    isLoading,
    allActivities,
    currentUser,
    resourcesList,
    manuals,
  };
})(Calendar);
