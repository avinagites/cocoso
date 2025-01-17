import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alert as CAlert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
  createStandaloneToast,
} from '@chakra-ui/react';

import { chakraTheme } from '../utils/constants/theme';

const { ToastContainer, toast } = createStandaloneToast({ theme: chakraTheme });

const toastContainer = document.getElementById('toast-root');
createRoot(toastContainer).render(
  <>
    <ToastContainer />
  </>
);

const timeOutTime = 5;

const Alert = ({ children, isClosable, message, type = 'error', ...otherProps }) => {
  return (
    <Box w="100%" maxW="500px">
      <CAlert status={type} {...otherProps}>
        <AlertIcon />
        <Box flex="1">
          {/* <AlertTitle>
              {success ? 'Success!' : info ? 'Info' : warning ? 'Warning' : 'Error'}
            </AlertTitle> */}
          <AlertDescription display="block">{children || message}</AlertDescription>
        </Box>
        {isClosable && <CloseButton position="absolute" right="8px" top="8px" />}
      </CAlert>
    </Box>
  );
};

const renderToast = (status, text, duration) => {
  toast({
    description: text,
    duration: (duration || timeOutTime) * 1000,
    isClosable: true,
    position: 'top',
    status,
  });
};

const message = {
  success: (text, duration) => renderToast('success', text, duration * 1000),

  error: (text, duration) => renderToast('error', text, duration),

  info: (text, duration = timeOutTime) => renderToast('info', text, duration),
};

export { message, Alert };
