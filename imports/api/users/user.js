import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import SimpleSchema from 'simpl-schema';
import { Schemas } from '../_utils/schemas';

const Users = Meteor.users;

Users.schema = {};
Users.schema.AccountBase = {
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  emails: { type: Array },
  'emails.$': { type: Object },
  'emails.$.address': { type: String, regEx: SimpleSchema.RegEx.Email },
  'emails.$.verified': { type: Boolean },
  username: { type: String, min: 3, max: 21 },
  createdAt: { type: Date },
  services: { type: Object, blackbox: true },
};
Users.schema.UserProfile = {
  firstName: { type: String, optional: true, defaultValue: '' },
  lastName: { type: String, optional: true, defaultValue: '' },
  bio: { type: String, defaultValue: '', optional: true },
  contactInfo: { type: String, defaultValue: '', optional: true },
  lang: { type: String, optional: true },
  avatar: { type: new SimpleSchema(Schemas.Avatar), optional: true },
  isPublic: { type: Boolean, defaultValue: true, optional: true },

  memberships: { type: Array, defaultValue: [] },
  'memberships.$': {
    type: new SimpleSchema({
      host: Schemas.Hostname,
      role: { type: String },
      date: { type: Date },
      isPublic: { type: Boolean, optional: true, defaultValue: true },
    }),
    optional: true,
  },

  processes: { type: Array, defaultValue: [] },
  'processes.$': {
    type: new SimpleSchema({
      processId: Schemas.Id,
      name: { type: String },
      isAdmin: { type: Boolean, defaultValue: false },
      joinDate: { type: Date },
    }),
    optional: true,
  },

  notifications: { type: Array, defaultValue: [] },
  'notifications.$': {
    type: new SimpleSchema({
      contextId: Schemas.Id,
      context: { type: String },
      count: { type: SimpleSchema.Integer },
      host: { type: String, optional: true },
      title: { type: String, optional: true },
      unSeenIndexes: { type: Array, defaultValue: [], optional: true },
      'unSeenIndexes.$': {
        type: SimpleSchema.Integer,
        optional: true,
      },
    }),
    optional: true,
  },

  attending: { type: Array, optional: true },
  'attending.$': {
    type: new SimpleSchema({
      groupId: Schemas.Id,
      name: { type: String },
      meAdmin: { type: Boolean },
      joinDate: { type: Date },
    }),
    optional: true,
  },

  verifiedBy: {
    type: new SimpleSchema({
      userId: Schemas.Id,
      username: { type: String },
      date: { type: Date },
    }),
    optional: true,
  },
  unVerifiedBy: {
    type: new SimpleSchema({
      userId: Schemas.Id,
      username: { type: String },
      date: { type: Date },
    }),
    optional: true,
  },
};

// Ensuring every user has an email address, should be in server-side code
Accounts.validateNewUser((user) => {
  new SimpleSchema(Users.schema.AccountBase).validate(user);
  // Return true to allow user creation to proceed
  return true;
});

Users.attachSchema(
  new SimpleSchema({
    ...Users.schema.AccountBase,
    ...Users.schema.UserProfile,
  })
);

export default Users;
