import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (event: T) => Promise<void> | void;

/**
 * Event service for publishing and subscribing to events
 */
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Publish an event
   */
  async publish<T>(event: T): Promise<void> {
    try {
      const eventName = this.getEventName(event);
      this.logger.debug(`📤 Publishing event: ${eventName}`);

      await this.eventEmitter.emitAsync(eventName, event);

      this.logger.debug(`✅ Event published successfully: ${eventName}`);
    } catch (error) {
      this.logger.error(`❌ Failed to publish event:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to an event
   */
  on<T>(eventClass: new (...args: any[]) => T, handler: EventHandler<T>): void {
    const eventName = this.getEventNameFromClass(eventClass);
    this.logger.debug(`📥 Subscribing to event: ${eventName}`);

    this.eventEmitter.on(eventName, handler);
  }

  /**
   * Subscribe to an event (once)
   */
  once<T>(eventClass: new (...args: any[]) => T, handler: EventHandler<T>): void {
    const eventName = this.getEventNameFromClass(eventClass);
    this.logger.debug(`📥 Subscribing to event (once): ${eventName}`);

    this.eventEmitter.once(eventName, handler);
  }

  /**
   * Remove event listener
   */
  off<T>(eventClass: new (...args: any[]) => T, handler?: EventHandler<T>): void {
    const eventName = this.getEventNameFromClass(eventClass);
    this.logger.debug(`📤 Removing event listener: ${eventName}`);

    if (handler) {
      this.eventEmitter.off(eventName, handler);
    } else {
      this.eventEmitter.removeAllListeners(eventName);
    }
  }

  /**
   * Get event name from event instance
   */
  private getEventName(event: any): string {
    return event.constructor.name;
  }

  /**
   * Get event name from event class
   */
  private getEventNameFromClass(eventClass: new (...args: any[]) => any): string {
    return eventClass.name;
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    return this.eventEmitter.eventNames() as string[];
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventClass: new (...args: any[]) => any): number {
    const eventName = this.getEventNameFromClass(eventClass);
    return this.eventEmitter.listenerCount(eventName);
  }
}
