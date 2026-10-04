import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_SC } from "next/font/google";
import { getSession } from "@/lib/auth";
import "./landing.css";

const noto = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "DIVEWORLD 潜入世界｜精品潜水旅行",
  description:
    "探索帕劳、诗巴丹、科莫多等世界级潜水目的地，查看潜点信息、真实评价与精品小团行程。",
  icons: { icon: "/favicon.svg" },
};

const destinations = [
  { name: "帕劳", en: "PALAU", tag: "放流潜水", image: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?auto=format&fit=crop&w=1200&q=85", temp: "27–30°C", season: "11月–5月", level: "AOW", spots: "蓝角 · 德国水道" },
  { name: "诗巴丹", en: "SIPADAN", tag: "海龟风暴", image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=1200&q=85", temp: "26–30°C", season: "3月–10月", level: "OW+", spots: "海狼风暴 · 龟墓" },
  { name: "科莫多", en: "KOMODO", tag: "蝠鲼天堂", image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=85", temp: "24–29°C", season: "4月–11月", level: "AOW", spots: "Manta Point · Castle Rock" },
];

// TODO: 评价、评分和统计数字目前是示例文案，上线前替换为真实数据。
const reviews = [
  { quote: "第一次看见几十条鲨鱼从蓝角掠过，整个世界突然安静了。领队对流况的判断非常稳。", name: "Chloe · 香港", trip: "帕劳船宿 2025.04", score: "4.9" },
  { quote: "行程不是赶潜点，而是跟着海况走。每天的 briefing 很清楚，摄影位也照顾得很细。", name: "阿杰 · 深圳", trip: "科莫多 2025.07", score: "5.0" },
  { quote: "从装备检查到水下手势都很安心。海龟、杰克风暴、黄昏潜，一趟全部遇见。", name: "Mina · 上海", trip: "诗巴丹 2025.03", score: "4.9" },
];

export default async function HomePage() {
  const session = await getSession();
  const memberHref = session ? "/trips" : "/login";
  const memberLabel = session ? "会员中心" : "会员登录";

  return (
    <main className={`dw ${noto.variable}`}>
      <section className="hero" id="home">
        <nav className="nav shell">
          <a className="brand" href="#home"><span className="brandMark">D</span><span>DIVEWORLD<small>潜入世界</small></span></a>
          <div className="navlinks"><a href="#destinations">目的地</a><a href="#dive-info">潜水指南</a><a href="#reviews">潜友评价</a><a href="#itinerary">精选行程</a></div>
          <div className="navActions"><Link className="navMember" href={memberHref}>{memberLabel}</Link><a className="navCta" href="#contact">咨询潜水顾问 <span>↗</span></a></div>
        </nav>

        <div className="heroContent shell">
          <p className="eyebrow"><span></span> EXPLORE THE BLUE PLANET</p>
          <h1>世界很大，<br />我们从<span>海面之下</span>出发。</h1>
          <p className="heroIntro">为真正热爱海洋的人，挑选值得下潜的目的地。<br />小团出发、专业领队、把每一次入水都留给惊喜。</p>
          <div className="heroActions"><a className="primaryBtn" href="#destinations">探索潜水目的地 <b>→</b></a><a className="textBtn" href="#itinerary"><i>▶</i> 查看本季行程</a></div>
        </div>
        <div className="heroSide"><div className="vertical">SCROLL TO DISCOVER</div><div className="line"></div></div>
        <div className="heroStats shell">
          <div><strong>18</strong><span>精选潜水目的地<br />遍布全球</span></div>
          <div><strong>4.9</strong><span>潜友平均评分<br />来自 860+ 次出发</span></div>
          <div><strong>8</strong><span>人以内精品小团<br />更自由，也更安全</span></div>
        </div>
      </section>

      <section className="intro shell" id="destinations">
        <div><p className="sectionKicker">01 / DESTINATIONS</p><h2>下一片蓝，<br />想在哪里遇见？</h2></div>
        <p className="sectionCopy">从太平洋的湛蓝峭壁，到印度洋的珊瑚花园。我们依据季节、能见度与海洋生物迁徙，为你挑选恰逢其时的潜水目的地。</p>
      </section>

      <section className="cards shell">
        {destinations.map((d, i) => <article className="destination" key={d.name}>
          <div className="cardImage" style={{backgroundImage:`url(${d.image})`}}><span className="cardNo">0{i+1}</span><span className="cardTag">{d.tag}</span><div className="cardTitle"><small>{d.en}</small><h3>{d.name}</h3></div></div>
          <div className="cardMeta"><span>水温 <b>{d.temp}</b></span><span>季节 <b>{d.season}</b></span><span>建议 <b>{d.level}</b></span></div>
          <div className="cardBottom"><p>{d.spots}</p><a href="#itinerary" aria-label={`查看${d.name}行程`}>↗</a></div>
        </article>)}
      </section>
      <div className="center"><a className="outlineBtn" href="#dive-info">查看全部目的地 <span>→</span></a></div>

      <section className="diveInfo" id="dive-info">
        <div className="shell infoGrid">
          <div className="infoVisual"><div className="depth">— 18 M</div><div className="circleText">BREATHE · LOOK · REMEMBER ·</div><div className="bigNumber">70%</div><p>地球被海洋覆盖<br />而我们才刚刚开始探索</p></div>
          <div className="infoContent"><p className="sectionKicker light">02 / DIVE GUIDE</p><h2>不只看风景，<br />更懂得如何潜。</h2><p>每个目的地都有自己的水流、地形与季节。出发前，专属潜水顾问会根据你的证照、潜水记录与期待，匹配最合适的路线。</p>
            <div className="featureList"><div><b>01</b><span><strong>难度真实标注</strong><small>流况、深度、能见度一目了然</small></span></div><div><b>02</b><span><strong>专业中文领队</strong><small>熟悉潜点，也懂你的节奏</small></span></div><div><b>03</b><span><strong>海洋友善原则</strong><small>小团、零触碰、负责任旅行</small></span></div></div>
          </div>
        </div>
      </section>

      <section className="reviews shell" id="reviews">
        <div className="reviewsHead"><div><p className="sectionKicker">03 / DIVER STORIES</p><h2>他们从海里回来，<br />带回这些故事。</h2></div><div className="rating"><strong>4.9</strong><span>★★★★★<small>860+ VERIFIED REVIEWS</small></span></div></div>
        <div className="reviewGrid">{reviews.map((r, i) => <article key={r.name}><span className="quote">“</span><p>{r.quote}</p><div className="reviewer"><div className={`avatar a${i}`}>{r.name.slice(0,1)}</div><span><b>{r.name}</b><small>{r.trip}</small></span><em>{r.score}</em></div></article>)}</div>
      </section>

      <section className="itinerary" id="itinerary">
        <div className="shell tripGrid">
          <div className="tripIntro"><p className="sectionKicker light">04 / FEATURED JOURNEY</p><p className="tripBadge">2026 秋季限定 · 仅 8 席</p><h2>帕劳深蓝<br />7 日探索之旅</h2><p>追随潮汐，穿过蓝洞与水道。5 天 15 潜，把帕劳最值得期待的水下时刻，一次收进旅程。</p><div className="tripPrice"><small>每位起</small><strong>¥ 18,800</strong><span>含住宿、潜水及当地交通</span></div><a href="#contact" className="primaryBtn coral">获取详细行程 <b>→</b></a></div>
          <div className="timeline">
            {[['DAY 01','抵达科罗尔','机场接送 · 装备检查 · 欢迎晚餐'],['DAY 02','沉船与珊瑚花园','Check Dive · Helmet Wreck · Chandelier Cave'],['DAY 03–05','蓝角与德国水道','每日 3 潜 · 鲨鱼 · 蝠鲼 · 杰克风暴'],['DAY 06','乌龙水道与日落潜','放流潜水 · 海滩午餐 · Sunset Dive'],['DAY 07','陆地探索与返程','牛奶湖 · 城市漫步 · 送机']].map((x,i)=><div className="day" key={x[0]}><span>{x[0]}</span><i>{String(i+1).padStart(2,'0')}</i><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="cta" id="contact"><div className="shell ctaInner"><p className="sectionKicker">READY TO DIVE?</p><h2>你的下一次下潜，<br />从一次对话开始。</h2><p>告诉我们你的证照、假期与愿望清单，潜水顾问将在 24 小时内为你定制建议。</p><a href="mailto:hello@diveworld.travel" className="darkBtn">开始规划旅程 <span>↗</span></a></div></section>
      <footer><div className="shell footerInner"><a className="brand" href="#home"><span className="brandMark">D</span><span>DIVEWORLD<small>潜入世界</small></span></a><p>© 2026 DIVEWORLD · 潜水改变看世界的方式</p><div><a href="#destinations">目的地</a><a href="#dive-info">安全指南</a><a href="mailto:hello@diveworld.travel">联系我们</a></div></div></footer>
    </main>
  );
}
