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
      .catch(err => console.error(err));

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
