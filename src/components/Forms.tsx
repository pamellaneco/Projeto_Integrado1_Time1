import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

interface FormsProps {
  title?: string; 
  children: React.ReactNode; 
  width?: number | string;
}

export default function Forms({ title, children, width = 400 }: FormsProps) {

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: '#3A5566'
      }}
    >
      <Container
        sx={{
          width: '100%',
          maxWidth: width,
        }}
      >
        {title && (
          <Typography variant="h4" gutterBottom align="left" fontWeight={'bold'} >
            {title}
          </Typography>
        )}
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children}
        </Box>
      </Container>
    </Box>
  );
}