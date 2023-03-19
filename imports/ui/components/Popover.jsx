import React from 'react';
import {
  Popover as CPopover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  //   PopoverAnchor,
} from '@chakra-ui/react';

export default function Popover({ footer, title, trigger, children, ...otherProps }) {
  return (
    <CPopover {...otherProps}>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent bg="gray.50">
        <PopoverArrow />
        <PopoverCloseButton />
        {title && <PopoverHeader>{title}</PopoverHeader>}
        <PopoverBody>{children}</PopoverBody>
        {footer && <PopoverFooter>{footer}</PopoverFooter>}
      </PopoverContent>
    </CPopover>
  );
}
