import { IDeliveryData } from "./Delivery";

export type ILocation = {
  latitude: number;
  longitude: number;
};

export interface IPackageData {
  _id?: string;
  package_uid?: string;
  description?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  from_name?: string;
  from_address?: string;
  from_location?: ILocation;
  to_name?: string;
  to_address?: string;
  to_location?: ILocation;
  deliveries: IDeliveryData[];
  created_at?: string;
  last_edited_at?: string;
}
