import { stateManager } from './state-manager';
import { ScenarioType } from '@/types';

/**
 * Traffic Simulator (SRS FR-19, FR-20, PRD #21, #22)
 * Generates synthetic traffic distributions to test caching behaviors.
 */

export class TrafficSimulator {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private speedMultiplier: number = 1;

  public start(multiplier: number = 1) {
    this.speedMultiplier = multiplier;
    this.isRunning = true;
    stateManager.setSimulatorRunning(true, multiplier);

    if (this.timer) {
      clearInterval(this.timer);
    }

    const intervalMs = Math.max(100, Math.floor(1000 / this.speedMultiplier));
    this.timer = setInterval(() => {
      this.generateTrafficBatch();
    }, intervalMs);
  }

  public stop() {
    this.isRunning = false;
    stateManager.setSimulatorRunning(false, 1);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = multiplier;
    if (this.isRunning) {
      this.start(multiplier);
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      speedMultiplier: this.speedMultiplier,
      currentScenario: stateManager.getScenario(),
    };
  }

  /**
   * Run a burst of requests immediately (e.g. for "Trigger Spike" or single scenario step)
   */
  public async runBurst(count: number = 20, forcedProductId?: string) {
    const products = stateManager.getProducts();
    if (products.length === 0) return;

    for (let i = 0; i < count; i++) {
      const targetId = forcedProductId || this.pickProductByScenario(stateManager.getScenario());
      await stateManager.requestProduct(targetId);
    }
    stateManager.tick(Date.now());
  }

  /**
   * Generates a batch of requests during each interval tick
   */
  public async generateTrafficBatch() {
    const scenario = stateManager.getScenario();
    const batchSize = Math.max(2, Math.floor(5 * (this.speedMultiplier > 5 ? 3 : 1)));

    for (let i = 0; i < batchSize; i++) {
      const prodId = this.pickProductByScenario(scenario);
      if (prodId) {
        await stateManager.requestProduct(prodId);
      }
    }

    stateManager.tick(Date.now());
  }

  private pickProductByScenario(scenario: ScenarioType): string {
    const products = stateManager.getProducts();
    if (products.length === 0) return 'prod-001';

    const hotProds = products.filter((p) => p.baseDemand === 'HOT');
    const warmProds = products.filter((p) => p.baseDemand === 'WARM');
    const coldProds = products.filter((p) => p.baseDemand === 'COLD');

    const rand = Math.random();

    switch (scenario) {
      case 'VIRAL_SURGE': {
        // 80% traffic directed at 'prod-016' (Vintage Model M Keyboard)
        if (rand < 0.8) {
          return 'prod-016';
        }
        if (rand < 0.95 && hotProds.length > 0) {
          return hotProds[Math.floor(Math.random() * hotProds.length)].id;
        }
        return products[Math.floor(Math.random() * products.length)].id;
      }

      case 'PRODUCT_DECLINE': {
        // 'prod-001' (iPhone) receives zero traffic; traffic moves to Samsung / Dell / Sony
        const nonIphoneHot = hotProds.filter((p) => p.id !== 'prod-001');
        if (rand < 0.65 && nonIphoneHot.length > 0) {
          return nonIphoneHot[Math.floor(Math.random() * nonIphoneHot.length)].id;
        }
        if (rand < 0.9 && warmProds.length > 0) {
          return warmProds[Math.floor(Math.random() * warmProds.length)].id;
        }
        return coldProds.length > 0 ? coldProds[Math.floor(Math.random() * coldProds.length)].id : products[0].id;
      }

      case 'CACHE_PRESSURE': {
        // High dispersion: pick uniformly from all 30 products to flood the cache beyond capacity
        return products[Math.floor(Math.random() * products.length)].id;
      }

      case 'FLASH_SALE': {
        // Heavy 90% concentration on top 3 flagship devices
        const flashIds = ['prod-001', 'prod-002', 'prod-005'];
        if (rand < 0.85) {
          return flashIds[Math.floor(Math.random() * flashIds.length)];
        }
        return products[Math.floor(Math.random() * products.length)].id;
      }

      case 'NORMAL':
      default: {
        // Standard skewed 80/20 distribution
        if (rand < 0.70 && hotProds.length > 0) {
          return hotProds[Math.floor(Math.random() * hotProds.length)].id;
        }
        if (rand < 0.92 && warmProds.length > 0) {
          return warmProds[Math.floor(Math.random() * warmProds.length)].id;
        }
        if (coldProds.length > 0) {
          return coldProds[Math.floor(Math.random() * coldProds.length)].id;
        }
        return products[0].id;
      }
    }
  }
}

// Global Singleton instance
const globalForSim = globalThis as unknown as { trafficSimulatorSingleton?: TrafficSimulator };
export const trafficSimulator = globalForSim.trafficSimulatorSingleton ?? new TrafficSimulator();
if (process.env.NODE_ENV !== 'production') globalForSim.trafficSimulatorSingleton = trafficSimulator;
