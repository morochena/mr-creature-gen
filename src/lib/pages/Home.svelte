<script>
  import { supabase } from "../supabaseClient";
  import { generateMonster } from "../utils/generateMonster";
  import { Datatable } from "svelte-simple-datatables";
  import { monsters } from "../stores/monsterStore";
  import { openAIAPIKey } from "../stores/apiKeyStore";
  import logo from "../../assets/logo.png";

  let loading = true;
  const settings = { columnFilter: true };
  let rows;
  let errorMessage = "";
  let currentTab = "generate";

  // new monster stats
  let manName = "";
  let type = "humanoid";
  let size = "medium";
  let race = "";
  let difficulty = "average";
  let theme = "";
  let magic = false;

  async function getMonsters(node) {
    try {
      loading = true;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      supabase
        .from("monsters")
        .select(`id, inserted_at, name, size`)
        .eq("user_id", user.id)
        .order("inserted_at", { ascending: false })
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

  const setGenerateTab = () => {
    currentTab = "generate";
  };

  const setListTab = () => {
    currentTab = "list";
  };

  getMonsters();
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

<div class="row flex-spaces tabs margin-top-large">
  <input id="tab1" type="radio" name="tabs" checked />
  <label for="tab1" on:click={setGenerateTab}>Generate Creature</label>

  <input id="tab2" type="radio" name="tabs" />
  <label for="tab2" on:click={setListTab}>List Creatures</label>
</div>

{#if currentTab == "generate"}
  <form class="bg-gray-50 p-4" method="POST" on:submit|preventDefault={generateMonsterWrapper}>
    <div class="form-group">
      <label for="manName">Name</label>
      <input name="manName" id="manName" type="text" placeholder="Name" bind:value={manName} class="input-block" />
    </div>

    <div class="form-group">
      <label for="size">Size</label>
      <select name="size" id="size" class="input-block" bind:value={size}>
        <option value="tiny">Tiny</option>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
        <option value="huge">Huge</option>
        <option value="gargantuan">Gargantuan</option>
      </select>
    </div>

    <div class="form-group">
      <label for="type">Type</label>
      <select name="type" id="type" class="input-block" bind:value={type}>
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

    <div class="form-group">
      <label for="difficulty">Difficulty</label>
      <select name="difficulty" id="difficulty" class="input-block" bind:value={difficulty}>
        <option value="pathetically weak">Pathetically Weak</option>
        <option value="weak">Weak</option>
        <option value="average">Average</option>
        <option value="powerful">Powerful</option>
        <option value="very powerful">Very Powerful</option>
        <option value="extremely powerful">Extremely Powerful</option>
      </select>
    </div>

    <div class="form-group">
      <label for="theme">Theme</label>
      <input name="theme" id="theme" type="text" placeholder="eg. aquatic" bind:value={theme} class="input-block" />
    </div>

    <fieldset class="form-group">
      <label for="magic" class="paper-check">
        <input name="magic" id="magic" type="checkbox" bind:checked={magic} />
        <span>Magic User</span>
      </label>
    </fieldset>

    <div class="form-group">
      <label for="openAIAPIKey"
        ><a href="https://beta.openai.com/account/api-keys" target="_blank">OpenAI API Key</a></label
      >
      <input
        name="openAIAPIKey"
        id="openAIAPIKey"
        type="text"
        bind:value={$openAIAPIKey}
        placeholder="optional, for name & description"
        class="input-block"
      />
      <small>This value is persisted in local browser storage - delete it after use if on a shared computer.</small>
    </div>

    <div class="form-group">
      <button class="btn-large btn-block" type="submit" value="Generate" disabled={loading}>Generate</button>
    </div>

    <p class="text-danger">{errorMessage}</p>
  </form>

  <hr />

  <button class="margin-top-large btn-block" on:click={signOut} disabled={loading}> Sign Out </button>
{/if}

{#if !loading && currentTab == "list"}
  <table>
    <thead>
      <th data-key="name">Name</th>
    </thead>
    <tbody>
      {#if monsters}
        {#each $monsters as row}
          <tr>
            <td><a href={`/monsters/${row.id}`}>{row.name}</a></td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
{/if}
