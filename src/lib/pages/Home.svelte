<script>
  import { supabase } from "../supabaseClient";
  import { generateMonster } from "../utils/generateMonster";
  import { Datatable } from "svelte-simple-datatables";
  import { monsters } from "../stores/monsterStore";
  import { openAIAPIKey } from "../stores/apiKeyStore";

  let loading = true;
  const settings = { columnFilter: true };
  let rows;
  let errorMessage = "";

  // new monster stats
  let manName = "";
  let type = "humanoid";
  let size = "medium";
  let race = "";
  let difficulty = "average";
  let theme = "";
  let magic = false;

  function getProfile(node) {
    try {
      loading = true;
      const user = supabase.auth.getUser();

      supabase
        .from("monsters")
        .select(`id, inserted_at, name, size`)
        .order("inserted_at", { ascending: false })
        .eq("user_id", user?.id)
        .then(({ data, error, status }) => {
          if (data) {
            monsters.set(data);
          }
          if (error && status !== 406) throw error;
        });
    } catch (error) {
      alert(error.message);
    } finally {
      loading = false;
    }
  }

  async function generateMonsterWrapper() {
    try {
      loading = true;
      await generateMonster({ manName, size, type, race, theme, magic, difficulty, apiKey: openAIAPIKey });
    } catch (error) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }

  async function signOut() {
    try {
      loading = true;
      let { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      loading = false;
    }
  }

  getProfile();
</script>

<div class="mt-8">
  <button
    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    on:click={signOut}
    disabled={loading}
  >
    Sign Out
  </button>
</div>

<h1 class="text-2xl font-bold mb-4">Generate New Monster</h1>

<form class="bg-gray-50 p-4" method="POST" on:submit|preventDefault={generateMonsterWrapper}>
  <div>
    <label for="manName">Name</label>
    <input
      name="manName"
      id="manName"
      type="text"
      placeholder="Name (optional)"
      bind:value={manName}
      class="block bg-gray-200 rounded p-2 mb-4"
    />
  </div>

  <div class="mb-4">
    <label for="size">Size</label>
    <select
      name="size"
      id="size"
      class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      bind:value={size}
    >
      <option value="tiny">Tiny</option>
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
      <option value="huge">Huge</option>
      <option value="gargantuan">Gargantuan</option>
    </select>
  </div>

  <div class="mb-4">
    <label for="type">Type</label>
    <select
      name="type"
      id="type"
      class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      bind:value={type}
    >
      <option value="aberration">Aberration</option>
      <option value="beast">Beast</option>
      <option value="celestial">Celestial</option>
      <option value="construct">Construct</option>
      <option value="dragon">Dragon</option>
      <option value="elemental">Elemental</option>
      <option value="fey">Fey</option>
      <option value="fiend">Fiend</option>
      <option value="giant">Giant</option>
      <option value="humanoid" selected>Humanoid</option>
      <option value="monstrosity">Monstrosity</option>
      <option value="ooze">Ooze</option>
      <option value="plant">Plant</option>
      <option value="undead">Undead</option>
    </select>
  </div>

  <div class="mb-4">
    <label for="difficulty">Difficulty</label>
    <select
      name="difficulty"
      id="difficulty"
      class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      bind:value={difficulty}
    >
      <option value="pathetically weak">Pathetically Weak</option>
      <option value="weak">Weak</option>
      <option value="average">Average</option>
      <option value="powerful">Powerful</option>
      <option value="very powerful">Very Powerful</option>
      <option value="extremely powerful">Extremely Powerful</option>
    </select>
  </div>
  <div class="mb-4">
    <label for="theme">Theme</label>
    <input
      name="theme"
      id="theme"
      type="text"
      placeholder="eg. aquatic"
      bind:value={theme}
      class="block bg-gray-200 rounded p-2 mb-4"
    />
  </div>

  <div class="mb-4">
    <label for="magic">Magic User</label>
    <input name="magic" id="magic" type="checkbox" bind:checked={magic} class="bg-gray-200 rounded p-2 ml-1" />
  </div>

  <div class="mb-4">
    <label for="openAIAPIKey"><a href="https://beta.openai.com/account/api-keys">OpenAI API Key</a></label>
    <input
      name="openAIAPIKey"
      id="openAIAPIKey"
      type="text"
      bind:value={$openAIAPIKey}
      placeholder="optional, for name/description"
      class="block bg-gray-200 rounded p-2"
    />
    <span class="text-xs text-red-500 mb-4"
      >This value is persisted in local browser storage - delete it after use if on a shared computer.</span
    >
  </div>

  <input
    type="submit"
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    value="Generate"
    disabled={loading}
  />

  <p class="text-red-500">{errorMessage}</p>
</form>

<hr class="my-8" />

<h1 class="text-2xl font-bold mb-4">Monsters</h1>
{#if !loading}
  <Datatable {settings} data={$monsters} bind:dataRows={rows}>
    <thead>
      <th data-key="name">Name</th>
      <th data-key="difficulty">Difficulty</th>
      <th data-key="size">Size</th>
      <th data-key="inserted_at">Created At</th>
    </thead>
    <tbody>
      {#if rows}
        {#each $rows as row}
          <tr>
            <td><a href={`/monsters/${row.id}`}>{row.name}</a></td>
            <td>{row.difficulty}</td>
            <td>{row.size}</td>
            <td>{new Date(row.inserted_at).toLocaleString()}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </Datatable>
{/if}
