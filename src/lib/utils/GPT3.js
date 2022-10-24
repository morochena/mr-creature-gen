import { Configuration, OpenAIApi } from "openai";



export const GPTGenerate = async (manName, size, type, theme, difficulty, magic, apiKey) => {

  if (!apiKey) {
    return { name: manName || "", description: "" };
  }

  const configuration = new Configuration({
    apiKey: apiKey
  });

  let prompt;
  let instruction;
  if (manName) {
    prompt = `Size: ${size}\nType: ${type}\nTheme: ${theme}\nDifficulty: ${difficulty}\nMagic User: ${magic}\nName: ${manName}\nDescription:\n`
    instruction = "Add a colorful description for the D&D monster described by the size, type, theme, and difficulty."
  } else {
    prompt = `Size: ${size}\nType: ${type}\nTheme: ${theme}\nDifficulty: ${difficulty}\nMagic User: ${magic}\nName:\nDescription:\n`
    instruction = "Fill in the name add a colorful description for the D&D monster described by the size, type, theme, and difficulty."
  }

  const openai = new OpenAIApi(configuration);

  const response = await openai.createEdit({
    model: "text-davinci-edit-001",
    input: prompt,
    instruction: instruction
  });

  const value = response.data.choices[0].text;
  console.log("================================================")
  console.log(value)

  const name = value.match(/Name:(.*)\nDescription:/)[1];
  const description = value.split("Description:")[1];

  return { name: name.trim(), description: description.trim() };
}