<script>
  import { supabase } from "../supabaseClient";
  import { emptySkillPool } from "../utils/data/skillList";
  import { specialtyList } from "../utils/data/specialtyList";
  import {
    calcBody,
    calcConsider,
    calcDodge,
    calcLevel,
    calcMind,
    calcMove,
    calcPerception,
    calcRun,
    calcStatBonus,
    calcTotalSkillBonus,
  } from "../utils/calculations";
  import logo from "../../assets/logo.png";

  export let id;
  let monster;
  let ascii = ``;

  const loadData = async () => {
    await supabase.auth.getUser();
    const { data, error, status } = await supabase.from("monsters").select(`*`).eq("id", id).single();

    if (data) {
      monster = data;
      printMonster();

      return {
        monster,
      };
    }
    if (error && status !== 406) throw error;
  };

  const printStats = () => {
    const str = `${monster.str}(${calcStatBonus(monster.str)})`.padEnd(8);
    const dex = `${monster.dex}(${calcStatBonus(monster.dex)})`.padEnd(8);
    const emp = `${monster.emp}(${calcStatBonus(monster.emp)})`.padEnd(8);
    const int = `${monster.int}(${calcStatBonus(monster.int)})`.padEnd(8);

    const strLabel = `STR`.padEnd(8);
    const dexLabel = `DEX`.padEnd(8);
    const empLabel = `EMP`.padEnd(8);
    const intLabel = `INT`.padEnd(8);

    return str + dex + emp + int + "\n" + strLabel + dexLabel + empLabel + intLabel;
  };

  const printSkills = () => {
    const getStatValue = (skill) => {
      const stat = emptySkillPool().find((skillz) => skillz.name === skill.name).stat;
      return monster[stat];
    };

    return emptySkillPool()
      .map((skill) => {
        if (monster[skill.name]) {
          const statValue = getStatValue(skill);
          return skill.name + ": " + monster[skill.name] + `(${calcTotalSkillBonus(statValue, monster[skill.name])})`;
        }
      })
      .filter((skill) => skill)
      .join("\n");
  };

  const printSpecialties = () => {
    return specialtyList
      .map((specialty) => {
        if (monster.specialties[specialty]) {
          return specialty + ": " + monster.specialties[specialty] + "(+?)";
        }
      })
      .filter((specialty) => specialty)
      .join("\n");
  };

  const cleanDescription = (description) => {
    // split description into lines that are 80 characters or less
    // add to new line if split

    const lines = description.split("\n");
    const newLines = [];

    lines.forEach((line) => {
      if (line.length > 32) {
        const split = line.match(/.{1,32}(\s|$)/g);
        split.forEach((splitLine) => {
          newLines.push(splitLine);
        });
      } else {
        newLines.push(line);
      }
    });

    return newLines.join("\n");
  };

  const printMonster = () => {
    if (!monster) return;
    ascii = `
${monster.name}
Size: ${monster.size}
${cleanDescription(monster.description)}

-------------------------------

Calculated Stats:
Body:${calcBody(monster)}
Mind: ${calcMind(monster)}
Dodge: ${calcDodge(monster)}
Consider: ${calcConsider(monster)}
Perception: ${calcPerception(monster)}
Move: ${calcMove(monster)}
Run: ${calcRun(monster)}
~XP: ${calcLevel(monster)}
 
Base Stats:
${printStats()}

Skills:
${printSkills()}

Specialties:
${printSpecialties()}
`;
  };

  loadData();
</script>

<a href="/">
  <img
    src={logo}
    alt="Logo"
    width="300px"
    style="display: block;
  margin-left: auto;
  margin-right: auto;"
  />
</a>

<a href={`/monsters/${id}`}><button class="btn margin-top-small"> Edit </button></a>

<pre>{ascii}</pre>
