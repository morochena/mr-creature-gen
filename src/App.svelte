<script>
  import { user } from "./lib/stores/sessionStore";
  import { supabase } from "./lib/supabaseClient";

  import { Router, Link, Route } from "svelte-routing";
  import Home from "./lib/pages/Home.svelte";
  import Edit from "./lib/pages/Edit.svelte";
  import Auth from "./lib/pages/Auth.svelte";
  import Show from "./lib/pages/Show.svelte";
  import "papercss/dist/paper.min.css";

  const setSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      user.set(session.user);
    }
  };

  supabase.auth.onAuthStateChange((_, session) => {
    user.set(session.user);
  });

  let url = "";

  setSession();
</script>

<main class="">
  {#if $user}
    <Router {url}>
      <div>
        <Route path="/"><Home /></Route>
        <Route path="/monsters/:id" let:params><Edit id={params.id} /></Route>
        <Route path="/monsters/:id/show" let:params><Show id={params.id} /></Route>
      </div>
    </Router>
  {:else}
    <Auth />
  {/if}
</main>
