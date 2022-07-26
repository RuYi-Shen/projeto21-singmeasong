import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database.js";
import { faker } from "@faker-js/faker";

beforeEach(() => {
  prisma.recommendation.deleteMany({});
});

describe("POST /recommendations", () => {
  it("given a video with duplicate name it should return 409", async () => {
    const newVideo = {
      name: "孤城",
      youtubeLink: "https://www.youtube.com/watch?v=r2sCy9ZOToA",
    };

    const firstTry = await supertest(app)
      .post("/recommendations")
      .send(newVideo);
    expect(firstTry.status).toEqual(201);

    const secondTry = await supertest(app)
      .post("/recommendations")
      .send(newVideo);
    expect(secondTry.status).toEqual(409);

    const videoFromDb = await prisma.recommendation.findUnique({
      where: {
        name: newVideo.name,
      },
    });
    expect(videoFromDb).toBeDefined();
  });

  it("given a video with no name it should return 400", async () => {
    const newVideo = {
      youtubeLink: "https://www.youtube.com/watch?v=r2sCy9ZOToA",
    };

    const response = await supertest(app)
      .post("/recommendations")
      .send(newVideo);
    expect(response.status).toEqual(422);
  });

  it("given a video with invalid youtube link it should return 400", async () => {
    const newVideo = {
      name: "孤城",
      youtubeLink: "https://www.google.com.br/",
    };

    const response = await supertest(app)
      .post("/recommendations")
      .send(newVideo);
    expect(response.status).toEqual(422);
  });
});
