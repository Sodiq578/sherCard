// src/components/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCamera,
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiEdit2,
  FiSave,
  FiX,
  FiLogOut,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiChevronRight,
} from "react-icons/fi";
import "../styles/Profile.css";
import Logo from "../assets/images/logo.png";

function Profile({ user, updateUser, onLogout }) {
  const navigate = useNavigate();

  const [ism, setIsm] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [rasm, setRasm] = useState("");
  const [tahrirlash, setTahrirlash] = useState(false);
  const [kartalarSoni, setKartalarSoni] = useState(0);
  const [tarixKorsat, setTarixKorsat] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setIsm(user.profile.name || user.login);
      setTelefon(user.profile.phone || "");
      setEmail(user.profile.email || "");
      setRasm(user.profile.avatar || "");
    }
    setKartalarSoni(user?.cards?.length || 0);
  }, [user]);

  const saqlash = () => {
    if (!ism.trim() || !telefon.trim()) {
      alert("Ism va telefon to'ldirilishi shart!");
      return;
    }

    const yangilanganFoydalanuvchi = {
      ...user,
      profile: {
        ...user.profile,
        name: ism,
        phone: telefon,
        email,
        avatar: rasm,
      },
    };

    updateUser(yangilanganFoydalanuvchi);
    setTahrirlash(false);
    alert("Profil muvaffaqiyatli yangilandi!");
  };

  const rasmOzgartirish = (e) => {
    const fayl = e.target.files[0];
    if (fayl) {
      if (fayl.size > 2 * 1024 * 1024) {
        alert("Rasm hajmi 2MB dan oshmasin!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setRasm(ev.target.result);
      reader.readAsDataURL(fayl);
    }
  };

  const chiqish = () => {
    if (window.confirm("Haqiqatan ham chiqmoqchimisiz?")) {
      onLogout();
      navigate("/");
    }
  };

  const tarixniOchish = () => setTarixKorsat((prev) => !prev);

  if (!user)
    return (
      <div className="yuklanmoqda">
        <div className="aylanuvchi"></div>
        <p>Yuklanmoqda...</p>
      </div>
    );

  return (
    <div className="profil-sahifa">
      {/* === SARLAVHA === */}
      <div className="profil-sarlavha">
        <button onClick={() => navigate(-1)} className="orqaga-tugma">
          <FiArrowLeft size={24} />
        </button>
        <h1>Profil</h1>
        <button
          onClick={() => setTahrirlash(!tahrirlash)}
          className="tahrirlash-tugma"
        >
          {tahrirlash ? <FiX /> : <FiEdit2 />}
        </button>
      </div>

      {/* === PROFIL KARTASI === */}
      <div className="profil-kartasi">
        {/* === AVATAR === */}
        <div className="rasm-bolimi">
          <div className="rasm-quti">
            {rasm ? (
              <img src={rasm} alt="Avatar" className="foydalanuvchi-rasmi" />
            ) : (
              <div className="rasm-orniga">{ism.charAt(0).toUpperCase()}</div>
            )}
            {tahrirlash && (
              <label htmlFor="rasm-yuklash" className="kamera-belgisi">
                <FiCamera size={18} />
              </label>
            )}
          </div>
          <input
            id="rasm-yuklash"
            type="file"
            accept="image/*"
            onChange={rasmOzgartirish}
            className="rasm-kirish"
          />
          <h2 className="foydalanuvchi-ism">{ism}</h2>
          <p className="foydalanuvchi-nik">
            @{user.profile?.username || "username"}
          </p>
          <div className="balans-belgisi">
            <span>{(user.balance || 0).toLocaleString()} UZS</span>
            <img src={Logo} alt="Logo" className="balans-logosi" />
          </div>
        </div>

        {/* === FORMA === */}
        <div className="profil-forma">
          <div className="kirish-guruh">
            <label>
              <FiUser /> To'liq ism
            </label>
            <input
              type="text"
              value={ism}
              onChange={(e) => setIsm(e.target.value)}
              disabled={!tahrirlash}
              placeholder="Ism Familiya"
            />
          </div>

          <div className="kirish-guruh">
            <label>
              <FiPhone /> Telefon
            </label>
            <input
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              disabled={!tahrirlash}
              placeholder="+998 ** *** ** **"
            />
          </div>

          <div className="kirish-guruh">
            <label>
              <FiMail /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!tahrirlash}
              placeholder="email@example.com"
            />
          </div>

          {tahrirlash && (
            <div className="forma-harakatlar">
              <button onClick={saqlash} className="saqlash-tugma">
                <FiSave /> Saqlash
              </button>
              <button
                onClick={() => setTahrirlash(false)}
                className="bekor-qilish-tugma"
              >
                <FiX /> Bekor qilish
              </button>
            </div>
          )}
        </div>

        {/* === STATISTIKA === */}
        <div className="statistika-setka">
          <div className="stat-element">
            <FiDollarSign className="stat-belgi" />
            <div className="stat-qiymat">
              {(user.balance || 0).toLocaleString()}
            </div>
            <div className="stat-izoh">Balans</div>
          </div>
          <div className="stat-element" onClick={() => navigate("/cards")}>
            <FiCreditCard className="stat-belgi" />
            <div className="stat-qiymat">{kartalarSoni}</div>
            <div className="stat-izoh">Kartalar</div>
            <FiChevronRight className="ong-belgi" />
          </div>
          <div
            className="stat-element"
            onClick={tarixniOchish}
            style={{ cursor: "pointer" }}
          >
            <FiClock className="stat-belgi" />
            <div className="stat-qiymat">{user.history?.length || 0}</div>
            <div className="stat-izoh">Tarix</div>
            <FiChevronRight
              className={`ong-belgi ${tarixKorsat ? "aylantirilgan" : ""}`}
            />
          </div>
        </div>

        {/* === TARIX === */}
        <div
          className={`tarix-bolimi ${tarixKorsat ? "kengaytirilgan" : ""}`}
        >
          <div className="tarix-mazmuni">
            {user.history && user.history.length > 0 ? (
              <div className="tarix-royxati">
                {user.history
                  .slice()
                  .reverse()
                  .map((item, i) => {
                    const kirim =
                      item.amount?.toString().startsWith("+") ||
                      item.action?.includes("to‘ldirildi") ||
                      item.action?.includes("keldi");
                    return (
                      <div key={i} className="tarix-band">
                        <div className="tarix-belgisi">
                          {kirim ? (
                            <FiArrowDownLeft className="kirim" />
                          ) : (
                            <FiArrowUpRight className="chiqim" />
                          )}
                        </div>
                        <div className="tarix-malumot">
                          <p className="amal-turi">
                            {item.action || item.type || "Amal"}
                          </p>
                          <p className="amal-sana">
                            {item.time ||
                              new Date().toLocaleString("uz-UZ")}
                          </p>
                        </div>
                        <div
                          className={`amal-miqdor ${
                            kirim ? "musbat" : "manfiy"
                          }`}
                        >
                          {kirim ? "+" : ""}
                          {Math.abs(parseInt(item.amount) || 0).toLocaleString()}{" "}
                          UZS
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="tarix-yoq">Hozircha hech qanday amal yo'q.</p>
            )}
          </div>
        </div>

        {/* === CHIQISH === */}
        <button onClick={chiqish} className="chiqish-tugma">
          <FiLogOut /> Chiqish
        </button>
      </div>
    </div>
  );
}

export default Profile;
