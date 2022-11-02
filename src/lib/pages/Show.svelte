<script>
  import { specialtyList } from "../utils/data/specialtyList";
  import { supabase } from "../supabaseClient";

  import StatInput from "./StatInput.svelte";

  export let id;

  let selectedSpecialty = "Academia";

  let monster = { specialties: {} };

  const loadData = async () => {
    await supabase.auth.getUser();
    const { data, error, status } = await supabase.from("monsters").select(`*`).single().eq("id", id);

    if (data) {
      monster = data;
      console.log(monster);

      return {
        monster,
      };
    }
    if (error && status !== 406) throw error;
  };

  let saveText = "Save";

  const addSpeciality = () => {
    monster.specialties[selectedSpecialty] = 0;
    console;
  };

  const calcLevel = (monster) => {
    let level = 0;

    const scaleAdd = (stat) => {
      let xp = 0;
      for (let i = 0; i <= stat; i++) {
        xp += i;
      }

      return xp;
    };

    level += scaleAdd(monster.str - 8);
    level += scaleAdd(monster.dex - 8);
    level += scaleAdd(monster.emp - 8);
    level += scaleAdd(monster.int - 8);

    const skills = [
      { name: "smash", stat: "str", value: 0 },
      { name: "launch", stat: "str", value: 0 },
      { name: "athletics", stat: "str", value: 0 },
      { name: "physique", stat: "str", value: 0 },
      { name: "provoke", stat: "str", value: 0 },
      { name: "accuracy", stat: "dex", value: 0 },
      { name: "mobility", stat: "dex", value: 0 },
      { name: "thievery", stat: "dex", value: 0 },
      { name: "notice", stat: "dex", value: 0 },
      { name: "stealth", stat: "dex", value: 0 },
      { name: "animal_handling", stat: "emp", value: 0 },
      { name: "deceive", stat: "emp", value: 0 },
      { name: "rapport", stat: "emp", value: 0 },
      { name: "willpower", stat: "emp", value: 0 },
      { name: "mysticism", stat: "emp", value: 0 },
      { name: "craft", stat: "int", value: 0 },
      { name: "travel", stat: "int", value: 0 },
      { name: "reasoning", stat: "int", value: 0 },
      { name: "lore", stat: "int", value: 0 },
      { name: "resourcefulness", stat: "int", value: 0 },
    ];

    for (const skill of skills) {
      level += scaleAdd(monster[skill.name]);
    }

    for (const specialty in monster.specialties) {
      level += scaleAdd(monster.specialties[specialty]);
    }

    return level;
  };

  const calcStatBonus = (stat) => {
    const value = Math.floor(stat - 5);
    if (value > 0) {
      return "+" + value;
    }
    return value;
  };

  const calcTotalSkillBonus = (stat, skill) => {
    const skillValue = skill * 2;
    const statValue = stat - 5;
    const value = Math.floor(statValue + skillValue);
    if (value > 0) {
      return "+" + value;
    }
    return value;
  };

  const calcRawSkillBonus = (stat, skill) => {
    const skillValue = skill * 2;
    const statValue = stat - 5;
    return Math.floor(statValue + skillValue);
  };

  const calcBody = (monster) => {
    const value = Math.floor(calcRawSkillBonus(monster.str, monster.physique)) + 10;

    if (monster.size == "tiny") {
      return Math.floor(value / 4);
    } else if (monster.size == "small") {
      return Math.floor(value / 2);
    } else if (monster.size == "large") {
      return Math.floor(value * 2);
    } else if (monster.size == "huge") {
      return Math.floor(value * 3);
    } else if (monster.size == "gargantuan") {
      return Math.floor(value * 4);
    } else if (monster.size == "colossal") {
      return Math.floor(value * 6);
    }
    return value;
  };

  const calcMind = (monster) => {
    return Math.floor(calcRawSkillBonus(monster.emp, monster.willpower)) + 10;
  };

  const calcDodge = (monster) => {
    const skillBonus = calcRawSkillBonus(monster.dex, monster.stealth);
    const specialityBonus = (monster.specialties.Dodge || 0) * 3;
    const combined = skillBonus + specialityBonus;

    const value = Math.floor(combined / 2) + 7;

    if (monster.size == "tiny") {
      return value + 4;
    } else if (monster.size == "small") {
      return value + 2;
    } else if (monster.size == "large") {
      return value - 2;
    } else if (monster.size == "huge") {
      return value - 3;
    } else if (monster.size == "gargantuan") {
      return value - 4;
    } else if (monster.size == "colossal") {
      return value - 6;
    }

    return value;
  };

  const calcPerception = (monster) => {
    const skillBonus = calcRawSkillBonus(monster.int, monster.notice);
    const combined = skillBonus;
    return Math.floor(combined / 2) + 7;
  };

  const calcConsider = (monster) => {
    const skillBonus = calcRawSkillBonus(monster.int, monster.reasoning);
    const specialityBonus = (monster.specialties.Consider || 0) * 3;
    const combined = skillBonus + specialityBonus;
    return Math.floor(combined / 2) + 7;
  };

  const calcMove = (monster) => {
    return Math.ceil((monster.dex - 5) / 2) + 5;
  };

  const calcRun = (monster) => {
    const baseRun = calcMove(monster) * 2 + 10;
    const skillBonus = calcRawSkillBonus(monster.str, monster.athletics);
    const specialityBonus = (monster.specialties.Running || 0) * 3;

    const combined = skillBonus + specialityBonus;

    return Math.floor(combined * 2) + baseRun;
  };

  const saveMonster = async () => {
    await supabase.auth.getUser();
    const { error } = await supabase.from("monsters").upsert(monster);

    if (!error) {
      saveText = "Saved!";
      setTimeout(() => {
        saveText = "Save";
      }, 2000);
    }
  };

  const deleteMonster = async () => {
    if (confirm("Are you sure?")) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("monsters").delete().eq("id", monster.id);

      if (!error) {
        window.location.href = "/";
      }
    }
  };

  const removeSpecialty = (selectedSpecialty) => {
    const newSpecialties = Object.keys(monster.specialties).reduce((acc, key) => {
      if (key !== selectedSpecialty) {
        acc[key] = monster.specialties[key];
      }
      return acc;
    }, {});

    monster.specialties = newSpecialties;
  };

  loadData();
