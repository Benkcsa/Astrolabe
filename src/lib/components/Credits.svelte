<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="overlay" on:click={close} role="presentation">
  <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true" aria-label="Credits">
    <button class="close" on:click={close} title="Close" aria-label="Close">x</button>

    <img class="logo" src="/astroprisma-3pl-white.png" alt="ASTROPRISMA Third Party License" />

    <div class="credits-body">
      <p>
        Astrolabe is an independent production by Benkcsa/[ircuit and is not affiliated with
        Crescent Chimera. It is published under the ASTROPRISMA Third Party License.
      </p>
      <p>ASTROPRISMA is copyright Camila Mera and Crescent Chimera.</p>
      <p class="license">
        The Astrolabe source code is released under the MIT License - free to use, copy, modify,
        and distribute.
      </p>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    z-index: 100;
    padding: 20px;
  }
  .modal {
    position: relative;
    background: var(--bg-panel);
    color: var(--on-bg);
    border: 2px solid var(--c-ink);
    border-radius: var(--radius);
    max-width: 460px;
    width: 100%;
    padding: 24px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  }
  .close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: var(--field-bg);
    color: var(--c-cream);
    border: 1px solid var(--field-border);
    border-radius: var(--radius-sm);
    width: 28px;
    height: 28px;
    font-family: var(--font-heading);
    font-size: 15px;
  }
  .close:hover {
    background: var(--danger);
  }
  .logo {
    display: block;
    max-width: 220px;
    width: 60%;
    margin: 8px auto 18px;
  }
  .credits-body p {
    font-family: 'Feature Mono', var(--font-mono);
    font-weight: 100;
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
    margin: 0 0 12px;
  }
  .license {
    opacity: 0.85;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }
</style>
