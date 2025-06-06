const Service = require('../models/service')
const { cacheMethodCalls } = require("../utils/cache");

const serviceService = {
  async findServices(query, page = 1, limit = 9) {
    const skip = (page - 1) * limit;
    const [services, total] = await Promise.all([
      Service.find(query).skip(skip).limit(limit),
      Service.countDocuments(query),
    ]);
    return {
      data: services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findServiceById(id) {
    return Service.findById(id);
  },

  async createService(data) {
    const service = new Service(data);
    return service.save();
  },

  async updateService(id, data) {
    return Service.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteService(id) {
    return Service.findByIdAndDelete(id);
  },
};

// Wrap with caching proxy
// Specified methods that modify data and should flush cache
const cachedService = cacheMethodCalls(serviceService, [
  "createService",
  "updateService",
  "deleteService",
]);

module.exports = cachedService;