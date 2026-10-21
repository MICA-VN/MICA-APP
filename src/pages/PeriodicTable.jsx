import { useEffect, useRef, useState } from "react";
import { getCloudflareApiUrl } from "../services/api";
import { readCachedElements, saveCachedElements } from "../services/periodicTableCache";
import "../styles/pages/PeriodicTable.css";

const PERIODIC_TABLE_API_URL = getCloudflareApiUrl("/api/contents/periodic_table");
const TOTAL_ELEMENTS = 118;
const ELEMENTS_PER_REVEAL_STEP = 5;
const PERIODIC_TABLE_FIELDS = ["name", "symbol", "category", "group", "period"];
const REQUIRED_RESPONSE_FIELDS = ["number", ...PERIODIC_TABLE_FIELDS];
const PERIODS = Array.from({ length: 7 }, (_value, index) => index + 1);
const GROUPS = Array.from({ length: 18 }, (_value, index) => index + 1);
const PERIOD_GROUPS = {
  1: [1, 18],
  2: [1, 2, 13, 14, 15, 16, 17, 18],
  3: [1, 2, 13, 14, 15, 16, 17, 18],
  4: GROUPS,
  5: GROUPS,
  6: GROUPS,
  7: GROUPS,
};
const GROUP_ROMAN_LABELS = [
  "IA",
  "IIA",
  "IIIB",
  "IVB",
  "VB",
  "VIB",
  "VIIB",
  "VIIIB",
  "VIIIB",
  "VIIIB",
  "IB",
  "IIB",
  "IIIA",
  "IVA",
  "VA",
  "VIA",
  "VIIA",
  "VIIIA",
];
const CATEGORY_LABELS = {
  "alkali-metal": "Kim loại kiềm",
  "alkaline-earth": "Kim loại kiềm thổ",
  "transition-metal": "Kim loại chuyển tiếp",
  "post-transition": "Kim loại hậu chuyển tiếp",
  metalloid: "Á kim",
  nonmetal: "Phi kim",
  halogen: "Halogen",
  "noble-gas": "Khí hiếm",
  lanthanide: "Họ Lanthanide",
  actinide: "Họ Actinide",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

function ElementTile({ element, dimState }) {
  return (
    <div
      className={`element-tile category-${element.category}${dimState ? ` ${dimState}` : ""}`}
      data-element-category={element.category}
      style={{ "--reveal-order": (element.number - 1) % ELEMENTS_PER_REVEAL_STEP }}
      aria-label={`${element.number}, ${element.symbol}, ${element.name}, ${CATEGORY_LABELS[element.category] ?? element.category}`}
    >
      <span className="element-number">{element.number}</span>
      <strong className="element-symbol">{element.symbol}</strong>
      <span className="element-name">{element.name}</span>
    </div>
  );
}

function ElementLoadingTile({ loading }) {
  return (
    <div className="element-tile loading-tile" aria-hidden="true">
      {loading && <span className="loading-spinner" />}
    </div>
  );
}

function matchesFilter(element, filter) {
  if (filter.type === "category") return element.category === filter.value;
  if (filter.type === "period") return element.period === filter.value;
  if (filter.value === 3) {
    return element.elementGroup === 3 ||
      (element.number >= 57 && element.number <= 71) ||
      (element.number >= 89 && element.number <= 103);
  }
  return element.elementGroup === filter.value;
}

function PeriodicTable() {
  const [elements, setElements] = useState([]);
  const [requestState, setRequestState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [cacheError, setCacheError] = useState("");
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(() => new Set());
  const tableScrollRef = useRef(null);
  const pendingCategoryRevealRef = useRef(null);
  const scrollAnimationFrameRef = useRef(null);

  useEffect(() => () => {
    if (scrollAnimationFrameRef.current) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    const clearHover = () => setHoveredFilter(null);
    const clearHoverWhenHidden = () => {
      if (document.hidden) clearHover();
    };

    window.addEventListener("blur", clearHover);
    document.addEventListener("visibilitychange", clearHoverWhenHidden);
    return () => {
      window.removeEventListener("blur", clearHover);
      document.removeEventListener("visibilitychange", clearHoverWhenHidden);
    };
  }, []);

  useEffect(() => {
    const category = pendingCategoryRevealRef.current;
    const scrollContainer = tableScrollRef.current;
    if (!category || !scrollContainer) return;

    const tiles = [...scrollContainer.querySelectorAll(
      `[data-element-category="${category}"]`,
    )];
    if (tiles.length === 0) return;

    pendingCategoryRevealRef.current = null;
    const viewport = scrollContainer.getBoundingClientRect();
    const bounds = tiles.reduce((result, tile) => {
      const rect = tile.getBoundingClientRect();
      return {
        top: Math.min(result.top, rect.top),
        right: Math.max(result.right, rect.right),
        bottom: Math.max(result.bottom, rect.bottom),
        left: Math.min(result.left, rect.left),
      };
    }, { top: Infinity, right: -Infinity, bottom: -Infinity, left: Infinity });

    const isVisible = bounds.left >= viewport.left && bounds.right <= viewport.right
      && bounds.top >= viewport.top && bounds.bottom <= viewport.bottom;
    if (isVisible) return;

    const targetLeft = Math.max(0, Math.min(
      scrollContainer.scrollWidth - scrollContainer.clientWidth,
      scrollContainer.scrollLeft + (bounds.left + bounds.right - viewport.left - viewport.right) / 2,
    ));
    const targetTop = Math.max(0, Math.min(
      scrollContainer.scrollHeight - scrollContainer.clientHeight,
      scrollContainer.scrollTop + (bounds.top + bounds.bottom - viewport.top - viewport.bottom) / 2,
    ));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scrollContainer.scrollTo(targetLeft, targetTop);
      return;
    }

    if (scrollAnimationFrameRef.current) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
    }
    const startLeft = scrollContainer.scrollLeft;
    const startTop = scrollContainer.scrollTop;
    const startedAt = performance.now();
    const duration = 380;
    const animateScroll = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      scrollContainer.scrollTo(
        startLeft + (targetLeft - startLeft) * easedProgress,
        startTop + (targetTop - startTop) * easedProgress,
      );
      if (progress < 1) scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll);
    };
    scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll);
  }, [elements, selectedFilters]);

  useEffect(() => {
    let cancelled = false;
    let cacheLoaded = false;
    let activeController = null;
    let requestId = 0;
    let hasCachedElements = false;

    const setOfflineState = () => {
      if (hasCachedElements) {
        setRequestState("loaded");
        setErrorMessage("");
      } else if (cacheLoaded) {
        setRequestState("error");
        setErrorMessage("Chưa có dữ liệu ngoại tuyến. Hãy kết nối mạng để tải bảng tuần hoàn lần đầu.");
      }
    };

    const refreshElements = async () => {
      if (cancelled || !navigator.onLine || !cacheLoaded) return;
      if (activeController && !activeController.signal.aborted) return;

      const controller = new AbortController();
      activeController = controller;
      const currentRequestId = ++requestId;
      setErrorMessage("");
      if (!hasCachedElements) setRequestState("loading");
      try {
        const from = 1;
        const to = TOTAL_ELEMENTS;
        const response = await fetch(PERIODIC_TABLE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: PERIODIC_TABLE_FIELDS, from, to }),
          signal: controller.signal,
        });
        const responseBody = await response.text();
        let result;

        try {
          result = JSON.parse(responseBody);
        } catch {
          throw new Error(
            response.ok
              ? "Periodic table API returned invalid JSON"
              : `API request failed (${response.status})`,
          );
        }
        if (!response.ok) {
          throw new Error(result.error ?? `API request failed (${response.status})`);
        }
        if (
          result.from !== from ||
          result.to !== to ||
          JSON.stringify(result.fields) !== JSON.stringify(REQUIRED_RESPONSE_FIELDS) ||
          !Array.isArray(result.rows) ||
          result.rows.length > TOTAL_ELEMENTS
        ) {
          throw new TypeError("Periodic table API returned an invalid result");
        }

        const elementsByNumber = new Map();
        result.rows.forEach((row) => {
          if (
            !row ||
            typeof row !== "object" ||
            Array.isArray(row) ||
            !Number.isSafeInteger(row.number) ||
            row.number < from ||
            row.number > to ||
            REQUIRED_RESPONSE_FIELDS.some((field) => !Object.hasOwn(row, field)) ||
            elementsByNumber.has(row.number)
          ) {
            throw new TypeError("Periodic table API returned an invalid element row");
          }
          elementsByNumber.set(row.number, {
            number: row.number,
            name: row.name,
            symbol: row.symbol,
            category: row.category,
            elementGroup: row.group,
            period: row.period,
          });
        });
        const refreshedElements = [...elementsByNumber.values()]
          .sort((left, right) => left.number - right.number);
        if (cancelled || currentRequestId !== requestId) return;
        if (refreshedElements.length > 0) {
          hasCachedElements = true;
          setElements(refreshedElements);
          try {
            await saveCachedElements(refreshedElements);
          } catch (error) {
            console.error("Failed to save offline periodic table data", error);
            setCacheError("Không thể lưu dữ liệu bảng tuần hoàn để dùng ngoại tuyến.");
          }
        }
        if (cancelled || currentRequestId !== requestId) return;
        setRequestState("loaded");
        setErrorMessage("");
      } catch (error) {
        if (cancelled || currentRequestId !== requestId || error.name === "AbortError") return;
        if (!navigator.onLine) {
          setOfflineState();
          return;
        }
        console.error("Failed to load periodic table", error);
        if (hasCachedElements) {
          const availableElements = await readCachedElements().catch((cacheReadError) => {
            console.error("Failed to read cached data after a network error", cacheReadError);
            return [];
          });
          if (cancelled || currentRequestId !== requestId) return;
          if (availableElements.length > 0) setElements(availableElements);
          setErrorMessage("Đang hiển thị dữ liệu đã lưu. Không thể kết nối để cập nhật.");
          setRequestState("loaded");
        } else {
          setErrorMessage(error.message);
          setRequestState("error");
        }
      } finally {
        if (activeController === controller) activeController = null;
      }
    };

    const handleOffline = () => {
      requestId += 1;
      activeController?.abort();
      activeController = null;
      setOfflineState();
    };
    const handleOnline = () => {
      if (!cacheLoaded) return;
      activeController?.abort();
      activeController = null;
      refreshElements();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    const loadCacheAndRefresh = async () => {
      try {
        const cachedElements = await readCachedElements();
        if (cancelled) return;
        hasCachedElements = cachedElements.length > 0;
        if (hasCachedElements) setElements(cachedElements);
      } catch (error) {
        console.error("Failed to read offline periodic table cache", error);
        setCacheError("Không thể đọc dữ liệu bảng tuần hoàn đã lưu trên thiết bị.");
      }

      cacheLoaded = true;
      if (!navigator.onLine) {
        setOfflineState();
      } else {
        refreshElements();
      }
    };

    loadCacheAndRefresh();

    return () => {
      cancelled = true;
      requestId += 1;
      activeController?.abort();
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const categories = CATEGORY_ORDER;
  const elementsBySlot = new Map(
    elements
      .filter((element) => element.category !== "lanthanide" && element.category !== "actinide")
      .map((element) => [`${element.period}-${element.elementGroup}`, element]),
  );
  const elementsByFBlockNumber = new Map(
    elements.map((element) => [element.number, element]),
  );
  const getElementDimState = (element) => {
    if (hoveredFilter && matchesFilter(element, hoveredFilter)) {
      return "element-tile-highlighted";
    }

    const matchesSelectedFilter = [...selectedFilters].some((key) => {
      const [type, value] = key.split(":");
      return matchesFilter(element, {
        type,
        value: type === "category" ? value : Number(value),
      });
    });

    if (hoveredFilter) {
      return matchesSelectedFilter
        ? "element-tile-selected-dimmed"
        : "element-tile-dimmed";
    }
    return selectedFilters.size > 0 && !matchesSelectedFilter
      ? "element-tile-dimmed"
      : "";
  };

  const toggleFilter = (filter) => {
    const key = `${filter.type}:${filter.value}`;
    setSelectedFilters((selected) => {
      const next = new Set(selected);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        if (filter.type === "category") {
          pendingCategoryRevealRef.current = filter.value;
        }
      }
      return next;
    });
  };

  const setHoveringFilter = (filter) => {
    setHoveredFilter({ ...filter, key: `${filter.type}:${filter.value}` });
  };

  const getFilterButtonProps = (filter) => {
    const key = `${filter.type}:${filter.value}`;
    const setMouseHover = (event) => {
      if (event.pointerType === "mouse") setHoveringFilter(filter);
    };
    const clearMouseHover = (event) => {
      if (event.pointerType === "mouse") {
        setHoveredFilter((current) => (current?.key === key ? null : current));
      }
    };
    return {
      type: "button",
      "aria-pressed": selectedFilters.has(key),
      onClick: () => toggleFilter(filter),
      onPointerEnter: setMouseHover,
      onPointerLeave: clearMouseHover,
    };
  };

  return (
    <main className="periodic-table-page">
      {requestState === "loading" && (
        <div className="periodic-table-status periodic-table-loading" role="status">
          Đang tải bảng tuần hoàn...
        </div>
      )}
      {requestState === "error" && (
        <div className="periodic-table-status periodic-table-error" role="alert">
          <strong>Chưa thể tải bảng tuần hoàn</strong>
          <span>{errorMessage}</span>
        </div>
      )}
      {cacheError && (
        <div className="periodic-table-status periodic-table-error" role="alert">
          {cacheError}
        </div>
      )}
      {requestState === "loaded" && errorMessage && (
        <div className="periodic-table-status periodic-table-offline-note" role="status">
          {errorMessage}
        </div>
      )}

      {(requestState !== "error" || elements.length > 0) && (
        <section className="periodic-table-section" aria-label="Bảng tuần hoàn các nguyên tố">
          <div className="periodic-table-scroll" ref={tableScrollRef}>
            <div className="periodic-table-grid">
              <div className="group-corner">
                <span>Chu kì</span>
                <span>/ Nhóm</span>
              </div>
              {GROUPS.map((group) => (
                <button
                  className={`axis-filter group-label${selectedFilters.has(`group:${group}`) ? " selected" : ""}`}
                  key={group}
                  style={{ gridColumn: group + 1, gridRow: 1 }}
                  aria-label={`Nhóm ${GROUP_ROMAN_LABELS[group - 1]}`}
                  {...getFilterButtonProps({ type: "group", value: group })}
                >
                  {GROUP_ROMAN_LABELS[group - 1]}
                </button>
              ))}
              {PERIODS.map((period) => (
                <button
                  className={`axis-filter period-label${selectedFilters.has(`period:${period}`) ? " selected" : ""}`}
                  key={period}
                  aria-label={`Chu kỳ ${period}`}
                  style={{ gridColumn: 1, gridRow: period + 1 }}
                  {...getFilterButtonProps({ type: "period", value: period })}
                >
                  {period}
                </button>
              ))}

              <div
                className="periodic-table-legend"
                role="group"
                aria-label="Phân loại nguyên tố"
                style={{ gridColumn: "4 / span 10", gridRow: "2 / span 3" }}
              >
                {categories.map((category) => (
                  <button
                    className={`legend-item category-${category}${selectedFilters.has(`category:${category}`) ? " selected" : ""}`}
                    key={category}
                    {...getFilterButtonProps({ type: "category", value: category })}
                  >
                    <span className="legend-swatch" />
                    {CATEGORY_LABELS[category] ?? category}
                  </button>
                ))}
              </div>

              {PERIODS.flatMap((period) =>
                PERIOD_GROUPS[period].map((group) => {
                  if (group === 3 && (period === 6 || period === 7)) return null;
                  const element = elementsBySlot.get(`${period}-${group}`);
                  return (
                    <div
                      className="periodic-table-cell"
                      key={`${period}-${group}`}
                      style={{ gridColumn: group + 1, gridRow: period + 1 }}
                    >
                      {element
                        ? (
                          <ElementTile
                            element={element}
                            dimState={getElementDimState(element)}
                          />
                        )
                        : <ElementLoadingTile loading={requestState === "loading"} />}
                    </div>
                  );
                }),
              )}

              <div
                className="series-placeholder"
                style={{ gridColumn: 4, gridRow: 7 }}
              >
                <span>57–71</span>
                <strong>Lanthanide</strong>
              </div>
              {Array.from({ length: 15 }, (_value, index) => {
                const element = elementsByFBlockNumber.get(index + 57);
                return (
                  <div
                    className="periodic-table-cell"
                    key={`lanthanide-${index + 57}`}
                    style={{ gridColumn: index + 4, gridRow: 10 }}
                  >
                    {element
                      ? (
                        <ElementTile
                          element={element}
                          dimState={getElementDimState(element)}
                        />
                      )
                      : <ElementLoadingTile loading={requestState === "loading"} />}
                  </div>
                );
              })}
              <div
                className="series-placeholder"
                style={{ gridColumn: 4, gridRow: 8 }}
              >
                <span>89–103</span>
                <strong>Actinide</strong>
              </div>
              {Array.from({ length: 15 }, (_value, index) => {
                const element = elementsByFBlockNumber.get(index + 89);
                return (
                  <div
                    className="periodic-table-cell"
                    key={`actinide-${index + 89}`}
                    style={{ gridColumn: index + 4, gridRow: 11 }}
                  >
                    {element
                      ? (
                        <ElementTile
                          element={element}
                          dimState={getElementDimState(element)}
                        />
                      )
                      : <ElementLoadingTile loading={requestState === "loading"} />}
                  </div>
                );
              })}

              <div className="series-caption" style={{ gridColumn: 1, gridRow: 10 }}>
                <span>6</span>
                <strong>Lanthanide</strong>
              </div>

              <div className="series-caption" style={{ gridColumn: 1, gridRow: 11 }}>
                <span>7</span>
                <strong>Actinide</strong>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default PeriodicTable;
