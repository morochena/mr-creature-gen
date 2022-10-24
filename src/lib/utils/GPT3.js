import { Configuration, OpenAIApi } from "openai";



export const GPTGenerate = async (size, type, theme, difficulty, magic, apiKey) => {

  if (!apiKey) {
    return { name: "", description: "" };
  }

  const configuration = new Configuration({
    apiKey: apiKey
  });

  let prompt = `Size: ${size}\nType: ${type}\nTheme: ${theme}\nDifficulty: ${difficulty}\nMagic User: ${magic}\nName:\nDescription:\n`

  const openai = new OpenAIApi(configuration);

  const response = await openai.createEdit({
    model: "text-davinci-edit-001",
    input: prompt,
    instruction: "Fill in the name add a colorful description for the D&D monster described by the size, type, theme, and difficulty."
  });

  const value = response.data.choices[0].text;
  console.log("================================================")
  console.log(value)

  const name = value.match(/Name:(.*)\nDescription:/)[1];
  const description = value.split("Description:")[1];

  return { name: name.trim(), description: description.trim() };
}