</script>

<button on:click={saveMonster} class="btn-block btn-secondary margin-top-small">
  {saveText}
</button>
<button on:click={deleteMonster} class="btn-block btn-danger"> Delete </button>

<div class="form-group margin-top-large">
  <label for="name">Name</label>
  <input name="name" id="name" class="input-block" bind:value={monster.name} />
</div>

<div class="form-group">
  <label for="description">Description</label>
  <textarea name="description" id="description" rows="6" class="input-block" bind:value={monster.description} />
</div>

<h3>Calculated Stats</h3>

<table>
  <tbody>
    <tr><td>Body</td><td>{calcBody(monster)}</td></tr>
    <tr><td>Mind</td><td> {calcMind(monster)}</td></tr>
    <tr><td>Dodge</td><td> {calcDodge(monster)}</td></tr>
    <tr><td>Consider</td><td> {calcConsider(monster)}</td></tr>
    <tr><td>Perception</td><td> {calcPerception(monster)}</td></tr>
    <tr><td>Move</td><td> {calcMove(monster)}</td></tr>
    <tr><td>Run</td><td> {calcRun(monster)}</td></tr>
    <tr><td>~XP</td><td> {calcLevel(monster)}</td></tr>
  </tbody>
</table>

<h3>Base Stats</h3>

<table>
  <tbody>
    <StatInput label="Strength" bind:statValue={monster.str} statBonus={calcStatBonus(monster.str)} />
    <StatInput label="Dexterity" bind:statValue={monster.dex} statBonus={calcStatBonus(monster.dex)} />
    <StatInput label="Empathy" bind:statValue={monster.emp} statBonus={calcStatBonus(monster.emp)} />
    <StatInput label="Intelligence" bind:statValue={monster.int} statBonus={calcStatBonus(monster.int)} />
    <tr>
      <td><label for="size"> Size </label></td>
      <td
        ><select name="size" id="size" style="width: 120px" bind:value={monster.size}>
          <option value="tiny">Tiny</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
          <option value="gargantuan">Gargantuan</option>
        </select>
      </td>
      <td />
    </tr>
  </tbody>
</table>

<h4>STR Skills</h4>

