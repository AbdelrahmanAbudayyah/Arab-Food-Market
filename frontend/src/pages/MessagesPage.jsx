import io from 'socket.io-client';

import { useEffect, useState,useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './css/messagesPage.css'


import axiosInstance from'../axiosInstance';
import { useParams } from 'react-router-dom';

const SOCKET_URL = process.env.REACT_APP_API_URL; // change to your backend UR

export default function MessagesPage(){

    const socket = useRef(null);
    const messagesEndRef = useRef(null);
    const {user}= useAuth();
    const {id,name}=useParams();
    const [conversations, setConversations]= useState([]);
    const [selectedConvo, setSelectedConvo]= useState([]);
    const [selectedConvoId, setSelectedConvoId]= useState(null);
    const [message, setMessage]= useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    //socket.io set up

    //connect when the component mounts:
    useEffect(() => {
        if (!user) return;
      
        socket.current = io(SOCKET_URL, {
          withCredentials: true,
        });
      
        return () => {
          socket.current.disconnect(); // Clean up on unmount
        };
      }, [user]);

      //Join the selected conversation room
      useEffect(() => {
        if (selectedConvoId && socket.current) {
          socket.current.emit('join-conversation', selectedConvoId);
        }
      }, [selectedConvoId]);

      //When a new message is emitted from the server, receive it and add it to the conversation:
      useEffect(() => {
        if (!socket.current) return;
      
        socket.current.on('receive-message', (data) => {
          if (data.conversationId === selectedConvoId) {
            setSelectedConvo((prev) => [...prev, data]);
          }
        });
      
        return () => {
          socket.current.off('receive-message'); // Clean up listener
        };
      }, [selectedConvoId]);

      //Scroll to bottom when messages update
      useEffect(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [selectedConvo]);
      
    useEffect(() => {
        if (user) {
            (async () => {
                const fetchedConversations = await getConversations();
                console.log("fetched conversations",fetchedConversations); 
          if (id) {
            console.log("id",id);
            (async () => {
              const conversation = await getConversationUsingParams(id,name);
              console.log("Fetched from param:", conversation);

          
              // Check if the conversation already exists in the state
                const exists =  fetchedConversations.some((convo) => {
                    console.log("Comparing:", convo._id, "===", conversation._id);
                    return convo._id === conversation._id;
                });
          
              console.log("Exists already?", exists);

              if (!exists) {
                setConversations((prev) => [conversation, ...prev]); // add to the top
                console.log("inside conversation doesnt exit");
              }
              
          
              setSelectedConvoId(conversation._id);
              await getMessages(conversation._id);
            })();
          }
        })();
    }
      }, [user, id]);
    
    const getConversationUsingParams= async (id,name) =>{
        try{

            const result = await axiosInstance.post('/chat/conversation',{receiverId:id},{withCredentials:true}) ;
            const convo= {...result.data, otherUser:{id:id,name:name}}
           // console.log("get existed convo or create anew one ",result.data);
          return convo;
            //return result.data; // existed conversation or a new created empty one 

        }catch (err) {
                  if (err.response?.status === 401) {
                    try {
                      await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                      const result = await axiosInstance.post('/chat/conversation',[id],{withCredentials:true}) ;
                      return result.data;
      
                      
                } catch (refreshError) {
                      console.error('Token refresh failed or retry failed:', refreshError);
                    }
                  } else {
                    console.error('get conversations error:', err);
                  }
                }
    }

    const getConversations = async ()=>{
        setIsLoading(true);
        setError(null);

        try{
            const result = await axiosInstance.get('/chat/conversations',{withCredentials:true}) ;
            console.log("get conversations ",result.data );

            setConversations(result.data);
            return(result.data);

        }catch (err) {
                  if (err.response?.status === 401) {
                    try {
                      await axiosInstance.post('/refresh-token', {}, { withCredentials: true });
                      const result = await axiosInstance.get('/chat/conversations',[],{withCredentials:true}) ;
                      console.log("get conversations ",result.data );
                      setConversations(result.data); 
                      return(result.data);
   
                } catch (refreshError) {
                      console.error('Token refresh failed or retry failed:', refreshError);
                    }
                  } else {
                    setError("Failed to load conversations.");
                    console.error('get conversations error:', err);
                  }
                } finally{
                    setIsLoading(false);

                }
    }

    const getMessages = async (conversationId)=>{
        setIsLoading(true);
        setError(null);

        try{
            const result = await axiosInstance.get(`/chat/messages/${conversationId}`,{withCredentials:true}) ;
            setSelectedConvo(result.data);
            console.log("convo id",conversationId);
            console.log("messages for selected convo",result.data);

        }catch (err) {
                  if (err.response?.status === 401) {
                    try {
                      await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                      const result = await axiosInstance.get(`/api/chat/messages/${conversationId}`,{withCredentials:true}) ;
                      setSelectedConvo(result.data);                
                } catch (refreshError) {
                      console.error('Token refresh failed or retry failed:', refreshError);
                    }
                  } else {
                    setError("Failed to load messages.");

                    console.error('get messages error:', err);
                  }
                }finally{
                    setIsLoading(false);

                }
    }

    const sendMessage = async ()=>{
      if(! message)
        return;
        try{
            const result = await axiosInstance.post('chat/message',{content:message,conversationId:selectedConvoId},{withCredentials:true}) ;
                    const newMessage=result.data.newMessage;
                    console.log('newMessage: ',newMessage);

                    // Emit to socket
                      socket.current.emit('send-message', newMessage);

                      const newSelectedConvo = [...selectedConvo ,newMessage];
                      setSelectedConvo(newSelectedConvo);
                      setMessage(''); // Clear input
        }catch (err) {
                  if (err.response?.status === 401) {
                    try {
                      await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                      const result = await axiosInstance.post('chat/message',{content:message,conversationId:selectedConvoId},{withCredentials:true}) ;
                      const newMessage=result.data.newMessage;
                     console.log('newMessage: ',newMessage);
                    // Emit to socket
                      socket.current.emit('send-message', newMessage);
                      const newSelectedConvo = [...selectedConvo ,  {content: result.data.content}];
                      setSelectedConvo(newSelectedConvo);
                      setMessage(''); // Clear input

      
                } catch (refreshError) {
                      console.error('Token refresh failed or retry failed:', refreshError);
                    }
                  } else {
                    console.error('get messages error:', err);
                  }
                }
    }

    return (

      <div className="page-content">
    <div className="messages-page">
      {isLoading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="messages_sidebar">
        <h2>Conversations</h2>
        {conversations.length === 0 ? (
          <p>No conversations available</p>
        ) : (
          <ul>
            {conversations.map((convo) => (
              <li 
                key={convo._id} 
                onClick={() => {
                  setSelectedConvoId(convo._id);
                  getMessages(convo._id);
                }}
                className={selectedConvoId === convo._id ? 'active-convo' : ''}
              >
                {convo.otherUser?.name || 'Unknown User'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-window">
        {selectedConvoId ? (
          <>
            <div className="messages">
            {selectedConvo.map((msg, index) => {
  const currentDate = new Date(msg.createdAt).toDateString();
  const previousDate = index > 0 ? new Date(selectedConvo[index - 1].createdAt).toDateString() : null;
  const showDate = currentDate !== previousDate;

  return (
    <div key={index}>
      {showDate && (
        <div className="date-separator">{currentDate}</div>
      )}
      <div className={`message-wrapper ${String(msg.senderId) === String(user.id) ? 'sent-wrapper' : 'received-wrapper'}`}>
        <div className={`message-bubble ${String(msg.senderId) === String(user.id) ? 'sent' : 'received'}`}>
          <div className="message-content">{msg.content}</div>
          <div className="message-time">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
})}

            </div>
            <div className="message-input">
              <input 
                value={message || ''} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Type a message..." 
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p className="select-conversation">Select a conversation to view messages.</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      </div>
      </div>
    
    )
    
    
     
}

