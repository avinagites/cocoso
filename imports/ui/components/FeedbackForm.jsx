import React, { useState } from 'react';
import {
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import FormField from './FormField';

function FeedbackForm() {
  const [tc] = useTranslation('common');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <Flex align="center" bg="" justify="space-between" p="2">
      <Button colorScheme="gray.600" variant="ghost" onClick={() => setShowFeedbackModal(true)}>
        {tc('modals.feedback.label')}
      </Button>

      <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{tc('modals.feedback.label')}</ModalHeader>
          <ModalCloseButton />
          <form action="https://formspree.io/f/xdopweon" method="POST">
            <ModalBody>
              <VStack spacing="6">
                <FormField label={tc('modals.feedback.form.email.label')}>
                  <Input type="email" name="_replyto" />
                </FormField>

                <FormField label={tc('modals.feedback.form.subject.label')}>
                  <Select name="subject">
                    {[
                      tc('modals.feedback.form.subject.select.suggest'),
                      tc('modals.feedback.form.subject.select.bug'),
                      tc('modals.feedback.form.subject.select.compliment'),
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={tc('modals.feedback.form.details.label')}>
                  <Textarea name="message" />
                </FormField>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={() => setShowFeedbackModal(false)}>
                {tc('actions.close')}
              </Button>
              <Button colorScheme="blue" type="submit">
                {tc('actions.send')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default FeedbackForm;