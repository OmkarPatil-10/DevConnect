require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express()
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.CLIENT_BASE_URL, // e.g. "https://developer-pairing-app-frontend.vercel.app"
].filter(Boolean); // remove undefined/null

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      const isAllowed = allowedOrigins.includes(origin) || !origin || origin.endsWith('.vercel.app') || (origin && origin.startsWith('http://localhost:'));
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling'] // Server still allows both, but client will force websocket
  }
});

const port = process.env.PORT || 3000
const authRouter = require('./routes/auth/auth-routes');
const matchRouter = require('./routes/match');
const sprintRouter = require('./routes/sprint-routes');
const taskRouter = require('./routes/task-routes');
const msgRouter = require('./routes/msg-routes');
const directMessageRouter = require('./routes/direct-message-routes');

const DB_NAME = 'devConnect'

mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
.then(() => console.log('Connected to MongoDB'))
 .catch(err => console.error(err));

// Configure CORS first
// Configure CORS first
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    // Check against allowed origins or allow if in development
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production' || (origin && origin.startsWith('http://localhost:'))) {
      return callback(null, true);
    }
    
    // For Vercel deployments, we might need to be more permissive or ensure CLIENT_BASE_URL is set correctly
    // Temporary allow all for debugging if needed, but best to rely on env vars.
    // However, since user reported issues, let's log and allow dynamic vercel origins if consistent with our app
    if (origin.endsWith('.vercel.app')) {
       return callback(null, true);
    }

    console.log("❌ CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Configure body-parser with increased limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint for keep-alive pings (prevents Render free tier spin-down)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/api/auth",authRouter);

// Add match route
app.use('/api/match', matchRouter);

// Add sprint route
app.use('/api/sprint', sprintRouter);

//add task route
app.use('/api/tasks',taskRouter);

//add message route
app.use('/api/message', msgRouter);

//add direct message route
app.use('/api/direct-messages', directMessageRouter);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle authentication
  socket.on('authenticate', (data) => {
    try {
      const jwt = require('jsonwebtoken');
      const token = data.token;
      const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
      socket.userId = decoded.id;
      socket.username = decoded.username;
      console.log(`User authenticated: ${socket.username} (${socket.userId})`);
      socket.emit('authenticated');
    } catch (error) {
      console.error('Authentication failed:', error);
      socket.emit('authError', { error: 'Authentication failed' });
    }
  });

  // Join a sprint room
  socket.on('joinSprint', (sprintId) => {
    socket.join(`sprint_${sprintId}`);
    socket.sprintId = sprintId; // Store sprint ID for cleanup
    console.log(`User ${socket.id} joined sprint room: sprint_${sprintId}`);
    
    // Notify others in the room that a user joined
    socket.to(`sprint_${sprintId}`).emit('userJoined', { 
      userId: socket.userId,
      username: socket.username 
    });
  });

  // Handle sending a message
  socket.on('sendMessage', async (data) => {
    try {
      // Save message to database
      const Message = require('./models/Message');
      const Sprint = require('./models/Sprint');
      const sprint = await Sprint.findById(data.sprintId);
      if (!sprint) {
        socket.emit('messageError', { error: 'Sprint not found' });
        return;
      }
      const isClosed =
        sprint.isFinished ||
        sprint.isActive === false ||
        (sprint.endDate && new Date(sprint.endDate) < new Date());
      if (isClosed) {
        socket.emit('messageError', { error: 'Sprint has ended' });
        return;
      }
      
      const message = await Message.create({
        sprint: data.sprintId,
        sender: data.senderId,
        text: data.text,
        timestamp: new Date()
      });

      // Add message to sprint's messages array
      await Sprint.findByIdAndUpdate(data.sprintId, { $push: { messages: message._id } });

      // Populate sender info
      const populatedMessage = await Message.findById(message._id).populate('sender', 'username email');

      // Broadcast the message to all users in the sprint room
      io.to(`sprint_${data.sprintId}`).emit('newMessage', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle sending direct message
  socket.on('sendDirectMessage', async (data) => {
    try {
      const DirectMessage = require('./models/DirectMessage');
      const Conversation = require('./models/Conversation');
      
      // Create message
      const message = await DirectMessage.create({
        conversation: data.conversationId,
        sender: data.senderId,
        recipient: data.recipientId,
        text: data.text,
        timestamp: new Date()
      });

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: message._id,
        lastMessageTime: message.timestamp
      });

      // Populate message data
      await message.populate([
        { path: 'sender', select: 'username email' },
        { path: 'recipient', select: 'username email' }
      ]);

      // Send to sender (for confirmation)
      socket.emit('directMessageSent', message);

      // Send to recipient
      socket.to(`user_${data.recipientId}`).emit('newDirectMessage', message);

    } catch (error) {
      console.error('Error sending direct message:', error);
      socket.emit('directMessageError', { error: 'Failed to send message' });
    }
  });

  // Handle joining user room for direct messages
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} joined user room: user_${userId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Notify others in the sprint room that user left
    if (socket.sprintId) {
      socket.to(`sprint_${socket.sprintId}`).emit('userLeft', { 
        userId: socket.userId,
        username: socket.username 
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
