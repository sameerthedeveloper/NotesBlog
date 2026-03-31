import React from "react";
import { Card, CardContent, Skeleton, Box, Stack } from "@mui/material";

const NoteCardSkeleton = () => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: "100%", 
        borderRadius: 1, // 16px 
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width="80%" height={32} sx={{ borderRadius: 1 }} />
          <Box>
            <Skeleton variant="text" width="100%" sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="100%" sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="60%" sx={{ borderRadius: 1 }} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={40} height={20} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={50} height={20} sx={{ borderRadius: 1 }} />
          </Stack>
        </Stack>
      </CardContent>
      <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid", borderColor: "divider", opacity: 0.3 }}>
        <Skeleton variant="text" width={60} sx={{ ml: 1 }} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
        </Stack>
      </Box>
    </Card>
  );
};

export default NoteCardSkeleton;
