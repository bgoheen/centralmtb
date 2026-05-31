// Central MTB Header Include
// Navigation + mobile sheet - matches homepage design system

document.write(`
  <nav class="nav" role="navigation" aria-label="Main navigation">
    <div class="nav__inner">
      <a href="/" class="brand" aria-label="Central MTB Home">
        <img src="/images/logo.png" alt="St. Paul Central MTB logo">
      </a>

      <div class="nav__links">
        <a href="/parent-guide">Parent Guide</a>
        <a href="/equipment-guide">Equipment Guide</a>
        <a href="/coach-bios">Coaches</a>
        <a href="/media">Media</a>
      </div>

      <div class="nav__cta">
        <a href="/join" class="btn btn--primary btn--small">Join the Team <span class="arrow" aria-hidden="true">&rarr;</span></a>
        <button class="nav__burger" aria-label="Open menu" aria-expanded="false" data-menu-open>
          <span></span>
        </button>
      </div>
    </div>
  </nav>

  <div class="sheet" data-sheet aria-hidden="true" role="dialog" aria-label="Navigation menu">
    <button class="sheet__close" aria-label="Close menu" data-menu-close>&times;</button>
    <a href="/parent-guide">Parent Guide</a>
    <a href="/equipment-guide">Equipment Guide</a>
    <a href="/coach-bios">Coaches</a>
    <a href="/media">Media</a>
    <a href="/join">Join the Team</a>
  </div>

  <script>
    (function(){
      var openBtn  = document.querySelector('[data-menu-open]');
      var closeBtn = document.querySelector('[data-menu-close]');
      var sheet    = document.querySelector('[data-sheet]');
      if (!openBtn || !closeBtn || !sheet) return;
      function openSheet(){
        sheet.setAttribute('data-open','true');
        sheet.setAttribute('aria-hidden','false');
        openBtn.setAttribute('aria-expanded','true');
        document.body.style.overflow='hidden';
      }
      function closeSheet(){
        sheet.setAttribute('data-open','false');
        sheet.setAttribute('aria-hidden','true');
        openBtn.setAttribute('aria-expanded','false');
        document.body.style.overflow='';
      }
      openBtn.addEventListener('click', openSheet);
      closeBtn.addEventListener('click', closeSheet);
      sheet.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', closeSheet);
      });
      document.addEventListener('keydown', function(e){
        if (e.key==='Escape' && sheet.getAttribute('data-open')==='true') closeSheet();
      });
    })();
  <\/script>
`);
