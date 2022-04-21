import { withTracker } from 'meteor/react-meteor-data';
import Activity from './Activity';
import Chats from '../../../api/chats/chat';
import Activities from '../../../api/activities/activity';
import { useTranslation } from 'react-i18next';

export default ActivityContainer = withTracker((props) => {
  const activityId = props.match.params.id;
  const activity = Meteor.subscribe('activity', activityId);

  const isLoading = !activity.ready();
  const activityData = Activities ? Activities.findOne({ _id: activityId }) : null;
  const currentUser = Meteor.user();

  const chatSubscription = Meteor.subscribe('chat', activityId);
  const chatData = Chats ? Chats.findOne({ contextId: activityId }) : null;

  const [t] = useTranslation('activities');
  const [tc] = useTranslation('common');

  return {
    isLoading,
    activityData,
    currentUser,
    chatData,
    t,
    tc,
  };
})(Activity);
