import "../styles/home.css";
import FeatureCard from "../components/FeatureCard";

function Tools() {
  return (
    <main className="home">
      <section className="features">
        <FeatureCard
          icon="⚛"
          title="Cân Bằng PTHH"
          tagline="Công cụ hỗ trợ cân bằng các phương trình hoá học 1 cách chính xác."
          button="Thử ngay"
          url="tools/canbang"
        />
      </section>
    </main>
  );
}

export default Tools;