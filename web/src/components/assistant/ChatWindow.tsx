import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Stack,
  Chip,
  Fade,
  Avatar,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SendIcon from '@mui/icons-material/Send';
import MinimizeIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatMessage from './ChatMessage';
import ContextBadge from './ContextBadge';
import type { AssistantSource, AssistantContext } from '../../api';

interface ChatWindowProps {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    sources?: AssistantSource[];
  }>;
  context: AssistantContext;
  suggestions?: string[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  onMinimize: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  context,
  suggestions = [],
  isLoading,
  onSendMessage,
  onClose,
  onMinimize,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  return (
    <Paper
      elevation={12}
      sx={{
        width: 400,
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 20px 40px -5px rgba(0,0,0,0.15)',
      }}
    >
      {/* Modern Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #f1f5f9',
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'transparent',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
            </Box>
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
              {t('assistant.title', 'FinCopilot')}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.2)' }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600 }}>
                ONLINE
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={onMinimize}
            sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9', color: '#64748b' } }}
          >
            <MinimizeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Context badge - Optional if context exists */}
      <ContextBadge
        stock={context.stock}
        fund={context.fund}
        page={context.page}
      />

      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2.5,
          bgcolor: '#f8fafc',
          backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Welcome message if no messages */}
        {messages.length === 0 && !isLoading && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <Box 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '24px', 
                  bgcolor: 'white', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 32, color: '#6366f1' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', mb: 1 }}>
                {t('assistant.welcome_title', 'How can I help you?')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 4, maxWidth: 280, mx: 'auto' }}>
                {t('assistant.welcome', 'Ask me about market trends, specific stocks, or portfolio analysis.')}
              </Typography>

              {/* Suggested questions */}
              {suggestions.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 2 }}>
                    {t('assistant.try_asking', 'SUGGESTIONS')}
                  </Typography>
                  <Stack spacing={1.5} alignItems="center">
                    {suggestions.map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: 'white',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          height: 32,
                          '&:hover': { 
                            bgcolor: 'white', 
                            borderColor: '#6366f1',
                            color: '#6366f1',
                            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.1)'
                          },
                          transition: 'all 0.2s',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {/* Message list */}
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <ChatMessage role="assistant" content="" isLoading />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: 1, 
            bgcolor: '#f1f5f9', 
            borderRadius: 3, 
            p: 0.75,
            pl: 2,
            transition: 'box-shadow 0.2s',
            '&:focus-within': {
                boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                bgcolor: 'white',
                border: '1px solid #e2e8f0'
            },
            border: '1px solid transparent'
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={3}
            variant="standard"
            placeholder={t('assistant.input_placeholder', 'Ask anything...')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            InputProps={{
                disableUnderline: true,
                sx: { 
                    fontSize: '0.9rem', 
                    color: '#334155',
                    py: 1
                }
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              bgcolor: inputValue.trim() ? '#6366f1' : '#e2e8f0',
              color: 'white',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: inputValue.trim() ? '#4f46e5' : '#e2e8f0' },
              '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' },
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? (
                <Box sx={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </Box>
            ) : (
                <SendIcon sx={{ fontSize: 18, ml: 0.2 }} />
            )}
          </IconButton>
        </Box>
        <Typography variant="caption" align="center" display="block" sx={{ mt: 1, color: '#94a3b8', fontSize: '0.65rem' }}>
            {t('assistant.disclaimer', 'AI can make mistakes. Please verify important information.')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ChatWindow;
