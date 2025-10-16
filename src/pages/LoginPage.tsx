import React from 'react';
import { Box, TextField, Button, Container } from '@mui/material';
import Forms from '../components/Forms';


export default function LoginPage() {

    const textFieldStyle = {
        '& label.Mui-focused': {
            color: 'white',
        },
        '& .MuiInputLabel-root': {
            color: 'white',
        },
        '& .MuiInputBase-input': {
            color: 'white',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'white',
            },
            '&:hover fieldset': {
                borderColor: '#ccebff',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'white',
            },
        },
    };


    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <Box
                sx={{
                    flex: 3,
                    backgroundColor: '#3A5566',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Container
                    sx={{
                        padding: 4,
                        width: '80%',
                        maxWidth: 400,
                    }}
                >
                    <Forms title="Login">

                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            sx={textFieldStyle}
                        />
                        <TextField
                            label="Senha"
                            type="password"
                            variant="outlined"
                            fullWidth
                            sx={textFieldStyle}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: 'white',  
                                color: '#1D2B33',         
                                '&:hover': {               
                                    backgroundColor: '#f9f0f0' 
                                }
                            }}
                        >
                            Entrar
                        </Button>

                    </Forms>
                </Container>
            </Box>

            <Box
                sx={{
                    flex: 2,
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <img
                    src="src\resources\logo-login.svg"
                    alt="Logo"
                    style={{ maxWidth: '70%', maxHeight: '70%' }}
                />
            </Box>
        </Box>
    );
}