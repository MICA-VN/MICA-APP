import { useEffect, useState } from "react";
import "../styles/components/SvgIcon.css";

const SVG_API_URL = "https://mica-app-api.mica-vn.workers.dev/api/assets/svg";

function SvgIcon({ name, size = 24, w, h, className }) {
  const width = w ?? size;
  const height = h ?? size;
  const query = new URLSearchParams({ name });

  if (w === undefined && h === undefined) {
    query.set("size", String(size));
  } else {
    query.set("w", String(width));
    query.set("h", String(height));
  }

  const url = `${SVG_API_URL}?${query}`;
  const [result, setResult] = useState({ url: "", markup: "", error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`SVG request failed (${response.status}) for "${name}"`);
        }
        return response.text();
      })
      .then((markup) => setResult({ url, markup, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error(error);
        setResult({ url, markup: "", error });
      });

    return () => controller.abort();
  }, [name, url]);

  if (result.url !== url) {
    return <span className={`svg-icon ${className ?? ""}`} aria-hidden="true" />;
  }

  if (result.error) {
    return (
      <span
        className={`svg-icon svg-icon-error ${className ?? ""}`}
        role="img"
        aria-label={`Không tải được biểu tượng ${name}`}
        title={result.error.message}
      >
        !
      </span>
    );
  }

  return (
    <span
      className={`svg-icon ${className ?? ""}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: result.markup }}
    />
  );
}

export default SvgIcon;
