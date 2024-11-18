import React, { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { uploadFileToS3 } from '../../utils/awsconfig'; // Import S3 utility
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let photoURL = '';
      if (photoFile) {
        photoURL = await uploadFileToS3(photoFile); // Upload photo to AWS S3
      }

      await updateProfile(user, { displayName, photoURL });

      // Save user details to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName,
        email,
        photoURL,
      });

      navigate('/');
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)',
        height: '98vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: { xs: '100%', sm: '400px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #34a853, #4285f4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          mb={3}
        >
          Register
        </Typography>
        <form
          onSubmit={handleRegister}
          style={{
            width: '100%',
            maxWidth: '250px', // Restrict form content to a smaller width
            margin: '0 auto', // Center align the form content
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={3}
          >
            <TextField
              type="text"
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              variant="outlined"
              required
              fullWidth
            />
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              required
              fullWidth
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              required
              fullWidth
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                mt: 2,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)',
                color: '#fff',
              }}
            >
              Upload Profile Picture
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #34a853, #1a73e8)',
                fontSize: '16px',
                color: '#fff',
              }}
            >
              Register
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
