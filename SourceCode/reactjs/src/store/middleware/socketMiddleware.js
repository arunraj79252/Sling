import { socketActions } from "../slice/socketSlice";
import { io } from "socket.io-client";
import socketIOClient from "socket.io-client";
import ChatMessage from "../../components/chat/chatMessage";
import { apliSlice } from "../../api/apiSlice";
import { toast } from "react-toastify";



const socketMiddleware = (store) => {
  const { REACT_APP_WEBSOCKET_URL } = process.env;
  let socket;
  return (next) => (action) => {
    const isConnectionEstablished =
      socket && store.getState().socket.isConnected;

    if (socketActions.startConnecting.match(action)&& !store.getState().socket.isConnected) {
      try {
        socket = io("http://localhost:5002", {
          // path:"./socket.io",
          // secure: true, 
          // rejectUnauthorized: false,
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: "SLING " + store.getState().auth.accessToken,
              },
            },
          },
          reconnection: false,
        });
      } catch (error) {
      }

      socket.on("connection",(payload)=>{
        store.dispatch(socketActions.connectionEstablished());
      })
      socket.on("chat", (data) => {
        toast.info(`New Mesage From ${data?.senderName} :${data?.message}`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          toastId:data?.senderId
          });
        new Notification(data.senderName, {body: data.message, icon: data.senderImage})
        store.dispatch({
          type: `${apliSlice.reducerPath}/invalidateTags`,
          payload: ['Recent',],
       })
       store.dispatch(apliSlice.util.invalidateTags([{ type: 'ViewMessage', id: data.senderId }]))
      });
    }
    next(action);
  };
};

export default socketMiddleware;