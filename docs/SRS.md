# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Predictive Cloud-Cost Caching Engine

**Version:** 2.0
**Project Type:** Hackathon Prototype
**Technology Strategy:** Full JavaScript / TypeScript Stack
**Primary Domain:** System Design, Distributed Caching, Cloud Cost Optimization
**Deployment:** Free / Free-Tier Infrastructure

---

# 1. Executive Summary

The **Predictive Cloud-Cost Caching Engine** is an intelligent caching middleware designed for applications such as e-commerce platforms.

The system analyzes product access patterns and dynamically determines:

* Which products should be cached
* How long each product should remain cached
* Which products should be evicted
* How much database traffic is being avoided
* How much estimated database cost is being saved

The system provides a real-time dashboard showing cache performance, product popularity, dynamic TTL decisions, cache evictions, database load reduction, and estimated cost savings.

---

# 2. Problem Statement

Modern e-commerce applications can receive thousands or millions of product requests.

Without caching:

```text
User
  ↓
Application Server
  ↓
Database
```

Every request can result in a database query.

This causes:

* Increased database load
* Increased response time
* Increased database infrastructure cost
* Poor scalability

A traditional caching strategy improves this:

```text
User
  ↓
Application
  ↓
Redis
  ↓
Database only on cache miss
```

However, static caching policies create another problem.

For example:

```text
Every Product → TTL = 30 minutes
```

A highly popular product and a product that is accessed once per day receive the same treatment.

This wastes cache memory.

---

# 3. Proposed Solution

The proposed system introduces an intelligent caching layer between the application and the database.

The system continuously monitors:

* Request frequency
* Cache hits
* Cache misses
* Recency
* Product popularity
* Traffic trends
* Cache memory usage

It uses this information to dynamically adjust TTL values.

Example:

```text
Popular Product
      ↓
High Popularity
      ↓
Long TTL
      ↓
High Cache Hit Rate
```

while:

```text
Rare Product
      ↓
Low Popularity
      ↓
Short TTL
      ↓
Quick Eviction
```

The system also calculates estimated database cost savings.

---

# 4. Project Objectives

## Primary Objectives

The system shall:

1. Implement Redis-based caching.
2. Implement cache-aside architecture.
3. Track cache hits and misses.
4. Calculate product popularity.
5. Dynamically adjust TTL.
6. Implement intelligent cache eviction.
7. Simulate different traffic patterns.
8. Calculate database requests avoided.
9. Estimate database cost savings.
10. Display all important metrics through a dashboard.
11. Deploy the complete prototype using free-tier services.

---

# 5. Technology Strategy

The entire application will use **JavaScript/TypeScript wherever practical**.

## Core Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Language          | TypeScript                          |
| Frontend          | Next.js                             |
| Backend           | Next.js API Routes / Route Handlers |
| Runtime           | Node.js                             |
| Cache             | Redis                               |
| Database          | PostgreSQL                          |
| ORM               | Prisma                              |
| UI                | Tailwind CSS                        |
| Charts            | Recharts                            |
| Validation        | Zod                                 |
| Real-time updates | Server-Sent Events / polling        |
| Testing           | Vitest                              |
| Containerization  | Docker                              |
| Package Manager   | npm / pnpm                          |
| Version Control   | Git + GitHub                        |

---

# 6. Why TypeScript/Node.js?

The prototype intentionally avoids having separate Python and JavaScript services.

Instead:

```text
                    Next.js
               ┌───────────────┐
               │               │
               │   Frontend    │
               │               │
               │   Dashboard   │
               │               │
               ├───────────────┤
               │               │
               │ API Routes     │
               │               │
               │ Cache Engine   │
               │ Analytics      │
               │ Cost Engine    │
               │ Simulator      │
               │               │
               └───────┬───────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
           Redis            PostgreSQL
```

Benefits:

* One language
* One repository
* Faster development
* Easier debugging
* Easier deployment
* Easier hackathon collaboration
* Easier free-tier deployment

