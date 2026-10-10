import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Maximize, Play, X } from "lucide-react";
import "./video-cases.css";

const cases = [
  { id: "fanmai-shengji", title: "东南亚人口贩卖升级", number: "01", duration: "03:20" },
  { id: "riben-pengpan", title: "日本经济崩盘", number: "02", duration: "03:32" },
];
const media = (item, extension) => `/media/video-cases/${item.id}.${extension}`;

function CasePlayer({ item, onClose }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fullscreenHint, setFullscreenHint] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    video.play().catch(() => {});
    return () => {
      video.pause();
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  async function enterFullscreen() {
    const video = videoRef.current;
    try {
      if (video.requestFullscreen) await video.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else setFullscreenHint("可在新标签页打开视频，使用播放器的全屏按钮。");
    } catch {
      setFullscreenHint("请使用播放器右下角的全屏按钮。");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="case-player"
      aria-labelledby="case-player-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="case-player-inner">
        <header className="case-player-header">
          <div>
            <span>VIDEO CASE / {item.number}</span>
            <h2 id="case-player-title">{item.title}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="关闭视频案例"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        <div className="case-player-stage">
          <video
            ref={videoRef}
            src={media(item, "mp4")}
            poster={media(item, "webp")}
            controls
            playsInline
            autoPlay
            preload="metadata"
            aria-label={`${item.title}完整视频`}
            onLoadedData={() => setReady(true)}
            onError={() => setFailed(true)}
          />
          {!ready && !failed && (
            <span className="case-player-loading" role="status">
              正在加载视频…
            </span>
          )}
        </div>
        <footer className="case-player-footer">
          <p role="status">
            {failed
              ? "视频暂时无法加载，请尝试在新标签页打开。"
              : fullscreenHint || "完整作品 · 原声播放"}
          </p>
          <div>
            <a href={media(item, "mp4")} target="_blank" rel="noreferrer">
              打开视频 <ArrowUpRight size={16} />
            </a>
            <button className="case-fullscreen" onClick={enterFullscreen}>
              <Maximize size={16} />
              全屏观看
            </button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}

export default function VideoCases({ onViewerOpen, onViewerClose }) {
  const [selected, setSelected] = useState(null);
  function openCase(item) {
    onViewerOpen();
    setSelected(item);
  }
  function closeCase() {
    setSelected(null);
    onViewerClose();
  }
  return (
    <section
      id="films"
      className="video-cases section-space"
      aria-labelledby="video-cases-title"
    >
      <div className="shell">
        <div className="section-label">
          <span className="section-index">01</span>
          <span>SELECTED FILMS / 视频案例</span>
        </div>
        <div className="film-heading">
          <h2 id="video-cases-title">
            先看作品，<span>再认识我。</span>
          </h2>
          <p>
            用两支完整作品，看看我的内容表达。
            <br />
            点击播放，进入故事。
          </p>
        </div>
        <div className="film-grid">
          {cases.map((item) => (
            <button
              className="film-card"
              key={item.id}
              aria-label={`播放视频案例：${item.title}`}
              onClick={() => openCase(item)}
            >
              <div className="film-cover">
                <img
                  className="film-backdrop"
                  src={media(item, "webp")}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
                <img
                  className="film-poster"
                  src={media(item, "webp")}
                  alt={`${item.title}视频画面`}
                  loading="lazy"
                />
                <div className="film-cover-shade" />
                <span className="film-number">VIDEO CASE / {item.number}</span>
                <span className="film-play">
                  <Play size={25} fill="currentColor" aria-hidden="true" />
                </span>
                <span className="film-watch-label">
                  播放完整视频 <ArrowUpRight size={16} />
                </span>
                <span className="film-format">{item.duration} · 完整作品</span>
              </div>
              <div className="film-card-info">
                <div>
                  <span>视频案例 {item.number}</span>
                  <h3>{item.title}</h3>
                </div>
                <ArrowUpRight size={25} aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
        <div className="film-bottom">
          <span>STORIES WORTH WATCHING.</span>
          <a href="#work">
            继续了解项目与成果 <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      {selected && <CasePlayer item={selected} onClose={closeCase} />}
    </section>
  );
}
