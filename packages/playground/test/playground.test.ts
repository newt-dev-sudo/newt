import assert from "node:assert/strict";
import { test } from "node:test";
import { PlaygroundModel } from "../src/AppModel.js";
import { examples } from "../src/examples.js";
import { createSimulation } from "../src/simulationEngine.js";

test("playground examples compile through the model", () => {
  const model = new PlaygroundModel(examples[0].source);
  for (const example of examples) {
    const state = model.loadExample(example.id);
    assert.equal(state.status, "running", `${example.id} should compile`);
    assert.equal(state.errors.length, 0);
  }
});

test("simulation responds to a command", () => {
  const simulation = createSimulation(examples[0].source);
  const messages = simulation.sendMessage("!hello", "Sam");
  assert.ok(messages.some((message) => message.from === "bot" && message.content.includes("Sam")));
});
