import "../styles/home.css";
import packageInfo from "../../package.json";

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
      <main className="home" id="home">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> KHO HỌC LIỆU HÓA HỌC TƯƠNG TÁC</span>
            <h1 id="hero-title">
              Học Hóa học
              <br />
              <span>theo cách của bạn.</span>
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
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="molecule molecule-main">M</div>
            <span className="molecule molecule-small molecule-small-one">O</span>
            <span className="molecule molecule-small molecule-small-two">H</span>
            <span className="molecule-dot molecule-dot-one" />
            <span className="molecule-dot molecule-dot-two" />
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

      <footer className="site-footer">
        <div className="footer-details">
          <p>
            © {new Date().getFullYear()} {packageInfo.displayName ?? packageInfo.name}
            {" · "}{packageInfo.description}{" · "}v{packageInfo.version}
          </p>
          <p className="footer-author">Phát triển bởi {packageInfo.author.name}</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;