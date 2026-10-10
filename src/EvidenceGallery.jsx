import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  ZoomIn,
  ZoomOut,
  Images,
} from "lucide-react";
import evidence from "./evidence-data.json";

export const evidenceCategories = evidence.categories;
export const evidenceCount = evidence.items.length;
const PAGE_SIZE = 12;

function EvidenceViewer({ items, initialIndex, onClose }) {
  const dialogRef = useRef(null);
  const stageRef = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const item = items[index];
  const category = evidenceCategories.find(
    (category) => category.id === item.category,
  );
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    setZoomed(false);
    stageRef.current?.scrollTo({ top: 0, left: 0 });
  }, [index]);
  function navigate(direction) {
    setIndex((current) => (current + direction + items.length) % items.length);
  }
  return (
    <dialog
      ref={dialogRef}
      className="evidence-lightbox"
      aria-labelledby="evidence-lightbox-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          navigate(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          navigate(1);
        }
      }}
    >
      <div className="evidence-lightbox-inner">
        <header className="evidence-lightbox-header">
          <div>
            <span>
              {category.label} / {index + 1} OF {items.length}
            </span>
            <h3 id="evidence-lightbox-title">{item.title}</h3>
          </div>
          <button
            className="icon-button"
            aria-label="关闭业绩图片"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>
        <div
          className={`evidence-image-stage ${zoomed ? "is-zoomed" : ""}`}
          ref={stageRef}
        >
          <img
            key={item.id}
            className="evidence-full-image"
            src={item.src}
            alt={item.title}
          />
        </div>
        <footer className="evidence-lightbox-footer">
          <div className="evidence-image-controls">
            <button
              className="icon-button"
              aria-label="上一张业绩图片"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
            </button>
            <span aria-live="polite">
              {index + 1} / {items.length}
            </span>
            <button
              className="icon-button"
              aria-label="下一张业绩图片"
              onClick={() => navigate(1)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="evidence-file-info">
            <span title={item.fileName}>{item.fileName}</span>
            <small>
              {item.width} × {item.height}
            </small>
          </div>
          <div className="evidence-view-actions">
            <button onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>
              {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}{" "}
              {zoomed ? "适应窗口" : "放大查看"}
            </button>
            <a href={item.src} target="_blank" rel="noreferrer">
              打开原图 <ArrowUpRight size={16} />
            </a>
          </div>
        </footer>
      </div>
    </dialog>
  );
}

function EvidenceGrid({ items }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const shown = items.slice(0, limit);
  return (
    <>
      <div className="evidence-grid">
        {shown.map((item, index) => (
          <button
            key={item.id}
            className="evidence-card"
            onClick={() => setSelectedIndex(index)}
            aria-label={`查看业绩图片：${item.title}`}
          >
            <div className="evidence-thumbnail">
              <img
                src={item.thumbnail}
                alt={item.title}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
              />
              <span className="evidence-zoom-badge">
                <ZoomIn size={18} />
              </span>
            </div>
            <div className="evidence-card-meta">
              <span>
                {
                  evidenceCategories.find(
                    (category) => category.id === item.category,
                  ).label
                }
              </span>
              <h4>{item.title}</h4>
              <p title={item.fileName}>{item.fileName}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="evidence-gallery-bottom">
        <p aria-live="polite">
          已展示 {shown.length} / {items.length} 张
          <span>点击图片放大，使用左右方向键切换。</span>
        </p>
        {limit < items.length && (
          <button
            className="evidence-load-more"
            onClick={() => setLimit(limit + PAGE_SIZE)}
          >
            继续查看 <span>+{Math.min(PAGE_SIZE, items.length - limit)}</span>
            <Plus size={17} />
          </button>
        )}
      </div>
      {selectedIndex !== null && (
        <EvidenceViewer
          items={items}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}

export default function EvidenceGallery({ category, onCategoryChange }) {
  const items =
    category === "all"
      ? evidence.items
      : evidence.items.filter((item) => item.category === category);
  return (
    <div className="evidence-archive" id="evidence">
      <div className="evidence-archive-heading">
        <div>
          <span className="evidence-kicker">RESULTS IN DETAIL / 业绩证明</span>
          <h3>
            每一份成果，<span>都有迹可循。</span>
          </h3>
          <p>账号、合作、带货与教学，把一路积累的项目记录展开给你看。</p>
        </div>
        <div className="evidence-total">
          <Images size={20} />
          <strong>{evidenceCount}</strong>
          <span>张截图与照片</span>
        </div>
      </div>
      <div className="evidence-filters" role="group" aria-label="业绩证明分类">
        <button
          className={category === "all" ? "selected" : ""}
          aria-pressed={category === "all"}
          onClick={() => onCategoryChange("all")}
        >
          全部材料<span>{evidenceCount}</span>
        </button>
        {evidenceCategories.map((group) => (
          <button
            key={group.id}
            className={category === group.id ? "selected" : ""}
            aria-pressed={category === group.id}
            onClick={() => onCategoryChange(group.id)}
          >
            {group.label}
            <span>{group.count}</span>
          </button>
        ))}
      </div>
      <p className="evidence-category-description">
        {category === "all"
          ? "按六类整理历史记录，可筛选查看完整原图。"
          : evidenceCategories.find((group) => group.id === category)
              .description}
      </p>
      <EvidenceGrid key={category} items={items} />
    </div>
  );
}
