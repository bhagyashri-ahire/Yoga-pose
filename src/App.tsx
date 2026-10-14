import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePoseCoach, type PoseStats } from "./hooks/usePoseCoach";
import { CHECK_NAMES } from "./lib/poseEngine";
import homeHeroImage from "./imports/image-2.png";
import howItWorksImage from "./imports/image-3.png";

type Route = "home" | "poses" | "train" | "progress" | "about";
type IconName =
  | "arrow"
  | "brain"
  | "camera"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "eye"
  | "instagram"
  | "menu"
  | "pause"
  | "play"
  | "spark"
  | "target"
  | "trend"
  | "user"
  | "x";

const images = [
  "https://images.unsplash.com/photo-1758274526663-483cd2284954?auto=format&fit=max&fm=jpg&q=88&w=1400",
  "https://images.unsplash.com/photo-1599447292180-45fd84092ef0?auto=format&fit=max&fm=jpg&q=88&w=1200",
  "https://images.unsplash.com/photo-1599447292411-637efa33e046?auto=format&fit=max&fm=jpg&q=88&w=1200",
  "https://images.unsplash.com/photo-1758274532792-2123a14eeb14?auto=format&fit=max&fm=jpg&q=88&w=1400",
  "https://images.unsplash.com/photo-1758274526447-ea3e051b3dee?auto=format&fit=max&fm=jpg&q=88&w=1400",
  "https://images.unsplash.com/photo-1717839339049-2aba90aaabc1?auto=format&fit=max&fm=jpg&q=88&w=1200",
];

const poses = [
  { slug: "tadasana", name: "Tadasana", common: "Mountain Pose", difficulty: "Beginner", category: "Standing", target: "Posture • Core", image: images[1], description: "Find grounded alignment and build awareness from the feet up." },
  { slug: "vrikshasana", name: "Vrikshasana", common: "Tree Pose", difficulty: "Beginner", category: "Balance", target: "Balance • Hips", image: images[2], description: "Cultivate steady focus, balance, and openness through the hips." },
  { slug: "trikonasana", name: "Trikonasana", common: "Triangle Pose", difficulty: "Intermediate", category: "Flexibility", target: "Hips • Hamstrings", image: images[3], description: "Create length through the side body while opening hips and chest." },
  { slug: "warrior1", name: "Warrior I", common: "Virabhadrasana I", difficulty: "Intermediate", category: "Strength", target: "Legs • Hips • Core", image: images[4], description: "Build lower-body strength with an uplifted, steady upper body." },
  { slug: "warrior2", name: "Warrior II", common: "Virabhadrasana II", difficulty: "Intermediate", category: "Standing", target: "Legs • Shoulders • Core", image: images[0], description: "Develop grounded strength, open hips, and focused alignment." },
  { slug: "bhujangasana", name: "Bhujangasana", common: "Cobra Pose", difficulty: "Beginner", category: "Flexibility", target: "Spine • Chest", image: images[5], description: "Gently strengthen your back while opening the chest and shoulders." },
];

const pathToRoute = (): Route => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (path === "poses" || path === "train" || path === "progress" || path === "about") return path;
  return "home";
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    brain: <><path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.5a3.5 3.5 0 0 0 0 7V16a3.5 3.5 0 0 0 6 2.45V5.55A3.5 3.5 0 0 0 9.5 4.5Z" /><path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v.5a3.5 3.5 0 0 1 0 7V16a3.5 3.5 0 0 1-6 2.45" /><path d="M8 9h1.5M16 9h-1.5M8 15h1.5M16 15h-1.5" /></>,
    camera: <><path d="M14.5 5 13 3H7L5.5 5H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" /><circle cx="10" cy="12" r="4" transform="translate(2)" /></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    pause: <><path d="M9 5v14M15 5v14" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4Z" /><path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Button({ children, variant = "primary", icon, onClick, className = "", type = "button" }: { children: ReactNode; variant?: "primary" | "secondary" | "light" | "ghost"; icon?: IconName; onClick?: () => void; className?: string; type?: "button" | "submit" }) {
  return <button type={type} className={`button button-${variant} ${className}`} onClick={onClick}>{children}{icon && <Icon name={icon} size={17} />}</button>;
}

