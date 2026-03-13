import { ContainerAPI } from "../endpoints/containerEndpoints";

export const containerService = {
  async getAllContainers() {
    return (await ContainerAPI.getAll()).data;
  },
  async getContainerById(id) {
    return (await ContainerAPI.getById(id)).data;
  },
  async createContainer(data) {
    return (await ContainerAPI.create(data)).data;
  },
  async updateContainer(id, data) {
    return (await ContainerAPI.update(id, data)).data;
  },
  async deleteContainer(id) {
    await ContainerAPI.delete(id);
    return true;
  },
  async addItem(id, data) {
    const payload = {
      ...data,
      quantityOrdered: parseFloat(data.quantityOrdered),
      landedCost: parseFloat(data.landedCost),
      priceKsh: parseFloat(data.priceKsh || 0),
      priceUsd: parseFloat(data.priceUsd || 0),
      sph: data.sph ? parseFloat(data.sph) : undefined,
      cyl: data.cyl ? parseFloat(data.cyl) : undefined,
      axis: data.axis ? parseInt(data.axis) : undefined,
      nearAdd: data.nearAdd ? parseFloat(data.nearAdd) : undefined,
      wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : undefined,
    };
    return (await ContainerAPI.addItem(id, payload)).data;
  },
  async bulkAddItems(id, items) {
    return (await ContainerAPI.bulkAddItems(id, items)).data;
  },
  async deleteItem(id, itemId) {
    await ContainerAPI.deleteItem(id, itemId);
    return true;
  },
  async receiveContainer(id) {
    return (await ContainerAPI.receive(id)).data;
  },
};