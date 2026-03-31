import React, { useEffect, useState } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';

const AdBlock = ({ 
  client = 'ca-pub-4366510851653349', 
  slot = '3200385772', 
  format = 'auto', 
  responsive = 'true', 
  sx = {} 
}) => {
  const theme = useTheme();
  const [adError, setAdError] = useState(false);
  const isDevPlaceholder = !client || !slot;

  useEffect(() => {
    if (isDevPlaceholder) return;

    try {
      // Ensure the adsbygoogle array exists
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense logic pushed too early or blocked. This is normal in some SPAs.", err);
      // We don't necessarily set error here because AdSense handles its own retries
    }
  }, [isDevPlaceholder, slot]); // Added slot for route-based refreshes

  // If no credentials are provided or an error occurs, render a clean Material Design placeholder box
  if (isDevPlaceholder || adError) {
    return (
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
          p: 3,
          backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.divider, 0.05) : alpha(theme.palette.divider, 0.1),
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 2, // 8px Radius 
          color: 'text.secondary',
          overflow: 'hidden',
          ...sx
        }}
      >
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '1px', opacity: 0.6 }}>
          Advertisement Placeholder
        </Typography>
      </Box>
    );
  }

  // Render the actual AdSense block
  return (
    <Box sx={{ minHeight: 120, overflow: 'hidden', display: 'flex', justifyContent: 'center', ...sx }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </Box>
  );
};

export default AdBlock;