---

# 7. System Scope

The prototype contains the following major modules:

```text
1. Product API
2. Cache Middleware
3. Redis Cache
4. Popularity Analyzer
5. Dynamic TTL Engine
6. Smart Eviction Engine
7. Cost Calculation Engine
8. Traffic Simulator
9. Analytics Engine
10. Admin Dashboard
```

---

# 8. High-Level Architecture

The prototype architecture shall be:

```text
                         USERS
                           │
                           ▼
                  ┌─────────────────┐
                  │    Next.js      │
                  │   Application   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Product API     │
                  │ /api/products   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Cache Manager   │
                  └────────┬────────┘
                           │
                    Check Redis
                           │
                 ┌─────────┴─────────┐
                 │                   │
                HIT                 MISS
                 │                   │
                 ▼                   ▼
              Redis             PostgreSQL
                 │                   │
                 │                   ▼
                 │              Calculate TTL
                 │                   │
                 │                   ▼
                 │                 Redis
                 │                   │
                 └─────────┬─────────┘
                           │
                           ▼
                    Analytics Engine
                           │
                ┌──────────┼───────────┐
                ▼          ▼           ▼
            Popularity   TTL Engine   Cost Engine
                │          │           │
                └──────────┼───────────┘
                           ▼
                    Admin Dashboard
```

---

# 9. Request Flow

## Cache Hit

```text
Client
  ↓
Next.js API
  ↓
Redis
  ↓
CACHE HIT
  ↓
Return Product
```

Database is not contacted.

---

## Cache Miss

```text
Client
  ↓
Next.js API
  ↓
Redis
  ↓
CACHE MISS
  ↓
PostgreSQL
  ↓
Calculate Popularity / TTL
  ↓
Redis SET
  ↓
Return Product
```

---

# 10. Functional Requirements

# FR-01 — Product API

The system shall provide product APIs.

```http
GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

---

# FR-02 — Cache Lookup

Every product GET request shall first attempt to retrieve the product from Redis.

Example:

```text
GET /api/products/123

Redis:
product:123
```

---

# FR-03 — Cache Hit

If Redis contains the product:

```text
cache_hit = true
```

The product shall be returned without querying PostgreSQL.

---

# FR-04 — Cache Miss

If Redis does not contain the product:

```text
cache_hit = false
```

The system shall:

1. Query PostgreSQL.
2. Calculate appropriate TTL.
3. Store product in Redis.
4. Return product.

---

# FR-05 — Cache Event Tracking

The system shall record:

```text
CACHE_HIT
CACHE_MISS
CACHE_SET
CACHE_EVICTION
```

Each event shall contain:

```json
{
  "productId": "123",
  "event": "CACHE_HIT",
  "timestamp": "2026-08-09T18:00:00Z"
}
```

---

# FR-06 — Popularity Score

The system shall calculate a popularity score for each product.

For the hackathon prototype, the score will use a deterministic algorithm.

Example:

```text
Popularity Score =
    40% Request Frequency
  + 30% Recency
  + 20% Traffic Growth
  + 10% Historical Popularity
```

The score shall range from:

```text
0 → 100
```

---

# FR-07 — Dynamic TTL

TTL shall be determined based on the popularity score.

|  Score |        TTL |
| -----: | ---------: |
| 80–100 | 60 minutes |
|  60–79 | 30 minutes |
|  40–59 | 10 minutes |
|  20–39 |  2 minutes |
|   0–19 | 30 seconds |

These values shall be configurable.

---

# FR-08 — TTL Recalculation

The system shall periodically reevaluate popularity.

Example:

```text
Product A

Popularity:
50 → 85

TTL:
10 min → 60 min
```

If popularity decreases:

```text
85 → 20

TTL:
60 min → 2 min
```

---

# FR-09 — Smart Eviction

When cache capacity reaches the configured threshold, the system shall identify low-value cache entries.

The eviction score shall consider:

```text
Frequency
+
Recency
+
Popularity
+
Remaining TTL
```

Example:

```text
Eviction Score =

