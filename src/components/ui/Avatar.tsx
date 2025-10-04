import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface AvatarProps extends MuiAvatarProps {}

const StyledAvatar = styled(MuiAvatar)(({ theme }) => ({
  transition: 'all 0.3s ease',
}));

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  return <StyledAvatar ref={ref} {...props} />;
});

Avatar.displayName = 'Avatar';
