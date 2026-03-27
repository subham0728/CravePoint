import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    id: string;
    status: OrderStatus;
    customer: Principal;
    timestamp: bigint;
    items: Array<[string, bigint]>;
}
export enum OrderStatus {
    readyForPickup = "readyForPickup",
    preparing = "preparing",
    ordered = "ordered",
    reviewed = "reviewed"
}
export interface backendInterface {
    changeStaffPassword(oldPassword: string, newPassword: string): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrderStatus(orderId: string): Promise<OrderStatus>;
    placeOrder(items: Array<[string, bigint]>): Promise<string>;
    staffLogin(password: string): Promise<boolean>;
    staffUpdateOrderStatus(orderId: string, status: OrderStatus, password: string): Promise<void>;
}
