<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep homepage cover-on-scroll behavior in the reusable ScrollCutoutStack wrapper; measure each layer's height so tall sections remain readable before pinning, and use normal flow for reduced motion.
- Scope Lenis wheel smoothing to ScrollCutoutStack, load it after hydration, and destroy it on navigation or reduced-motion changes; preserve native touch and nested tool scrolling so the effect never traps input.
