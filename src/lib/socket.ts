import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join booking room for real-time updates
      socket.on('join-booking', (bookingId: string) => {
        socket.join(`booking-${bookingId}`)
        console.log(`User joined booking room: booking-${bookingId}`)
      })

      // Leave booking room
      socket.on('leave-booking', (bookingId: string) => {
        socket.leave(`booking-${bookingId}`)
        console.log(`User left booking room: booking-${bookingId}`)
      })

      // Handle chat messages
      socket.on('send-message', async (data: {
        bookingId: string
        senderId: string
        content: string
      }) => {
        try {
          // Save message to database
          const message = await prisma.message.create({
            data: {
              bookingId: data.bookingId,
              senderId: data.senderId,
              content: data.content,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                }
              }
            }
          })

          // Broadcast to booking room
          io.to(`booking-${data.bookingId}`).emit('new-message', message)
        } catch (error) {
          console.error('Error saving message:', error)
          socket.emit('message-error', { error: 'Failed to send message' })
        }
      })

      // Handle booking status updates
      socket.on('update-booking-status', (data: {
        bookingId: string
        status: string
        userId: string
      }) => {
        // Broadcast status update to booking room
        io.to(`booking-${data.bookingId}`).emit('booking-status-updated', {
          bookingId: data.bookingId,
          status: data.status,
          updatedBy: data.userId,
          timestamp: new Date()
        })
      })

      // Handle location updates for real-time tracking
      socket.on('update-location', (data: {
        userId: string
        latitude: number
        longitude: number
        bookingId?: string
      }) => {
        if (data.bookingId) {
          io.to(`booking-${data.bookingId}`).emit('location-updated', {
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date()
          })
        }
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }
  res.end()
}
