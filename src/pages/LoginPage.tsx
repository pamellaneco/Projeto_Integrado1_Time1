import React, { useState } from 'react';
import { Box, TextField, Button, Container, Typography, Alert } from '@mui/material';
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
  
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await window.auth.login(email, senha);
      
      if (res.ok) {
        if (res.token) localStorage.setItem('auth_token', res.token);
        window.location.hash = '/dashboard';
        return;
      } else {
        setError(res.error || 'Erro desconhecido ao tentar logar.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setError(null);
    setter(value);
  };

  const textFieldStyle = {
    '& label.Mui-focused': { color: 'white' },
    '& .MuiInputLabel-root': { color: 'white' },
    '& .MuiInputBase-input': { color: 'white' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'white' },
      '&:hover fieldset': { borderColor: '#ccebff' },
      '&.Mui-focused fieldset': { borderColor: 'white' },
    },
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Box sx={{ flex: 3, backgroundColor: '#3A5566', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Container sx={{ padding: 4, width: '80%', maxWidth: 400 }}>
          <Forms title="Login">
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
              value={email}
              onChange={e => handleInputChange(setEmail, e.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
              value={senha}
              onChange={e => handleInputChange(setSenha, e.target.value)}
            />
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              onClick={handleLogin}
              sx={{
                backgroundColor: 'white',
                color: '#1D2B33',
                '&:hover': { backgroundColor: '#f9f0f0' },
                mt: 2
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Forms>
        </Container>
      </Box>

      <Box sx={{ flex: 2, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="src/resources/logo-login.svg" alt="Logo" style={{ maxWidth: '70%', maxHeight: '70%' }} />
      </Box>
    </Box>
  );
}