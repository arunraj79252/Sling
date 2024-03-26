import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { Box } from "@mui/system";
import DraftsIcon from "@mui/icons-material/Drafts";
import React, { useCallback, useEffect, useRef } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link as ReactLink, useNavigate } from "react-router-dom";
import AuthInput from "../layout/authInput";
import { useForm } from "react-hook-form";
import { useGoogleLoginMutation, useLoginMutation } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { login } from "../../store/slice/authSlice";
import { loadScript } from "../../App";

const Login = () => {
  // const google = window.google;
  // const google = window.google = window.google ? window.google : {}
  /* global google*/
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const { register, handleSubmit, watch } = useForm();
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const [googleApiCall] = useGoogleLoginMutation();

  const saveTokens = useCallback(
    (res, email) => {
      let payload = {
        accessToken: res.token,
        refreshToken: res.refreshToken,
        email: email,
        socketId: "",
        userName: res.userName,
        userId: res.userId,
        profileImage: res.profileImage,
      };
      dispatch(login(payload));
      localStorage.setItem("accessToken", res.token);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem('userId', res.userId);
      navigate("/");
    },
    [dispatch, navigate]
  );

  const handleCallBackResponse = useCallback(
    (response) => {
      let payload = {
        code: response.credential,
      };
      googleApiCall(payload)
        .then((res) => {
          
          // navigate("/")
          saveTokens(res.data, "");
        })
        .catch((error) => {
          
        });
    },
    [googleApiCall, saveTokens]
  );
  const { REACT_APP_CLIENT_ID } = process.env;
  const googleButton = useRef();

  useEffect(() => {
    const src = "https://accounts.google.com/gsi/client";
    loadScript(src)
      .then(() => {
        google.accounts.id.initialize({
          client_id: REACT_APP_CLIENT_ID,
          callback: handleCallBackResponse,
          auto_select: false
        });
        google.accounts.id.renderButton(googleButton.current, {
          theme: "filled_blue",
          size: "large",
          width: 300,
          text: "continue_with",
          shape: "circle",
        });
        google.accounts.id.prompt();
        google.accounts.id.cancel();
      })
      .catch(console.error);

    return () => {
      const scriptTag = document.querySelector(`script[src="${src}"]`);
      if (scriptTag) document.body.removeChild(scriptTag);
    };
  }, [REACT_APP_CLIENT_ID, handleCallBackResponse]);

  const [loginCall, { isLoading }] = useLoginMutation();

  const onSubmit = handleSubmit((data) => {
    loginCall(data)
      .unwrap()
      .then((res) => {
        saveTokens(res, data.email);
      })
      .catch((error) => {
      });
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box>
        <Paper
          elevation={16}
          sx={{ minHeight: "50vh", padding: { xs: 2, sm: 4 } }}
          py={10}
        >
          <Typography variant="h2" component={"h3"} py={4} align="center">
            Sign In
          </Typography>

          <Box component={"form"} onSubmit={onSubmit}>
            <AuthInput
              type={"text"}
              placeholder="Email"
              Icon={DraftsIcon}
              form={register}
              label="email"
              validation={{ required: true }}
            />
            <AuthInput
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              Icon={LockIcon}
              form={register}
              label="password"
              validation={{ required: true }}
              End={
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              }
            />

            <Box
              component={"div"}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                my: 2,
                color: "text.secondary",
              }}
            >
              <Box
                component={"div"}
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Remember Me"
                />
              </Box>
              <Link
                component={ReactLink}
                color="text.secondary"
                underline="hover"
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
                to="/forgot"
              >
                Forgot password?
              </Link>
            </Box>
            <Box
              component={"div"}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                my: 3,
              }}
              width={"100%"}
            >
              <Box component={"div"} width={"60%"}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  type="submit"
                  disabled={isLoading || !watch("email") || !watch("password")}
                  sx={{
                    // background: theme.palette.primary.secondary,
                    borderRadius: "calc(34px/2)",
                    boxShadow: 1,
                  }}
                >
                  {isLoading ? (
                    <CircularProgress
                      sx={{ color: "text.light" }}
                      size={25.72}
                    />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Box>
            </Box>
            <Divider>
              <Chip label="or" />
            </Divider>
            {/* <Button
              fullWidth
              size="medium"
              variant="outlined"
              color="primary"
              ref={googleButton}
              sx={{
                borderRadius: "calc(34px/2)",
                my: 5,
                py: 1,
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {" "}
              <GoogleIcon sx={{ mr: 1 }} />
              Sign in With Google
            </Button> */}
            <Box
              component={"div"}
              ref={googleButton}
              sx={{ display: "flex", justifyContent: "center", my: 3 }}
            ></Box>
          </Box>
          <Box component={"div"} sx={{ my: 2 }}>
            <Typography component={"p"} align="center" color={"text.secondary"}>
              Don't have an acoount?{" "}
              <Link
                component={ReactLink}
                color="primary"
                underline="hover"
                to="/register"
              >
                create
              </Link>
              {/* <Button onClick={()=>google.accounts.id.disableAutoSelect()}></Button> */}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
