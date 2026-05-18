import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get('health')
  async check(): Promise<{
    status: 'ok' | 'degraded';
    service: string;
    postgres: 'connected' | 'error';
    timestamp: string;
  }> {
    let postgres: 'connected' | 'error' = 'error';
    try {
      await this.dataSource.query('SELECT 1');
      postgres = 'connected';
    } catch {
      postgres = 'error';
    }
    return {
      status: postgres === 'connected' ? 'ok' : 'degraded',
      service: 'autoflow-payment-service',
      postgres,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('billing/health/liveness')
  liveness() {
    return { status: 'ok' };
  }

  @Get('billing/health/readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.db.pingCheck('postgres')]);
  }
}
