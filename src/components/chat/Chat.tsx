import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import profileimage from '../../assets/images/defult-profile.png';
import Profile from '../Profile/Profile';
import NoUsersImage from '../../assets/images/chat.png';
import { format } from 'date-fns'; // Import date formatting library
import CloseIcon from '@mui/icons-material/Close'; // Import Close Icon

interface User {
  uid: string;
  displayName?: string;
  email: string;
  photoURL?: string;
}

interface Message {
  text: string;
  from: string;
  to: string;
  createdAt: Timestamp;
}


const Chat: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }

  const { currentUser } = authContext;
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [view, setView] = useState<'chat' | 'profile'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for the messages container

  useEffect(() => {
    if (!currentUser) return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersArray: User[] = [];
      snapshot.forEach((doc) => {
        usersArray.push(doc.data() as User);
      });
      setUsers(usersArray);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const selectUser = (user: User) => {
    setChatUser(user);

    const chatId =
      currentUser!.uid > user.uid
        ? `${currentUser!.uid + user.uid}`
        : `${user.uid + currentUser!.uid}`;

    const messagesRef = collection(db, 'messages', chatId, 'chat');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push(doc.data() as Message);
      });
      setMessages(msgs);
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll whenever messages are updated

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chatUser || !currentUser) return;

    const chatId =
      currentUser.uid > chatUser.uid
        ? `${currentUser.uid + chatUser.uid}`
        : `${chatUser.uid + currentUser.uid}`;

    await addDoc(collection(db, 'messages', chatId, 'chat'), {
      text,
      from: currentUser.uid,
      to: chatUser.uid,
      createdAt: serverTimestamp(),
    });
    setText('');
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCloseChat = (): void => {
    setChatUser(null);
    setMessages([]);
  };

  const formatTimestamp = (timestamp: Timestamp): string => {
    try {
      const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
      return format(date, 'hh:mm a'); // Format as "hour:minute AM/PM"
    } catch {
      return '';
    }
  };

  return (
    <Grid container height="98vh" overflow="hidden">
      {/* Sidebar */}
      <Grid
        item
        xs={1}
        sx={{
          background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)', // Gradient background
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
          <IconButton
            onClick={() => setView('profile')}
            sx={{ color: 'white' }}
          >
            <AccountCircleIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={() => setView('chat')}
            sx={{ color: 'white' }}
          >
            <ChatIcon fontSize="large" />
          </IconButton>
          <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
            <LogoutIcon fontSize="large" />
          </IconButton>
        </Box>
      </Grid>

      {/* Main Content */}
      <Grid item xs={11} display="flex" flexDirection="column" height="100%">
        {view === 'profile' ? (
          <Profile />
        ) : (
          <>
            {/* Header */}
            <Box
              p={2}
              sx={{
                background: 'linear-gradient(135deg,  #FF7E5F, #FEB47B)', // Gradient background for header
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0, // Prevent the header from shrinking
              }}
            >
              <Typography variant="h6">
                {chatUser ? chatUser.displayName : 'ChitChat'}
              </Typography>
              {chatUser && (
                <IconButton onClick={handleCloseChat} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            <Grid container height="calc(100% - 64px)" overflow="hidden">
              {/* Users List */}
              <Grid
                item
                xs={4}
                bgcolor="background.default"
                borderRight={1}
                borderColor="grey.300"
                overflowY="auto"
                height="100%" // Maintain consistent height
              >
                <List>
                  {users.map((user) => (
                    <ListItem
                      key={user.uid}
                      component="button"
                      onClick={() => selectUser(user)}
                      selected={chatUser?.uid === user.uid}
                      sx={{
                        textAlign: 'left',
                        width: '100%',
                        backgroundColor: chatUser?.uid === user.uid ? 'primary.light' : 'transparent',
                        '&:hover': { backgroundColor: 'background.paper' },
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={user.photoURL || profileimage} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.displayName || user.email}
                        primaryTypographyProps={{
                          fontWeight: chatUser?.uid === user.uid ? 700 : 500,
                          color: chatUser?.uid === user.uid ? 'primary.main' : 'black',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Chat Section */}
              <Grid
                item
                xs={8}
                display="flex"
                flexDirection="column"
                overflow="hidden"
                height="100%" // Maintain consistent height
              >
                {chatUser ? (
                  <>
                    {/* Messages */}
                    <Box
                      flexGrow={1}
                      overflow="auto"
                      p={2}
                      bgcolor="background.paper"
                      display="flex"
                      flexDirection="column"
                      gap={2}
                    >
                      {messages.map((msg, index) => (
                        <Box
                          key={index}
                          alignSelf={msg.from === currentUser!.uid ? 'flex-end' : 'flex-start'}
                          bgcolor={msg.from === currentUser!.uid ? 'primary.light' : 'grey.300'}
                          color={msg.from === currentUser!.uid ? 'white' : 'black'}
                          px={3}
                          py={1}
                          borderRadius={3}
                          boxShadow={1}
                          maxWidth="70%"
                          display="flex"
                          flexDirection="column"
                        >
                          <Typography>{msg.text}</Typography>
                          <Typography
                            variant="caption"
                            align="right"
                            color="text.secondary"
                            mt={1}
                          >
                            {msg.createdAt ? formatTimestamp(msg.createdAt) : ''}
                          </Typography>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} /> {/* Scroll target */}
                    </Box>

                    {/* Input Area */}
                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      display="flex"
                      p={2}
                      borderTop={1}
                      borderColor="grey.300"
                      bgcolor="background.default"
                      flexShrink={0} // Prevent shrinking
                    >
                      <TextField
                        variant="outlined"
                        fullWidth
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter message..."
                        size="small"
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        sx={{ ml: 2 }}
                        endIcon={<SendIcon />}
                      >
                        Send
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexGrow={1}
                    bgcolor="background.paper"
                    flexDirection="column"
                  >
                    <img
                      src={NoUsersImage}
                      alt="No users selected"
                      style={{ maxWidth: '250px', marginBottom: '20px' }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Select a user to start chatting
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default Chat;