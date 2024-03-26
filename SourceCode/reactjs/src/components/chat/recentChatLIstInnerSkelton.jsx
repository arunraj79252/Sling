import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

const RecentChatLIstInnerSkelton = () => {
  let array = [1, 2, 3, 4];
  return (
    <Box>
      {array.map((res) => (
        <Box key={res} component={"span"}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Skeleton variant="circular" height={40} width={40} />
            </ListItemAvatar>
            <ListItemText
              sx={{
                "& .MuiListItemText-secondary , & .MuiListItemText-primary": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  justifyContent: "space-between",
                },
              }}
              primary={
                <React.Fragment>
                  <Skeleton animation="wave" height={24} width="35%" />
                  
                  <Skeleton animation="wave" height={24} width={"20%"} />
                </React.Fragment>
              }
              secondary={
                <React.Fragment>
                  <Skeleton animation="wave" height={24} width={"70%"} />

                  <Skeleton
                    sx={{ borderRadius: "16px" }}
                    width={"15%"}
                    height={30}
                  />
                </React.Fragment>
              }
            />
          </ListItem>
        </Box>
      ))}
    </Box>
  );
};

export default RecentChatLIstInnerSkelton;
