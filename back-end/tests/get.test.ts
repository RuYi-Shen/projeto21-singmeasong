import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database.js";
import { faker } from "@faker-js/faker";

beforeEach(async () => {
  await prisma.recommendation.deleteMany({});
});

describe("GET /recommendations", () => {
  it("should return 200 and last 10 recommendations", async () => {
    const response = await supertest(app).get("/recommendations");
    expect(response.status).toEqual(200);
    expect(response.body.length).toBeLessThanOrEqual(10);
  });

  it("given a video ID it should return 200", async () => {
    const newVideo = {
      name: "孤城",
      youtubeLink: "https://www.youtube.com/watch?v=r2sCy9ZOToA",
    };
    await prisma.recommendation.create({
      data: newVideo,
    });
    const videoFromDb = await prisma.recommendation.findUnique({
      where: {
        name: newVideo.name,
      },
    });

    const id = videoFromDb.id;
    const response = await supertest(app).get(`/recommendations/${id}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(id);
  });

  it("given a invalid video ID it should return 404", async () => {
    const response = await supertest(app).get("/recommendations/0");
    expect(response.status).toEqual(404);
  });

  it("given the random parameter it should return 200", async () => {
    const response = await supertest(app).get("/recommendations/random");
    expect(response.status).toEqual(404);

    const newVideo = {
      name: faker.internet.emoji(),
      youtubeLink: "https://www.youtube.com/watch?v=r2sCy9ZOToA",
    };
    await prisma.recommendation.create({
      data: newVideo,
    });
    const response2 = await supertest(app).get("/recommendations/random");
    expect(response2.status).toEqual(200);
    expect(response2.body.name).toEqual(newVideo.name);
  });

  it("given the top parameter it should return 200", async () => {
    const amount = Math.round(Math.random() * 20);
    const response = await supertest(app).get(`/recommendations/top/${amount}`);
    expect(response.status).toEqual(200);
    expect(response.body.length).toBeLessThanOrEqual(amount);
    for(let i = 0; i < response.body.length - 2; i++) {
      expect(response.body[i].score).toBeGreaterThanOrEqual(response.body[i+1].score);
    }
  });
});
