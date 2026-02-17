import { Device } from "@domain/entities/device/device.entity";

export abstract class DeviceRepository {
  abstract save(device: Device): Promise<Device>;
  abstract getDevicesByUserId(userId: string): Promise<Device[]>;
  abstract getDeviceById(deviceId: string): Promise<Device[] | null>;
  abstract updateDevice(device: Device): Promise<void>;
  abstract deleteDevice(deviceId: string): Promise<void>;
}
