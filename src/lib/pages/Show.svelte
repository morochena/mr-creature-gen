<script>
  import { specialtyList } from "../utils/data/specialtyList";
  import { supabase } from "../supabaseClient";

  export let id;

  let selectedSpecialty = "Academia";

  let monster = { specialties: {} };

  const loadData = async () => {
    supabase.auth.user();
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
    supabase.auth.user();
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
      const user = supabase.auth.user();
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

<!-- create a save button-->
<div class="flex justify-end">
  <button
    on:click={saveMonster}
    class="bg-blue-500 hover:bg-blue-700 w-24 text-white font-bold py-2 px-4 rounded text-center my-4"
  >
    {saveText}
  </button>
  <button
    on:click={deleteMonster}
    class="bg-red-500 hover:bg-red-700 w-24 text-white font-bold py-2 px-4 rounded text-center my-4 ml-2"
  >
    Delete
  </button>
</div>

<div class="flex items-center bg-gray-200 p-3">
  <div class="w-36 h-36 bg-gray-400" />
  <div class="ml-4 w-full">
    <input class="text-lg leading-6 font-medium text-gray-900 w-full" bind:value={monster.name} />
    <br />
    <textarea rows="6" class="mt-2 text-sm leading-5 text-gray-500 w-full" bind:value={monster.description} />
  </div>
</div>
<!-- calculated stats: body, mind, dodge, consider, move run, armor -->
<div class="flex items-center bg-gray-200 p-3">
  <div class="w-32 bg-gray-400 p-2 mx-1">Body: {calcBody(monster)}</div>
  <div class="w-32 bg-gray-400 p-2 mx-1">Mind {calcMind(monster)}</div>
  <div class="w-32 bg-gray-400 p-2 mx-1">Dodge {calcDodge(monster)}</div>
  <div class="w-32 bg-gray-400 p-2 mx-1">Consider {calcConsider(monster)}</div>
  <div class="w-32 bg-gray-400 p-2 mx-1">Perception {calcPerception(monster)}</div>
  <div class="w-32 bg-gray-400 p-2 mx-1">Move {calcMove(monster)}</div>
  <div class="w-32 bg-gray-400 p-2 mx-1">Run {calcRun(monster)}</div>
  <div class="w-32 bg-gray-400 p-2 mx-1">~XP {calcLevel(monster)}</div>
</div>

<div class="flex flex-wrap -mx-3">
  <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
    <h2 class="text-lg leading-6 font-medium text-gray-900 my-4 text-center">Base Stats</h2>

    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="str"> Strength </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="str"
          type="number"
          bind:value={monster.str}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcStatBonus(monster.str)}</span>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="dex"> Dexterity </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="dex"
          type="number"
          bind:value={monster.dex}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcStatBonus(monster.dex)}</span>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="emp"> Empathy </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="emp"
          type="number"
          bind:value={monster.emp}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcStatBonus(monster.emp)}</span>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="int"> Intelligence </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="int"
          type="number"
          bind:value={monster.int}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcStatBonus(monster.int)}</span>
      </div>

      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="int"> Size </label>
        <select
          name="size"
          id="size"
          class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          bind:value={monster.size}
        >
          <option value="tiny">Tiny</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
          <option value="gargantuan">Gargantuan</option>
        </select>
      </div>
    </div>

    <h2 class="text-lg leading-6 font-medium text-gray-900 my-4 text-center">Specialties</h2>

    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
      {#each Object.keys(monster.specialties || {}) as speciality}
        <div class="mb-4 flex items-center">
          <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-32" for="smash"> {speciality} </label>
          <input
            class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id={speciality}
            type="number"
            bind:value={monster.specialties[speciality]}
          />
          <button on:click={() => removeSpecialty(speciality)} class="text-red-500 text-xs ml-8">X</button>
        </div>
      {/each}

      <form class="" method="POST" on:submit|preventDefault={addSpeciality}>
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
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2" type="submit">
          Add
        </button>
      </form>
    </div>
  </div>
  <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
    <h2 class="text-lg leading-6 font-medium text-gray-900 my-4 text-center">STR Skills</h2>

    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="smash"> Smash </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="smash"
          type="number"
          bind:value={monster.smash}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcTotalSkillBonus(monster.str, monster.smash)}</span>
      </div>

      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="launch"> Launch </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="launch"
          type="number"
          bind:value={monster.launch}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcTotalSkillBonus(monster.str, monster.launch)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="athletics"> Athletics </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="athletics"
          type="number"
          bind:value={monster.athletics}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.str, monster.athletics)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="physique"> Physique </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="physique"
          type="number"
          bind:value={monster.physique}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.str, monster.physique)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="provoke"> Provoke </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="provoke"
          type="number"
          bind:value={monster.provoke}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.str, monster.provoke)}</span
        >
      </div>
    </div>
    <h2 class="text-lg leading-6 font-medium text-gray-900 my-4 text-center">EMP Skills</h2>

    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="animal_handling">
          Animal Handling
        </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="animal_handling"
          type="number"
          bind:value={monster.animal_handling}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.emp, monster.animal_handling)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="deceive"> Deceive </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="deceive"
          type="number"
          bind:value={monster.deceive}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.emp, monster.deceive)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="rapport"> Rapport </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="rapport"
          type="number"
          bind:value={monster.rapport}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.emp, monster.rapport)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="willpower"> Willpower </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="willpower"
          type="number"
          bind:value={monster.willpower}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.emp, monster.willpower)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="mysticism"> Mysticism </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="mysticism"
          type="number"
          bind:value={monster.mysticism}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.emp, monster.mysticism)}</span
        >
      </div>
    </div>
  </div>
  <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
    <h2 class="text-lg leading-6 font-medium text-gray-900 my-4 text-center">DEX Skills</h2>

    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="accuracy"> Accuracy </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="accuracy"
          type="number"
          bind:value={monster.accuracy}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.dex, monster.accuracy)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="mobility"> Mobility </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="mobility"
          type="number"
          bind:value={monster.mobility}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.dex, monster.mobility)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="thievery"> Thievery </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="thievery"
          type="number"
          bind:value={monster.thievery}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.dex, monster.thievery)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="notice"> Notice </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="notice"
          type="number"
          bind:value={monster.notice}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcTotalSkillBonus(monster.dex, monster.notice)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="stealth"> Stealth </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="stealth"
          type="number"
          bind:value={monster.stealth}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.dex, monster.stealth)}</span
        >
      </div>
    </div>
    <h2 class="text-lg leading-6 font-medium text-gray-900 my-4 text-center">INT Skills</h2>

    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="craft"> Craft </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="craft"
          type="number"
          bind:value={monster.craft}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcTotalSkillBonus(monster.int, monster.craft)}</span>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="travel"> Travel </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="travel"
          type="number"
          bind:value={monster.travel}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcTotalSkillBonus(monster.int, monster.travel)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="reasoning"> Reasoning </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="reasoning"
          type="number"
          bind:value={monster.reasoning}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.int, monster.reasoning)}</span
        >
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="lore"> Lore </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="lore"
          type="number"
          bind:value={monster.lore}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2">{calcTotalSkillBonus(monster.int, monster.lore)}</span>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block text-gray-700 text-sm font-bold mb-2 mx-2 w-24" for="resourcefulness"> Resourceful </label>
        <input
          class="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="resourcefulness"
          type="number"
          bind:value={monster.resourcefulness}
        />
        <span class="text-gray-700 text-sm font-bold mb-2 mx-2"
          >{calcTotalSkillBonus(monster.int, monster.resourcefulness)}</span
        >
      </div>
    </div>
  </div>
</div>