40% Frequency
+
30% Recency
+
30% Popularity
```

Products with the lowest score become eviction candidates.

---

# FR-10 — Cache Capacity

The system shall support a configurable logical cache capacity.

Example:

```text
Maximum cached products = 1,000
```

This allows the hackathon demonstration to trigger eviction without requiring a large Redis instance.

---

# FR-11 — Database Request Reduction

The system shall calculate:

```text
Database Requests Avoided =
Total Requests - Database Requests
```

---

# FR-12 — Cache Hit Rate

The system shall calculate:

```text
Cache Hit Rate =
Cache Hits / Total Requests × 100
```

---

# FR-13 — Cache Miss Rate

The system shall calculate:

```text
Cache Miss Rate =
Cache Misses / Total Requests × 100
```

---

# FR-14 — Cost Savings

The system shall estimate database cost savings.

Formula:

```text
Estimated Database Savings =

Database Requests Avoided
×
Configured Database Cost Per Request
```

Example:

```text
Requests Avoided = 100,000

Cost per request = $0.00001

Estimated Savings = $1
```

The dashboard must clearly label this as:

> Estimated Cost Savings

because actual cloud billing varies by provider and workload.

---

# FR-15 — Cache Cost

The system may estimate cache cost using:

```text
Cache Memory Usage
×
Configured Cost Per GB
```

---

# FR-16 — Net Savings

The system shall optionally calculate:

```text
Net Savings =

Estimated Database Savings
-
Estimated Cache Cost
```

---

# FR-17 — Dashboard

The dashboard shall display:

### System Metrics

```text
Total Requests
Cache Hits
Cache Misses
Cache Hit Rate
Database Requests
Database Requests Avoided
```

### Cost Metrics

```text
Estimated DB Savings
Estimated Cache Cost
Net Savings
```

### Cache Metrics

```text
Cached Items
Cache Utilization
Evictions
Average TTL
```

---

# FR-18 — Product Analytics

The dashboard shall provide product-level information.

Example:

| Product  | Requests | Hit Rate | Popularity | TTL | Status |
| -------- | -------: | -------: | ---------: | --: | ------ |
| iPhone   |   10,000 |      98% |         95 | 60m | KEEP   |
| MacBook  |    7,000 |      94% |         82 | 60m | KEEP   |
| Shoes    |    2,000 |      80% |         61 | 30m | KEEP   |
| Keyboard |      200 |      35% |         18 | 30s | EVICT  |

---

# FR-19 — Traffic Simulator

The prototype shall provide a traffic simulator.

The simulator will generate:

### Hot Products

High request frequency.

### Warm Products

Medium request frequency.

### Cold Products

Low request frequency.

### Trending Products

Products whose traffic suddenly increases.

### Declining Products

Products whose traffic suddenly decreases.

---

# FR-20 — Traffic Scenarios

The dashboard shall provide predefined scenarios.

### Scenario A — Normal

```text
Hot → High traffic
Warm → Medium traffic
Cold → Low traffic
```

### Scenario B — Viral Product

```text
Cold Product
     ↓
Traffic suddenly increases
     ↓
Popularity increases
     ↓
TTL increases
```

### Scenario C — Product Decline

```text
Hot Product
     ↓
Traffic decreases
     ↓
Popularity decreases
     ↓
TTL decreases
```

### Scenario D — Cache Pressure

```text
Cache reaches capacity
     ↓
Eviction engine activates
     ↓
Low-value products removed
```

---

# 11. Dashboard Design

The dashboard shall be the primary visual component of the hackathon prototype.

## Header

```text
┌─────────────────────────────────────────────────────┐
│ Predictive Cloud-Cost Caching Engine               │
│ Intelligent Cache Optimization                     │
└─────────────────────────────────────────────────────┘
```

---

## KPI Cards

```text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Hit Rate    │ │ DB Avoided  │ │ Savings     │
│   87.4%     │ │   87,400    │ │   $8.74     │
└─────────────┘ └─────────────┘ └─────────────┘
```

Additional:

```text
Cache Items
Evictions
Average Latency
```

---

# 12. Charts

The dashboard shall provide:

### Cache Hit Rate

```text
Hit Rate %
   │
