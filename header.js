// Central MTB Header Include
// This file contains the navigation and mobile menu

document.write(`
  <nav class="nav" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo" aria-label="Central MTB Home">
        <img src="/images/logo.png" alt="St. Paul Central MTB logo" width="120" height="44">
      </a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li class="dropdown">
          <a href="/parent-guide">Parent Guide</a>
          <ul class="dropdown-menu">
            <li><a href="/parent-guide">Welcome</a></li>
            <li><a href="/parent-guide#eligibility">Eligibility</a></li>
            <li><a href="/parent-guide#schedule">Practices &amp; Schedule</a></li>
            <li><a href="/parent-guide#costs">Equipment &amp; Fees</a></li>
            <li><a href="/equipment-guide">Equipment Guide</a></li>
            <li><a href="/lettering-criteria">Lettering Criteria</a></li>
          </ul>
        </li>
        <li class="dropdown">
          <a href="/try-it-ride">Try-It-Ride</a>
          <ul class="dropdown-menu">
            <li><a href="/girls">Girls Try-It-Ride</a></li>
          </ul>
        </li>
        <li class="dropdown">
          <a href="/resources">Resources</a>
          <ul class="dropdown-menu">
            <li><a href="/coach">Coach Info</a></li>
            <li><a href="/coach-bios">Coach Bios</a></li>
            <li><a href="/captain">Captain Application</a></li>
            <li><a href="/media">Photos &amp; Media</a></li>
            <li><a href="/sponsor">Become a Sponsor</a></li>
          </ul>
        </li>
        <li><a href="https://shop.centralmtb.com/" target="_blank" rel="noopener">Shop</a></li>
        <li><a href="/join" class="nav-cta">Join the Team</a></li>
      </ul>
      <button class="ham" aria-label="Open menu" aria-expanded="false" id="hamBtn">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="mob-menu" id="mobMenu" role="dialog" aria-label="Navigation menu">
    <a href="/">Home</a>
    <a href="/parent-guide">Parent Guide</a>
    <div class="mob-sub">
      <a href="/parent-guide#eligibility">Eligibility</a>
      <a href="/parent-guide#costs">Equipment &amp; Fees</a>
      <a href="/equipment-guide">Equipment Guide</a>
      <a href="/lettering-criteria">Lettering Criteria</a>
    </div>
    <a href="/try-it-ride">Try-It-Ride</a>
    <div class="mob-sub">
      <a href="/girls">Girls Try-It-Ride</a>
    </div>
    <a href="/resources">Resources</a>
    <div class="mob-sub">
      <a href="/coach-bios">Coach Bios</a>
      <a href="/captain">Captain Application</a>
      <a href="/media">Photos &amp; Media</a>
      <a href="/sponsor">Become a Sponsor</a>
    </div>
    <a href="https://shop.centralmtb.com/" target="_blank" rel="noopener">Shop</a>
    <a href="/join" class="mob-cta">Join the Team</a>
  </div>

  <script>
    // Mobile menu toggle
    var hamBtn=document.getElementById("hamBtn"),mobMenu=document.getElementById("mobMenu");
    hamBtn.addEventListener("click",function(){var o=mobMenu.classList.toggle("open");hamBtn.classList.toggle("active");hamBtn.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":"";});
    for(var ml=mobMenu.querySelectorAll("a"),i=0;i<ml.length;i++)ml[i].addEventListener("click",function(){mobMenu.classList.remove("open");hamBtn.classList.remove("active");hamBtn.setAttribute("aria-expanded","false");document.body.style.overflow="";});
  </script>
`);
