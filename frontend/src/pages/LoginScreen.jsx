import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Link, Alert } from '@mui/material';
import { Calendar, CheckCircle, Recycle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ onIrCadastro }) {
  const { login } = useAuth();
  const [loginData, setLoginData] = useState({
    email: '',
    senha: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!loginData.email.trim() || !loginData.senha) {
      setErro('Informe e-mail e senha.');
      return;
    }

    setCarregando(true);
    try {
      await login(loginData.email.trim(), loginData.senha);
      // ao logar, o AuthContext atualiza `autenticado` e o App.jsx
      // troca automaticamente para as telas privadas.
    } catch (err) {
      setErro(err.message || 'Nao foi possivel entrar.');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #2b7430 100%)' }}>
      {/* Lateral Esquerda - Sobre o Projeto E-Waster */}
      <Box
        className="w-[28%] text-white p-8 flex flex-col justify-start"
        sx={{
          background: 'linear-gradient(160deg, #2E7D32 0%, #2a7230 100%)'
        }}
      >
        <div className="mb-8">
          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem', marginBottom: '4px' }}>
            E-Waster
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', opacity: 0.9 }}>
            Coleta Consciente
          </Typography>
        </div>

        <div className="mb-8">
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.3rem', lineHeight: 1.3, marginBottom: '16px' }}>
            Descarte certo.
            <br />
            Planeta melhor.
          </Typography>
        </div>

        <div className="space-y-4">
          <Box>
            <Typography sx={{ fontSize: '0.85rem', marginBottom: '8px' }}>
              • Junte o lixo eletrônico!
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.5, marginLeft: '12px' }}>
              Separe celulares, computadores, cabos, pilhas e vidros aparelhos sem uso.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.85rem', marginBottom: '8px' }}>
              • Agende a coleta!
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.5, marginLeft: '12px' }}>
              Agende o horário em um ponto de coleta disponível.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.85rem', marginBottom: '8px' }}>
              • Descarte corretamente!
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.5, marginLeft: '12px' }}>
              Garanta que os resíduos sejam reciclados e tenham um destino sustentável.
            </Typography>
          </Box>
        </div>
      </Box>

      {/* Centro - Formulário de Login */}
      <Box
        className="w-[44%] flex items-center justify-center px-16"
        sx={{
          backgroundColor: '#ffffff'
        }}
      >
        <Box className="w-full max-w-sm">
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, marginBottom: '8px', color: '#1f2937', fontSize: '1.75rem' }}
          >
            Bem-vindo de volta
          </Typography>
          <Typography sx={{ color: '#6b7280', marginBottom: '40px', fontSize: '0.95rem' }}>
            Acesse sua conta para continuar
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box className="mb-5">
              <Typography sx={{ marginBottom: '8px', color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>
                E-mail
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2E7D32',
                    },
                  },
                }}
              />
            </Box>

            <Box className="mb-6">
              <Typography sx={{ marginBottom: '8px', color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>
                Senha
              </Typography>
              <TextField
                fullWidth
                name="senha"
                type="password"
                value={loginData.senha}
                onChange={handleChange}
                placeholder="Sua senha"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2E7D32',
                    },
                  },
                }}
              />
            </Box>

            {erro && (
              <Alert severity="error" sx={{ marginBottom: '16px', borderRadius: '12px' }}>
                {erro}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={carregando}
              sx={{
                background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #27632A 0%, #2E7D32 100%)'
                },
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                paddingY: '12px',
                marginBottom: '20px',
                borderRadius: '12px'
              }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>

            <Box className="text-center mb-6">
              <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Não tem conta?{' '}
                <Link
                  component="button" onClick={onIrCadastro}
                  sx={{
                    color: '#2E7D32',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Cadastre-se
                </Link>
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '12px 16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #bbf7d0'
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#166534' }}>
                Conta de teste: <span style={{ fontFamily: 'monospace' }}>eito@email.com / 123456</span>
              </Typography>
            </Box>
          </form>
        </Box>
      </Box>

      {/* Lateral Direita - Descarte de Lixo Eletrônico */}
      <Box
        className="w-[28%] p-8 flex flex-col"
        sx={{
          background: 'linear-gradient(200deg, #2E7D32 0%, #2b7530 100%)'
        }}
      >
        <div className="flex-1">
          <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: '12px', color: '#ffffff', fontSize: '1.15rem' }}>
            Descarte de Lixo Eletrônico
          </Typography>

          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '20px', lineHeight: 1.6 }}>
            O lixo eletrônico contém substâncias tóxicas que podem contaminar o solo e a água quando descartados incorretamente.
          </Typography>

          <div className="space-y-3 mb-6">
            <Box className="flex items-start gap-3">
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px'
                }}
              >
                <Trash2 size={16} style={{ color: '#81C784' }} />
              </Box>
              <div>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  Metais Pesados
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                  Chumbo, mercúrio e cádmio
                </Typography>
              </div>
            </Box>

            <Box className="flex items-start gap-3">
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px'
                }}
              >
                <Recycle size={16} style={{ color: '#81C784' }} />
              </Box>
              <div>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  Reciclagem
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                  95% dos materiais são reutilizáveis
                </Typography>
              </div>
            </Box>

            <Box className="flex items-start gap-3">
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px'
                }}
              >
                <Calendar size={16} style={{ color: '#81C784' }} />
              </Box>
              <div>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  Impacto Ambiental
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                  Reduz emissão de CO₂
                </Typography>
              </div>
            </Box>
          </div>

          {/* Espaço para vídeo em loop */}
          <Box
            sx={{
              borderRadius: '8px',
              overflow: 'hidden',
              minHeight: '220px',
              position: 'relative',
              backgroundColor: '#000'
            }}
          >
            <video
              width="100%"
              height="100%"
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{
                display: 'block',
                objectFit: 'cover'
              }}
            >
              <source src="/video-coleta-fim.mp4" type="video/mp4" />
              Seu navegador não suporta vídeo.
            </video>

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                pointerEvents: 'none'
              }}
            >
              <Recycle size={36} style={{ marginBottom: '6px', opacity: 0.7 }} />
            </Box>
          </Box>
        </div>
      </Box >
    </div >
  );
}
