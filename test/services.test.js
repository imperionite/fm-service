const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const sinon = require("sinon");

const app = require("../app"); // Your Express app
const { serviceService } = require("../services/service"); // Raw service logic for stubbing

describe("Services API", () => {
  let findServicesStub, findByIdStub, createStub, updateStub, deleteStub;

  beforeEach(() => {
    findServicesStub = sinon.stub(serviceService, "findServices");
    findByIdStub = sinon.stub(serviceService, "findServiceById");
    createStub = sinon.stub(serviceService, "createService");
    updateStub = sinon.stub(serviceService, "updateService");
    deleteStub = sinon.stub(serviceService, "deleteService");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GET /api/services", () => {
    it("should return paginated list of services", async () => {
      const fakeResult = {
        data: [{ _id: "abc123", name: "Test Service" }],
        total: 1,
        page: 1,
        limit: 9,
        totalPages: 1,
      };
      findServicesStub.resolves(fakeResult);

      const res = await request(app).get("/api/services");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(fakeResult);
      expect(findServicesStub.calledOnce).to.be.true;
    });

    // For future regerence
    // it("should handle errors gracefully", async () => {
    //   findServicesStub.rejects(new Error("DB error"));

    //   const res = await request(app).get("/api/services");

    //   expect(res.status).to.equal(500);
    //   expect(res.body).to.have.property("error");
    // });
  });

  describe("GET /api/services/:id", () => {
    it("should return a service by ID", async () => {
      const fakeService = { _id: "abc123", name: "Test Service" };
      findByIdStub.resolves(fakeService);

      const res = await request(app).get("/api/services/abc123");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(fakeService);
      expect(findByIdStub.calledWith("abc123")).to.be.true;
    });

    it("should return 404 if service not found", async () => {
      findByIdStub.resolves(null);

      const res = await request(app).get("/api/services/unknownId");

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error", "Service not found");
    });

    it("should return 400 for invalid ID", async () => {
      findByIdStub.rejects(new Error("Cast to ObjectId failed"));

      const res = await request(app).get("/api/services/invalid-id");

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error", "Invalid service ID");
    });
  });

  describe("POST /api/services", () => {
    it("should create a new service", async () => {
      const newService = {
        name: "New Service",
        description: "Desc",
        category: "Financial Analysis",
        industry: "Retail",
        price: 1000,
        duration_hours: 2,
      };
      createStub.resolves({ ...newService, _id: "newId" });

      const res = await request(app).post("/api/services").send(newService);

      expect(res.status).to.equal(201);
      expect(res.body).to.include(newService);
      expect(createStub.calledWith(newService)).to.be.true;
    });

    it("should return 400 on validation error", async () => {
      createStub.rejects(new Error("Validation failed"));

      const res = await request(app).post("/api/services").send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });
  });

  describe("PUT /api/services/:id", () => {
    it("should update an existing service", async () => {
      const updateData = { price: 2000 };
      updateStub.resolves({ _id: "abc123", name: "Existing Service", ...updateData });

      const res = await request(app).put("/api/services/abc123").send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body.price).to.equal(2000);
      expect(updateStub.calledWith("abc123", updateData)).to.be.true;
    });

    it("should return 404 if service to update not found", async () => {
      updateStub.resolves(null);

      const res = await request(app).put("/api/services/unknownId").send({ price: 2000 });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error", "Service not found");
    });

    it("should return 400 on update error", async () => {
      updateStub.rejects(new Error("Update failed"));

      const res = await request(app).put("/api/services/abc123").send({ price: -10 });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });
  });

  describe("DELETE /api/services/:id", () => {
    it("should delete a service", async () => {
      deleteStub.resolves({ _id: "abc123" });

      const res = await request(app).delete("/api/services/abc123");

      expect(res.status).to.equal(204);
      expect(res.body).to.be.empty;
      expect(deleteStub.calledWith("abc123")).to.be.true;
    });

    it("should return 404 if service to delete not found", async () => {
      deleteStub.resolves(null);

      const res = await request(app).delete("/api/services/unknownId");

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error", "Service not found");
    });

    it("should return 400 on delete error", async () => {
      deleteStub.rejects(new Error("Delete failed"));

      const res = await request(app).delete("/api/services/abc123");

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });
  });
});
