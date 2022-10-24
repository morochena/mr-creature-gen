<script>
  import { user } from "./lib/stores/sessionStore";
  import { supabase } from "./lib/supabaseClient";

  import { Router, Link, Route } from "svelte-routing";
  import Home from "./lib/pages/Home.svelte";
  import Show from "./lib/pages/Show.svelte";
  import Auth from "./lib/pages/Auth.svelte";
  import logo from "./assets/logo.png";

  // @ts-ignore
  user.set(supabase.auth.user());

  supabase.auth.onAuthStateChange((_, session) => {
    // @ts-ignore
    user.set(session.user);
  });

  let url = "";
</script>

<main class="container mx-auto grid mt-4 mb-20 px-10">
  <a href="/" class="place-self-center">
    <img src={logo} alt="Logo" class="object-cover h-48 w-96 place-self-center" />
  </a>

  {#if $user}
    <Router {url}>
      <div>
        <Route path="/"><Home /></Route>
        <Route path="/monsters/:id" let:params><Show id={params.id} /></Route>
      </div>
    </Router>
  {:else}
    <Auth />
  {/if}
</main>
