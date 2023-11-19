import { ILocation, IPackageData } from "./Package";

export enum DeliveryStatus {
  Open = "OPEN",
  PickedUp = "PICKEDUP",
  InTransit = "INTRANSIT",
  Delivered = "DELIVERED",
  Failed = "FAILED",
}

export interface IDeliveryData {
  _id?: string;
  delivery_uid?: string;
  status?: DeliveryStatus;
  location?: ILocation;
  created_at?: string;
  pickup_time?: string;
  start_time?: string;
  end_time?: string;
  last_edited_at?: string;
  package?: IPackageData;
}
