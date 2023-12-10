const PORT = 8000
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose");

const app = express()
app.use(express.json())
app.use(cors())

const API_KEY = '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'

mongoose.connect("mongodb://127.0.0.1:27017/chatgptdetails",{useNewUrlParser:true});

// Create a Mongoose schema for your chat data
const chatSchema = new mongoose.Schema({
    role: String,
    content: String,
});

// Create a Mongoose model based on the schema
const Chat = mongoose.model("Chat", chatSchema);

const db = mongoose.connection;  //connection to db
db.on("error", (error) => console.log(error));
db.on("open", () => console.log("Database Connected"));


app.post('/completions', async (req, res) => {
    console.log("options---------", req.body.message)

    // Save the user message to MongoDB
    const userMessage = new Chat({ role: "user", content: req.body.message });
    await userMessage.save();

    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: req.body.message }],
            max_tokens: 100,
        })
    }

    try {

       
        const response = await fetch('https://api.openai.com/v1/chat/completions', options)
        const data = await response.json()
        res.send(data)

        // Save the AI response to MongoDB
        const aiMessage = new Chat({ role: "ai", content: data.choices[0].message.content });
        await aiMessage.save();


    } catch (error) {
        console.error(error)
    }

})





app.listen(PORT, () => console.log('Your server is running on PORT ' + PORT))