100│              ╭─────
 80│       ╭──────╯
 60│───────╯
   └────────────────────
        Time
```

### Database Load

Display:

```text
Requests
   │
   │ DB Requests
   │ Cache Requests
   └────────────────
```

### Cost Savings

Display cumulative estimated savings.

---

# 13. Intelligent TTL Panel

The dashboard shall show the system's decisions.

Example:

```text
┌───────────────────────────────────────────────┐
│ INTELLIGENT TTL DECISIONS                     │
├────────────┬───────┬──────┬──────────┬────────┤
│ Product    │ Score │ TTL  │ Previous │ Action │
├────────────┼───────┼──────┼──────────┼────────┤
│ iPhone     │  95   │ 60m  │ 30m      │ ↑ TTL   │
│ MacBook    │  81   │ 60m  │ 30m      │ ↑ TTL   │
│ Shoes      │  55   │ 10m  │ 30m      │ ↓ TTL   │
│ Keyboard   │  12   │ 30s  │ 2m       │ EVICT   │
└────────────┴───────┴──────┴──────────┴────────┘
```

This is important for explaining the intelligence of the system.

---

# 14. Technology Architecture

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
Recharts
```

Responsibilities:

* Dashboard
* Charts
* Metrics
* Product analytics
* Traffic simulator controls
* TTL visualization

---

## Backend

```text
Next.js Route Handlers
TypeScript
```

Responsibilities:

* Product API
* Cache operations
* Analytics
* TTL engine
* Cost engine
* Traffic simulator
* Admin APIs

---

## Cache

```text
Redis
```

Responsibilities:

* Product caching
* TTL
* Cache expiration
* Counters
* Temporary analytics state

---

## Database

```text
PostgreSQL
+
Prisma
```

Responsibilities:

* Product persistence
* Analytics configuration
* Optional historical metrics

---

# 15. Project Structure

Recommended repository:

```text
predictive-cache-engine/
│
├── app/
│   ├── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   └── api/
│       ├── products/
│       ├── metrics/
│       ├── cache/
│       ├── simulator/
│       └── admin/
│
├── components/
│   ├── dashboard/
│   ├── charts/
│   ├── metrics/
│   └── tables/
│
├── lib/
│   ├── redis.ts
│   ├── prisma.ts
│   ├── cache.ts
│   ├── ttl-engine.ts
│   ├── popularity.ts
│   ├── eviction.ts
│   ├── cost-engine.ts
│   └── analytics.ts
│
├── prisma/
│   └── schema.prisma
│
├── scripts/
│   ├── seed.ts
│   └── simulator.ts
│
├── types/
│   └── index.ts
│
├── tests/
│
├── public/
│
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 16. Database Schema

## Product

```text
Product
-------------------------
id
name
category
price
description
createdAt
updatedAt
```

---

## ProductStats

```text
ProductStats
-------------------------
id
productId
requestCount
hitCount
missCount
popularityScore
currentTTL
lastAccessed
updatedAt
```

---

## CacheEvent

```text
CacheEvent
-------------------------
id
productId
eventType
timestamp
latency
```

Possible event types:

```text
CACHE_HIT
CACHE_MISS
CACHE_SET
CACHE_EVICTION
TTL_INCREASE
TTL_DECREASE
```

---

## CostConfiguration

```text
CostConfiguration
-------------------------
id
dbCostPerRequest
cacheCostPerGB
cacheCapacity
updatedAt
```

---

# 17. Redis Design

Product:

```text
product:{id}
```

Example:

```text
product:123
```

Value:

```json
{
  "id": 123,
  "name": "iPhone",
  "price": 79999
}
```

TTL:

```text
3600 seconds
```

---

## Request Counter

```text
stats:requests:{productId}
```

---

## Hit Counter

```text
stats:hits:{productId}
```

---

## Miss Counter

```text
stats:misses:{productId}
```

---

# 18. Cache Pattern

The prototype shall use the:

## Cache-Aside Pattern

```text
Application
     │
     ▼
