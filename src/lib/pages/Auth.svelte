<script>
  import { supabase } from "../supabaseClient";

  let loading = false;

  const handleLogin = async () => {
    try {
      loading = true;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
      });
      if (error) throw error;
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      loading = false;
    }
  };
</script>

<div class="row flex">
  <button on:click={handleLogin} class="button block"> Sign in with Discord </button>
</div>
