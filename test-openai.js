import { runAI } from "./ai/aiClient.js";

const test = async () => {
  const result = await runAI("Say only the word OK.");
  console.log(result);
};

test();
