import React, { useState, useContext, useEffect } from 'react';
import { db } from '../../services/firebase';
import { AuthContext } from '../../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { uploadFileToS3 } from '../../utils/awsconfig';

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
    displayName: '',
    email: '',
    photoURL: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserInfo;
          setUserInfo(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, files } = e.target;

    if (name === 'photo' && files && files[0]) {
      setPhotoFile(files[0]);
    } else {
      setUserInfo({ ...userInfo, [name]: value });
    }
  };

  const handleEditToggle = (): void => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (): Promise<void> => {
    if (!currentUser) return;

    try {
      setIsUploading(true);

      let photoURL = userInfo.photoURL;

      // Upload new photo if a file is selected
      if (photoFile) {
        photoURL = await uploadFileToS3(photoFile);
      }

      const updateData: { [key: string]: any } = {
        displayName: userInfo.displayName,
        photoURL,
      };

      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), updateData);

      // Update Firebase Auth currentUser
      await updateProfile(currentUser, {
        displayName: userInfo.displayName,
        photoURL,
      });

      // Update local state
      setUserInfo((prev) => ({ ...prev, photoURL }));
      setPhotoFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUploading(false);
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
              src={
                photoFile
                  ? URL.createObjectURL(photoFile)
                  : userInfo.photoURL || undefined
              }
              alt="Profile"
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    name="photo"
                    onChange={handleChange}
                  />
                </Button>
                <TextField
                  variant="outlined"
                  name="displayName"
                  value={userInfo.displayName}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  label="Display Name"
                />
              </>
            ) : (
              <>
                <Typography variant="h5" fontWeight="bold">
                  {userInfo.displayName || 'Your Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userInfo.email}
                </Typography>
              </>
            )}
          </Box>

          <Box mt={2}>
            {isEditing ? (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSave}
                disabled={isUploading}
              >
                {isUploading ? 'Saving...' : 'Save Changes'}
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
