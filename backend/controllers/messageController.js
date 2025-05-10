const {createOrGetConversation,sendMessage,getMessages,getAllConversations} = require('../models/messageModel');

const createOrGetConversationController = async (req, res) => {
  try {
    const senderId= req.user.id;
    const {receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender and receiver are required' });
    }

    const result=await createOrGetConversation(senderId,receiverId);

    res.status(result.status).json(result.conversation);

  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendMessageController=async (req,res)=>{
    const { conversationId,content } = req.body;
        const senderId = req.user.id;
    try{
        if(!conversationId|| !senderId || !content)
            res.status(400).json({ message: 'missing required fields' });

        const result = await sendMessage(senderId,conversationId,content);

        res.status(201).json({message:result.message,newMessage:result.newMessage});
    }catch(err){
        console.error('Error sending a message:', err);
        res.status(500).json({ message: 'Server error' });

    }
}

    const getMessagesController=async (req,res)=>{
        const {conversationId} = req.params;
        try{
            if(!conversationId)
                res.status(400).json({ message: 'missing conversationId'});
            const result = await getMessages(conversationId);
            res.status(200).json(result);
        }catch(err){
            console.error('Error getting messages:', err);
            res.status(500).json({ message: 'Server error' });
    
        }
    }


        const getConversationsController = async (req,res)=>{
             const id = req.user.id;
            try{
                if(!id)
                    res.status(400).json({ message: 'missing userId'});
                const result = await getAllConversations(id);
                res.status(200).json(result);
            }catch(err){
                console.error('Error getting conversations:', err);
                res.status(500).json({ message: 'Server error' });
            }
        };

    //delete conversation and messages,,




module.exports = { createOrGetConversationController,sendMessageController,getMessagesController,getConversationsController};
