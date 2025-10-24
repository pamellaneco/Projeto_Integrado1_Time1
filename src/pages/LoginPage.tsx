import React, { useState } from 'react';
import { Box, TextField, Button, Container } from '@mui/material';
import Forms from '../components/Forms';

declare global {
  interface Window {
    auth: {
      login: (email: string, senha: string) => Promise<{ ok: boolean; token?: string; error?: string }>;
    };
  }
}


export default function LoginPage() {
const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await window.auth.login(email, senha)
      if (res.ok) {
        if (res.token) localStorage.setItem('auth_token', res.token);

        window.location.hash = '/dashboard';
        return;
      } else {
        alert('Erro no login: ' + res.error)
      }
    } catch (err) {
      console.error(err)
      alert('Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

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
      <Box sx={{ flex: 3, backgroundColor: '#3A5566', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Container sx={{ padding: 4, width: '80%', maxWidth: 400 }}>
          <Forms title="Login">
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
            <Button
              variant="contained"
              disabled={loading}
              onClick={handleLogin}
              sx={{
                backgroundColor: 'white',
                color: '#1D2B33',
                '&:hover': { backgroundColor: '#f9f0f0' }
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Forms>
        </Container>
      </Box>

      <Box sx={{ flex: 2, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="src\\resources\\logo-login.svg" alt="Logo" style={{ maxWidth: '70%', maxHeight: '70%' }} />
      </Box>
    </Box>
  );
}