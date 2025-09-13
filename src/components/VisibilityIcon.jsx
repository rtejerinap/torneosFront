import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export default function VisibilityIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 13c-4.08 0-7.75-2.44-9.35-6C4.25 7.94 7.92 5.5 12 5.5s7.75 2.44 9.35 6c-1.6 3.56-5.27 6-9.35 6zm0-10a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z" />
    </SvgIcon>
  );
}
