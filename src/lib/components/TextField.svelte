<script lang="ts">
  import { autogrow } from '../util/autogrow';

  export let value: string;
  export let placeholder = '';
  export let rows = 1;
  export let align: 'left' | 'center' = 'left';
  // Kept for API compatibility; every field now wraps + grows downwards.
  export let multiline = false;
  // Short-name fields keep the sans (Rimma) font; everything else uses the journal font.
  export let sans = false;
  // Slightly larger text for emphasised fields.
  export let big = false;
</script>

<textarea
  class="tf"
  class:multi={multiline}
  class:sans
  class:big
  style="text-align:{align}"
  {placeholder}
  {rows}
  bind:value
  use:autogrow
></textarea>

<style>
  .tf {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--field-border);
    border-radius: var(--radius-sm);
    background: var(--field-bg);
    color: var(--field-text);
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.35;
    padding: 4px 6px;
    resize: none;
    overflow: hidden;
    display: block;
  }
  .tf.sans {
    font-family: var(--font-sheet);
    font-size: 14px;
  }
  .tf.big {
    font-size: 17px;
  }
  .tf:focus {
    outline: none;
    border-color: var(--accent);
  }
</style>
