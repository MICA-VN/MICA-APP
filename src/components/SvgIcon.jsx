import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "../services/api";
import "../styles/components/SvgIcon.css";

function SvgIcon({ name, size = 24, w, h, className, onLoad }) {
  const width = w ?? size;
  const height = h ?? size;
  const query = new URLSearchParams({ name });

  if (w === undefined && h === undefined) {
    query.set("size", String(size));
  } else {
    query.set("w", String(width));
    query.set("h", String(height));
  }

  const url = getApiUrl(`/api/assets/svg?${query}`);
  const [result, setResult] = useState({ url: "", markup: "", error: null });
  const [refreshVersion, setRefreshVersion] = useState(0);
  const iconRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setRefreshVersion((version) => version + 1);

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { cache: refreshVersion === 0 ? "default" : "no-cache", signal: controller.signal })
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
        setResult((current) => (
          current.url === url && current.markup
            ? { ...current, error }
            : { url, markup: "", error }
        ));
      });

    return () => controller.abort();
  }, [name, refreshVersion, url]);

  useEffect(() => {
    if (result.url !== url || !result.markup || !onLoad) return;

    const svg = iconRef.current?.querySelector("svg");
    if (svg) onLoad(svg);
  }, [onLoad, result.markup, result.url, url]);

  if (result.url !== url) {
    return (
      <span
        ref={iconRef}
        className={`svg-icon ${className ?? ""}`}
        aria-hidden="true"
      />
    );
  }

  if (result.error && !result.markup) {
    return (
      <span
        className={`svg-icon svg-icon-error ${className ?? ""}`}
        ref={iconRef}
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
      ref={iconRef}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: result.markup }}
    />
  );
}

export default SvgIcon;
