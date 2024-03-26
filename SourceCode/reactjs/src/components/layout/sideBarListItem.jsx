import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { styled } from "@mui/material/styles";
import { useTheme } from "@emotion/react";

const SideBarListItem = ({ key, index, open, Icon, text, onClick }) => {
  const theme = useTheme()
  const SideListItem = styled(ListItem)(({ theme }) => ({

  }));
  return (
    <SideListItem
    sx={{
      background:index ? theme.palette.primary.main:"",

    }}
      key={key}
      disablePadding
      // sx={{ display: "block" }}
      onClick={onClick}
    >
      <ListItemButton
        sx={{
          minHeight: 48,
          justifyContent: "center",
          px: 2.5,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 3 : "auto",
            justifyContent: "center",
          }}
        >
          <Icon  sx={{
            color:index? "text.light":"primary.main"
          }} />
        </ListItemIcon>
        {text && <ListItemText
          primary={text}
          sx={{ opacity: open ? 1 : 0, color: index ? "background.default":"primary.main" }}
        />}
      </ListItemButton>
    </SideListItem>
  );
};

export default SideBarListItem;
