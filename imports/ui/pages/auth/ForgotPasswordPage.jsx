import React, { useState, useContext } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Box, Center, Flex, Heading, Link as CLink, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { StateContext } from '../../LayoutContainer';
import { ForgotPassword } from './index';
import { call } from '../../utils/shared';
import { message } from '../../components/message';

function ForgotPasswordPage() {
  const [t] = useTranslation('accounts');
  const [emailSent, setEmailSent] = useState(false);
  const { currentUser } = useContext(StateContext);

  const handleForgotPassword = async (email) => {
    try {
      await call('forgotPassword', email);
      message.success(t('password.message.checkMail'));
      setEmailSent(true);
    } catch (error) {
      message.error(error.reason);
    }
  };

  if (currentUser) {
    return <Redirect to={`/@${currentUser.username}/profile`} />;
  }

  return (
    <Box pb="8" minHeight="100vh">
      <Center p="4">
        <Box w="xs">
          <Heading size="md" textAlign="center">
            {t('password.labels.title')}
          </Heading>
          <Center pt="4" px="4">
            <Text mb="4" textAlign="center">
              {t('password.labels.subtitle.forgot')}
            </Text>
          </Center>

          <Box bg="brand.50" p="6">
            {emailSent ? (
              <Text>{t('password.message.linkSend')}</Text>
            ) : (
              <ForgotPassword onForgotPassword={handleForgotPassword} />
            )}
          </Box>

          <Flex justify="space-around" mt="4">
            <Link to="/login">
              <CLink as="span">{t('actions.login')}</CLink>
            </Link>
            <Link to="/register">
              <CLink as="span">{t('actions.signup')}</CLink>
            </Link>
          </Flex>
        </Box>
      </Center>
    </Box>
  );
}

export default ForgotPasswordPage;
