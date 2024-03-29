import React, {useEffect,useState} from 'react';
import "./App.css";
import Chat from "./Chat"
import Sidebar from "./Sidebar";
import Pusher from "pusher-js";
import axios from "./axios";


function App() {
const [messages,setMessages]=useState([]);

  useEffect(()=>{
    axios.get("/messages/sync").then((response)=>{
      setMessages(response.data);
    }).catch(function (err) {
        console.log('ERROR: ', err)
      })
  }, []);


useEffect(()=>{
  const pusher = new Pusher('b60dd4af8dd2ef1e6d36', {
    cluster: 'ap2'
  });

  const channel = pusher.subscribe("messages");
  channel.bind("inserted", (newMessage)=> {
    // console.log('inserted');
    // alert(JSON.stringify(newMessage));
    setMessages([...messages,newMessage])
  });

  return()=>{
    channel.unbind_all();
    channel.unsubscribe();
  };
},[messages]);

console.log(messages);

  return (
    <div className="app">
    <div className='app__body'>
      <Sidebar />
      <Chat messages={messages} />
    </div>
    </div>
  );
}

export default App;
