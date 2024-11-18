import React, { useState, useContext } from 'react';
import { db } from '../../services/firebase';
import { AuthContext } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';

interface UserInfo {
  displayName: string;
  email: string;
  photoURL: string;
}

const Profile: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }

  const { currentUser } = authContext;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    photoURL: currentUser?.photoURL || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleEditToggle = (): void => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (): Promise<void> => {
    if (!currentUser) return;

    try {
      const updateData: { [key: string]: any } = {
        displayName: userInfo.displayName,
        email: userInfo.email,
        photoURL: userInfo.photoURL,
      };

      await updateDoc(doc(db, 'users', currentUser.uid), updateData);

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      p={3}
    >
      <Card sx={{ width: 400, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar
              src={userInfo.photoURL}
              alt="Profile"
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Typography variant="h5" fontWeight="bold">
              {isEditing ? (
                <TextField
                  variant="outlined"
                  name="displayName"
                  value={userInfo.displayName}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              ) : (
                userInfo.displayName || 'Your Name'
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userInfo.email}
            </Typography>
          </Box>

          <Box mt={2}>
            {isEditing ? (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSave}
              >
                Save Changes
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleEditToggle}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
