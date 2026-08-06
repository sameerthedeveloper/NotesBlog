import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Avatar,
  TextField,
  IconButton,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tooltip,
  Divider
} from "@mui/material";
import {
  Send as SendIcon,
  Tag as ChannelIcon,
  Code as CodeIcon,
  DeleteOutline as DeleteIcon,
  Group as GroupIcon
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import {
  DEFAULT_CHAT_ROOMS,
  subscribeChatRooms,
  subscribeChatMessages,
  sendChatMessage,
  deleteChatMessage
} from "../services/communityService";
import toast from "react-hot-toast";

const GroupChatView = ({ currentUser, userProfile, initialRoomId = null }) => {
  const [rooms, setRooms] = useState(DEFAULT_CHAT_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState(
    DEFAULT_CHAT_ROOMS.find((r) => r.id === initialRoomId) || DEFAULT_CHAT_ROOMS[0]
  );
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inputMessage, setInputMessage] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Sync selectedRoom if initialRoomId prop changes
  useEffect(() => {
    if (initialRoomId) {
      const match = rooms.find((r) => r.id === initialRoomId);
      if (match) setSelectedRoom(match);
    }
  }, [initialRoomId, rooms]);

  // Subscribe to room list
  useEffect(() => {
    const unsubRooms = subscribeChatRooms((fetchedRooms) => {
      setRooms(fetchedRooms);
    });
    return () => unsubRooms();
  }, []);

  // Subscribe to messages in current room
  useEffect(() => {
    if (!selectedRoom?.id) return;

    setLoading(true);
    const unsubMessages = subscribeChatMessages(selectedRoom.id, (fetchedMsgs) => {
      setMessages(fetchedMsgs);
      setLoading(false);
    });

    return () => unsubMessages();
  }, [selectedRoom?.id]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !codeSnippet.trim()) return;

    if (!currentUser) {
      toast.error("Please login to join the group chat.");
      return;
    }

    setSending(true);
    try {
      await sendChatMessage(selectedRoom.id, inputMessage, codeSnippet, userProfile);
      setInputMessage("");
      setCodeSnippet("");
      setShowCodeInput(false);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await deleteChatMessage(msgId);
      toast.success("Message deleted.");
    } catch {
      toast.error("Failed to delete message.");
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: { xs: "auto", md: "680px" }
      }}
    >
      {/* Channels Sidebar */}
      <Box
        sx={{
          width: { xs: "100%", md: "260px" },
          borderRight: { md: "1px solid" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          p: 2
        }}
      >
        <Typography variant="overline" fontWeight={800} color="text.secondary" px={1} mb={1} display="block">
          PUBLIC CHANNELS
        </Typography>

        <Stack spacing={0.5}>
          {rooms.map((room) => {
            const isSelected = selectedRoom.id === room.id;
            return (
              <Button
                key={room.id}
                fullWidth
                variant={isSelected ? "contained" : "text"}
                color={isSelected ? "primary" : "inherit"}
                startIcon={<ChannelIcon />}
                onClick={() => setSelectedRoom(room)}
                sx={{
                  justifyContent: "flex-start",
                  borderRadius: 2.5,
                  fontWeight: isSelected ? 800 : 600,
                  textTransform: "none",
                  px: 2,
                  py: 1
                }}
              >
                #{room.name}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* Main Chat Stream */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Channel Top Header */}
        <Box
          sx={{
            p: 2,
            px: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ChannelIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={800} fontSize="1.05rem">
                #{selectedRoom.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedRoom.description}
              </Typography>
            </Box>
          </Stack>

          <Chip
            icon={<GroupIcon sx={{ fontSize: "16px !important" }} />}
            label="Live Public Room"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          />
        </Box>

        {/* Message Stream */}
        <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: "auto" }}>
              <CircularProgress size={32} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: "center", my: "auto", color: "text.secondary", py: 6 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Welcome to #{selectedRoom.name}!
              </Typography>
              <Typography variant="body2">
                This room is empty. Send a message to start the conversation.
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => {
              const isMine = currentUser?.uid === msg.authorId;
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                    flexDirection: isMine ? "row-reverse" : "row"
                  }}
                >
                  <Avatar
                    src={msg.authorPhoto}
                    sx={{ width: 34, height: 34, bgcolor: "primary.main", fontWeight: 700, fontSize: "0.85rem" }}
                  >
                    {msg.authorName?.charAt(0) || "U"}
                  </Avatar>

                  <Box sx={{ maxWidth: "75%" }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={0.5}
                      justifyContent={isMine ? "flex-end" : "flex-start"}
                    >
                      <Typography variant="caption" fontWeight={700} color="text.primary">
                        {msg.authorName || "Anonymous"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        {msg.createdAt?.toDate ? formatDistanceToNow(msg.createdAt.toDate()) + " ago" : "Just now"}
                      </Typography>
                      {isMine && (
                        <IconButton size="small" onClick={() => handleDeleteMessage(msg.id)} sx={{ p: 0.2 }}>
                          <DeleteIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        </IconButton>
                      )}
                    </Stack>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        px: 2.2,
                        borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        bgcolor: isMine
                          ? "primary.main"
                          : (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        color: isMine ? "primary.contrastText" : "text.primary"
                      }}
                    >
                      <Typography variant="body2" sx={{ whitespace: "pre-wrap", wordBreak: "break-word" }}>
                        {msg.text}
                      </Typography>

                      {msg.codeSnippet && (
                        <Box
                          component="pre"
                          sx={{
                            p: 1.5,
                            mt: 1,
                            borderRadius: 2,
                            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.08)",
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            overflowX: "auto"
                          }}
                        >
                          <code>{msg.codeSnippet}</code>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Composer */}
        <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          {showCodeInput && (
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="// Paste code snippet..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontFamily: "monospace",
                  fontSize: "0.85rem"
                }
              }}
            />
          )}

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Attach Code Snippet">
              <IconButton color={showCodeInput ? "primary" : "default"} onClick={() => setShowCodeInput(!showCodeInput)}>
                <CodeIcon />
              </IconButton>
            </Tooltip>

            <TextField
              fullWidth
              size="small"
              placeholder={`Message #${selectedRoom.name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={sending || (!inputMessage.trim() && !codeSnippet.trim())}
              sx={{ borderRadius: 3, px: 2.5, height: 40 }}
            >
              {sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default GroupChatView;
