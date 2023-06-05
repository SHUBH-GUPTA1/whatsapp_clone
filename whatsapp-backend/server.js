//importing
import  express  from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

//app config
const app=express();
const port=process.env.PORT || 3000

const pusher = new Pusher({
    appId: "1611703",
    key: "b60dd4af8dd2ef1e6d36",
    secret: "dfbcedecb65a33b8e0b8",
    cluster: "ap2",
    useTLS: true
  });

//middleware
app.use(express.json());
// app.use(express.urlencoded({extended:true}));
app.use(cors());


// app.use((req,res,next)=>{
//     res.setHeader("Acess-Control-Allow-Origin","*");
//     res.setHeader("Acess-Control-Allow-Headers","*");
//     next();
// });

//DB config
const connection_url="mongodb+srv://admin:rgBbv954uHGWtQJ1@cluster0.dzny8ep.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db=mongoose.connection

db.once('open',()=>{
    console.log("DB connected");

    const msgCollection=db.collection("messagecontents");
    const changeStream=msgCollection.watch();

    changeStream.on('change',(change)=>{
        console.log(change) 

        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received,
            });
        }else{
            console.log("error triggering Pusher");
        }
    });
});


//api routes
app.get('/',(req,res)=>res.status(200).send("hello world"));

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new',(req,res)=>{
    const dbMessage=req.body

    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})



//listen
app.listen(port,()=>console.log(`litening on local host:${port}`))