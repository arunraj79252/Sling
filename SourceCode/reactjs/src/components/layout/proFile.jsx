import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Avatar,
  Tooltip,
  TextField,
  CardContent,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Container } from "@mui/system";
import DraftsIcon from "@mui/icons-material/Drafts";
import PersonIcon from "@mui/icons-material/Person";
import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@emotion/react";
import { FaRegEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "./ProFile.module.css";
import axios from "axios";
import { accessTokenSelector } from "../../store/selectors/AuthSelectors";
import swal from "sweetalert";
import { updateprofileImage } from "../../store/slice/authSlice";

const { REACT_APP_API_ENDPOINT } = process.env;

function ProFile() {
  const dispatch = useDispatch();
  const [user, setUser] = useState({ name: "", phoneNo: "", email: "" });
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); 
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    mode: "onChange",
    defaultValues: { user: user },
  });

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    if (newProfilePic) handleUpload();
  }, [newProfilePic]);

  const token = useSelector(accessTokenSelector);

  const getUserDetails = async () => {
    const url = `${REACT_APP_API_ENDPOINT}user/profile`;
    const headers = {
      Authorization: `SLING ${token}`,
    };
    try {
      const response = await axios.get(url, { headers });
      setUser(response?.data);
      let payload = {
        profileImage: response?.data?.profileImage,
      };
      dispatch(updateprofileImage(payload));
      const { name, email, phoneNo } = { ...response?.data };
      setValue("user", { name, email, phoneNo: phoneNo?.toString() });
    } catch (err) {
      
    }
  };

  const handleUpload = async () => {
    const fileSize = newProfilePic.size / 1024 / 1024; 
    if (fileSize > 5) {
      alert("sixe");
      setNewProfilePic(null);
      toast.warning("File size exceeds 5 MB", { 
      toastId: "sizevalidation",
      position:'top-center' });
    } else {
      let validtaionResult = validateProfilePicture(newProfilePic);
      if (validtaionResult) {
        let data = new FormData();
        data.append("profileImage", newProfilePic);
        const url = `${REACT_APP_API_ENDPOINT}user/profileImage`;
        const headers = {
          Authorization: `SLING ${token}`,
          "Content-Type": "multipart/form-data",
        };

        try {
          const response = await axios.put(url, data, { headers });
          console.log(response.data); 
          toast.success("Profile Picture Updated", { 
            toastId: "imagesuccess",
            position:'top-center',
           });
          getUserDetails();
          setPreviewImage(null);
       
        } catch (error) {
          toast.error("Profile Picture Update Failed", {
            toastId: "imagefailed",
            position:'top-center',
          });
        }
        getUserDetails();
      }
    }
  };

  const validateProfilePicture = (profilePic) => {
    let allowedExtension = ["jpeg", "jpg", "png"];
    let fileExtension = profilePic.name.split(".").pop().toLowerCase();
    let isValidFile = false;

    for (let index in allowedExtension) {
      if (fileExtension === allowedExtension[index]) {
        isValidFile = true;
        break;
      }
    }
    if (!isValidFile) {
      toast.error(
        "Allowed Extensions are : *." + allowedExtension.join(", *."),
        { toastId: "validation", 
        position: "top-center" }
      );
    }
    return isValidFile;
  };

  const onSubmit = async (newData) => {
    const url = `${REACT_APP_API_ENDPOINT}user`;
    const headers = {
      Authorization: `SLING ${token}`,
    };

    let data = newData?.user;

    if (!data.phoneNo) {
      delete data.phoneNo;
    }

   
    swal({
      title: "Confirmation",
      text: "Are you sure you want to update the details?",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          const response = await axios.put(url, data, { headers });
          
          toast.success("Details updated successfully", {
            toastId: "detailupdatesuccess",
            position: "top-center",
          });
        } catch (err) {
          toast.error("Details update failed", {
            toastId: "detailupdatesuccess",
            position: "top-center",
          });
        }
      } else if(confirmed === null){
        getUserDetails();      
      }
    });
  };

  return (
    <div>
      <ToastContainer />
      <Container
        maxWidth="xl"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Grid container>
          <Grid item display={{ xs: "none", sm: "block" }} sm={6}>
            <Paper
              elevation={16}
              sx={{
                padding: theme.spacing(2),
                textAlign: "center",
                color: theme.palette.text.secondary,
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                maxHeight: "80vh",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1611175694989-4870fafa4494?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y2hhdCUyMGFwcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
                height="750px" style={{ height: "75vh", width: "75vh" }} alt="img"
              ></img>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={16}
              sx={{
                padding: theme.spacing(2),
                textAlign: "center",
                color: theme.palette.text.secondary,
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                maxHeight: "80vh",
               
              }}
            >
              <div className={style.profilePic}>
                {previewImage ? (
                  <Avatar
                    className={style.avatar}
                    alt={user?.name}
                    src={previewImage}
                  />
                ) : (
                  <Avatar
                    className={style.avatar}
                    alt={user?.name}
                    src={user?.profileImage ? user?.profileImage : user?.name}
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: "10px",
                }}
              >
                {" "}
                <Tooltip title={"Change profile picture"}>
                  <label>
                    <input
                      data-testid="image-uploader"
                      id="file"
                      className={style.input}
                      type="file"
                      onChange={(event) => {
                        setNewProfilePic(event.target.files[0]);
                        setPreviewImage(
                          URL.createObjectURL(event.target.files[0])
                        );
                      }}
                    />
                    <FaRegEdit style={{ cursor: "pointer" }} />
                  </label>
                </Tooltip>
              </div>
              <CardContent
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  paddingBottom: "10px",
                }}
              >
                <TextField
                  data-testid="name-input"
                  variant="outlined"
                  {...register("user.name", {
                    validate: (value) => {
                      return value.trim() !== "" ? null : "Not a valid name";
                    },
                    required: "Name is required",
                    maxLength: {
                      value: 60,
                      message: "Maximum 60 characters",
                    },
                  })}
                  error={!!errors?.user?.name}
                  helperText={errors?.user?.name?.message}
                  InputLabelProps={{
                    shrink: !!getValues("user.name"),
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "rgb(103, 58, 183)" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  data-testid="name-input"
                  variant="outlined"
                  {...register("user.email", {
                    validate: (value) => {
                      return value.trim() !== "" ? null : "Not a valid email";
                    },
                    required: "Email is required",
                    pattern: {
                      value:
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      message: "Invalid Email",
                    },
                  })}
                  error={!!errors?.user?.email}
                  helperText={errors?.user?.email?.message}
                  InputLabelProps={{
                    shrink: !!getValues("user.email"),
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DraftsIcon sx={{ color: "rgb(103, 58, 183)" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </CardContent>
              <Box
                component={"div"}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                  alignItems: "center",
                  flexDirection: "column",
                  "@media (max-width: 600px)": {
                    alignItems: "center",
                  },
                }}
              >
                <Button
                  variant="contained"
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  sx={{
                    background: theme.palette.primary.secondary,
                    borderRadius: "2pc",
                    boxShadow: 1,
                    width: "50%",
                    marginBottom: "10px",
                  }}
                >
                  UPDATE
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default ProFile;