Check Redis
     │
 ┌───┴───┐
 │       │
HIT     MISS
 │       │
 ▼       ▼
Return  PostgreSQL
         │
         ▼
       Redis
         │
         ▼
       Return
```

---

# 19. Dynamic TTL Algorithm

Initial implementation:

```typescript
function calculateTTL(score: number): number {
  if (score >= 80) return 3600;
  if (score >= 60) return 1800;
  if (score >= 40) return 600;
  if (score >= 20) return 120;

  return 30;
}
```

This algorithm will be configurable.

---

# 20. Popularity Algorithm

The system will normalize individual metrics between 0 and 100.

Example:

```text
Popularity Score =

0.40 × Frequency Score
+
0.30 × Recency Score
+
0.20 × Growth Score
+
0.10 × Historical Score
```

The result:

```text
0 → 100
```

---

# 21. Smart Eviction Algorithm

When:

```text
Cache Utilization > 90%
```

the eviction engine shall activate.

It calculates:

```text
Eviction Score =

0.40 × Frequency
+
0.30 × Recency
+
0.30 × Popularity
```

Lowest scoring products become eviction candidates.

---

# 22. Cost Engine

The cost engine shall calculate:

```text
Total Requests
Cache Hits
Cache Misses
DB Requests
DB Requests Avoided
```

Then:

```text
DB Requests Avoided =
Total Requests - DB Requests
```

And:

```text
DB Savings =
DB Requests Avoided × DB Cost Per Request
```

Optional:

```text
Net Savings =
DB Savings - Cache Cost
```

---

# 23. API Specification

## Product APIs

```http
GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

---

## Metrics APIs

```http
GET /api/metrics
GET /api/metrics/cache
GET /api/metrics/cost
GET /api/metrics/products
```

---

## Cache APIs

```http
GET /api/cache/stats
GET /api/cache/items
POST /api/cache/recalculate
POST /api/cache/evict
```

---

## Simulator APIs

```http
POST /api/simulator/start
POST /api/simulator/stop
POST /api/simulator/scenario
GET /api/simulator/status
```

---

# 24. Real-Time Dashboard Communication

The prototype shall use one of:

### Option A — Polling

Dashboard requests:

```text
GET /api/metrics
```

every 2–5 seconds.

This is recommended for the first version because it is extremely simple.

### Option B — Server-Sent Events

For a more advanced implementation:

```text
Dashboard
    ↓
SSE Connection
    ↓
Next.js Server
    ↓
Metrics
```

SSE may be added after the core prototype works.

---

# 25. Error Handling

## Redis Failure

The application shall fallback to PostgreSQL.

```text
Redis unavailable
      ↓
Skip cache
      ↓
PostgreSQL
```

The dashboard should show:

```text
Redis Status: DEGRADED
```

---

## Database Failure

Return:

```http
500 Internal Server Error
```

with a safe error message.

---

## Product Not Found

Return:

```http
404 Not Found
```

---

# 26. Security

The prototype shall implement basic security.

### Environment Variables

Secrets must be stored using:

```text
DATABASE_URL
REDIS_URL
ADMIN_SECRET
```

Never hardcode credentials.

### Input Validation

Use:

```text
Zod
```

for API input validation.

### Admin Dashboard

Basic authentication or an admin secret shall be used.

Production-grade RBAC is outside the prototype scope.

---

# 27. Performance Requirements

The prototype should target:

```text
Cache Hit Response
< 100 ms
```

under normal demo conditions.

The system should demonstrate that:

```text
Cache Hit Latency
<
Database Query Latency
```

