export interface BaseEvent<TPayload> {
    eventId: string;
    eventType: string;
    timestamp: string;
    source: string;
    correlationId: string;
    payload: TPayload;
}
export declare class EventPublisherService {
    private readonly logger;
    private readonly url;
    private readonly connection;
    publish<TPayload>(params: {
        exchange: string;
        routingKey: string;
        event: BaseEvent<TPayload>;
    }): Promise<void>;
}
