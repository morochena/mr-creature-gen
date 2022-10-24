import { monsters } from "../stores/monsterStore";
import { supabase } from "../supabaseClient";
import { GPTGenerate } from "./GPT3.js";
import { get } from 'svelte/store';
import { emptySkillPool } from "./data/skillList";
export const generateMonster = async ({ manName, size, type, race, theme, magic, difficulty, apiKey }) => {

  const user = supabase.auth.user()

  const openAIKey = get(apiKey)

  // generate name and description
  const { name, description } = await GPTGenerate(manName, size, type, theme, difficulty, magic, openAIKey)

  let monster = {
    name,
    description,
    size,
    user_id: user.id,
  }

  // generate str, dex, int, emp
  generateBaseStats(size, difficulty, magic, monster);

  // generate skills
  let monsterSkillPool = emptySkillPool();

  monsterSkillPool = monsterSkillPool.map(skill => {
    skill.value = addSkillPoint(skill, monster)
    return skill
  })

  monsterSkillPool.forEach(skill => {
    monster[skill.name] = skill.value
  })


  let { data, error } = await supabase.from('monsters').insert(monster)

  if (error) throw error
  window.location.href = `/monsters/${data[0].id}`
}


// randomly add values, tend to add skill values if they are with a favored stat
const addSkillPoint = (skill, monster) => {
  const stats = { str: monster.str, dex: monster.dex, int: monster.int, emp: monster.emp }
  const difficulty = monster.difficulty

  let skillValue = 0;
  if (difficulty == "weak") {
    skillValue = Math.floor(Math.random() * 2)
  } else if (difficulty == "average") {
    skillValue = Math.floor(Math.random() * 3)
  } else if (difficulty == "powerful") {
    skillValue = Math.floor(Math.random() * 4)
  } else if (difficulty == "very powerful") {
    skillValue = Math.floor(Math.random() * 5)
  } else if (difficulty == "extremely powerful") {
    skillValue = Math.floor(Math.random() * 6)
  }

  const strHighest = skill.stat == "str" && stats.str >= stats.dex && stats.str >= stats.emp && stats.str >= stats.int
  const dexHighest = skill.stat == "dex" && stats.dex >= stats.str && stats.dex >= stats.emp && stats.dex >= stats.int
  const empHighest = skill.stat == "emp" && stats.emp >= stats.str && stats.emp >= stats.dex && stats.emp >= stats.int
  const intHighest = skill.stat == "int" && stats.int >= stats.str && stats.int >= stats.dex && stats.int >= stats.emp

  // if skill.stat is highest stat, 50% chance to add one
  if (strHighest || dexHighest || empHighest || intHighest) {
    if (Math.random() > 0.5) {
      skillValue += 1
    }
  }

  return skillValue
}

const roll2d10 = () => {
  return Math.max(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1);
}

function generateBaseStats(size, difficulty, magic, monster) {
  let str = roll2d10();
  let dex = roll2d10();
  let emp = roll2d10();
  let int = roll2d10();

  // modify bonus stats if size large, huge, or gargantuan
  if (size == "large") {
    str += Math.floor(Math.random() * 3) + 1;
    dex -= Math.floor(Math.random() * 3) + 1;
  } else if (size == "huge") {
    str += Math.floor(Math.random() * 6) + 1;
    dex -= Math.floor(Math.random() * 4) + 1;
  } else if (size == "gargantuan") {
    str += Math.floor(Math.random() * 9) + 1;
    dex -= Math.floor(Math.random() * 5) + 1;
  }

  // modify bonus stats based on difficulty 
  if (difficulty == "pathetically weak") {
    str -= Math.floor(Math.random() * 3) + 1;
    dex -= Math.floor(Math.random() * 3) + 1;
    emp -= Math.floor(Math.random() * 3) + 1;
    int -= Math.floor(Math.random() * 3) + 1;
  } else if (difficulty == "weak") {
    str -= Math.floor(Math.random() * 2) + 1;
    dex -= Math.floor(Math.random() * 2) + 1;
    emp -= Math.floor(Math.random() * 2) + 1;
    int -= Math.floor(Math.random() * 2) + 1;
  } else if (difficulty == "powerful") {
    str += Math.floor(Math.random() * 3) + 1;
    dex += Math.floor(Math.random() * 3) + 1;
    emp += Math.floor(Math.random() * 3) + 1;
    int += Math.floor(Math.random() * 3) + 1;
  } else if (difficulty == "very powerful") {
    str += Math.floor(Math.random() * 4) + 1;
    dex += Math.floor(Math.random() * 4) + 1;
    emp += Math.floor(Math.random() * 4) + 1;
    int += Math.floor(Math.random() * 4) + 1;
  } else if (difficulty == "extremely powerful") {
    str += Math.floor(Math.random() * 6) + 1;
    dex += Math.floor(Math.random() * 6) + 1;
    emp += Math.floor(Math.random() * 6) + 1;
    int += Math.floor(Math.random() * 6) + 1;
  }

  // if magic user, add int and emp and reduce str and dex 
  if (magic) {
    str -= Math.floor(Math.random() * 2) + 1;
    dex -= Math.floor(Math.random() * 2) + 1;
    emp += Math.floor(Math.random() * 2) + 1;
    int += Math.floor(Math.random() * 2) + 1;
  }

  // ensure each stat is at least 0 
  str = Math.max(str, 0);
  dex = Math.max(dex, 0);
  emp = Math.max(emp, 0);
  int = Math.max(int, 0);

  monster.str = str;
  monster.dex = dex;
  monster.emp = emp;
  monster.int = int;
}
