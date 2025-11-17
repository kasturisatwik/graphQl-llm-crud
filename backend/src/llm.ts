import * as fs from 'fs';
import path from 'path';
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { config } from "dotenv";

config();

const Model = process.env.MODEL;
const __dirname = path.resolve();
const TEMPLATE_PATH = path.join(__dirname, "src", "prompt.txt");

const llm = new Ollama({
    model: Model,
    baseUrl: "http://localhost:11434",
    temperature: 0.2,
  });

  const promptText = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const prompt = new PromptTemplate({
    template: `{Text}\n\nUser:{input}\nOutput:`,
    inputVariables: ["input","Text"],
  });

export async function translateNLtoGraphQL(nl: any) {
  const filledPrompt = await prompt.format({ input: nl, Text: promptText  });
  const response = await llm.invoke(filledPrompt);
  return response;
}

export function cleanedGql(gql: string): string {
  const cleaned_gql = gql
    .trim()
    .replace(/^```(?:graphql|gql)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
  console.log({cleaned_gql})
  return cleaned_gql;
}