import { Avatar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import {
  profileImageSelector,
  userNameSelector,
} from "../../store/selectors/AuthSelectors";
import { generateColorHsl } from "../../utils/generateColorHsl";

const GetMyProfileImage = () => {
  const profileImage = useSelector(profileImageSelector);
  const userName = useSelector(userNameSelector);
  let myAvatar;
  const color = generateColorHsl(userName, [40, 60], [40, 60]);
  if (profileImage) {
    myAvatar = <Avatar sx={{ width: 32, height: 32 }} src={profileImage} />;
  } else {
    myAvatar = (
      <Avatar sx={{ width: 32, height: 32, bgcolor: color }}>
        {userName ? userName[0].toUpperCase() : "M"}
      </Avatar>
    );
  }
  return myAvatar;
};

export default GetMyProfileImage;
