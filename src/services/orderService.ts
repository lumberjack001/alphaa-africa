import { apiFetch } from "@/lib/api";

export interface OrderItem {
  reference: string;
  booking_type: string; // e.g. "flight", "hotel", "car", "package", "visa"
  title: string;
  amount: string;
  currency: string;
  payment_status: "success" | "pending" | "failed" | string;
  paid_at?: string | null;
  created_at: string;
}

export interface OrderHistoryResponse {
  count: number;
  orders: OrderItem[];
}

export interface OrderHistoryParams {
  email?: string;
  token?: string;
}

export interface OrderDetailsResponse {
  reference: string;
  status: string;
  payment_status?: string;
  pnr?: string;
  amadeus_order_id?: string;
  total_amount?: string;
  currency?: string;
  flight_details?: {
    airline_code?: string;
    validating_airlines?: string[];
    cabin?: string;
    seats_available?: number;
    last_ticketing_date?: string;
    itineraries?: any[];
    [key: string]: any;
  };
  travelers?: any[];
  booking?: any;
  [key: string]: any;
}

/**
 * Fetch all order history tied to a customer.
 * - For Logged-in users: sending Bearer auth token automatically (handled by apiFetch).
 * - For Guests: pass email and secure token from email link.
 */
export async function getOrderHistory(params?: OrderHistoryParams): Promise<OrderHistoryResponse> {
  const queryParams = new URLSearchParams();

  if (params?.email) queryParams.set("email", params.email);
  if (params?.token) queryParams.set("token", params.token);

  const queryString = queryParams.toString();
  const endpoint = `/api/payments/orders/history/${queryString ? `?${queryString}` : ""}`;

  return apiFetch<OrderHistoryResponse>(endpoint);
}

/**
 * Fetch full order & PNR details by Paystack reference or order lookup.
 * GET /api/payments/order/<reference>/
 */
export async function lookupOrder(reference: string): Promise<OrderDetailsResponse> {
  return apiFetch<OrderDetailsResponse>(`/api/payments/order/${encodeURIComponent(reference)}/`);
}
