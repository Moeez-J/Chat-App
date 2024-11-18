import React, { useState } from 'react';
import { Box, IconButton, Menu as MuiMenu, MenuItem, Modal } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutButton from '../Profile/LogoutButton';
import Profile from '../Profile/Profile';

const Menu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Anchor for the menu
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // Toggle profile modal

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleProfile = (): void => {
    setIsProfileOpen(true);
    handleMenuClose(); // Close the menu when opening the profile
  };

  const handleCloseProfile = (): void => {
    setIsProfileOpen(false);
  };

  return (
    <>
      <IconButton onClick={handleMenuClick} color="inherit">
        <MoreVertIcon />
      </IconButton>
      <MuiMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem>
          <LogoutButton />
        </MenuItem>
      </MuiMenu>

      {/* Profile Modal */}
      <Modal open={isProfileOpen} onClose={handleCloseProfile}>
        <Box>
          <Profile />
        </Box>
      </Modal>
    </>
  );
};

export default Menu;