---

# 28. Load Simulation

The simulator shall generate requests programmatically.

Example:

```text
Product A → 100 req/sec
Product B → 60 req/sec
Product C → 20 req/sec
Product D → 2 req/sec
```

Traffic can dynamically change.

Example:

```text
Product D:

2 req/sec
   ↓
10 req/sec
   ↓
50 req/sec
   ↓
100 req/sec
```

The dashboard should show:

```text
Popularity ↑
TTL ↑
Cache Hit Rate ↑
DB Requests ↓
Savings ↑
```

---

# 29. Hackathon Demo Flow

The final demo should follow this sequence.

## Step 1

Open dashboard.

Show:

```text
Cache Hit Rate: 0%
DB Requests: High
Savings: $0
```

---

## Step 2

Start traffic simulator.

Traffic begins.

---

## Step 3

Hot products become cached.

Dashboard:

```text
Hit Rate ↑
DB Requests ↓
```

---

## Step 4

Show intelligent TTL decisions.

```text
iPhone
Score: 95
TTL: 60 min
```

---

## Step 5

Make a cold product trend.

```text
Keyboard
Traffic: 2 → 100 req/sec
```

System detects increased popularity.

```text
TTL:
30 sec → 2 min → 10 min → 30 min
```

---

## Step 6

Trigger cache pressure.

```text
Cache utilization → 90%+
```

Eviction engine activates.

Low-value products are removed.

---

## Step 7

Dashboard displays:

```text
Database Requests Avoided
Estimated Savings
Net Savings
```

This demonstrates the complete problem-to-solution flow.

---

# 30. Deployment Architecture

The prototype shall be designed for free-tier deployment.

Recommended conceptual architecture:

```text
                   Internet
                      │
                      ▼
               ┌─────────────┐
               │   Next.js   │
               │   Hosting   │
               └──────┬──────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
         Redis              PostgreSQL
       Free Tier            Free Tier
```

The application should be deployable without requiring:

* Kubernetes
* AWS EC2
* AWS ElastiCache
* AWS RDS
* Kafka cluster

for the hackathon version.

---

# 31. Docker Support

Local development shall support:

```bash
docker compose up
```

with:

```text
Next.js
Redis
PostgreSQL
```

This allows the entire system to run locally.

---

# 32. Environment Configuration

Example:

```env
DATABASE_URL=
REDIS_URL=
ADMIN_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

# 33. Testing Requirements

The prototype shall contain tests for:

### Cache

* Cache hit
* Cache miss
* Cache set
* Cache expiration

### TTL

* High popularity
* Medium popularity
* Low popularity

### Popularity

* Frequency calculation
* Recency calculation
* Score calculation

### Cost

* Database requests avoided
* Estimated savings
* Net savings

### API

* Product retrieval
* Invalid product
* Database failure

---

# 34. Success Criteria

The prototype shall be considered successful if it demonstrates:

### Technical

* Redis caching works.
* PostgreSQL persistence works.
* Cache-aside pattern works.
* Dynamic TTL works.
* Smart eviction works.
* Analytics work.
* Traffic simulation works.

### Business

The dashboard must clearly demonstrate:

```text
Caching
   ↓
Fewer DB Requests
   ↓
Lower Estimated DB Cost
```

### Visual

Judges should be able to see:

```text
Traffic Change
     ↓
System Decision
     ↓
TTL Change
     ↓
Cache Behavior
     ↓
Database Load
     ↓
