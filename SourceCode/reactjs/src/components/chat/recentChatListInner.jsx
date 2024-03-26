import {
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React,{useEffect, useState} from "react";
import { useSelector } from "react-redux";
import { selectedIdSelector } from "../../store/selectors/ChatSelector";
import { generateColorHsl } from "../../utils/generateColorHsl";
import axios from "axios";

const { REACT_APP_API_ENDPOINT } = process.env;

const RecentChatListInner = ({ userList, onSelect,}) => {
  
  const selectedId = useSelector(selectedIdSelector);

  const[data,setData]=useState(userList);

  useEffect(() => {
    getMessage();
  }, []);

  const getMessage = ( )=> {
    axios.get(`${REACT_APP_API_ENDPOINT}message`)
    .then((response) => {
      setData(response.data.docs);
     
    })
    .catch((error) => {
      // Handle error
      console.error(error);
    });
  }



  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {data?.map(({ message, partnerId, partnerName, partnerProfileImage, unreadCount }, index) => {
        let name = partnerName;
        let profileImage = partnerProfileImage;
        let body = message.body;

        // Convert UTC timestamp to IST
        const istDate = new Date(message.timestamp);
        const istOptions = { timeZone: "Asia/Kolkata" };
        const istDateString = istDate.toLocaleString("en-IN", istOptions);

        // Get today's date in IST
        const today = new Date().toLocaleDateString("en-IN", istOptions);

        // Format the timestamp based on the rules
        let formattedTimestamp;

        if (istDateString.startsWith(today)) {
          // Display as hh:mm am/pm if it's today's date
          formattedTimestamp = istDate.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            hour: "numeric",
            minute: "numeric",
          });
        } else if (istDate.toDateString() === new Date().toDateString()) {
          // Display as "yesterday" if it's yesterday's date
          formattedTimestamp = "Yesterday";
        } else {
          // Display as dd/mm/yy for older dates
          const options = { day: "numeric", month: "numeric", year: "2-digit" };
          formattedTimestamp = istDate.toLocaleDateString("en-IN", options);
        }

        let color;
        const fullName = name[0].toUpperCase() + name.slice(1);
        if (!profileImage) {
          color = generateColorHsl(name, [40, 60], [40, 60]);
        }
        return (
          <Box key={index} component={"span"}>
            <ListItem alignItems="flex-start">
              <ListItemButton
                onClick={(e) =>{ getMessage();onSelect(e, partnerId)}}
                sx={{
                  backgroundColor: selectedId === partnerId && "background.select",
                  borderRadius: "8px",
                }}
              >
                <ListItemAvatar>
                  {profileImage ? (
                    <Avatar src={profileImage} />
                  ) : (
                    <Avatar sx={{ bgcolor: color }}>{fullName[0]}</Avatar>
                  )}
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
                      <Typography
                        variant="subtitle1"
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                        whiteSpace={"nowrap"}
                        component="span"
                      >
                        {fullName}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
                        {formattedTimestamp}
                      </Typography>
                    </React.Fragment>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        pr={"4px"}
                        sx={{
                          display: "inline",
                          overflow: "hidden",
                          fontWeight: message.isRead === 0 && message.sender.toString() === partnerId ? "bold" : "normal",
                        }}  
                        component="span"
                        // variant="body2"
                        color="text.primary"
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                        whiteSpace={"nowrap"}
                      >
                        {body}
                      </Typography>
                      {unreadCount > 0 && (
                        <Chip component={"span"} label={unreadCount} color="secondary" size="small" />
                      )}
                      
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            </ListItem>
            <Divider variant="middle" component="li" />
           
          </Box>
        );
      })}
    </List>
  );
};

export default RecentChatListInner;
