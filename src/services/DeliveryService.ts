import http from "../http-common";
import { IDeliveryData } from "../types/Delivery";

const findByID = (id: string) => {
  return http.get<IDeliveryData>(`/deliveries/${id}`);
};

const DeliveryService = {
  findByID,
};

export default DeliveryService;
