import { useRef } from "react";
import "../styles/pages/Home.css";
import Footer from "../components/Footer";

function SpringDraggable({ className, children, label }) {
  const dragRef = useRef(null);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.currentTarget.classList.remove("is-springing");
    event.currentTarget.classList.add("is-dragging");
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rawX = event.clientX - drag.startX;
    const rawY = event.clientY - drag.startY;
    const distance = Math.hypot(rawX, rawY);
    const freeMovement = 18;
    const resistanceRange = 56;
    const maxPullRadius = 72;
    const resistedDistance = Math.min(maxPullRadius, distance <= freeMovement
      ? distance
      : freeMovement +
        resistanceRange * (1 - Math.exp(-(distance - freeMovement) / resistanceRange)));
    const scale = distance === 0 ? 0 : resistedDistance / distance;
    const x = rawX * scale;
    const y = rawY * scale;
    drag.moved ||= distance > 0;
    event.currentTarget.style.setProperty("--drag-x", `${x}px`);
    event.currentTarget.style.setProperty("--drag-y", `${y}px`);
  };

  const finishDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;

    const element = event.currentTarget;
    element.classList.remove("is-dragging");
    if (drag.moved) {
      element.classList.add("is-springing");
      element.style.setProperty("--drag-x", "0px");
      element.style.setProperty("--drag-y", "0px");
    } else {
      element.style.removeProperty("--drag-x");
      element.style.removeProperty("--drag-y");
    }
  };

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== "transform") return;
    event.currentTarget.classList.remove("is-springing");
    event.currentTarget.style.removeProperty("--drag-x");
    event.currentTarget.style.removeProperty("--drag-y");
  };

  return (
    <span
      className={`${className} draggable-molecule`}
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </span>
  );
}

const plannedFeatures = [
  {
    number: "01",
    icon: "⚛",
    category: "KHÁM PHÁ",
    title: "Bảng tuần hoàn",
    description:
      "Tra cứu các nguyên tố, tính chất đặc trưng và khám phá mối liên hệ trong thế giới hóa học.",
    details: ["Thông tin nguyên tố", "Xu hướng tuần hoàn", "Tra cứu nhanh"],
    tone: "blue",
  },
  {
    number: "02",
    icon: "∑",
    category: "TÍNH TOÁN",
    title: "Công cụ hóa học",
    description:
      "Hỗ trợ các phép tính thường gặp, từ nồng độ phần trăm đến nồng độ mol và cân bằng phương trình.",
    details: ["Nồng độ C%", "Nồng độ mol CM", "Cân bằng phương trình"],
    tone: "teal",
  },
  {
    number: "03",
    icon: "⚗",
    category: "THỰC HÀNH",
    title: "Phòng thí nghiệm ảo",
    description:
      "Mô phỏng thí nghiệm trực quan để bạn quan sát hiện tượng và tìm hiểu hóa học qua trải nghiệm.",
    details: ["Thí nghiệm mô phỏng", "Quan sát hiện tượng", "Học an toàn"],
    tone: "violet",
  },
];

function Home() {
  return (
    <div className="home-page">
      <main className="home">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> KHO HỌC LIỆU HÓA HỌC TƯƠNG TÁC</span>
            <h1 id="hero-title">
              Hoá học Tương tác
              <br />
              <span>nền tảng thế hệ mới.</span>
            </h1>
            <p className="hero-description">
              Khám phá nguyên tố, giải bài tập và trải nghiệm các thí nghiệm
              trong một không gian học tập trực quan — tất cả đang được phát
              triển tại MICA.
            </p>
            <a className="hero-action" href="#features">
              Khám phá tính năng <span aria-hidden="true">↓</span>
            </a>
            <div className="hero-note">
              <span className="hero-note-mark">✦</span>
              <span>Nền tảng học tập mới dành cho những người yêu Hóa học</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one">
              <span className="orbit-electron-runner"><span className="orbit-electron" /></span>
            </div>
            <div className="orbit orbit-two">
              <span className="orbit-electron-runner"><span className="orbit-electron electron-teal" /></span>
            </div>
            <SpringDraggable className="molecule-main" label="Kéo chữ M">
              M
            </SpringDraggable>
            <SpringDraggable className="molecule-small molecule-small-one" label="Kéo chữ i">
              i
            </SpringDraggable>
            <SpringDraggable className="molecule-small molecule-small-two" label="Kéo chữ C">
              C
            </SpringDraggable>
            <SpringDraggable className="molecule-small molecule-small-three" label="Kéo chữ A">
              A
            </SpringDraggable>
            <span className="floating-electron floating-electron-one" />
            <span className="floating-electron floating-electron-two" />
            <span className="floating-electron floating-electron-three" />
            <div className="hero-art-label">
              <span>HỌC TẬP</span>
              <span>·</span>
              <span>KHÁM PHÁ</span>
              <span>·</span>
              <span>THỰC HÀNH</span>
            </div>
          </div>
          <div className="hero-index" aria-hidden="true">MICA / 01</div>
        </section>

        <section className="features-section" id="features" aria-labelledby="features-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">SẮP CÓ TẠI MICA</span>
              <h2 id="features-title">Hóa học, mở ra nhiều cách khám phá.</h2>
              <p>Các công cụ học tập đang được chuẩn bị để bạn trải nghiệm.</p>
            </div>
            <span className="feature-count">03 <span>TÍNH NĂNG</span></span>
          </div>

          <div className="feature-grid">
            {plannedFeatures.map((feature) => (
              <article className={`feature-card ${feature.tone}`} key={feature.number}>
                <div className="feature-card-top">
                  <span className="feature-number">{feature.number}</span>
                  <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
                  <span className="feature-status"><span /> Sắp ra mắt</span>
                </div>
                <div className="feature-card-content">
                  <span className="feature-category">{feature.category}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <ul className="feature-details">
                  {feature.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;