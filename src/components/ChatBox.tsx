'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  sender: {
    id: string
    name: string
    image?: string
  }
}

interface ChatBoxProps {
  bookingId: string
}

export default function ChatBox({ bookingId }: ChatBoxProps) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    const socketInstance = io()
    
    socketInstance.on('connect', () => {
      setIsConnected(true)
      socketInstance.emit('join-booking', bookingId)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('message-error', (error: { error: string }) => {
      console.error('Message error:', error)
    })

    setSocket(socketInstance)

    // Load existing messages
    loadMessages()

    return () => {
      socketInstance.emit('leave-booking', bookingId)
      socketInstance.close()
    }
  }, [bookingId, session?.user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !session?.user?.id) return

    socket.emit('send-message', {
      bookingId,
      senderId: session.user.id,
      content: newMessage.trim()
    })

    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === session?.user?.id
          
          return (
            <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                <Image
                  src={message.sender.image || '/default-avatar.png'}
                  alt={message.sender.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className={`mx-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                  <div className={`rounded-lg px-4 py-2 ${
                    isOwnMessage 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