Cost Savings
```

without needing to inspect the source code.

---

# 35. MVP Requirements

For the hackathon MVP, the following are mandatory:

```text
✓ Next.js application
✓ TypeScript
✓ PostgreSQL
✓ Prisma
✓ Redis
✓ Product API
✓ Cache-aside
✓ Dynamic TTL
✓ Popularity score
✓ Basic eviction
✓ Cost calculation
✓ Traffic simulator
✓ Admin dashboard
✓ Charts
✓ Deployment
```

---

# 36. Optional Features

If time remains:

```text
○ Server-Sent Events
○ Advanced eviction algorithm
○ Historical analytics
○ ML popularity prediction
○ Authentication
○ Redis Streams
○ Multi-level caching
○ Cloud provider cost presets
○ Performance comparison mode
```

---

# 37. Future Production Architecture

The prototype architecture can evolve into:

```text
                        USERS
                          │
                          ▼
                     CDN / WAF
                          │
                          ▼
                    API Gateway
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
            API-1       API-2       API-3
              │           │           │
              └───────────┼───────────┘
                          │
                          ▼
                    Redis Cluster
                          │
                          ▼
                      Database
                          │
                          ▼
                    Event Stream
                          │
                          ▼
                 Analytics Pipeline
                          │
                          ▼
                  Prediction Engine
                          │
                          ▼
                  Cache Optimizer
```

The hackathon prototype intentionally simplifies this architecture.

---

# 38. Future ML Architecture

Machine learning is NOT required for MVP.

If added later:

```text
Request Events
      ↓
Feature Extraction
      ↓
Traffic History
      ↓
Prediction Model
      ↓
Future Popularity
      ↓
Optimal TTL
```

Potential prediction:

```text
Product A

Current requests:
100/min

Predicted requests:
500/min

Decision:
Increase TTL
```

This can eventually turn the system into a genuine predictive caching engine.

---

# 39. Key Differentiator

A normal caching project says:

> "We use Redis to make APIs faster."

This project should say:

> **"We use traffic intelligence to decide what deserves cache memory, dynamically optimize TTLs, intelligently evict low-value data, reduce database load, and quantify the resulting cloud-cost savings."**

That distinction is important for the hackathon.

---

# 40. Final Prototype Architecture

The final recommended stack is:

```text
                  ┌─────────────────────┐
                  │       Next.js       │
                  │                     │
                  │  React Dashboard    │
                  │        +            │
                  │  Node.js APIs       │
                  │        +            │
                  │  Cache Intelligence │
                  └──────────┬──────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
              ┌─────────┐       ┌────────────┐
              │  Redis  │       │ PostgreSQL │
              │         │       │            │
              │ Cache   │       │ Products   │
              │ TTL     │       │ Data       │
              │ Counters│       │            │
              └─────────┘       └────────────┘

                             │
                             ▼
                  ┌─────────────────────┐
                  │ Analytics Engine    │
                  │                     │
                  │ Popularity          │
                  │ Dynamic TTL         │
                  │ Smart Eviction      │
                  │ Cost Calculation     │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Admin Dashboard     │
                  │                     │
                  │ Hit Rate            │
                  │ DB Load             │
                  │ TTL Changes         │
                  │ Evictions           │
                  │ Cost Savings        │
                  └─────────────────────┘
```

---

# 41. Final Technology Decision

## Frontend

**Next.js + TypeScript + Tailwind CSS + Recharts**

## Backend

**Node.js + Next.js Route Handlers + TypeScript**

## Cache

**Redis**

## Database

**PostgreSQL**

## ORM

**Prisma**

## Validation

**Zod**

## Testing

**Vitest**

## Deployment

**Free-tier Next.js hosting + Free PostgreSQL + Free Redis**

## Local Development

**Docker Compose**

---

# 42. Final One-Line Description

> **Predictive Cloud-Cost Caching Engine is a TypeScript-based intelligent caching middleware that dynamically optimizes cache TTL and eviction based on traffic patterns, reduces database load, and visualizes estimated cloud-cost savings in real time.**

# 43. Development Principle

The entire project shall follow one rule:

```text
BUILD SIMPLE
      ↓
MAKE IT WORK
      ↓
MAKE IT VISUAL
      ↓
MAKE IT INTELLIGENT
      ↓
THEN SCALE IT
```

The hackathon MVP should prioritize a working end-to-end demonstration over unnecessary infrastructure complexity.
