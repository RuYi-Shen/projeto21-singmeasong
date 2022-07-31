import { faker } from "@faker-js/faker";

const URL = "http://localhost:3000";
const SERVER_URL = "http://localhost:5000";

beforeEach(() => {
  cy.intercept("DELETE", "/recommendations").as("clear");
  cy.request("DELETE", `${SERVER_URL}/recommendations`);
  //cy.wait("@clear");
  cy.visit(URL);
});

describe("start", () => {
  it("should insert multiple videos", () => {
    const times = 3;
    for (let i = 0; i < times; i++) {
      cy.get("input").first().type(faker.lorem.words(3));
      cy.get("input")
        .last()
        .type("https://www.youtube.com/watch?v=DRy7CgWHLHU");
      cy.get("button").click();
      cy.get("article").should("have.length", i + 1);
    }
  });
  it("should block video with same name", () => {
    const newVideo = {
      name: faker.animal.cat(),
      url: "https://www.youtube.com/watch?v=DRy7CgWHLHU",
    };
    cy.get("input").first().type(newVideo.name);
    cy.get("input").last().type(newVideo.url);
    cy.get("button").click();
    cy.get("article").should("have.length", 1);
    cy.intercept("GET", "/recommendations").as("getRecommendations");
    cy.get("input").first().type(newVideo.name);
    cy.get("input").last().type(newVideo.url);
    cy.get("button").click();
    cy.wait("@getRecommendations");
    cy.get("article").should("have.length", 1);
  });
  it("should block video with no name", () => {
    cy.get("input").last().type("https://www.youtube.com/watch?v=DRy7CgWHLHU");
    cy.get("button").click();
    cy.get("article").should("have.length", 0);
  });

  it("should block video with invalid/empty link", () => {
    cy.get("input").first().type(faker.animal.cat());
    cy.get("button").click();
    cy.get("article").should("have.length", 0);
    cy.get("input").first().type(faker.animal.cat());
    cy.get("input").last().type(faker.internet.url());
    cy.get("button").click();
    cy.get("article").should("have.length", 0);
  });

  it("should change to top page", () => {
    cy.intercept("GET", "/recommendations/top/10").as("top");
    cy.contains("Top").click();
    cy.wait("@top");

    cy.url().should("equal", `${URL}/top`);
  });
  it("should change to random page", () => {
    cy.intercept("GET", "/recommendations/random").as("random");
    cy.contains("Random").click();
    cy.wait("@random");

    cy.url().should("equal", `${URL}/random`);
  });
  it("should change home page", () => {
    cy.intercept("GET", "/recommendations").as("home");
    cy.contains("Home").click();
    cy.wait("@home");

    cy.url().should("equal", `${URL}/`);
  });
  it("should up vote", () => {
    cy.get("input").first().type(faker.animal.cat());
    cy.get("input").last().type("https://www.youtube.com/watch?v=DRy7CgWHLHU");
    cy.intercept("GET", "/recommendations").as("getRecommendations");
    cy.get("button").click();
    cy.wait("@getRecommendations");
    cy.wait(1000);
    cy.get("article").should("have.length", 1);
    cy.get("article").find("svg").first().click();
    cy.get("article").find("div").last().should("have.text", "1");
  });
  it("should down vote", () => {
    cy.get("input").first().type(faker.animal.cat());
    cy.get("input").last().type("https://www.youtube.com/watch?v=DRy7CgWHLHU");
    cy.intercept("GET", "/recommendations").as("getRecommendations");
    cy.get("button").click();
    cy.wait("@getRecommendations");
    cy.wait(1000);
    cy.get("article").should("have.length", 1);
    cy.get("article").find("svg").last().click();
    cy.get("article").find("div").last().should("have.text", "-1");
  });
  it("should delete video", () => {
    cy.get("input").first().type(faker.animal.cat());
    cy.get("input").last().type("https://www.youtube.com/watch?v=DRy7CgWHLHU");
    cy.intercept("GET", "/recommendations").as("getRecommendations");
    cy.get("button").click();
    cy.wait("@getRecommendations");
    cy.wait(1000);
    cy.get("article").should("have.length", 1);
    for (let i = 0; i > -5; i--) {
      cy.get("article").find("div").last().should("have.text", i);
      cy.get("article").find("svg").last().click();
      cy.wait(500);
    }
    cy.get("article").find("svg").last().click();
    cy.get("article").should("have.length", 0);
  });
  it("should display in score ranking", () => {
    const times = 3;
    for (let i = 0; i < times; i++) {
      cy.get("input").first().type(faker.lorem.words(3));
      cy.get("input")
        .last()
        .type("https://www.youtube.com/watch?v=DRy7CgWHLHU");
      cy.get("button").click();
      cy.wait(500);
      for (let j = 0; j < i; j++) {
        cy.get("article").find("svg").first().click();
        cy.wait(500);
      }
    }
	cy.intercept("GET", "/recommendations/top/10").as("top");
    cy.contains("Top").click();
    cy.wait("@top");

    cy.url().should("equal", `${URL}/top`);
	cy.get("article").should("have.length", times);
	cy.get("article").last().find("div").last().should("have.text", "0");
	cy.get("article").first().find("div").last().should("have.text", times - 1);
  }); 
  it("should display in random video", () => {
    const times = 3;
    for (let i = 0; i < times; i++) {
      cy.get("input").first().type(faker.lorem.words(3));
      cy.get("input")
        .last()
        .type("https://www.youtube.com/watch?v=DRy7CgWHLHU");
      cy.get("button").click();
      cy.wait(500);
      for (let j = 0; j < i; j++) {
        cy.get("article").find("svg").first().click();
        cy.wait(500);
      }
    }
	cy.intercept("GET", "/recommendations/random").as("random");
    cy.contains("Random").click();
    cy.wait("@random");

    cy.url().should("equal", `${URL}/random`);
	cy.get("article").should("have.length", 1);
  });
});

afterEach(() => {
  cy.wait(500);
});
