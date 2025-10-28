// src/components/Hello.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hello.css';
import gift from '../assets/images/hello1.svg';
import flower from '../assets/images/hello2.svg';
import star from '../assets/images/hello1.svg';

const slides = [
  {
    image: gift,
    title: 'Salom',
    name: 'Abdulbosit!',
    text: 'Tarot savollarini bizning ilovamiz orqali yoki shaxsan so‘rashingiz mumkin. Natijalarni saqlang, solishtiring va tahlil qiling.',
    bonus: '+500 bonus ball'
  },
  {
    image: flower,
    title: 'Bonus tizimi',
    name: 'Siz uchun!',
    text: 'Har bir faoliyatingiz uchun ball to‘plang. Bu ballarni yig‘ib, maxsus sovg‘alar va chegirmalarga almashtiring.',
    bonus: 'Ball to‘plang'
  },
  {
    image: star,
    title: 'Do‘konlarda foydalaning',
    name: 'Imkoniyatlar!',
    text: 'Yig‘ilgan ballaringizni shahardagi do‘konlar va ovqatlanish joylarida chegirma olish uchun ishlating.',
    bonus: 'Chegirmalar oling'
  },
];


const Hello = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const skip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/main');
  };
  const start = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/main');
  };

  return (
    <div className="hello">
      <div className="bonus-badge">{slides[index].bonus}</div>
      
      <div className="content-wrapper">
        <img src={slides[index].image} alt="slide" className="hello-img" />
        
        <div className="text-content">
          <h1>{slides[index].title}</h1>
          <h2>{slides[index].name}</h2>
          <p>{slides[index].text}</p>
        </div>
      </div>

      <div className="bottom-section">
        <div className="dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <div className="actions">
          {index < slides.length - 1 ? (
            <>
              <button className="skip" onClick={skip}>O'tkazib yuborish</button>
              <button className="next" onClick={next}>Keyingisi</button>
            </>
          ) : (
            <button className="start" onClick={start}>Boshlash</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hello;