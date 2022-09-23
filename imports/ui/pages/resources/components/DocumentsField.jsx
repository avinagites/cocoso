import React, { useState, useEffect, useContext } from 'react';
import ReactDropzone from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Box, Code, Link as CLink } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { call } from '../../../utils/shared';
import Loader from '../../../components/Loader';
import { Alert, message } from '../../../components/message';
import NiceList from '../../../components/NiceList';
import { StateContext } from '../../../LayoutContainer';
import { DocumentUploadHelper } from '../../../components/UploadHelpers';

export default function DocumentsField({ contextType, contextId }) {
  const { role, canCreateContent } = useContext(StateContext);
  const isAdmin = role === 'admin';

  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [t] = useTranslation('resources');
  const [tc] = useTranslation('common');

  const getDocuments = async () => {
    try {
      const response = await call('getDocumentsByAttachments', contextId);
      setDocuments(response.reverse());
      setIsLoading(false);
    } catch (error) {
      message.error(error.reason);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDocuments();
  }, [documents.length]);

  const createDocument = async (uploadableFile, downloadUrl) => {
    try {
      await call('createDocument', uploadableFile.name, downloadUrl, contextType, contextId);
      getDocuments();
      message.success(`${uploadableFile.name} ${t('documents.fileDropper')}`);
    } catch (error) {
      message.error(error.reason);
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = async (documentId) => {
    if (!isAdmin) {
      message.error(tc('message.access.deny'));
      return;
    }

    try {
      await call('removeManual', documentId);
      getDocuments();
      message.success(tc('documents.remove'));
    } catch (error) {
      message.error(error.reason);
    }
  };

  const handleFileDrop = (files) => {
    if (files.length !== 1) {
      message.error(tc('plugins.fileDropper.single'));
      return;
    }
    setIsUploading(true);
    const upload = new Slingshot.Upload('processDocumentUpload');
    files.forEach((file) => {
      const parsedName = file.name.replace(/\s+/g, '-').toLowerCase();
      const uploadableFile = new File([file], parsedName, {
        type: file.type,
      });
      upload.send(uploadableFile, (error, downloadUrl) => {
        if (error) {
          console.error('Error uploading:', error);
          message.error(error.reason);
          setIsUploading(false);
        } else {
          createDocument(uploadableFile, downloadUrl);
        }
      });
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!documents) {
    return null;
  }

  const documentsList = documents.map((document) => ({
    ...document,
    actions: [
      {
        content: tc('labels.remove'),
        handleClick: () => removeDocument(document._id),
      },
    ],
  }));

  return (
    <Box>
      <Box bg="white" mb="4">
        {documents && documents.length > 0 ? (
          <NiceList actionsDisabled={!isAdmin} list={documentsList}>
            {(document) => (
              <Box style={{ width: '100%' }}>
                <Code fontWeight="bold">
                  <CLink href={document.documentUrl} target="_blank" rel="noreferrer">
                    {document.documentLabel} <ExternalLinkIcon mr="2px" fontSize="sm" />
                  </CLink>
                </Code>
              </Box>
            )}
          </NiceList>
        ) : (
          <Alert type="warning">{tc('documents.empty')}</Alert>
        )}
      </Box>
      {canCreateContent && (
        <Box>
          <Box mb="2">
            <ReactDropzone onDrop={handleFileDrop} multiple={false}>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <Box bg="gray.200" cursor="grab" h="180px" p="4" w="100%" {...getRootProps()}>
                  {isUploading ? (
                    <div style={{ textAlign: 'center' }}>
                      <Loader />
                      {tc('documents.up')}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>{tc('documents.drop')}</div>
                  )}
                  <input {...getInputProps()} />
                </Box>
              )}
            </ReactDropzone>
          </Box>
          <DocumentUploadHelper />
        </Box>
      )}
    </Box>
  );
}