<table>
  <tbody>
    <StatInput
      label="Smash"
      bind:statValue={monster.smash}
      statBonus={calcTotalSkillBonus(monster.str, monster.smash)}
    />
    <StatInput
      label="Launch"
      bind:statValue={monster.launch}
      statBonus={calcTotalSkillBonus(monster.str, monster.launch)}
    />
    <StatInput
      label="Athletics"
      bind:statValue={monster.athletics}
      statBonus={calcTotalSkillBonus(monster.str, monster.athletics)}
    />
    <StatInput
      label="Physique"
      bind:statValue={monster.physique}
      statBonus={calcTotalSkillBonus(monster.str, monster.physique)}
    />
    <StatInput
      label="Provoke"
      bind:statValue={monster.provoke}
      statBonus={calcTotalSkillBonus(monster.str, monster.provoke)}
    />
  </tbody>
</table>

<h4>DEX Skills</h4>

<table>
  <tbody>
    <StatInput
      label="Accuracy"
      bind:statValue={monster.accuracy}
      statBonus={calcTotalSkillBonus(monster.dex, monster.accuracy)}
    />
    <StatInput
      label="Mobility"
      bind:statValue={monster.mobility}
      statBonus={calcTotalSkillBonus(monster.dex, monster.mobility)}
    />
    <StatInput
      label="Thievery"
      bind:statValue={monster.thievery}
      statBonus={calcTotalSkillBonus(monster.dex, monster.thievery)}
    />
    <StatInput
      label="Notice"
      bind:statValue={monster.notice}
      statBonus={calcTotalSkillBonus(monster.dex, monster.notice)}
    />
    <StatInput
      label="Stealth"
      bind:statValue={monster.stealth}
      statBonus={calcTotalSkillBonus(monster.dex, monster.stealth)}
    />
  </tbody>
</table>

<h4>EMP Skills</h4>

<table>
  <tbody>
    <StatInput
      label="Animal Handling"
      bind:statValue={monster.animal_handling}
      statBonus={calcTotalSkillBonus(monster.emp, monster.animal_handling)}
    />
    <StatInput
      label="Deceive"
      bind:statValue={monster.deceive}
      statBonus={calcTotalSkillBonus(monster.emp, monster.deceive)}
    />
    <StatInput
      label="Rapport"
      bind:statValue={monster.rapport}
      statBonus={calcTotalSkillBonus(monster.emp, monster.rapport)}
    />
    <StatInput
      label="Willpower"
      bind:statValue={monster.willpower}
      statBonus={calcTotalSkillBonus(monster.emp, monster.willpower)}
    />
    <StatInput
      label="Mysticism"
      bind:statValue={monster.mysticism}
      statBonus={calcTotalSkillBonus(monster.emp, monster.mysticism)}
    />
  </tbody>
</table>

<h4>INT Skills</h4>

<table>
  <tbody>
    <StatInput
      label="Craft"
      bind:statValue={monster.craft}
      statBonus={calcTotalSkillBonus(monster.int, monster.craft)}
    />
    <StatInput
      label="Travel"
      bind:statValue={monster.travel}
      statBonus={calcTotalSkillBonus(monster.int, monster.travel)}
    />
    <StatInput
      label="Reasoning"
      bind:statValue={monster.reasoning}
      statBonus={calcTotalSkillBonus(monster.int, monster.reasoning)}
    />
    <StatInput label="Lore" bind:statValue={monster.lore} statBonus={calcTotalSkillBonus(monster.int, monster.lore)} />
    <StatInput
      label="Resourcefulness"
      bind:statValue={monster.resourcefulness}
      statBonus={calcTotalSkillBonus(monster.int, monster.resourcefulness)}
    />
  </tbody>
</table>

<h3>Specialties</h3>

<table>
  <tbody>
    {#each Object.keys(monster.specialties || {}) as speciality}
      <tr>
        <td><label class="" for={speciality}> {speciality} </label></td>
        <td><input class="" id={speciality} type="number" bind:value={monster.specialties[speciality]} /></td>
        <td>+?</td>
        <td> <button on:click={() => removeSpecialty(speciality)} class="btn-danger">X</button> </td>
      </tr>
    {/each}
  </tbody>
</table>

<form class="" method="POST" on:submit|preventDefault={addSpeciality}>
  <div class="margin-top-large form-group">
    <label for="speciality">Add Speciality</label>
    <select
      name="speciality"
      class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      bind:value={selectedSpecialty}
    >
      {#each specialtyList as speciality}
        <option value={speciality}>{speciality}</option>
      {/each}
      <option value="arr">Arrows</option>
    </select>
  </div>
  <button class="btn-secondary btn-block margin-top-small" type="submit"> Add </button>
</form>
