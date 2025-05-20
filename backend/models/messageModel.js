const Conversation = require('../config/mongoDB/schema/conversation');
const Message = require('../config/mongoDB/schema/message');
const {mysqlPool} = require('../config/mysql-db');


const createOrGetConversation = async(senderId,receiverId) => {
  try {
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If it exists, return it
    if (conversation)  return { status: 200, conversation};
    
    // If not, create new conversation
    conversation = new Conversation({
      participants: [senderId, receiverId]
    });

    await conversation.save();
    return({status:201,conversation});

  } catch (err) {
    console.error('Error creating conversation:', err);
    throw new Error("Error creating conversation");
  }
};

const sendMessage = async(senderId,conversationId,content) => {
        try {
            // Create the message
            const newMessage = new Message({
              conversationId,
              senderId,
              content,
            });

        await newMessage.save();
      return({message:"message sent", newMessage:newMessage  });
  
    } catch (err) {
      console.error('Error sending message:', err);
      throw new Error("Error sending message");
    }
  };

  const getMessages= async (conversationId)=>{
    try {
        const messages = await Message.find({ conversationId: conversationId });
        return(messages);

        } catch (err) {
        console.error('Error getting messages:', err);
        throw new Error("Error getting messages");
        }
    };

  //get all conversations for one user
  const getAllConversations = async (userId) => {
    try {
      const conversations = await Conversation.find({
        participants: userId,
      }).sort({ updatedAt: -1 }); // Most recent conversations first

      // 2. Extract all unique participant IDs (excluding current user)
    const allParticipantIds = [
        ...new Set(
          conversations.flatMap(conv => conv.participants).filter(id => id !== userId)
        )
      ];
      if (allParticipantIds.length === 0) return conversations;

       // 3. Query MySQL for user names
    const [rows] = await mysqlPool.query(
        `SELECT id, name FROM users WHERE id IN (${allParticipantIds.map(() => '?').join(',')})`,
        allParticipantIds
      );

    const userMap = {};
    rows.forEach(row => {
      userMap[row.id] = row.name;
    });
     // 4. Attach names to conversation objects
     const enrichedConversations = conversations.map(conv => {
        const otherId = conv.participants.find(p => String(p) !== String(userId));
        return {
          ...conv.toObject(),
          otherUser: {
            id: otherId,
            name: userMap[otherId] || 'Unknown'
          }
        };
      });  
      return enrichedConversations;

    } catch (err) {
      console.error('Error fetching conversations:', err);
      throw new Error('Error fetching conversations');
    }
  };

module.exports = { createOrGetConversation,sendMessage,getMessages,getAllConversations };

