import { TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { memo, useEffect } from "react";
const AuthInput = ({
  type,
  placeholder,
  Icon,
  End = null,
  form,
  label,
  validation = {},
  formError,
}) => {
  useEffect(() => {
   
  }, [formError]);
  return (
    <Box component={"div"}>
      <Box
        sx={{
          boxShadow: 1,
          display: "flex",
          alignItems: "center",
          paddingLeft: 2,
          paddingRight: 2,
          margin: "8px 0px",
          borderRadius: "calc(42px/2)",
          background: "background.paper",
          border: "1px solid",
          borderColor: formError ? "error.main" : "transparent",
        }}
      >
        <Icon sx={{ color: "primary.main", mr: 1, my: 0.5, fontSize: 40 }} />

        <TextField
          fullWidth
          sx={{ my: 2 }}
          placeholder={placeholder}
          variant="standard"
          id={"input-" + placeholder}
          {...form(label, { ...validation })}
          autoComplete="off"
          type={type}
          aria-invalid={formError ? "true" : "false"}
          InputProps={{
            disableUnderline: true,
            endAdornment: End,
          }}
        />
      </Box>
      <Box component={"span"}>
        <Typography align="left" color={"error"} sx={{
          
        }}>{formError?.message}</Typography>
      </Box>
    </Box>
  );
};

export default memo(AuthInput);
