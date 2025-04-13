import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const CustomButton = styled(Button)(({ bgimage }: { bgimage: string }) => ({
    position: 'relative',
    justifyContent: 'flex-start',
    color: 'white',
    padding: '10px 20px',
    height: '120px',
    borderRadius: '8px',
    backgroundColor: '#152b4a',
    opacity: 0.6,
    overflow: 'hidden', // Ensure the background stays within bounds
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -50,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("${bgimage}")`, // Replace with your image path
      backgroundSize: '200px',
      backgroundPosition: 'right',
      backgroundPositionX: '100%',
      backgroundPositionY: '30%',
      backgroundRepeat: 'no-repeat',
      transform: 'rotate(15deg)', // Rotate only the background
      opacity: 0.6,
      zIndex: -1, // Keep it behind the button content
    },
    '&:hover': {
      backgroundColor: '#152b4a',
      opacity: 0.9,
      color: 'white',
    },
  }));      