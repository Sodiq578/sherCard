// src/components/ChatDetail.jsx
import React, { useState, useRef } from "react";
import {
  FaPaperPlane,
  FaMicrophone,
  FaMoon,
  FaSun,
  FaPaperclip,
  FaImage,
  FaVideo,
} from "react-icons/fa";
import "../styles/ChatDetail.css";

function ChatDetail() {
  const [theme, setTheme] = useState("light");
  const [messages, setMessages] = useState([
    {
      type: "received",
      content: "Salom! Qalaysiz?",
      time: "10:00",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Tema almashtirish
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Xabar yuborish
  const sendMessage = () => {
    if (inputValue.trim() === "") return;
    const newMsg = {
      type: "sent",
      content: inputValue,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setInputValue("");
  };

  // Rasm yoki video yuborish
  const sendMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type.startsWith("video") ? "video" : "image";

    const newMsg = {
      type: "sent",
      mediaType: fileType,
      content: fileUrl,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Ovoz yozishni boshlash
  const startRecording = async () => {
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      // Soundwave uchun audio context
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const animateWave = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 2;
        setAudioLevel(avg);
        animationFrameRef.current = requestAnimationFrame(animateWave);
      };
      animateWave();

      mediaRecorderRef.current.onstop = () => {
        cancelAnimationFrame(animationFrameRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newMsg = {
          type: "sent",
          mediaType: "audio",
          content: audioUrl,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, newMsg]);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      alert("Mikrofonga ruxsat berilmagan!");
      setRecording(false);
    }
  };

  // Ovoz yozishni to'xtatish
  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <div className={`chat-detail-container ${theme}`}>
      <div className="chat-detail-header">
        <img
          src="https://cdn-icons-png.flaticon.com/512/9131/9131529.png"
          alt="User"
          className="chat-detail-avatar"
        />
        <h3 className="chat-user-name">Sodiqjon</h3>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            {msg.mediaType === "audio" ? (
              <audio controls src={msg.content} className="msg-audio"></audio>
            ) : msg.mediaType === "image" ? (
              <img src={msg.content} alt="sent" className="msg-img" />
            ) : msg.mediaType === "video" ? (
              <video controls src={msg.content} className="msg-video"></video>
            ) : (
              <p>{msg.content}</p>
            )}
            <span className="message-time">{msg.time}</span>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <label htmlFor="media-upload" className="file-btn">
          <FaPaperclip />
        </label>
        <input
          type="file"
          id="media-upload"
          accept="image/*,video/*"
          onChange={sendMedia}
          style={{ display: "none" }}
        />

        {recording ? (
          <div className="recording-bar">
            <div className="wave">
              <div
                className="wave-bar"
                style={{ height: `${Math.min(audioLevel, 60)}px` }}
              ></div>
              <div
                className="wave-bar"
                style={{ height: `${Math.min(audioLevel / 1.5, 50)}px` }}
              ></div>
              <div
                className="wave-bar"
                style={{ height: `${Math.min(audioLevel / 2, 40)}px` }}
              ></div>
              <div
                className="wave-bar"
                style={{ height: `${Math.min(audioLevel / 2.5, 30)}px` }}
              ></div>
              <div
                className="wave-bar"
                style={{ height: `${Math.min(audioLevel / 3, 20)}px` }}
              ></div>
            </div>
            <span className="recording-text">Ovoz yozilmoqda...</span>
          </div>
        ) : (
          <input
            type="text"
            placeholder="Xabar yozing..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
        )}

        {inputValue ? (
          <button onClick={sendMessage} className="send-btn">
            <FaPaperPlane />
          </button>
        ) : (
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`mic-btn ${recording ? "recording" : ""}`}
          >
            <FaMicrophone />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatDetail;