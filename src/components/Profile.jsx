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
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import "../styles/Profile.css";
import Logo from "../assets/images/logo.png";

// Custom Modal komponenti
const CustomModal = ({ isOpen, title, message, type = "info", onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const isError = type === "error";
  const isSuccess = type === "success";

  return (
    <div className="modal-orqa-fon" onClick={onCancel}>
      <div className="modal-konteyner" onClick={(e) => e.stopPropagation()}>
        <div className="modal-belgi">
          {isSuccess ? (
            <FiCheckCircle size={48} color="#4caf50" />
          ) : isError ? (
            <FiAlertCircle size={48} color="#f44336" />
          ) : (
            <FiAlertCircle size={48} color="#0C73FE" />
          )}
        </div>
        <h3 className="modal-sarlavha">{title}</h3>
        <p className="modal-matn">{message}</p>
        <div className="modal-tugmalar">
          {onConfirm && (
            <button onClick={onConfirm} className="modal-ha">
              <FiCheckCircle /> Ha
            </button>
          )}
          <button onClick={onCancel || onConfirm} className="modal-yoq">
            <FiX /> {onConfirm ? "Yo‘q" : "Yopish"}
          </button>
        </div>
      </div>
    </div>
  );
};

function Profile({ user, updateUser, onLogout }) {
  const navigate = useNavigate();

  const [ism, setIsm] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [rasm, setRasm] = useState("");
  const [tahrirlash, setTahrirlash] = useState(false);
  const [kartalarSoni, setKartalarSoni] = useState(0);
  const [tarixKorsat, setTarixKorsat] = useState(false);

  // Modal holati
  const [modal, setModal] = useState({
    ochiq: false,
    sarlavha: "",
    matn: "",
    turi: "info", // info, success, error, confirm
    onConfirm: null,
  });

  const ochiqModal = (sarlavha, matn, turi = "info", onConfirm = null) => {
    setModal({ ochiq: true, sarlavha, matn, turi, onConfirm });
  };

  const yopModal = () => {
    setModal({ ...modal, ochiq: false, onConfirm: null });
  };

  useEffect(() => {
    if (user?.profile) {
      setIsm(user.profile.name || user.login || "Foydalanuvchi");
      setTelefon(user.profile.phone || "");
      setEmail(user.profile.email || "");
      setRasm(user.profile.avatar || "");
    }
    setKartalarSoni(user?.cards?.length || 0);
  }, [user]);

  const saqlash = () => {
    if (!ism.trim()) {
      ochiqModal("Xatolik", "Ismni kiriting!", "error");
      return;
    }
    if (!telefon.trim()) {
      ochiqModal("Xatolik", "Telefon raqamni kiriting!", "error");
      return;
    }

    const yangilangan = {
      ...user,
      profile: {
        ...user.profile,
        name: ism,
        phone: telefon,
        email: email,
        avatar: rasm,
      },
    };

    updateUser(yangilangan);
    setTahrirlash(false);
    ochiqModal("Muvaffaqiyatli!", "Profil muvaffaqiyatli yangilandi!", "success");
  };

  const rasmOzgartirish = (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;

    if (fayl.size > 2 * 1024 * 1024) {
      ochiqModal("Rasm hajmi juda katta", "Rasm hajmi 2MB dan oshmasin!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setRasm(ev.target.result);
    reader.readAsDataURL(fayl);
  };

  const chiqish = () => {
    ochiqModal(
      "Chiqish",
      "Haqiqatan ham hisobingizdan chiqmoqchimisiz?",
      "confirm",
      () => {
        onLogout();
        navigate("/");
        yopModal();
      }
    );
  };

  const tarixniOchish = () => setTarixKorsat((prev) => !prev);

  // Yuklanmoqda holati
  if (!user) {
    return (
      <div className="yuklanmoqda">
        <div className="aylanuvchi"></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <>
      <div className="profil-sahifa">
        {/* SARLAVHA */}
        <div className="profil-sarlavha">
          <button onClick={() => navigate(-1)} className="orqaga-tugma">
            <FiArrowLeft size={24} />
          </button>
          <h1>Profil</h1>
          <button
            onClick={() => setTahrirlash(!tahrirlash)}
            className="tahrirlash-tugma"
          >
            {tahrirlash ? <FiX size={22} /> : <FiEdit2 size={20} />}
          </button>
        </div>

        {/* ASOSIY KARTA */}
        <div className="profil-kartasi">
          {/* AVATAR + ISM + BALANS */}
          <div className="rasm-bolimi">
            <div className="rasm-quti">
              {rasm ? (
                <img src={rasm} alt="Avatar" className="foydalanuvchi-rasmi" />
              ) : (
                <div className="rasm-orniga">
                  {ism.charAt(0).toUpperCase()}
                </div>
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

          {/* MA'LUMOTLAR FORMA */}
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
                <FiPhone /> Telefon raqam
              </label>
              <input
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                disabled={!tahrirlash}
                placeholder="+998 99 123 45 67"
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

            {/* SAQLASH / BEKOR QILISH */}
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

          {/* STATISTIKA */}
          <div className="statistika-setka">
            <div className="stat-element">
              <FiDollarSign className="stat-belgi" />
              <div className="stat-qiymat">
                {(user.balance || 0).toLocaleString()}
              </div>
              <div className="stat-izoh">Balans</div>
            </div>

            <div
              className="stat-element"
              onClick={() => navigate("/cards")}
              style={{ cursor: "pointer" }}
            >
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

          {/* TARIX RO‘YXATI */}
          <div className={`tarix-bolimi ${tarixKorsat ? "kengaytirilgan" : ""}`}>
            <div className="tarix-mazmuni">
              {user.history && user.history.length > 0 ? (
                <div className="tarix-royxati">
                  {user.history
                    .slice()
                    .reverse()
                    .map((item, i) => {
                      const kirim =
                        String(item.amount || "").startsWith("+") ||
                        item.action?.includes("to‘ldirildi") ||
                        item.action?.includes("keldi") ||
                        item.type === "deposit";

                      return (
                        <div key={i} className="tarix-band">
                          <div className="tarix-belgisi">
                            {kirim ? (
                              <FiArrowDownLeft className="kirim" size={20} />
                            ) : (
                              <FiArrowUpRight className="chiqim" size={20} />
                            )}
                          </div>
                          <div className="tarix-malumot">
                            <p className="amal-turi">
                              {item.action || item.type || "Noma'lum amal"}
                            </p>
                            <p className="amal-sana">
                              {item.time ||
                                new Date(item.date).toLocaleString("uz-UZ")}
                            </p>
                          </div>
                          <div
                            className={`amal-miqdor ${kirim ? "musbat" : "manfiy"
                              }`}
                          >
                            {kirim ? "+" : "-"}
                            {Math.abs(parseInt(item.amount) || 0).toLocaleString()} UZS
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="tarix-yoq">
                  Hozircha hech qanday tranzaksiya yo‘q.
                </p>
              )}
            </div>
          </div>

          {/* CHIQISH TUGMASI */}
          <button onClick={chiqish} className="chiqish-tugma">
            <FiLogOut /> Chiqish
          </button>
        </div>
      </div>

      {/* MODAL */}
      <CustomModal
        isOpen={modal.ochiq}
        title={modal.sarlavha}
        message={modal.matn}
        type={modal.turi}
        onConfirm={modal.onConfirm}
        onCancel={yopModal}
      />
    </>
  );
}

export default Profile;