function AppLink({ to, children, className = "", onNavigate }: { to: string; children: ReactNode; className?: string; onNavigate?: () => void }) {
  const handle = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    onNavigate?.();
  };
  return <a href={to} className={className} onClick={handle}>{children}</a>;
}

function Logo() {
  return <AppLink to="/" className="logo">
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 64 48" fill="none">
        <path d="M32 42C22 34 21 23 32 7C43 23 42 34 32 42Z" />
        <path d="M28 41C17 39 11 31 12 18C23 21 30 29 28 41Z" />
        <path d="M36 41C47 39 53 31 52 18C41 21 34 29 36 41Z" />
        <path d="M21 42C11 44 5 39 3 29C13 28 20 33 21 42Z" />
        <path d="M43 42C53 44 59 39 61 29C51 28 44 33 43 42Z" />
        <path d="M17 25C13 19 14 13 20 8C27 16 27 23 22 30" />
        <path d="M47 25C51 19 50 13 44 8C37 16 37 23 42 30" />
        <path d="M11 44C23 47 41 47 53 44" />
      </svg>
    </span>
    <span>PRANA <b>YOGA</b></span>
  </AppLink>;
}

function Navbar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 36);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const links: [Route, string][] = [["home", "Home"], ["poses", "Poses"], ["train", "Train"], ["progress", "Progress"], ["about", "About"]];
  return (
    <header className={`navbar ${route === "home" ? "navbar-home" : ""} ${route === "home" && scrolled ? "navbar-home-scrolled" : ""}`}>
      <div className="nav-inner">
        <Logo />
        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Main navigation">
          {links.map(([value, label]) => <AppLink key={value} to={value === "home" ? "/" : `/${value}`} className={route === value ? "active" : ""} onNavigate={() => setOpen(false)}>{label}</AppLink>)}
          <div className="mobile-actions"><AppLink to="/train" onNavigate={() => setOpen(false)}><Button>Start Training</Button></AppLink></div>
        </nav>
        <div className="nav-actions">
          <button className="login-button" type="button"><Icon name="user" size={17} /> Login</button>
          <AppLink to="/train"><Button>Start Training</Button></AppLink>
        </div>
        <button className="menu-button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}><Icon name={open ? "x" : "menu"} /></button>
      </div>
    </header>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`eyebrow ${light ? "eyebrow-light" : ""}`}><span /><small>{children}</small></div>;
}

function PoseCard({ pose, compact = false }: { pose: typeof poses[number]; compact?: boolean }) {
  return (
    <article className={`pose-card ${compact ? "pose-card-compact" : ""}`}>
      <div className="pose-image-wrap">
        <img src={pose.image} alt={`${pose.name} yoga practice`} />
        <span className="difficulty">{pose.difficulty}</span>
      </div>
      <div className="pose-card-body">
        <div><small>{pose.common}</small><h3>{pose.name}</h3></div>
        {!compact && <><p>{pose.description}</p><span className="pose-target">{pose.target}</span></>}
        <AppLink to={`/train?pose=${pose.slug}`} className={compact ? "round-arrow" : "practice-link"}>
          {compact ? <Icon name="arrow" /> : <>Practice This Pose <Icon name="arrow" size={17} /></>}
        </AppLink>
      </div>
    </article>
  );
}

