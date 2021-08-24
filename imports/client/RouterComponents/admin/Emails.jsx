import React, { useState, useEffect, useContext } from 'react';
import ReactQuill from 'react-quill';
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Text,
  TextInput,
} from 'grommet';

import { editorFormats, editorModules } from '../../constants/quillConfig';
import { defaultEmails } from '../../../../lib/constants';
import { call } from '../../functions';
import Loader from '../../UIComponents/Loader';
import { message, Alert } from '../../UIComponents/message';
import { StateContext } from '../../LayoutContainer';

const Field = ({ children, ...otherProps }) => (
  <FormField {...otherProps} margin={{ bottom: 'medium' }}>
    {children}
  </FormField>
);

export default function Emails() {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState(defaultEmails);

  const { currentUser, role } = useContext(StateContext);

  if (!currentUser || role !== 'admin') {
    return <Alert>You are not allowed</Alert>;
  }

  useEffect(() => {
    const getEmails = async () => {
      try {
        const emails = await call('getEmails');
        setEmails(emails);
      } catch (error) {
        console.log(error);
        message.error(error.reason);
      } finally {
        setLoading(false);
      }
    };
    getEmails();
  }, []);

  if (!emails) {
    return null;
  }

  const handleChange = (emailIndex, value) => {
    const newEmails = [...emails];
    newEmails[emailIndex] = {
      ...value,
      body: emails[emailIndex].body,
    };

    setEmails(newEmails);
  };

  const handleBodyChange = (emailIndex, value) => {
    const newEmails = [...emails];
    newEmails[emailIndex] = {
      ...emails[emailIndex],
      body: value,
    };

    setEmails(newEmails);
  };

  const handleSubmit = async (emailIndex) => {
    setLoading(true);
    try {
      await call('updateEmail', emailIndex, emails[emailIndex]);
      message.success('Email is successfully updated');
    } catch (error) {
      message.error(error.reason || error.error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  console.log(emails);

  return (
    <Box>
      <Heading level={3}>Emails</Heading>
      {emails &&
        emails.map((email, index) => (
          <Box>
            <Heading level={4}>{email.title}</Heading>
            <Form
              value={email}
              onChange={(value) => handleChange(index, value)}
              onSubmit={() => handleSubmit(index)}
            >
              <Field label="Subject">
                <TextInput name="subject" placeholder="Welcome" size="medium" />
              </Field>
              <Field label="Appeal">
                <Box
                  direction="row"
                  gap="small"
                  width="medium"
                  align="center"
                  justify="start"
                >
                  <Box style={{ width: 120 }}>
                    <TextInput
                      name="appeal"
                      placeholder="Dear"
                      plain={false}
                      size="small"
                    />
                  </Box>
                  <Text weight="bold">@username</Text>
                </Box>
              </Field>

              <Field label="Body">
                <ReactQuill
                  value={email && email.body}
                  formats={editorFormats}
                  modules={editorModules}
                  name="body"
                  onChange={(value) => handleBodyChange(index, value)}
                />
              </Field>

              <Box direction="row" justify="end" pad="small">
                <Button type="submit" primary label="Confirm" />
              </Box>
            </Form>
          </Box>
        ))}
    </Box>
  );
}
