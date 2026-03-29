import api from "./client";

export const getSpaces = () => api.get("/api/spaces");
export const getSpace = (id) => api.get(`/api/spaces/${id}`);
export const getSpaceAvailability = (id, from, to) =>
  api.get(`/api/spaces/${id}/availability`, { params: { from, to } });
export const createSpace = (data) => api.post("/api/spaces", data);
export const updateSpace = (id, data) => api.put(`/api/spaces/${id}`, data);
export const deleteSpace = (id) => api.delete(`/api/spaces/${id}`);
