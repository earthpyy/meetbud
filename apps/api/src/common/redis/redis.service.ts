import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(this.config.get<string>('REDIS_URL') as string)
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds != null) {
      await this.client.set(key, value, 'EX', ttlSeconds)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.client.del(...keys)
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1
  }

  incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds)
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    if (members.length) await this.client.sadd(key, ...members)
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    if (members.length) await this.client.srem(key, ...members)
  }

  smembers(key: string): Promise<string[]> {
    return this.client.smembers(key)
  }
}
