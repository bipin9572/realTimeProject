It is the full explation of real time chat application.

### Step 1: Set Up the Backend (Node.js + Express.js)

#### 1.1 Install Dependencies

First, you need to initialize a Node.js project and install the necessary packages:
```bash
mkdir chat-app
cd chat-app
npm init -y
npm install express mongoose ws cors
```

- **express**: Web framework for Node.js.
- **mongoose**: MongoDB object modeling for Node.js.
- **ws**: WebSocket implementation.
- **cors**: Middleware to allow cross-origin resource sharing.

#### 1.2 Create the Server (`server.js`)

This file will handle the backend logic, including WebSocket connections and interaction with MongoDB.

```javascript
const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const cors = require('cors');

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chat', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a Message Schema
const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Create WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const parsedMessage = JSON.parse(message);
    const newMessage = new Message(parsedMessage);

    // Save message to MongoDB
    await newMessage.save();

    // Broadcast the message to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// API to get all messages
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// Start the Express server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

#### Explanation:
- **Express.js**: Handles HTTP requests and serves APIs.
- **WebSocket**: Manages real-time communication between the server and clients.
- **MongoDB/Mongoose**: Stores and retrieves chat messages.

### Step 2: Set Up the Frontend (React.js)

#### 2.1 Create the React App

If you haven't installed `create-react-app`, you can install it globally:
```bash
npm install -g create-react-app
```

Then, create a new React project:
```bash
npx create-react-app chat-client
cd chat-client
npm install axios
```

- **axios**: Used for making HTTP requests to the backend.

#### 2.2 Create the Chat Component (`Chat.js`)

This component will manage the user interface and handle interactions with the WebSocket server.

```javascript
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    // Load previous messages
    axios.get('http://localhost:5000/messages')
      .then(response => setMessages(response.data))
      .catch(err => console.error('Error fetching messages:', err));

    return () => ws.current.close();
  }, []);

  const sendMessage = () => {
    const message = { username, content: input };
    ws.current.send(JSON.stringify(message));
    setInput('');
  };

  return (
    <div>
      <h1>Chat Application</h1>
      <div>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
      </div>
      <div>
        <input 
          type="text" 
          placeholder="Type a message" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}: </strong>{msg.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
```

#### Explanation:
- **useState**: Manages the state of messages, input, and username.
- **useEffect**: Initializes WebSocket connection and fetches previous messages on component mount.
- **axios**: Fetches previous messages from the server.
- **WebSocket**: Sends and receives messages in real-time.

#### 2.3 Update `App.js` to Include Chat Component

In your `src/App.js`, update the code to render the `Chat` component:

```javascript
import React from 'react';
import Chat from './Chat';

function App() {
  return (
    <div className="App">
      <Chat />
    </div>
  );
}

export default App;
```

### Step 3: Running the Application

#### 3.1 Start the Backend Server

Run the following command to start the backend server:

```bash
node server.js
```

This will start the Express server on `http://localhost:5000` and the WebSocket server on `ws://localhost:8080`.

#### 3.2 Start the React Frontend

Navigate to the `chat-client` directory and start the React development server:

```bash
npm start
```



### Step 4: Testing the Application

Open multiple browser tabs or windows and start chatting. The messages should appear in real-time across all clients, demonstrating the WebSocket functionality.

### Step 5: Additional Features

Depending on your needs, you can extend the application with features such as:
- **User Authentication**: Secure the chat by adding user login and registration.
- **Typing Indicators**: Show when a user is typing a message.
- **Private Messaging**: Implement private chat rooms or direct messages between users.
- **Deployment**: Deploy your application using services like Heroku, Vercel, or AWS.

