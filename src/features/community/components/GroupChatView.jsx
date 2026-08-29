"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Hash, Code, Trash2, Users, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DEFAULT_CHAT_ROOMS,
  subscribeChatRooms,
  subscribeChatMessages,
  sendChatMessage,
  deleteChatMessage,
} from "../services/communityService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  useEffect(() => {
    if (initialRoomId) {
      const match = rooms.find((r) => r.id === initialRoomId);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing selection from a prop-driven initial id
      if (match) setSelectedRoom(match);
    }
  }, [initialRoomId, rooms]);

  useEffect(() => {
    const unsubRooms = subscribeChatRooms((fetchedRooms) => {
      setRooms(fetchedRooms);
    });
    return () => unsubRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoom?.id) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting load state before a real-time Firestore subscription
    setLoading(true);
    const unsubMessages = subscribeChatMessages(selectedRoom.id, (fetchedMsgs) => {
      setMessages(fetchedMsgs);
      setLoading(false);
    });

    return () => unsubMessages();
  }, [selectedRoom?.id]);

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
      if (process.env.NODE_ENV !== "production") console.error(err);
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
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border md:h-[680px] md:flex-row">
      {/* Channels Sidebar */}
      <div className="border-b border-border bg-muted/30 p-3 md:w-64 md:border-r md:border-b-0">
        <p className="mb-2 px-1 text-xs font-extrabold tracking-wide text-muted-foreground">
          PUBLIC CHANNELS
        </p>

        <div className="flex flex-col gap-0.5">
          {rooms.map((room) => {
            const isSelected = selectedRoom.id === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm",
                  isSelected ? "bg-primary font-extrabold text-primary-foreground" : "font-semibold text-foreground hover:bg-muted"
                )}
              >
                <Hash className="size-4 shrink-0" />
                {room.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border p-3 px-4">
          <div className="flex items-center gap-2.5">
            <Hash className="size-5 text-primary" />
            <div>
              <p className="text-[1.05rem] font-extrabold">#{selectedRoom.name}</p>
              <p className="text-xs text-muted-foreground">{selectedRoom.description}</p>
            </div>
          </div>

          <Badge variant="outline" className="gap-1.5 font-semibold text-emerald-600">
            <Users className="size-3.5" />
            Live Public Room
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {loading ? (
            <div className="m-auto">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="m-auto py-10 text-center text-muted-foreground">
              <p className="font-bold">Welcome to #{selectedRoom.name}!</p>
              <p className="text-sm">This room is empty. Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = currentUser?.uid === msg.authorId;
              return (
                <div key={msg.id} className={cn("flex items-start gap-2.5", isMine && "flex-row-reverse")}>
                  <Avatar className="size-8.5">
                    <AvatarImage src={msg.authorPhoto || undefined} />
                    <AvatarFallback className="text-xs">{msg.authorName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>

                  <div className="max-w-[75%]">
                    <div className={cn("mb-1 flex items-center gap-1.5", isMine && "flex-row-reverse")}>
                      <span className="text-xs font-bold">{msg.authorName || "Anonymous"}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {msg.createdAt?.toDate ? formatDistanceToNow(msg.createdAt.toDate()) + " ago" : "Just now"}
                      </span>
                      {isMine && (
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2 text-sm",
                        isMine ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted"
                      )}
                    >
                      <p className="wrap-break-word whitespace-pre-wrap">{msg.text}</p>

                      {msg.codeSnippet && (
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-black/10 p-2.5 font-mono text-xs">
                          <code>{msg.codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-border p-3">
          {showCodeInput && (
            <Textarea
              rows={3}
              placeholder="// Paste code snippet..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="mb-2 font-mono text-sm"
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={showCodeInput ? "text-primary" : "text-muted-foreground"}
              onClick={() => setShowCodeInput(!showCodeInput)}
            >
              <Code />
            </Button>

            <Input
              placeholder={`Message #${selectedRoom.name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />

            <Button type="submit" disabled={sending || (!inputMessage.trim() && !codeSnippet.trim())}>
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChatView;
