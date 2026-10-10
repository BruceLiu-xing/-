import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Plus,
  Minus,
  X,
  Menu,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  Play,
  Pause,
  Sparkles,
  Clapperboard,
  ChartNoAxesCombined,
  ScanLine,
} from "lucide-react";
import { profile, stats, experiences, projects, capabilities } from "./content";
import EvidenceGallery, { evidenceCategories } from "./EvidenceGallery";
import VideoCases from "./VideoCases";
import "./styles.css";

const asset = (name) => `/media/${name}`;
const icons = {
  spark: Sparkles,
  film: Clapperboard,
  chart: ChartNoAxesCombined,
  target: ScanLine,
};

function Star({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 0c1.3 13.2 6.8 18.7 20 20-13.2 1.3-18.7 6.8-20 20C18.7 26.8 13.2 21.3 0 20 13.2 18.7 18.7 13.2 20 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SectionLabel({ number, children }) {
  return (
    <div className="section-label">
      <span className="section-index">{number}</span>
      <span>{children}</span>
    </div>
  );
}

function ProjectVisual({ project }) {
  if (project.id === "science")
    return (
      <div className="project-visual science-visual">
        <img
          className="science-scene"
          src={asset("hero-poster.webp")}
          alt=""
          loading="lazy"
        />
        <div className="visual-wordmark">
          科学放映室<span>THE SCIENCE CINEMA</span>
        </div>
        <div className="phone-stack">
          <img
            src={asset("universe-account.webp")}
            alt="科普矩阵账号页面"
            loading="lazy"
          />
          <img
            src={asset("science-account.webp")}
            alt="科学放映室账号页面"
            loading="lazy"
          />
        </div>
        <span className="visual-note">好奇心，是故事的起点。</span>
      </div>
    );
  if (project.id === "brand")
    return (
      <div className="project-visual brand-visual">
        <img
          className="brand-photo"
          src={asset("brand-meeting.webp")}
          alt="作品集中的品牌沟通会议照片"
          loading="lazy"
        />
        <div className="brand-overlay" />
        <span className="visual-topline">CREATIVITY MEETS BUSINESS</span>
        <div className="brand-words">
          让故事
          <br />
          <em>与品牌相遇。</em>
        </div>
        <div className="brand-names">
          智己汽车 <span>小鹏汽车</span> 京东 <span>卡萨帝</span>
        </div>
      </div>
    );
  if (project.id === "teaching")
    return (
      <div className="project-visual teaching-visual">
        <div className="teaching-orbit" />
        <div className="teaching-title">
          从创作者
          <br />
          到同行者<span>CREATE. SHARE. GROW.</span>
        </div>
        <img
          className="teaching-phone phone-back"
          src={asset("teaching-session.webp")}
          alt="内容创作教学画面"
          loading="lazy"
        />
        <img
          className="teaching-phone phone-front"
          src={asset("teaching-live.webp")}
          alt="科普直播教学画面"
          loading="lazy"
        />
      </div>
    );
  return (
    <div className="project-visual drama-visual">
      <div className="film-perforations top" />
      <div className="film-perforations bottom" />
      <span className="visual-topline">STORIES THAT CONVERT</span>
      <div className="drama-title">
        每一帧，
        <br />
        都有<em>吸引力。</em>
      </div>
      <div className="drama-proof">
        <img
          src={asset("drama-result.webp")}
          alt="短剧项目历史收益记录"
          loading="lazy"
        />
      </div>
      <span className="frame-mark">SCENE 04 / CONTENT & GROWTH</span>
    </div>
  );
}

const projectEvidence = {
  science: ["accounts", "income", "honors"],
  brand: ["brand", "commerce"],
  teaching: ["teaching"],
  drama: ["brand"],
};

function ProjectDialog({ project, onClose, onOpenEvidence }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = prevOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="project-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="project-dialog-title"
    >
      <div className="dialog-inner">
        <button
          className="icon-button dialog-close"
          onClick={onClose}
          aria-label="关闭项目详情"
        >
          <X size={22} />
        </button>
        <div className="dialog-kicker">
          <span>PROJECT / {project.number}</span>
          <span>{project.period}</span>
        </div>
        <h2 id="project-dialog-title">{project.name}</h2>
        <p className="dialog-intro">{project.description}</p>
        <div className="dialog-results">
          {project.results.map((result) => (
            <div key={result.label}>
              <strong>{result.value}</strong>
              <span>{result.label}</span>
            </div>
          ))}
        </div>
        <div className="dialog-role">
          <h3>我负责的部分</h3>
          <ul>
            {project.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {project.brands && (
          <div className="dialog-brands">
            {project.brands.map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        )}
        <div className="dialog-gallery-heading">
          <h3>项目记录</h3>
          <span>点击图片查看原尺寸</span>
        </div>
        <div className="dialog-gallery">
          {project.images.map((img) => (
            <figure key={img.src}>
              <a
                href={asset(img.src)}
                target="_blank"
                rel="noreferrer"
                aria-label={`查看${img.caption}大图`}
              >
                <img src={asset(img.src)} alt={img.caption} />
              </a>
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="source-note">{project.sourceNote}</p>
        <div className="project-evidence-links">
          <h3>更多业绩材料</h3>
          <p>继续查看相关分类中的完整截图与照片。</p>
          <div>
            {projectEvidence[project.id].map((id) => {
              const group = evidenceCategories.find((item) => item.id === id);
              return (
                <button key={id} onClick={() => onOpenEvidence(id)}>
                  {group.label}
                  <span>{group.count} 张</span>
                  <ArrowUpRight size={16} />
                </button>
              );
            })}
          </div>
        </div>
        <button className="text-link" onClick={onClose}>
          返回作品集 <ArrowRight size={17} />
        </button>
      </div>
    </dialog>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [filter, setFilter] = useState("全部作品");
  const [selectedProject, setSelectedProject] = useState(null);
  const [evidenceCategory, setEvidenceCategory] = useState("all");
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [copied, setCopied] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const resumeHeroAfterCase = useRef(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    const sections = document.querySelectorAll("main > section[id], #evidence");
    const secondScreen = document.getElementById("films");
    const onScroll = () => {
      const anchorOffset =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      setScrolled(
        !!secondScreen &&
          secondScreen.getBoundingClientRect().top <= anchorOffset + 1,
      );
      const current = Array.from(sections)
        .filter(
          (section) =>
            section.getBoundingClientRect().top <= window.innerHeight * 0.35,
        )
        .at(-1);
      setActiveSection(current?.id || "home");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const anchorFrame = requestAnimationFrame(() => {
      const anchor = document.getElementById(window.location.hash.slice(1));
      anchor?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      if (reduceMotion.matches) videoRef.current?.pause();
      else videoRef.current?.play().catch(() => {});
    };
    syncMotion();
    reduceMotion.addEventListener("change", syncMotion);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(anchorFrame);
      reduceMotion.removeEventListener("change", syncMotion);
      clearTimeout(toastTimer.current);
    };
  }, []);

  async function copyContact(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`${label}已复制`);
    } catch {
      setCopied("复制未成功，请长按或选中文字复制");
    }
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setCopied(""), 2800);
  }
  function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }
  function openEvidence(category = "all") {
    setSelectedProject(null);
    setEvidenceCategory(category);
    requestAnimationFrame(() => {
      document.getElementById("evidence")?.scrollIntoView({ block: "start" });
      window.history.replaceState(null, "", "#evidence");
    });
  }
  function pauseHeroForCase() {
    resumeHeroAfterCase.current =
      !!videoRef.current && !videoRef.current.paused;
    videoRef.current?.pause();
  }
  function restoreHeroAfterCase() {
    if (
      resumeHeroAfterCase.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      videoRef.current?.play().catch(() => {});
    }
    resumeHeroAfterCase.current = false;
  }
  const navItems = [
    { id: "films", text: "视频案例" },
    { id: "about", text: "关于我" },
    { id: "work", text: "精选项目" },
    { id: "evidence", text: "业绩证明" },
    { id: "expertise", text: "个人优势" },
  ];
  const shownProjects = projects.filter(
    (project) => filter === "全部作品" || project.category === filter,
  );

  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nav-shell">
          <a href="#home" className="logo" aria-label="刘圣星作品集首页">
            <Star />
            <div>
              LIU SHENGXING<span>CONTENT CREATOR & AI DIRECTOR</span>
            </div>
          </a>
          <nav
            className={menuOpen ? "nav-links is-open" : "nav-links"}
            aria-label="主导航"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "active" : ""}
                aria-current={
                  activeSection === item.id ? "location" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.text}
              </a>
            ))}
            <a
              className="nav-contact"
              href="#contact"
              onClick={() => setMenuOpen(false)}
            >
              聊聊合作 <ArrowUpRight size={16} />
            </a>
          </nav>
          <button
            className="menu-toggle icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "关闭导航" : "打开导航"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main">
        <section id="home" className="hero">
          <div className="hero-media" aria-hidden="true">
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="auto"
              poster={asset("hero-underground-poster.webp")}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            >
              <source src={asset("hero-underground.mp4")} type="video/mp4" />
            </video>
          </div>
          <div className="hero-shade" />
          <div className="hero-content shell">
            <div className="hero-eyebrow">
              <span className="status-dot" /> 独立思考，持续创作{" "}
              <span className="eyebrow-line" /> PORTFOLIO 2026
            </div>
            <h1>
              让好内容，
              <br />
              <span>被更多人看见。</span>
            </h1>
            <div className="hero-role">
              AI 短视频编导 <span>/</span> 资深内容运营
            </div>
            <p className="hero-description">
              我是刘圣星。从一个好奇的念头出发，
              <br />
              用影像讲述科技，以内容连接人与世界。
            </p>
            <a href="#films" className="button button-primary">
              观看视频案例 <Play size={17} fill="currentColor" />
            </a>
          </div>
          <div className="hero-caption">
            <span className="caption-cross">+</span>
            <div>
              BEYOND THE FRAME.<span>故事的边界，不止于画面。</span>
            </div>
          </div>
          <div className="hero-bottom shell">
            <a href="#films" className="scroll-cue">
              <span className="scroll-icon">
                <ArrowDown size={14} />
              </span>{" "}
              向下探索 <span>SCROLL TO DISCOVER</span>
            </a>
            <div className="hero-topics">
              SCIENCE <span>/</span> TECHNOLOGY <span>/</span> FINANCE
            </div>
            <button
              className="video-toggle"
              onClick={toggleVideo}
              aria-label={videoPlaying ? "暂停背景视频" : "播放背景视频"}
            >
              {videoPlaying ? (
                <Pause size={12} fill="currentColor" />
              ) : (
                <Play size={12} fill="currentColor" />
              )}{" "}
              <span>{videoPlaying ? "PAUSE" : "PLAY"}</span>
            </button>
          </div>
        </section>

        <VideoCases
          onViewerOpen={pauseHeroForCase}
          onViewerClose={restoreHeroAfterCase}
        />

        <section id="about" className="about section-space shell">
          <SectionLabel number="02">ABOUT ME / 关于我</SectionLabel>
          <div className="about-grid">
            <div className="about-visual">
              <div className="portrait-frame">
                <span className="portrait-coordinate">
                  23°07′ N / 113°16′ E
                </span>
                <img
                  src={asset("portrait-full.webp")}
                  alt="刘圣星个人形象"
                  loading="lazy"
                />
                <div className="portrait-bottom">
                  <span>
                    LIU
                    <br />
                    SHENGXING
                  </span>
                  <Star />
                </div>
              </div>
              <div className="portrait-caption">
                <span>
                  <MapPin size={13} /> 中国 · 广州
                </span>
                <span>始终对世界保持好奇</span>
              </div>
            </div>
            <div className="about-copy">
              <h2>
                内容是我的语言。
                <br />
                <span>创造，是我的日常。</span>
              </h2>
              <p className="about-lead">
                你好，我是刘圣星。
                <br />
                一名连接创意、技术与增长的内容创作者。
              </p>
              <p>
                过去 8
                年，我持续深耕科普、科技与财经短视频，从选题和脚本，到影像制作、账号运营与商业合作，把一个个想法变成被看见的作品。
              </p>
              <p>
                现在，我将 AI
                融入创作工作流，探索更有想象力的表达，也始终关注内容能否让人理解、产生共鸣并留下记忆。
              </p>
              <div className="about-tags">
                <span>内容编导</span>
                <span>AI 影像创作</span>
                <span>账号增长</span>
                <span>商业策划</span>
              </div>
              <div className="about-contact">
                <a href={`mailto:${profile.email}`}>
                  {profile.email}
                  <ArrowUpRight size={15} />
                </a>
                <button onClick={() => copyContact(profile.phone, "电话")}>
                  {profile.phone}
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong>
                  {stat.value}
                  <span>{stat.unit}</span>
                </strong>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="experience-heading">
            <h3>
              一路创作，一路生长<span>EXPERIENCE</span>
            </h3>
            <button
              className="text-link"
              onClick={() => setShowAllExperience(!showAllExperience)}
              aria-expanded={showAllExperience}
            >
              {showAllExperience ? "收起经历" : "查看完整经历"}
              {showAllExperience ? <Minus size={16} /> : <Plus size={16} />}
            </button>
          </div>
          <div className="experience-list">
            {experiences.slice(0, showAllExperience ? 4 : 2).map((exp, i) => (
              <article className="experience-row" key={exp.company}>
                <div className="experience-time">
                  <span className={i === 0 ? "current-dot" : "past-dot"} />
                  {exp.time}
                </div>
                <div className="experience-main">
                  <h4>{exp.company}</h4>
                  <p>{exp.description}</p>
                  <span className="experience-result">{exp.result}</span>
                </div>
                <span className="experience-role">{exp.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="work" className="work-section section-space">
          <div className="shell">
            <SectionLabel number="03">SELECTED WORK / 精选项目</SectionLabel>
            <div className="section-heading">
              <h2>
                作品，<span>是最好的介绍。</span>
              </h2>
              <p>
                从内容出发，让创意被看见。
                <br />
                每个项目，都是一次从想法到结果的实践。
              </p>
            </div>
            <div className="work-toolbar">
              <div
                className="project-filters"
                role="group"
                aria-label="项目分类"
              >
                {["全部作品", "内容与增长", "品牌与商业"].map((name) => (
                  <button
                    key={name}
                    className={filter === name ? "selected" : ""}
                    aria-pressed={filter === name}
                    onClick={() => setFilter(name)}
                  >
                    {name}
                    {name === "全部作品" && <sup>04</sup>}
                  </button>
                ))}
              </div>
              <span className="work-count">
                0{shownProjects.length} PROJECTS
              </span>
            </div>
            <div className="project-grid">
              {shownProjects.map((project) => (
                <button
                  key={project.id}
                  className={`project-card card-${project.id}`}
                  onClick={() => setSelectedProject(project)}
                  aria-label={`查看项目：${project.name}`}
                >
                  <div className="project-image-wrap">
                    <ProjectVisual project={project} />
                    <div className="project-top-meta">
                      <span>
                        {project.number} / {project.kicker}
                      </span>
                      <span className="project-open">
                        <ArrowUpRight size={21} />
                      </span>
                    </div>
                    <div className="project-image-stat">
                      <strong>{project.stat}</strong>
                      <span>{project.statLabel}</span>
                    </div>
                  </div>
                  <div className="project-card-info">
                    <div>
                      <div className="project-title-line">
                        <h3>{project.name}</h3>
                        <span>{project.period}</span>
                      </div>
                      <p>{project.summary}</p>
                      <div className="project-tags">
                        {project.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <ArrowUpRight className="project-info-arrow" size={25} />
                  </div>
                </button>
              ))}
            </div>
            <p className="project-footnote">
              项目数据来自个人履历与作品集，图片为项目历史记录。
            </p>
            <EvidenceGallery
              category={evidenceCategory}
              onCategoryChange={setEvidenceCategory}
            />
          </div>
        </section>

        <section
          id="expertise"
          className="expertise-section section-space shell"
        >
          <SectionLabel number="04">MY EXPERTISE / 个人优势</SectionLabel>
          <div className="section-heading">
            <h2>
              有创意，<span>也有落地的能力。</span>
            </h2>
            <p>
              理解内容，也理解内容背后的目标。
              <br />
              让每一个想法，都有走向结果的路径。
            </p>
          </div>
          <div className="capability-grid">
            {capabilities.map((capability) => {
              const Icon = icons[capability.icon];
              return (
                <article className="capability-card" key={capability.number}>
                  <div className="capability-top">
                    <Icon size={29} strokeWidth={1.3} />
                    <span>{capability.number}</span>
                  </div>
                  <span className="capability-english">
                    {capability.english}
                  </span>
                  <h3>{capability.title}</h3>
                  <p>{capability.text}</p>
                  <div className="capability-tags">
                    {capability.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="workflow">
            <span>
              我的创作路径<span className="workflow-en">HOW I WORK</span>
            </span>
            <ol>
              {["发现选题", "打磨脚本", "设计分镜", "影像制作", "发布复盘"].map(
                (item, i) => (
                  <li key={item}>
                    <span>0{i + 1}</span>
                    {item}
                    {i < 4 && <ArrowRight size={16} />}
                  </li>
                ),
              )}
            </ol>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-orbit" aria-hidden="true" />
          <div className="shell contact-shell">
            <SectionLabel number="05">LET’S CONNECT / 联系我</SectionLabel>
            <div className="contact-main">
              <div>
                <span className="contact-eyebrow">
                  <span className="status-dot" /> 开放交流与合作
                </span>
                <h2>
                  下一个好故事，
                  <br />
                  <span>我们一起创造。</span>
                  <Star />
                </h2>
                <p>
                  关于 AI 影像、内容创作，或一次新的职业机会。
                  <br />
                  期待听到你的想法。
                </p>
                <a
                  className="button button-primary contact-cta"
                  href={`mailto:${profile.email}`}
                >
                  聊聊你的想法 <ArrowUpRight size={20} />
                </a>
              </div>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-label">
                    <Mail size={15} /> EMAIL / 邮箱
                  </span>
                  <div>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                    <button
                      className="copy-button"
                      aria-label="复制邮箱"
                      onClick={() => copyContact(profile.email, "邮箱")}
                    >
                      <Copy size={17} />
                    </button>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-label">
                    <Phone size={15} /> PHONE / 电话
                  </span>
                  <div>
                    <a href={`tel:${profile.phone}`}>137 2513 2272</a>
                    <button
                      className="copy-button"
                      aria-label="复制电话"
                      onClick={() => copyContact(profile.phone, "电话")}
                    >
                      <Copy size={17} />
                    </button>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-label">
                    <MapPin size={15} /> BASED IN / 所在城市
                  </span>
                  <div>
                    <span>中国 · 广州</span>
                    <span className="location-en">GUANGZHOU, CN</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="contact-bottom">
              <div className="footer-name">
                LIU SHENGXING<span>持续好奇，持续创造。</span>
              </div>
              <span>© 2026 刘圣星 · 个人作品集</span>
              <a href="#home">
                回到顶部 <ArrowUp size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <div
        className={`toast ${copied ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {copied && (
          <>
            <Check size={17} />
            {copied}
          </>
        )}
      </div>
      {selectedProject && (
        <ProjectDialog
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpenEvidence={openEvidence}
        />
      )}
    </>
  );
}

const root =
  import.meta.hot?.data.root ?? createRoot(document.getElementById("root"));
if (import.meta.hot) import.meta.hot.data.root = root;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
