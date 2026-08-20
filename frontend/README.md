# Cache Ledger: Predictive Cloud-Cost Caching Engine

> **A High-Fidelity Middleware & Visual Telemetry Dashboard that Optimizes Dynamic Key TTLs, Reduces Cloud DB Strain, and Calculates Real-Time Financial ROI.**

---

## 💡 The Pitch: Why Cache Ledger?
In modern cloud architectures (such as AWS Aurora, RDS, or Google Cloud SQL), **read query load is one of the largest cost drivers**. Standard caching layers (like Redis or Memcached) typically apply a **Static TTL** (e.g., a fixed 10-minute cache expiration) to all database queries.

**The problem with static TTLs:**
1. **Cache Thrashing**: Cold, rarely accessed products waste expensive cache memory, while sudden viral spikes on hot items expire too quickly, leading to database request surges.
2. **Wasted Memory Cost**: Storing low-demand items in fast cache memory increases cloud billing unnecessarily.
3. **Zero Cost Visibility**: Infrastructure architects have no real-time transparency into how much money their caching policies are actually saving them.

**Cache Ledger** solves this by implementing an **algorithmic, self-tuning, and cost-aware caching middleware**. It dynamically promotes hot/surging items to extended cache lifespans, decays cold items to free memory, and provides a beautiful, real-time visual telemetry dashboard that proves exact database cost savings down to the fraction of a cent.

---

## 🧠 Core Algorithmic Architecture (What We Implemented)

Cache Ledger contains five tightly integrated software engines in [`lib/engine/`](file:///d:/Projects/Cache_Ledger/frontend/lib/engine):

### 1. The Popularity Engine (Normalized Weighted Scoring)
Every incoming request updates a multi-dimensional demand profile for the targeted resource. The engine computes a normalized popularity score ($0 \text{ to } 100$) using a weighted formula (defined in **SRS FR-06**):
$$\text{Popularity Score} = 0.40 \times \text{Frequency} + 0.30 \times \text{Recency} + 0.20 \times \text{Growth Velocity} + 0.10 \times \text{Historical Base}$$
- **Frequency (40%)**: Current window query count vs the most requested item.
- **Recency (30%)**: Decay based on the time elapsed since the last hit.
- **Growth Velocity (20%)**: First derivative of demand traffic trends across windows.
- **Historical Base (10%)**: Base catalog tier (HOT, WARM, COLD).

### 2. The Dynamic TTL Engine (Adaptive Promotion & Decay)
Rather than static caching, the engine maps the popularity score to five adaptive TTL brackets (**SRS FR-07**):
- **Score 80–100 (HOT Tier)**: **60-minute TTL** (extends cache retention for high-traffic assets).
- **Score 60–79 (WARM Active)**: **30-minute TTL**.
- **Score 40–59 (STABLE Normal)**: **10-minute TTL**.
- **Score 20–39 (COOL Marginal)**: **2-minute TTL**.
- **Score 0–19 (COLD Dormant)**: **30-second TTL** (quickly evicts cold assets to free memory).

### 3. The Smart Eviction Engine (Capacity-Aware Pruning)
When the cache reaches high utilization ($>90\%$ of the maximum logical capacity, e.g., 18 keys), it avoids naive random or strict LRU evictions. Instead, it evaluates all cached items using an eviction index:
$$\text{Eviction Score} = 0.40 \times \text{Frequency} + 0.30 \times \text{Recency} + 0.30 \times \text{Popularity}$$
It prunes the lowest-scoring keys, protecting active viral spikes while cleaning out low-value items (**SRS FR-09**).

### 4. The Cloud Cost & ROI Engine
It tracks direct database reads avoided: $\text{Total Requests} - \text{Direct DB Queries}$. 
It translates queries avoided into financial savings based on customizable cloud provider pricing (e.g., default AWS Aurora I/O cost of `$0.0001` per read query), outputting instant dollar ROI projections.

### 5. Multi-Scenario Workload Simulator
Generates synthetic traffic profiles matching real-world conditions:
- *Normal Zipfian Distribution*: Standard Pareto-skewed demand.
- *Viral Product Spike*: Directing 80% of traffic at a cold product to witness live Dynamic TTL promotion.
- *Demand Decline*: Watching an active product decay out of cache.
- *Cache Pressure Storm*: Uniform demand across all 30 products to trigger Smart Eviction under capacity pressure.
- *Flash Sale Burst*: Heavy QPS hits targeting flagship catalog items.

---

## 🏆 Unique Standout Features (For Hackathon Judges)

### 🔮 1. Decision Explainability Logs (PRD #20)
Every single caching decision is logged with a human-readable, logical explanation. The dashboard's **Live Decision Stream** shows *why* a decision occurred (e.g., *"Promoted product from 10m to 60m TTL because traffic surged +85% in the last window"*). This transparency bridges the gap between raw caching algorithms and infrastructure logging.

### ⚡ 2. 100% Client-Side Simulation (Vercel-Safe Sandbox)
Next.js projects deployed on serverless platforms (like Vercel) face stateless container recycling and strict execution quotas (e.g. 100k requests/month free tier limits).
- **What we did**: We migrated the entire simulation loop and state engine to run **directly inside the client's browser**.
- **The result**: **0 serverless execution billed on Vercel**. The simulation runs at 10x or 25x speeds with 0ms network latency, while the hosting is completely free and static.

### 🛒 3. Interactive Storefront Sandbox
Judges don't just look at charts—they can test the caching layer in real time. We built a mock e-commerce storefront. Clicking on products triggers immediate cache-aside lookups. The UI displays live feedback showing a **~2ms Cache HIT** vs a **~46.8ms Database MISS** and flashes the corresponding updates on the active metrics.

### 📊 4. A/B Benchmark ROI Proof
The **ROI Benchmark** tab shows a side-by-side performance audit comparing the **Adaptive Caching Policy** vs **Static 10m Caching** vs **No Caching**. The page includes an interactive slide calculator projecting monthly and annual cloud bill savings based on your custom enterprise traffic expectations.

---

## 🎨 Design & Aesthetic Ergonomics
The visual interface is built with premium cyber-fintech aesthetics using custom-tailored CSS variables:
- **Palette**: Warm terracotta and amber primary accents (`#B45309` / `#F97316`), deep sand/stone card backgrounds, and dark/light modes.
- **Typography**: Header text in modern **Oxanium**, metric counters in high-readability **Fira Code** (utilizing `tabular-nums` to eliminate number jitter during real-time updates), and body copy in crisp sans-serif.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16 (React 19, App Router)
- **Styling**: Tailwind CSS & CSS variables
- **Charts**: Recharts (gradient areas & customized tooltips)
- **Icons**: Lucide React
- **Verification**: TypeScript strict mode compiler & ESLint configuration

---

## 💻 Local Testing & Setup

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### Installation
1. Clone the repository and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the telemetry dashboard.

---

## 🌐 Vercel Deployment

Deploy with one click to Vercel:
1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the `frontend/` directory.
3. Configure the directory as a standard Next.js project. Vercel will build it as a static deployment, costing **$0** in serverless runtime charges.
