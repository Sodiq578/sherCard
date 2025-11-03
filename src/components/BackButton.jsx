import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; // yoki o'zingning iconingni ishlat

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(-1)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "16px",
        color: "#333",
        cursor: "pointer",
        padding: "10px 16px",
        position: "fixed",
        top: "12px",
        left: "12px",
        background: "white",
        borderRadius: "50px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      <ChevronLeft size={20} />
      
    </div>
  );
};

export default BackButton;
