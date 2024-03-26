import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

const ChatMessagingSkelton = () => {
  const array = [1, 2, 3, 4, 5, 6];
  return (
    <Box>
      {array.map((res) => (
        <Box
          key={res}
          px={3}
          pt={2}
          pb={2}
          display="flex"
          sx={{ flexDirection: res % 2 === 0 ? "row" : "row-reverse" }}
        >
          <Skeleton height={32} width={32} variant="circular" />
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{
              ml: res % 2 === 0 && 2,
              mr: res % 2 !== 0 && 2,
              borderRadius: "calc(48px/2)",
            }}
            height={60}
            width="25%"
          />
        </Box>
      ))}
    </Box>
  );
};

export default ChatMessagingSkelton;
