import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Fab, Badge, Zoom, Slide, useTheme, useMediaQuery } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatWindow from './ChatWindow';
import { useAppContext } from '../../contexts/AppContext';
import {
  sendAssistantMessage,
  getAssistantSuggestions,
  type AssistantSource,
  type AssistantMessage,
} from '../../api';

interface StoredMessage extends AssistantMessage {
  sources?: AssistantSource[];
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = 'assistant-fab-position';

const FloatingAssistant: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { currentPage, currentStock, currentFund, getStructuredContext } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Drag state
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: isMobile ? 16 : 24, y: isMobile ? 16 : 24 };
      }
    }
    return { x: isMobile ? 16 : 24, y: isMobile ? 16 : 24 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const hasDragged = useRef(false);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  // Ensure position stays within viewport on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 70),
        y: Math.min(prev.y, window.innerHeight - 70),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    hasDragged.current = false;
    setIsDragging(true);
  }, [position]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return;

    const deltaX = dragRef.current.startX - clientX;
    const deltaY = dragRef.current.startY - clientY;

    // Only consider it a drag if moved more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDragged.current = true;
    }

    const newX = Math.max(10, Math.min(window.innerWidth - 70, dragRef.current.startPosX + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.startPosY + deltaY));

    setPosition({ x: newX, y: newY });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Chat window style: always fixed at bottom-right corner
  const getChatWindowStyle = useCallback((): React.CSSProperties => ({
    position: 'fixed',
    right: 16,
    bottom: 80,  // Above the FAB area
  }), []);

  // Get structured context for API calls
  const context = getStructuredContext();

  // Load suggestions when context changes
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const result = await getAssistantSuggestions(context);
        setSuggestions(result.suggestions || []);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
        // Fallback suggestions
        setSuggestions([
          currentStock ? `${currentStock.name}最近有什么消息？` : '今天市场怎么样？',
          '有什么投资机会？',
          '分析一下当前的风险',
        ]);
      }
    };

    if (isOpen || messages.length === 0) {
      loadSuggestions();
    }
  }, [currentPage, currentStock?.code, currentFund?.code, isOpen]);

  // Handle sending message
  const handleSendMessage = useCallback(async (message: string) => {
    // Add user message
    const userMessage: StoredMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history from previous messages (limit to last 6)
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call API
      const response = await sendAssistantMessage({
        message,
        context,
        history,
      });

      // Add assistant response
      const assistantMessage: StoredMessage = {
        role: 'assistant',
        content: response.response,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update suggestions if provided
      if (response.suggested_questions && response.suggested_questions.length > 0) {
        setSuggestions(response.suggested_questions);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: StoredMessage = {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后重试。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, context]);

  // Handle open
  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
  };

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Handle minimize
  const handleMinimize = () => {
    setIsMinimized(true);
  };

  // Handle restore from minimized
  const handleRestore = () => {
    // Don't open if we just finished dragging
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    if (isMinimized) {
      setIsMinimized(false);
      setHasUnread(false);
    } else {
      handleOpen();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        right: position.x,
        bottom: position.y,
        zIndex: 1200,
      }}
    >
      {/* Chat window */}
      <Slide direction="up" in={isOpen && !isMinimized} mountOnEnter unmountOnExit>
        <Box sx={{ ...getChatWindowStyle() }}>
          <ChatWindow
            messages={messages}
            context={context}
            suggestions={suggestions}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onClose={handleClose}
            onMinimize={handleMinimize}
          />
        </Box>
      </Slide>

      {/* Floating action button */}
      <Zoom in={!isOpen || isMinimized}>
        <Badge
          badgeContent={hasUnread ? '!' : 0}
          color="error"
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              right: 6,
              top: 6,
              minWidth: 18,
              height: 18,
              fontSize: '0.7rem',
            },
          }}
        >
          <Fab
            ref={fabRef}
            color="primary"
            onClick={handleRestore}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
              width: 56,
              height: 56,
              boxShadow: theme.shadows[6],
              cursor: isDragging ? 'grabbing' : 'grab',
              '&:hover': {
                transform: isDragging ? 'none' : 'scale(1.05)',
                boxShadow: theme.shadows[12],
              },
              transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
              touchAction: 'none', // Prevent scrolling while dragging
            }}
          >
            <SmartToyIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Badge>
      </Zoom>

      {/* Context indicator on button (when minimized with context) */}
      {isMinimized && (currentStock || currentFund) && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 52,
            bgcolor: 'background.paper',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            boxShadow: 1,
            fontSize: '0.7rem',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentStock?.name || currentFund?.name}
        </Box>
      )}
    </Box>
  );
};

export default FloatingAssistant;
