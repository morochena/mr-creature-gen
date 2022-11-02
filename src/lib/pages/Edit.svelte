<script>
  import { specialtyList } from "../utils/data/specialtyList";
  import { supabase } from "../supabaseClient";
  import logo from "../../assets/logo.png";

  import StatInput from "./StatInput.svelte";
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

<a href={`/monsters/${id}/show`}><button class="btn margin-top-small"> Show </button></a>
<button on:click={saveMonster} class="btn-secondary margin-top-small margin-bottom-small">
  {saveText}
</button>
<button on:click={deleteMonster} class="btn-danger"> Delete </button>

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
        <td
          ><input
            class=""
            id={speciality}
            style="width: 80px"
            type="number"
            bind:value={monster.specialties[speciality]}
          /></td
        >
        <td>+?</td>
        <td> <button on:click={() => removeSpecialty(speciality)} class="btn-danger">X</button> </td>
      </tr>
    {/each}
  </tbody>
</table>

<form class="" method="POST" on:submit|preventDefault={addSpeciality}>
  <div class="margin-top-large form-group">
    <label for="speciality">Add Speciality</label>
    <select name="speciality" class="" bind:value={selectedSpecialty}>
      {#each specialtyList as speciality}
        <option value={speciality}>{speciality}</option>
      {/each}
      <option value="arr">Arrows</option>
    </select>
  </div>
  <button class="btn-secondary btn-block margin-top-small" type="submit"> Add </button>
</form>
