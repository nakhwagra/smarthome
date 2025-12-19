import mqtt, { MqttClient } from 'mqtt';

type Listener<T = unknown> = (data: T) => void;

type EventPayloads = {
  temperature: { temperature: number };
  humidity: { humidity: number };
  gas: { gas: number };
  light: { light: number };
  lamp_status: { status: string };
  door_status: { status: string };
  curtain_status: { status: string };
};

class MQTTService {
  private client: MqttClient | null = null;
  private listeners: Map<string, Listener[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';
      
      this.client = mqtt.connect(brokerUrl, {
        clientId: `smarthome_web_${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
      });

      this.client.on('connect', () => {
        this.reconnectAttempts = 0;
        this.subscribeToTopics();
        resolve();
      });

      this.client.on('message', (topic, payload) => {
        this.handleMessage(topic, payload);
      });

      this.client.on('error', (err) => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
        } else {
          reject(err);
        }
      });

      this.client.on('close', () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
        }
      });
    });
  }

  private subscribeToTopics(): void {
    if (!this.client?.connected) return;

    const topics = [
      'iotcihuy/home/temperature',
      'iotcihuy/home/humidity', 
      'iotcihuy/home/gas',
      'iotcihuy/home/light',
      'iotcihuy/home/lamp/status',
      'iotcihuy/home/door/status',
      'iotcihuy/home/curtain/status',
    ];

    topics.forEach(topic => {
      this.client?.subscribe(topic);
    });
  }

  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const data = JSON.parse(payload.toString()) as unknown;
      const topicParts = topic.split('/');
      
      let eventType: string;
      if (topicParts.includes('status')) {
        eventType = `${topicParts[topicParts.length - 2]}_status`;
      } else {
        eventType = topicParts[topicParts.length - 1];
      }
      
      this.emit(eventType, data);
    } catch {
      // Silently ignore parse errors
    }
  }

  on<K extends keyof EventPayloads>(eventType: K, callback: Listener<EventPayloads[K]>): void;
  on(eventType: string, callback: Listener): void;
  on(eventType: string, callback: Listener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
  }

  off<K extends keyof EventPayloads>(eventType: K, callback: Listener<EventPayloads[K]>): void;
  off(eventType: string, callback: Listener): void;
  off(eventType: string, callback: Listener): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  private emit(eventType: string, data: unknown): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  publish(topic: string, message: unknown): void {
    if (this.client?.connected) {
      this.client.publish(topic, JSON.stringify(message));
    }
  }

  disconnect(): void {
    this.client?.end();
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const mqttService = new MQTTService();
export default mqttService;