function HomePage() {
  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <main>
      <section className="hero">
        <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
        <div className="hero-copy">
          <Eyebrow>AI POWERED YOGA TRAINING</Eyebrow>
          <h1>Your Personal <em>AI Yoga</em> Trainer</h1>
          <p>Practice yoga with real-time AI guidance that watches your posture, understands your alignment, and helps you improve every pose.</p>
          <div className="hero-actions"><Button onClick={() => navigate("/train")} icon="arrow">Start Training</Button><Button variant="secondary" onClick={() => navigate("/poses")}>Explore Poses</Button></div>
          <div className="trust-row"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span></div><p><b>4.9</b> from 2,000+ mindful movers</p></div>
        </div>
        <div className="hero-visual">
          <div className="botanical botanical-one" aria-hidden="true"><span /><span /><span /></div>
          <div className="hero-image"><img src={homeHeroImage} alt="Woman seated in a calm meditation pose" /></div>
          <div className="float-card card-detection"><span className="icon-bubble"><Icon name="eye" /></span><div><small>AI Pose Detection</small><b><i /> Active</b></div></div>
          <div className="float-card card-alignment"><div className="score-ring">92<small>%</small></div><div><small>Alignment</small><b>Excellent</b></div></div>
          <div className="float-card card-pose"><small>Current pose</small><b>Warrior II</b><span>AI recognized</span></div>
        </div>
      </section>

      <section className="journey-bar">
        {["Choose Pose", "Start Camera", "Pose Detected", "Live Correction", "Track Progress"].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p>{index < 4 && <Icon name="chevron" size={15} />}</div>)}
      </section>

      <section className="section why" id="features">
        <div className="section-heading centered"><Eyebrow>WHY PRANA YOGA</Eyebrow><h2>Practice Smarter.<br /><em>Move Better.</em></h2><p>Intelligent guidance meets mindful movement—so every practice becomes more precise, personal, and rewarding.</p></div>
        <div className="feature-grid">
          {[
            ["eye", "Real-Time Correction", "Get clear, gentle feedback while you practice—not after."],
            ["target", "Pose Detection", "AI recognizes when your selected pose is truly established."],
            ["brain", "Alignment Analysis", "Understand key joint angles and refine your form with confidence."],
            ["trend", "Progress Tracking", "See your consistency, accuracy, and practice evolve over time."],
          ].map(([icon, title, text], index) => <article className="feature-card" key={title}><span className="feature-number">0{index + 1}</span><div className="feature-icon"><Icon name={icon as IconName} /></div><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="section practice-section" id="popular-poses">
        <div className="practice-heading"><div><Eyebrow>EXPLORE YOUR PRACTICE</Eyebrow><h2>Move when you want.<br /><em>Grow where you need.</em></h2></div><div><p>Choose a pose and let your personal AI trainer guide you through every angle.</p><AppLink to="/poses" className="text-link">View all poses <Icon name="arrow" size={17} /></AppLink></div></div>
        <div className="pose-scroll">{poses.map(pose => <PoseCard key={pose.slug} pose={pose} compact />)}</div>
      </section>

      <section className="section how-section" id="how-it-works">
        <div className="how-visual"><img src={howItWorksImage} alt="Yoga practitioner stretching outdoors" /><div className="how-overlay"><Icon name="spark" /><p>Guidance that meets you where you are</p></div></div>
        <div className="how-content"><Eyebrow>HOW IT WORKS</Eyebrow><h2>From camera on to<br /><em>confidence up.</em></h2>
          <div className="steps">
            {[
              ["Choose your pose", "Pick your focus from our growing guided library."],
              ["Set up your camera", "Find a clear space and make sure your full body is visible."],
              ["Let AI analyze", "We first detect your body, then confirm the pose before analysis."],
              ["Improve in real time", "Receive calm, actionable cues exactly when you need them."],
            ].map(([title, text], index) => <div className="step" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="benefit-band">
        <div><small>BUILT FOR REAL PRACTICE</small><h2>AI that knows when<br />you’re truly in position.</h2></div>
        <p>PRANA YOGA never guesses. Alignment scores and corrections only begin after your body is visible and your chosen pose is reliably detected.</p>
        <div className="status-demo"><div><i className="pulse-dot" /><span>BODY DETECTED</span></div><strong>Warrior II</strong><small>Ready to analyze</small></div>
      </section>

      <section className="cta-section"><div className="cta-decoration" /><Eyebrow light>YOUR PRACTICE, ELEVATED</Eyebrow><h2>Ready to improve<br /><em>your practice?</em></h2><p>Your first intelligent session is only a breath away.</p><AppLink to="/train"><Button variant="light" icon="arrow">Start Your Session</Button></AppLink></section>
    </main>
  );
}

function PosesPage() {
  const categories = ["All", "Beginner", "Intermediate", "Advanced", "Standing", "Balance", "Flexibility", "Strength"];
  const [category, setCategory] = useState("All");
  const visible = poses.filter(p => category === "All" || p.difficulty === category || p.category === category);
  return (
    <main className="page-main">
      <section className="page-hero">
        <Eyebrow>POSE LIBRARY</Eyebrow><h1>Explore Your <em>Practice</em></h1><p>Choose a pose and let your AI trainer guide you toward stronger, safer alignment.</p>
      </section>
      <section className="library section">
        <div className="filter-row" aria-label="Filter poses">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="library-meta"><p><b>{visible.length}</b> guided poses</p><p>More poses added every month</p></div>
        <div className="library-grid">{visible.map(pose => <PoseCard key={pose.slug} pose={pose} />)}</div>
        {!visible.length && <div className="empty-state"><Icon name="spark" /><h3>New advanced poses are coming soon</h3><p>Explore another category to begin a guided session today.</p></div>}
      </section>
      <section className="mini-cta"><div><Eyebrow light>NOT SURE WHERE TO START?</Eyebrow><h2>Begin with your foundation.</h2></div><AppLink to="/train?pose=tadasana"><Button variant="light" icon="arrow">Practice Tadasana</Button></AppLink></section>
    </main>
  );
}

type PoseResult = { slug: string; name: string; accuracy: number; seconds: number; best: number; checks: { name: string; pct: number; tip: string }[] };
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const gradeOf = (s: number) => (s >= 90 ? ["Excellent", "A"] : s >= 75 ? ["Good", "B"] : s >= 55 ? ["Fair", "C"] : ["Keep practicing", "D"]);
const buildResults = (stats: Record<string, PoseStats>): PoseResult[] =>
  Object.entries(stats).filter(([, q]) => q.sec >= 3 && q.n > 0).map(([slug, q]) => ({
    slug, name: poses.find(p => p.slug === slug)?.name ?? slug, accuracy: Math.round((q.sum / q.n) * 100), seconds: Math.round(q.sec), best: Math.round(q.best),
    checks: q.chk.map((c, i) => ({ name: CHECK_NAMES[slug]?.[i] ?? "Alignment", pct: Math.round((c.p / c.n) * 100), tip: c.bad })),
  }));

type CameraStage = "inactive" | "initializing" | "no-person" | "body" | "detected" | "analyzing" | "paused";

const stageContent: Record<Exclude<CameraStage, "paused">, { title: string; body: string; status: string }> = {
  inactive: { title: "Ready to begin?", body: "Position yourself in front of the camera and we'll guide you through your pose.", status: "Waiting to start" },
  initializing: { title: "Starting camera…", body: "Allow camera access when prompted.", status: "Connecting" },
  "no-person": { title: "Step into the frame", body: "Make sure your full body is visible from head to toe.", status: "Waiting for you" },
  body: { title: "Body detected", body: "Move into your selected pose to begin analysis.", status: "Detecting pose" },
  detected: { title: "Pose detected", body: "Hold steady while we confirm your alignment.", status: "Pose confirmed" },
  analyzing: { title: "Beautiful—hold steady", body: "Your alignment is being analyzed in real time.", status: "AI is analyzing" },
};

function TrainingPage() {
  const query = new URLSearchParams(window.location.search);
  const initial = poses.find(p => p.slug === query.get("pose")) || poses[4];
  const [pose, setPose] = useState(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [stage, setStage] = useState<CameraStage>("inactive");
  const [seconds, setSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState("");
  const [summary, setSummary] = useState<PoseResult[] | null>(null);
  const coach = usePoseCoach({ videoRef, canvasRef, slug: pose.slug, active: cameraOn, paused: stage === "paused" });
  useEffect(() => { if (cameraOn && coach.ready) setStage(s => (s === "paused" ? s : coach.phase)); }, [cameraOn, coach.ready, coach.phase]);
  useEffect(() => {
    if (!coach.error) return;
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOn(false); setCamError(coach.error); setStage("inactive");
  }, [coach.error]);
  const grade = coach.score >= 90 ? ["Excellent", "A"] : coach.score >= 75 ? ["Good", "B"] : coach.score >= 55 ? ["Fair", "C"] : ["Keep adjusting", "D"];
  const feedbackItems = coach.checks.map(c => ({ type: c.ok ? "good" : "warn", text: c.ok ? c.good : c.bad }));

  useEffect(() => {
    if (stage !== "analyzing") return;
    const interval = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [stage]);

  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), []);

  const startCamera = async () => {
    setStage("initializing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamError("");
      setCameraOn(true);
    } catch {
      setCamError("Camera access was blocked. Please allow it in your browser and try again.");
      setStage("inactive");
    }
  };
  const endSession = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    setCameraOn(false);
    setStage("inactive");
    setSummary(buildResults(coach.stats.current));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const active = !["inactive", "initializing"].includes(stage);
  const analysis = stage === "analyzing" || stage === "paused";
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <main className="training-page">
      {summary && <div className="summary-backdrop" role="dialog" aria-modal="true"><div className="summary-card">
        <div className="summary-head"><div><small>SESSION COMPLETE</small><h2>Your pose results</h2></div><button className="summary-x" aria-label="Close" onClick={() => setSummary(null)}><Icon name="x" /></button></div>
        {summary.length === 0 ? <div className="summary-empty"><Icon name="target" size={30} /><h3>No pose was analyzed yet</h3><p>Hold your pose until the status says “Analyzing” and your results will appear here.</p></div> :
          summary.map(r => { const g = gradeOf(r.accuracy); const weak = [...r.checks].sort((a, b) => a.pct - b.pct)[0];
            return <article className="summary-pose" key={r.slug}>
              <div className="summary-top"><span className={`summary-grade ${r.accuracy >= 75 ? "" : "low"}`}>{g[1]}</span><div><h3>{r.name}</h3><p>{g[0]} alignment</p></div><strong className="summary-score">{r.accuracy}<span>%</span></strong></div>
              <div className="summary-stats"><div><small>TIME ANALYZED</small><b>{fmt(r.seconds)}</b></div><div><small>BEST STEADY HOLD</small><b>{fmt(r.best)}</b></div></div>
              <div className="summary-checks">{r.checks.map(c => <div key={c.name}><span>{c.name}</span><div className="summary-bar"><i className={c.pct >= 75 ? "ok" : "warn"} style={{ width: `${c.pct}%` }} /></div><b>{c.pct}%</b></div>)}</div>
              {weak && <div className="summary-tip"><small>FOCUS NEXT TIME</small><p>{weak.pct >= 90 ? "Excellent. Every part of this pose was strong." : `${weak.name}: ${weak.tip}`}</p></div>}
            </article>; })}
        <div className="summary-actions"><Button variant="secondary" onClick={() => { coach.stats.current = {}; setSeconds(0); setSummary(null); }}>Practice again</Button><AppLink to="/progress"><Button icon="arrow">View progress</Button></AppLink></div>
      </div></div>}
      <section className="training-header">
        <div><Eyebrow>AI TRAINING STUDIO</Eyebrow><h1>Your Training Session</h1></div>
        <div className="pose-picker-wrap">
          <small>SELECTED POSE</small><button className="pose-picker" onClick={() => setPickerOpen(!pickerOpen)}><span><b>{pose.name}</b><small>{pose.difficulty}</small></span><Icon name="chevron" /></button>
          {pickerOpen && <div className="pose-menu">{poses.map(item => <button key={item.slug} className={item.slug === pose.slug ? "active" : ""} onClick={() => { setPose(item); setPickerOpen(false); }}>{item.name}<small>{item.difficulty}</small></button>)}</div>}
        </div>
      </section>

      <section className="studio-layout">
        <div className="camera-column">
          <div className={`camera-frame stage-${stage}`}>
            <video ref={videoRef} autoPlay playsInline muted />
            <canvas ref={canvasRef} className="pose-canvas" aria-hidden="true" />
            <div className="camera-gradient" />
            <div className="camera-top">
              {active ? <span className="live-badge"><i /> LIVE</span> : <span className="camera-label"><Icon name="camera" size={15} /> CAMERA OFF</span>}
              <span className="camera-pose">{pose.name}</span>
            </div>
            {stage === "inactive" && <div className="camera-empty"><span className="camera-orbit"><Icon name="camera" size={34} /></span><h2>Ready to practice?</h2><p>{stageContent.inactive.body}</p><Button onClick={startCamera} icon="camera">Start Camera</Button>{camError && <small className="camera-error">{camError}</small>}<small>Your video stays private and is never recorded.</small></div>}
            {stage === "initializing" && <div className="camera-empty"><span className="loader" /><h2>Starting camera…</h2><p>Allow camera access when prompted.</p></div>}
            {active && <>
              <div className="frame-guides"><i /><i /><i /><i /></div>
              
              <div className="camera-message"><span className={`status-symbol ${analysis ? "success" : ""}`}>{analysis ? <Icon name="check" /> : <Icon name="eye" />}</span><div><small>{stage === "body" ? "BODY DETECTED" : stage === "detected" || analysis ? `${pose.name.toUpperCase()} DETECTED` : "AI VISION ACTIVE"}</small><strong>{stage === "no-person" ? "Step into the frame" : stage === "body" ? `Move into ${pose.name}` : stage === "detected" ? "Pose detected" : stage === "paused" ? "Session paused" : coach.cue || "Beautiful—hold steady"}</strong><p>{stage === "no-person" ? "Your full body should be visible" : stage === "body" ? pose.slug === "bhujangasana" ? "Turn sideways to the camera, full body in view" : "Analysis begins only after the pose is confirmed" : stage === "detected" ? "Analyzing your alignment…" : analysis ? (coach.cue ? "Adjust gently, then hold" : "Real-time alignment is active") : ""}</p></div></div>
              {analysis && <div className="accuracy-overlay"><small>ACCURACY</small><strong>{coach.score}<span>%</span></strong><div><i style={{ width: `${coach.score}%` }} /></div></div>}
            </>}
            <div className="camera-bottom"><span><i className={analysis ? "ai-dot active" : "ai-dot"} />{active ? stageContent[stage === "paused" ? "analyzing" : stage].status : "AI is ready"}</span>{active && <span className="timer"><Icon name="clock" size={15} /> {time}</span>}</div>
          </div>
          {active && <div className="training-controls"><Button variant="secondary" onClick={() => setStage(stage === "paused" ? coach.phase : "paused")} icon={stage === "paused" ? "play" : "pause"}>{stage === "paused" ? "Resume" : "Pause"}</Button><Button onClick={endSession}>Finish &amp; See Result</Button><Button variant="secondary" onClick={() => { const next = poses[(poses.indexOf(pose) + 1) % poses.length]; setPose(next); }}>Next Pose <Icon name="arrow" size={16} /></Button></div>}
        </div>

        <aside className="feedback-panel">
          <div className="feedback-heading"><div><span className="ai-mark"><Icon name="spark" /></span><div><small>REAL-TIME</small><h2>AI Feedback</h2></div></div><span className={`ai-status ${analysis ? "online" : ""}`}><i />{analysis ? "Analyzing" : "Waiting"}</span></div>
          {!analysis ? <div className="waiting-feedback"><div className="scan-rings"><Icon name={stage === "inactive" ? "camera" : "target"} /></div><h3>{stage === "inactive" ? "Start your camera" : stage === "no-person" ? "Waiting for your body" : stage === "body" ? "Establish the pose" : "Confirming alignment"}</h3><p>{stage === "inactive" ? "Your live alignment feedback will appear here once your pose is detected." : stage === "no-person" ? "Step back until your full body is in view." : stage === "body" ? `Move into ${pose.name}. No scores are shown until we confirm it.` : "Hold still for a moment—we're making sure the pose is reliable."}</p><div className="sequence-list">{["Camera active", "Body detected", "Pose established", "Alignment analysis"].map((item, i) => <div key={item} className={active && i === 0 || ["body", "detected"].includes(stage) && i <= 1 || stage === "detected" && i <= 2 ? "complete" : ""}><span>{i + 1}</span>{item}</div>)}</div></div> :
          <>
            <div className="feedback-score"><div><small>OVERALL ALIGNMENT</small><strong>{grade[0]}</strong></div><span className="grade">{grade[1]}</span></div>
            <div className="feedback-list">
              {feedbackItems.map(({ type, text }) => <div className={`feedback-item ${type}`} key={text}><span><Icon name={type === "good" ? "check" : "arrow"} size={16} /></span><p>{text}</p></div>)}
            </div>
            <div className="angles"><div className="panel-label"><span>JOINT ANALYSIS</span><small>Live</small></div><div className="angle-grid">{[["Left Knee", `${coach.angles.kl}°`], ["Right Knee", `${coach.angles.kr}°`], ["Left Elbow", `${coach.angles.el}°`], ["Right Elbow", `${coach.angles.er}°`]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>
          </>}
        </aside>
      </section>
      <p className="privacy-note"><Icon name="eye" size={15} /> Your camera feed is processed securely in real time and is never stored.</p>
    </main>
  );
}

function ProgressPage() {
  const weekly = [66, 81, 55, 88, 72, 96, 78];
  const sessionRows = [
    ["27 Sep", "Warrior II", "08:32", "92%", "Excellent alignment"],
    ["25 Sep", "Tree Pose", "06:18", "88%", "Steady balance"],
    ["23 Sep", "Triangle Pose", "11:04", "91%", "Strong extension"],
    ["21 Sep", "Cobra Pose", "05:46", "86%", "Keep shoulders soft"],
  ];
  return (
    <main className="progress-page page-main">
      <section className="progress-hero"><div><Eyebrow>YOUR PRACTICE</Eyebrow><h1>Your <em>Progress</em></h1><p>Small, mindful improvements become meaningful change.</p></div><AppLink to="/train"><Button icon="play">Start New Session</Button></AppLink></section>
      <section className="stats-grid">
        {[["7", "days", "Current Streak", "trend"], ["24", "", "Sessions Completed", "check"], ["91", "%", "Average Accuracy", "target"], ["6h 42m", "", "Practice Time", "clock"]].map(([value, suffix, label, icon]) => <article className="stat-card" key={label}><span className="stat-icon"><Icon name={icon as IconName} /></span><div><strong>{value}<small>{suffix}</small></strong><p>{label}</p></div><span className="stat-trend">+8%</span></article>)}
      </section>
      <section className="dashboard-grid">
        <article className="chart-card">
          <div className="card-heading"><div><small>WEEKLY PRACTICE</small><h2>Your rhythm this week</h2></div><div className="legend"><i /> Accuracy</div></div>
          <div className="chart">
            {weekly.map((height, index) => <div className="bar-wrap" key={index}><div className="bar-track"><div className="bar-fill" style={{ height: `${height}%` }}><span>{height + 10}%</span></div></div><small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small></div>)}
          </div>
        </article>
        <article className="performance-card">
          <div className="card-heading"><div><small>POSE PERFORMANCE</small><h2>Your strongest poses</h2></div></div>
          {[["Warrior II", "94"], ["Triangle Pose", "91"], ["Tree Pose", "88"], ["Cobra Pose", "86"]].map(([name, score], index) => <div className="performance-row" key={name}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{name}</b><div><i style={{ width: `${score}%` }} /></div></div><strong>{score}%</strong></div>)}
        </article>
      </section>
      <section className="achievements-section"><div className="card-heading"><div><small>MILESTONES</small><h2>Achievements</h2></div><span>4 of 12 unlocked</span></div><div className="achievement-grid">{[["trend", "7 Day Streak", "A week of showing up"], ["spark", "First Perfect Pose", "One pose above 95%"], ["check", "10 Sessions", "Building a mindful habit"], ["target", "Warrior Master", "Five strong Warrior sessions"]].map(([icon, title, text]) => <article key={title}><span><Icon name={icon as IconName} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
      <section className="sessions-card"><div className="card-heading"><div><small>RECENT SESSIONS</small><h2>Your practice history</h2></div><button>View all</button></div><div className="session-table"><div className="session-head"><span>Date</span><span>Pose</span><span>Duration</span><span>Accuracy</span><span>Feedback</span></div>{sessionRows.map(row => <div className="session-row" key={row[0]}>{row.map((cell, index) => <span key={index} data-label={["Date", "Pose", "Duration", "Accuracy", "Feedback"][index]}>{index === 3 ? <b>{cell}</b> : cell}</span>)}</div>)}</div></section>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page-main">
      <section className="about-hero">
        <div className="about-copy"><Eyebrow>MINDFUL MOVEMENT, MADE INTELLIGENT</Eyebrow><h1>Yoga meets<br /><em>Artificial Intelligence.</em></h1><p>PRANA YOGA uses thoughtful computer vision to observe body landmarks, understand your posture, and offer clear guidance while you move.</p><AppLink to="/train"><Button icon="arrow">Experience AI Training</Button></AppLink></div>
        <div className="about-image"><img src={images[4]} alt="A focused yoga practice in a light studio" /><div className="about-float"><span><Icon name="brain" /></span><div><small>COMPUTER VISION</small><b>Movement understood in real time</b></div></div></div>
      </section>
      <section className="section process-section"><div className="section-heading"><Eyebrow>HOW IT WORKS</Eyebrow><h2>Intelligence in every<br /><em>stage of your practice.</em></h2></div><div className="process-grid">{[
        ["camera", "Camera captures movement", "Your live feed provides a private, real-time view."],
        ["eye", "AI finds body landmarks", "Key joints are mapped as you move in the frame."],
        ["target", "Your pose is recognized", "We confirm the selected pose before analysis begins."],
        ["chart", "Alignment is analyzed", "Joint angles are compared with balanced pose geometry."],
        ["spark", "Feedback arrives live", "Simple, supportive cues help you adjust in the moment."],
        ["trend", "Progress is recorded", "Session insights help make improvement visible over time."],
      ].map(([icon, title, text], index) => <article key={title}><span className="process-index">{String(index + 1).padStart(2, "0")}</span><span className="process-icon"><Icon name={icon as IconName} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="realtime-section"><div className="realtime-image"><img src={images[2]} alt="Yoga practice beside a bright window" /></div><div className="realtime-copy"><Eyebrow>WHY REAL-TIME?</Eyebrow><h2>Because the best time to adjust is <em>while you're moving.</em></h2><p>Immediate correction connects what you feel with what your body is actually doing. Instead of trying to remember feedback later, you can make a small change now—and understand the difference instantly.</p><div className="quote"><span>“</span><p>Guidance should feel like a calm teacher beside you, not a score judging you.</p></div></div></section>
      <section className="technology section"><div className="section-heading centered"><Eyebrow>THOUGHTFUL TECHNOLOGY</Eyebrow><h2>Advanced underneath.<br /><em>Simple on the surface.</em></h2></div><div className="tech-row">{["Computer Vision", "Pose Detection", "Joint Analysis", "Live Feedback", "Progress Tracking"].map((item, index) => <div key={item}><span>0{index + 1}</span><b>{item}</b></div>)}</div></section>
      <section className="mini-cta"><div><Eyebrow light>BEGIN YOUR PRACTICE</Eyebrow><h2>Move with more understanding.</h2></div><AppLink to="/poses"><Button variant="light" icon="arrow">Explore the Poses</Button></AppLink></section>
    </main>
  );
}

function Footer() {
  return (
    <footer><div className="footer-main"><div className="footer-brand"><Logo /><p>Intelligent guidance for a stronger, more mindful yoga practice.</p><div className="socials"><button aria-label="Instagram"><Icon name="instagram" /></button><button aria-label="Social channel"><span>f</span></button><button aria-label="Social channel"><span>p</span></button></div></div><div className="footer-column"><b>Explore</b><AppLink to="/">Home</AppLink><AppLink to="/poses">Pose Library</AppLink><AppLink to="/train">AI Training</AppLink></div><div className="footer-column"><b>PRANA YOGA</b><AppLink to="/about">How It Works</AppLink><AppLink to="/progress">Progress</AppLink><a href="mailto:hello@pranayoga.ai">Contact</a></div><div className="footer-news"><b>A mindful note, once a month.</b><p>Practice tips and thoughtful product updates.</p><form onSubmit={e => e.preventDefault()}><input type="email" aria-label="Email address" placeholder="Your email address" /><Button type="submit" icon="arrow">Join</Button></form></div></div><div className="footer-bottom"><span>© 2025 PRANA YOGA. Move with intention.</span><span>Privacy · Terms · Accessibility</span></div></footer>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(pathToRoute());
  useEffect(() => {
    const update = () => setRoute(pathToRoute());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  return <><Navbar route={route} />{route === "home" && <HomePage />}{route === "poses" && <PosesPage />}{route === "train" && <TrainingPage />}{route === "progress" && <ProgressPage />}{route === "about" && <AboutPage />}<Footer /></>;
}