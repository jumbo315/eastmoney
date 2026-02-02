import React from 'react';
import { Box, Typography, Paper, Avatar, Chip, Stack, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { AssistantSource } from '../../api';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: AssistantSource[];
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  sources,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const isUser = role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 32,
            height: 32,
            mt: 0.5,
          }}
        >
          <SmartToyIcon sx={{ fontSize: 18 }} />
        </Avatar>
      )}

      {/* Message bubble */}
      <Paper
        elevation={0}
        sx={{
          maxWidth: '80%',
          p: 1.5,
          borderRadius: 2,
          bgcolor: isUser ? '#e0e7ff' : 'grey.100',
          color: isUser ? '#3730a3' : 'text.primary',
        }}
      >
        {/* Loading indicator */}
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                '& > span': {
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'text.secondary',
                  animation: 'pulse 1.4s ease-in-out infinite',
                },
                '& > span:nth-of-type(1)': { animationDelay: '0s' },
                '& > span:nth-of-type(2)': { animationDelay: '0.2s' },
                '& > span:nth-of-type(3)': { animationDelay: '0.4s' },
                '@keyframes pulse': {
                  '0%, 80%, 100%': { opacity: 0.3 },
                  '40%': { opacity: 1 },
                },
              }}
            >
              <span />
              <span />
              <span />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('assistant.thinking', 'Thinking...')}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Message content */}
            {isUser ? (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
              >
                {content}
              </Typography>
            ) : (
              <Box
                sx={{
                  '& p': {
                    m: 0,
                    mb: 1,
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    '&:last-child': { mb: 0 },
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    mt: 1.5,
                    mb: 1,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    '&:first-of-type': { mt: 0 },
                  },
                  '& h1': { fontSize: '1.25rem' },
                  '& h2': { fontSize: '1.125rem' },
                  '& h3': { fontSize: '1rem' },
                  '& h4, & h5, & h6': { fontSize: '0.875rem' },
                  '& ul, & ol': {
                    m: 0,
                    mb: 1,
                    pl: 2.5,
                    '&:last-child': { mb: 0 },
                  },
                  '& li': {
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    mb: 0.5,
                    '&:last-child': { mb: 0 },
                  },
                  '& code': {
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    bgcolor: 'rgba(0, 0, 0, 0.06)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  },
                  '& pre': {
                    m: 0,
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'grey.800',
                    overflow: 'auto',
                    '&:last-child': { mb: 0 },
                    '& code': {
                      p: 0,
                      bgcolor: 'transparent',
                      color: 'grey.100',
                      fontSize: '0.8rem',
                    },
                  },
                  '& blockquote': {
                    m: 0,
                    mb: 1,
                    pl: 2,
                    borderLeft: '3px solid',
                    borderColor: 'grey.400',
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    '&:last-child': { mb: 0 },
                  },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    mb: 1,
                    fontSize: '0.875rem',
                    '&:last-child': { mb: 0 },
                  },
                  '& th, & td': {
                    border: '1px solid',
                    borderColor: 'grey.300',
                    p: 0.75,
                    textAlign: 'left',
                  },
                  '& th': {
                    bgcolor: 'grey.200',
                    fontWeight: 600,
                  },
                  '& hr': {
                    border: 'none',
                    borderTop: '1px solid',
                    borderColor: 'grey.300',
                    my: 1.5,
                  },
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'primary.main' }}
                      >
                        {children}
                      </Link>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </Box>
            )}

            {/* Sources */}
            {sources && sources.length > 0 && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  {t('assistant.sources', 'Sources')}:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {sources.map((source, index) => (
                    <Chip
                      key={index}
                      label={source.title}
                      size="small"
                      variant="outlined"
                      component={source.url ? 'a' : 'span'}
                      href={source.url || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable={!!source.url}
                      icon={source.url ? <OpenInNewIcon sx={{ fontSize: 12 }} /> : undefined}
                      sx={{
                        fontSize: '0.7rem',
                        height: 24,
                        mb: 0.5,
                        '& .MuiChip-label': {
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Avatar for user */}
      {isUser && (
        <Avatar
          sx={{
            bgcolor: 'grey.300',
            width: 32,
            height: 32,
            mt: 0.5,
          }}
        >
          <PersonIcon sx={{ fontSize: 18 }} />
        </Avatar>
      )}
    </Box>
  );
};

export default ChatMessage;
