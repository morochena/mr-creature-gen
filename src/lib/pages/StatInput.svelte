<script>
  export let label;
  export let statValue;
  export let statBonus;
</script>

<!-- <div class="form-group">
  <label class="" for={label}>{label}</label>
  <div class="row flex-edges">
    <div class="align-middle">
      <input id={label} type="number" bind:value={statValue} />
    </div>
    <div class="align-middle">
      <p><strong>{statBonus}</strong></p>
    </div>
  </div>
</div> -->

<tr>
  <td><label for={label}>{label}</label></td>
  <td><input id={label} type="number" bind:value={statValue} style="width: 80px" /></td>
  <td>{statBonus}</td>
</tr>
