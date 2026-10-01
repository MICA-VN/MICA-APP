import "../styles/home.css";
import FeatureCard from "../components/FeatureCard";

function Home() {
  return (
    <main className="home">
      <section className="features">
        <FeatureCard
          icon="⚛"
          title="Bảng Tuần Hoàn"
          tagline="Khám phá các nguyên tố và thế giới hóa học."
          button="Khám phá ngay"
          url="periodic"
        />
        <FeatureCard
          icon="⚗"
          title="Công Cụ Hóa Học"
          tagline="Các công cụ tương tác hỗ trợ học tập Hóa học."
          button="Xem ngay"
          url="tools"
        />
      </section>
    </main>
  );
}

export default Home;