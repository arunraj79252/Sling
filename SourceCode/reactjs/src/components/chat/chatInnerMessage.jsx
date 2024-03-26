import { Box } from '@mui/system'
import React, { useState ,useEffect} from 'react'
import GetMyProfileImage from '../layout/getMyProfileImage'
import { Modal } from '@mui/material'
import Button from '@mui/material/Button'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import Swal from 'sweetalert2'
import axios from 'axios'
import EditIcon from '@material-ui/icons/Edit'
import { DatasetLinkedOutlined } from '@mui/icons-material'

const { REACT_APP_API_ENDPOINT } = process.env

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3
}

const ChatInnerMessage = ({
  flag,
  parentFlag,
  sender,
  id,
  body,
  recieverAvatar,
  messageId,
  deleted
}) => {
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedBody, setEditedBody] = useState(body)
  const [data, setData] = useState([])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const deleteMessage = messageId => {
    handleClose()
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to delete this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        axios
          .delete(`${REACT_APP_API_ENDPOINT}message/${messageId}`)
          .then(res => {
            if (res.status === 200) {
              setData([{ deleted: 1 }])
            }
         
            Swal.fire({
              icon: 'success',
              text: 'Message deleted successfully'
            })
          })
          .catch(error => {
            Swal.fire({
              icon: 'error',
              text: 'Failed to delete the message'
            })
            
          })
      }
    })
  }
  const handleEdit = () => {
    setEditMode(true)
    handleClose()
  }

  const editMessage = () => {
    handleClose();
    axios
      .put(`${REACT_APP_API_ENDPOINT}message`, {
        messageId: messageId.toString(),
        message: editedBody
      })
      .then(res => {
        console.log(res,'>>>>>>>>>>>>>>>>>>>>>>>>>');
        if (res.status === 200) {
          setEditMode(false)
          setData([{ ...data[0], body: editedBody }])
        }
        Swal.fire({
          icon: 'success',
          text: 'Message updated successfully'
        })
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          text: 'Failed to update the message'
        })
      })
  } 
  

  return (
    <Box
      px={3}
      pt={!flag ? 2 : 0.1}
      pb={!parentFlag ? 2 : 0.1}
      display='flex'
      sx={{ flexDirection: sender === Number(id) ? 'row' : 'row-reverse'  }}
      >
      {sender !== Number(id) ? (
        <Box
          sx={{
            mr: 1,
            visibility: parentFlag && 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {deleted !== 1 && <GetMyProfileImage />}
        </Box>
      ) : (
        <Box
          sx={{
            visibility: parentFlag && 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {recieverAvatar}
        </Box>
      )}

      <Button
        onClick={() => {
          if (id !== sender && deleted !== 1 && !editMode) {
            handleOpen()
          }
        }}
      >
        {editMode ? (
          <div style={{ position: 'relative', display: 'inline-block' }} >
            <input
              style={{
                height: '15vh',
                width: '120vh',
                backgroundColor: '#eaeef4',
                borderLeft: 'none',
                borderRight: 'none',
                borderBlockStartColor:'inherit',
                borderBlockEndColor:'revert',
                border:'groove',
              }}
              type='text'
              value={editedBody}
              onChange={e => setEditedBody(e.target.value)}
            />
            <button
              style={{
                position: 'absolute',
                top: '84%',
                left: '4px',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgb(103, 58, 183)',
                borderRadius: '2pc',
                width: '10vh',
                height: '3vh'
              }}
              onClick={editMessage}
            >
              Update
            </button>
            <button
              style={{
                position: 'absolute',
                top: '86%',
                right: '95vh',
                width: '10vh',
                height: '3vh',
                transform: 'translateY(-50%)',
                border: "aliceblue",
                color:'blue',
                borderRadius: '2pc',
                backgroundColor:"#f8f7f9"
            
              }}
              onClick={() => {
                setEditMode(false)
                setEditedBody(body) // Reset the edited body to the original value
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <Box
            sx={{
              ml: sender === id && 2,
              mr: sender !== id && 2,
              display: 'flex',
              backgroundColor:
                sender === id ? 'primary.main' : 'background.border',
              color: sender === id && 'text.light',
              px: 2,
              py: 1,
              borderRadius: 'calc(48px/2)',
              fontStyle: deleted !== 1 ? 'normal' : 'italic',
              textTransform: 'none',
              
            }}
          >
            {data[0]?.deleted === 1 ? 'Message deleted by its author' : body}
          </Box>
        )}
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='child-modal-title'
        aria-describedby='child-modal-description'
        // style={{position: "absolute",
        //   top: "30%",
        //   left: "21%"}}
      >
        <Box sx={{ ...style, width: 200 }}>
          <Button onClick={() => deleteMessage(messageId)}>
            <DeleteForeverOutlinedIcon /> Delete
          </Button>
          {!editMode && (
            <Button onClick={handleEdit}>
              <EditIcon /> Edit
            </Button>
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default ChatInnerMessage
