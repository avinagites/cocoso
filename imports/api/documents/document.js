import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Schemas } from '../@/schemas';

const Documents = new Mongo.Collection('documents');

Document.schema = new SimpleSchema({
  _id: Schemas.Id,
  host: Schemas.Hostname,

  uploadedBy: Schemas.Id,
  uploadedUsername: {type: String},
  uploadedByName: {type: String},

  contextType: {type: String},
  documentLabel: {type: String},
  documentUrl: {type: String, regEx: SimpleSchema.RegEx.Url},

  creationDate: {type: Date},
});

Documents.attachSchema(Document.schema);

export default Documents;