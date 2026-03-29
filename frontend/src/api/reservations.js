import api from "./client";

export const getReservations = () => api.get("/api/reservations");
export const createReservation = (data) => api.post("/api/reservations", data);
export const updateReservationStatus = (id, data) => api.patch(`/api/reservations/${id}/status`, data);
export const cancelReservation = (id) => api.delete(`/api/reservations/${id}`);
